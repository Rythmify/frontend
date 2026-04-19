import type { Message } from '../../services/api/messaging/conversationApi';

interface MessageCellProps {
  message: Message;
  displayName: string;
  profilePicture?: string | null;
}

export default function MessageCell({ message, displayName, profilePicture }: MessageCellProps) {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  return (
    <div className="flex items-start gap-3 py-3">
     <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-[#2a2a2a]">
  {profilePicture ? (
    <img
      src={profilePicture}
      alt={displayName}
      className="object-cover rounded-full w-9 h-9"  
    />
  ) : (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#b08a8a] to-[#6b5b6b] flex-shrink-0" />  
  )}
</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-white">{displayName}</span>
          <span className="flex-shrink-0 text-xs text-gray-500">{timeAgo(message.created_at)}</span>
        </div>
        <p className="text-sm text-gray-400 mt-0.5 break-words">{message.body}</p>
      </div>
    </div>
  );
}