// ConversationItem.tsx
interface ConversationItemProps {
  photo: string
  name: string
  lastMessage: string
  sentFrom: string
  isActive?: boolean
  onClick?: () => void
}

export function ChatProfile({
  photo,
  name,
  lastMessage,
  sentFrom,
  isActive = false,
  onClick,
}: ConversationItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors rounded-sm ${
        isActive ? "bg-[black]" : "hover:bg-[#303030]"
      }`}
    >
      {/* Avatar */}
      <img
        src={photo}
        alt={name}
        className="object-cover rounded-full w-11 h-11 shrink-0"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-semibold text-white truncate">{name}</span>
          <span className="text-[#999] text-xs shrink-0">{sentFrom}</span>
        </div>
        <p className="text-[#999] text-sm truncate">{lastMessage}</p>
      </div>
    </div>
  )
}