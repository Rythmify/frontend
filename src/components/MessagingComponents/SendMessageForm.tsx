import { useState, useEffect, useRef, useCallback } from 'react';
import { sendMessage } from '../../services/api/messaging/conversationApi';
import type { Message } from '../../services/api/messaging/conversationApi';
import { MessageBox } from './MessageBox';
import type { ResolvedEmbed } from './MessageBox';
import MessageCell from './messagecell';
import { useAuthStore } from '@/stores/auth.store';
import { emitMessageSent, emitStopTyping } from '@/services/api/messaging/socketService';

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
  const [value, setValue]         = useState('');
  const [embeds, setEmbeds]       = useState<ResolvedEmbed[]>([]);
  const [error, setError]         = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [boxKey, setBoxKey]       = useState(0);

  const scrollContainerRef  = useRef<HTMLDivElement>(null);
  const sentinelRef         = useRef<HTMLDivElement>(null);
  const prevMsgCountRef     = useRef(0);
  const prevScrollHeightRef = useRef(0);
  const isLoadingMoreRef    = useRef(false);

  // ─── Scroll to bottom on initial load & new outgoing/incoming messages ───
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const prev    = prevMsgCountRef.current;
    const current = existingMessages.length;

    if (isLoadingMoreRef.current) {
      // Restore scroll position after prepend so view doesn't jump
      const newScrollHeight = container.scrollHeight;
      container.scrollTop   = newScrollHeight - prevScrollHeightRef.current;
      isLoadingMoreRef.current = false;
    } else if (prev === 0 && current > 0) {
      // Initial load — jump to bottom
      container.scrollTop = container.scrollHeight;
    } else if (current > prev) {
      // New message appended — scroll to bottom
      container.scrollTop = container.scrollHeight;
    }

    prevMsgCountRef.current = current;
  }, [existingMessages]);

  // ─── IntersectionObserver — load older messages when sentinel is visible ──
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!entries[0].isIntersecting) return;
      if (!hasMoreMessages || loadingMessages) return;

      const container = scrollContainerRef.current;
      if (container) {
        prevScrollHeightRef.current = container.scrollHeight;
        isLoadingMoreRef.current    = true;
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

  // ─── Send handler ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (value.trim() === '' && embeds.length === 0) {
      setError('Enter a message or paste a track/playlist link');
      return;
    }
    setError(null);
    setIsSending(true);

    try {
      const sentMessages: Message[] = [];

      if (embeds.length > 0) {
        for (let i = 0; i < embeds.length; i++) {
          const embed = embeds[i];
          const res = await sendMessage(conversationId, {
            ...(i === 0 && value.trim() ? { body: value.trim() } : {}),
            resource: { type: embed.type, id: embed.id },
          });
          const msg: Message = {
            ...res.data,
            body: i === 0 ? value.trim() : '',
            embed_type: embed.type,
            embed_id: embed.id,
            _embedResource: embed.resource,
          } as Message & { _embedResource: ResolvedEmbed['resource'] };
          sentMessages.push(msg);
        }
      } else {
        const res = await sendMessage(conversationId, { body: value.trim() });
        sentMessages.push({ ...res.data, body: value.trim() });
      }

      for (const msg of sentMessages) {
        onMessageSent(msg);
        emitMessageSent(conversationId, msg);
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
        display_name: user?.displayName ?? user?.username ?? 'Me',
        profile_picture: user?.avatar ?? null,
      };
    }
    return ParticipantInfo;
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Scrollable message list ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto flex flex-col gap-4 px-3 py-3 min-h-0"
      >
        {/* Sentinel — sits at the very top; triggers load-more when visible */}
        <div ref={sentinelRef} className="h-1 w-full shrink-0" />

        {/* "Loading older…" indicator */}
        {loadingMessages && hasMoreMessages && (
          <div className="text-xs text-[#666] text-center py-2 shrink-0">
            Loading older messages…
          </div>
        )}

        {/* Initial load spinner */}
        {loadingMessages && existingMessages.length === 0 ? (
          <div className="text-sm text-[#666] text-center py-4">
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

        {/* Typing indicator */}
        {isTyping && (
          <p className="text-xs text-[#999] italic px-1 pb-1 shrink-0">
            typing…
          </p>
        )}
      </div>

      {/* ── Composer ── */}
      <div className="shrink-0 flex flex-col gap-2 px-3 pb-3 pt-2 bg-bg border-t border-white/10">
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
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end">
          <button
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