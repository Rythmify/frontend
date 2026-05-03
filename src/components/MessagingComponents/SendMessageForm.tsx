import { useState, useEffect, useRef, useCallback } from 'react';
import { sendMessage } from '../../services/api/messaging/conversationApi';
import type { Message } from '../../services/api/messaging/conversationApi';
import { MessageBox } from './MessageBox';
import type { ResolvedEmbed } from './MessageBox';
import MessageCell from './messagecell';
import { useAuthStore } from '@/stores/auth.store';
import { emitMessageSent, emitStopTyping } from '@/services/api/messaging/socketService';
import TrackPlaylistPicker from './TrackPlaylistPicker';
import type { PickedItem } from './TrackPlaylistPicker';

interface SendMessageFormProps {
  conversationId: string;
  existingMessages: Message[];
  loadingMessages: boolean;
  hasMoreMessages: boolean;
  onLoadMore: () => void;
  onMessageSent: (msg: Message) => void;
  isTyping?: boolean;
  ParticipantInfo: {
    display_name: string;
    profile_picture?: string | null;
  };
}

type MessageWithEmbed = Message & {
  _embedResource?: ResolvedEmbed['resource'];
};

export default function SendMessageForm({
  conversationId,
  existingMessages,
  loadingMessages,
  hasMoreMessages,
  onLoadMore,
  onMessageSent,
  isTyping,
  ParticipantInfo,
}: SendMessageFormProps) {
  const [value, setValue]           = useState('');
  const [embeds, setEmbeds]         = useState<ResolvedEmbed[]>([]);
  const [error, setError]           = useState<string | null>(null);
  const [isSending, setIsSending]   = useState(false);
  const [boxKey, setBoxKey]         = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const scrollContainerRef  = useRef<HTMLDivElement>(null);
  const sentinelRef         = useRef<HTMLDivElement>(null);
  const prevMsgCountRef     = useRef(0);
  const prevScrollHeightRef = useRef(0);
  const isPrependingRef     = useRef(false);
  const composerRef         = useRef<HTMLDivElement>(null);

  // ─── Scroll management ────────────────────────────────────────────────────
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const prev    = prevMsgCountRef.current;
    const current = existingMessages.length;

    if (isPrependingRef.current) {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop   = newScrollHeight - prevScrollHeightRef.current;
      isPrependingRef.current = false;
    } else if (prev === 0 && current > 0) {
      container.scrollTop = container.scrollHeight;
    } else if (current > prev) {
      container.scrollTop = container.scrollHeight;
    }

    prevMsgCountRef.current = current;
  }, [existingMessages]);

  // ─── IntersectionObserver — sentinel at TOP ───────────────────────────────
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!entries[0].isIntersecting) return;
      if (!hasMoreMessages || loadingMessages) return;

      const container = scrollContainerRef.current;
      if (container) {
        prevScrollHeightRef.current = container.scrollHeight;
        isPrependingRef.current     = true;
      }
      onLoadMore();
    },
    [hasMoreMessages, loadingMessages, onLoadMore],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      root: scrollContainerRef.current,
      threshold: 0.1,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect]);

  // ─── Handle pick from TrackPlaylistPicker ─────────────────────────────────
  // The picker emits a PickedItem; we inject it as a URL-less embed directly
  // so the user sees a MiniPlayer card without having to paste a link.
  const handlePick = useCallback((item: PickedItem) => {
    // Build a synthetic ResolvedEmbed so MessageBox / send logic handles it
    const syntheticEmbed: ResolvedEmbed =
      item.type === 'track'
        ? {
            type: 'track',
            id: item.id,
            sourceUrl: '',          // no URL to strip from textarea
            resource: {
              id: item.id,
              title: item.title,
              cover_image: item.coverImage,
              artist_name: item.artistName,
              // required Message fields that aren't displayed in the picker
              description: null, genre: null, duration: null, bitrate: null,
              status: 'public', is_public: true, is_hidden: false,
              user_id: '', play_count: 0, like_count: 0,
              stream_url: null, preview_url: null, waveform_url: null,
              artists: null, created_at: '', updated_at: '',
            } as any,
          }
        : {
            type: 'playlist',
            id: item.id,
            sourceUrl: '',
            resource: {
              playlist_id: item.id,
              name: item.title,
              cover_image: item.coverImage,
              track_count: item.trackCount,
              owner_user_id: '', slug: null, description: null,
              is_public: true, like_count: 0, repost_count: 0,
              created_at: '', updated_at: '',
            } as any,
          };

    setEmbeds((prev) => [...prev, syntheticEmbed]);
    // Notify MessageBox parent of updated embeds
    setBoxKey((k) => k + 1);          // remount so MessageBox re-syncs
    setError(null);
  }, []);

  // ─── Send handler ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    const cleanBody = value.trim();

    if (cleanBody === '' && embeds.length === 0) {
      setError('Enter a message or paste a track/playlist link');
      return;
    }
    setError(null);
    setIsSending(true);

    try {
      const sentMessages: MessageWithEmbed[] = [];

      if (embeds.length > 0) {
        for (let i = 0; i < embeds.length; i++) {
          const embed = embeds[i];

          const payload = {
            ...(i === 0 && cleanBody ? { body: cleanBody } : {}),
            resource: { type: embed.type, id: embed.id },
          };

          const res = await sendMessage(conversationId, payload);

          const msg: MessageWithEmbed = {
            ...res.data,
            body:           i === 0 ? cleanBody : '',
            embed_type:     embed.type,
            embed_id:       embed.id,
            _embedResource: embed.resource,
          };

          sentMessages.push(msg);
        }
      } else {
        const res = await sendMessage(conversationId, { body: cleanBody });
        sentMessages.push({ ...res.data, body: cleanBody });
      }

      for (const msg of sentMessages) {
        onMessageSent(msg as Message);
        emitMessageSent(conversationId, msg as Message);
      }
      emitStopTyping(conversationId);

      setValue('');
      setEmbeds([]);
      setBoxKey((k) => k + 1);
    } catch (err: unknown) {
      const axiosError = err as { response?: { status: number } };
      if (axiosError.response?.status === 403) {
        setError('Unable to send message to this user.');
      } else {
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const user = useAuthStore((state) => state.user);

  const getSenderInfo = (senderId: string) => {
    if (senderId === user?.id) {
      return {
        display_name:    user?.displayName ?? user?.username ?? 'Me',
        profile_picture: user?.avatar ?? null,
      };
    }
    return ParticipantInfo;
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div data-test="send-message-form" className="flex flex-col h-full min-h-0">
      {/* ── Scrollable message list ── */}
      <div
        data-test="send-message-list"
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto flex flex-col gap-4 px-3 py-3 min-h-0"
      >
        <div ref={sentinelRef} data-test="send-message-sentinel" className="h-1 w-full shrink-0" />

        {loadingMessages && hasMoreMessages && (
          <div data-test="send-message-loading-more" className="text-xs text-[#666] text-center py-2 shrink-0">
            Loading older messages…
          </div>
        )}

        {loadingMessages && existingMessages.length === 0 ? (
          <div data-test="send-message-loading" className="text-sm text-[#666] text-center py-4">
            Loading messages…
          </div>
        ) : (
          existingMessages.map((msg) => (
            <MessageCell
              key={msg.id}
              message={msg}
              displayName={getSenderInfo(msg.sender_id).display_name}
              profilePicture={getSenderInfo(msg.sender_id).profile_picture}
            />
          ))
        )}

        {isTyping && (
          <p data-test="typing-indicator" className="text-xs text-[#999] italic px-1 pb-1 shrink-0">
            typing…
          </p>
        )}
      </div>

      {/* ── Composer ── */}
      <div
        ref={composerRef}
        className="shrink-0 flex flex-col gap-2 px-3 pb-3 pt-2 bg-bg border-t border-white/10 relative"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      >
        <label className="text-sm font-bold text-white">
          Write your message and add tracks or playlists{' '}
          <span className="text-red-500">*</span>
        </label>

        <MessageBox
          key={boxKey}
          onValueChange={setValue}
          onIsEmptyChange={(empty) => {
            if (empty) setError(null);
          }}
          onEmbedsResolved={setEmbeds}
          hasError={!!error}
          // Pass externally-picked embeds so MessageBox renders their MiniPlayers
          externalEmbeds={embeds}
        />

        {pickerOpen && (
          <TrackPlaylistPicker
            onPick={handlePick}
            onClose={() => setPickerOpen(false)}
          />
        )}

        {error && <p data-test="send-message-error" className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-between">
          {user?.role === 'artist' && (
            <button
              type="button"
              data-test="add-track-playlist-button"
              onClick={() => setPickerOpen((o) => !o)}
              className={`px-5 py-2 text-sm font-semibold text-black border rounded-lg transition-colors ${
                pickerOpen
                  ? 'border-white bg-white'
                  : 'border-white bg-white hover:bg-white/85'
              }`}
            >
              Add track or playlist
            </button>
          )}
          <button
            data-test="send-message-button"
            onClick={handleSend}
            disabled={isSending}
            className="px-5 py-2 text-sm font-semibold text-black transition-colors bg-white rounded-lg hover:text-[color:#838383] disabled:opacity-50"
          >
            {isSending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
