import { type Conversation } from '@/services/api/messaging/conversationApi'
import UserAvatar from '@/components/UI/UserAvatar'

const timeAgo = (dateStr: string): string => {
  const diff    = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  const months  = Math.floor(days / 30);
  const years   = Math.floor(days / 365);
  const weeks   = Math.floor(days / 7);

  if (years > 0)   return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0)  return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks > 0)   return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days > 0)    return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0)   return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "just now";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLastMessagePreview(last_message: Conversation["last_message"] | null): string {
  if (!last_message) return "·";

  // Has text body — show it (truncation handled by CSS)
  if (last_message.body?.trim()) return last_message.body.trim();

  // Embed only — show a readable fallback
  if (last_message.embed_type === "track")    return "🎵 Shared a track";
  if (last_message.embed_type === "playlist") return "🎶 Shared a playlist";

  // Fallback
  return "·";
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ChatProfileProps {
  conversation: Conversation
  isActive?: boolean
  onClick?: () => void
}

export function ChatProfile({ conversation, isActive = false, onClick }: ChatProfileProps) {
  const { participant, last_message, unread_count, updated_at } = conversation

  const preview = getLastMessagePreview(last_message)

  return (
    <div
      data-test={`chat-profile-${conversation.id}`}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors rounded-sm width-full ${
        isActive ? 'bg-[#303030]' : 'hover:bg-[#303030]'
      }`}
    >
      <div className="relative shrink-0">
        <div className="flex w-3 shrink-0">
          {unread_count > 0 && (
            <span data-test="chat-profile-unread-dot" className="w-2.5 h-2.5 rounded-full bg-[#f50] block" />
          )}
        </div>
        <UserAvatar
          src={participant.avatar}
          name={participant.display_name}
          alt={participant.display_name}
          wrapperClassName="w-11 h-11 rounded-full overflow-hidden flex-shrink-0"
          initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-white text-sm font-bold"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            data-test="chat-profile-name"
            className={`text-xs truncate ${
              unread_count > 0 ? 'font-bold text-white' : 'font-semibold text-white'
            }`}
          >
            {participant.display_name}
          </span>
          <span data-test="chat-profile-time" className="text-[#999] text-xs shrink-0">{timeAgo(updated_at)}</span>
        </div>
        <p
          data-test="chat-profile-preview"
          className={`text-xs truncate ${
            unread_count > 0 ? 'text-[#ccc] font-medium' : 'text-[#999]'
          }`}
        >
          {preview}
        </p>
      </div>
    </div>
  )
}