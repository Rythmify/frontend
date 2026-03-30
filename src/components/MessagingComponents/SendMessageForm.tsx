import { useState } from 'react';
import { sendMessage } from '../../services/api/messaging/conversationApi';
import type { Message } from '../../services/api/messaging/conversationApi';
import { MessageBox } from './MessageBox';
import type { ResolvedEmbed } from './MessageBox';
import MessageCell from './messagecell';
import { useAuthStore } from '@/stores/auth.store' 
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
  const [embed, setEmbed]         = useState<ResolvedEmbed | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [boxKey, setBoxKey]       = useState(0);

  const handleSend = async () => {
    if (value.trim() === '') {
      setError('Enter a message');
      return;
    }
    setError(null);
    setIsSending(true);
    try {
      const res = await sendMessage(conversationId, {
        body: value.trim(),
        ...(embed ? { resource: { type: embed.type, id: embed.id } } : {}),
      });
      onMessageSent({ ...res.data, body: value.trim() });
      setValue('');
      setEmbed(null);
      setBoxKey(k => k + 1);
    }  catch (err: unknown) {
    const axiosError = err as { response?: { status: number } }
    if (axiosError.response?.status === 403) {
      setError('Unable to send message to this user.')
    } else {
      setError('Failed to send message. Please try again.')
    }
    } finally {
      setIsSending(false);
    }
  };

const user = useAuthStore(state => state.user)
const getSenderInfo = (senderId: string) => {
  if (senderId === user?.id) {
    return {
      display_name: 'Me',
      profile_picture: user?.avatar??null
    };
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
          onEmbedResolved={setEmbed}
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