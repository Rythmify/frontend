import { useState } from 'react';
import { sendMessage } from '../../services/api/messaging/conversationApi';
import type { Message } from '../../services/api/messaging/conversationApi';
import { MessageBox } from './MessageBox';
import type { ResolvedEmbed } from './MessageBox';
import MessageCell from './messagecell';
import { useAuthStore } from '@/stores/auth.store'
import { emitMessageSent, emitStopTyping } from '@/services/api/messaging/socketService';

interface SendMessageFormProps {
  conversationId: string;
  existingMessages: Message[];
  loadingMessages: boolean;
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
  onMessageSent,
  isTyping,
  ParticipantInfo,
}: SendMessageFormProps) {
  const [value, setValue]         = useState('');
  const [embeds, setEmbeds]       = useState<ResolvedEmbed[]>([]);
  const [error, setError]         = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [boxKey, setBoxKey]       = useState(0);

  const handleSend = async () => {
    if (value.trim() === '' && embeds.length === 0) {
      setError('Enter a message or paste a track/playlist link');
      return;
    }
    setError(null);
    setIsSending(true);

    try {
      /**
       * The API accepts one resource per message.
       * If the user pasted multiple permalinks we send one message per embed
       * (body only on the first, empty body on subsequent ones), then one
       * final text-only message if there's body text without any embed.
       *
       * Strategy:
       *   - If embeds exist: first message carries the text body + first embed,
       *     each additional embed is a separate resource-only message.
       *   - If no embeds: single text message.
       */
      const sentMessages: Message[] = [];

      if (embeds.length > 0) {
        for (let i = 0; i < embeds.length; i++) {
          const embed = embeds[i];
          const res = await sendMessage(conversationId, {
            // Only attach the text body to the first message
            ...(i === 0 && value.trim() ? { body: value.trim() } : {}),
            resource: { type: embed.type, id: embed.id },
          });
          // Attach embed metadata so MessageCell can render it
          const msg: Message = {
            ...res.data,
            body: i === 0 ? value.trim() : '',
            embed_type: embed.type,
            embed_id: embed.id,
            // Store serialised resource for immediate rendering without a re-fetch
            _embedResource: embed.resource,
          } as Message & { _embedResource: ResolvedEmbed['resource'] };
          sentMessages.push(msg);
        }
      } else {
        // Text-only message
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
      setBoxKey(k => k + 1);
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

  const user = useAuthStore(state => state.user);
  const getSenderInfo = (senderId: string) => {
    if (senderId === user?.id) {
      return { display_name: 'Me', profile_picture: user?.avatar ?? null };
    }
    return ParticipantInfo;
  };

  return (
    <div className="flex flex-col gap-4">

      {loadingMessages ? (
        <div className="text-sm text-[#666] text-center py-4">Loading messages…</div>
      ) : (
        existingMessages.map(msg => (
          <MessageCell
            key={msg.id}
            message={msg}
            displayName={getSenderInfo(msg.sender_id).display_name}
            profilePicture={getSenderInfo(msg.sender_id).profile_picture}
          />
        ))
      )}

      {isTyping && (
        <p className="text-xs text-[#999] italic px-3 pb-1">typing...</p>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-white">
          Write your message and add tracks or playlists{' '}
          <span className="text-red-500">*</span>
        </label>
        <MessageBox
          key={boxKey}
          onValueChange={setValue}
          onIsEmptyChange={(empty) => { if (empty) setError(null); }}
          onEmbedsResolved={setEmbeds}   // ← plural now
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