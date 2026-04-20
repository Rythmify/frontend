import { type Conversation } from '@/services/api/messaging/conversationApi'

const timeAgo = (dateStr: string): string => {
 const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
}
interface ChatProfileProps {
  conversation: Conversation
  isActive?: boolean
  onClick?: () => void
}

export function ChatProfile({ conversation, isActive = false, onClick }: ChatProfileProps) {
  const { participant, last_message, unread_count, updated_at } = conversation

  return (
    <div
      data-test={`chat-profile-${conversation.id}`}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors rounded-sm width-full ${
        isActive ? 'bg-[#303030]' : 'hover:bg-[#303030]'
      }`}
    >
       
      <div className="relative shrink-0 ">
           <div className="flex w-3 shrink-0">
  {unread_count > 0 && (
    <span className="w-2.5 h-2.5 rounded-full bg-[#f50] block" />
  )}
</div>
       {participant.avatar ? (
  <img
    src={participant.avatar}
    alt={participant.display_name}
    className="object-cover rounded-full w-11 h-11"
  />
) : (
  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#b08a8a] to-[#6b5b6b] flex-shrink-0" />
)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className={`text-xs truncate ${
              unread_count > 0 ? 'font-bold text-white' : 'font-semibold text-white'
            }`}
          >
            {participant.display_name}
          </span>
          <span className="text-[#999] text-xs shrink-0">{timeAgo(updated_at)}</span>
        </div>
        <p
          className={`text-xs truncate ${
            unread_count > 0 ? 'text-[#ccc] font-medium' : 'text-[#999]'
          }`}
        >
          {last_message?.body || '·'}
        </p>
      </div>
    </div>
  )
}