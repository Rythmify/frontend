import { ChatProfile } from '@/components/MessagingComponents/ChatProfile'
import { type Conversation } from '@/services/api/messaging/conversationApi'

interface ChatsProps {
  conversations: Conversation[]
  loading: boolean
  error: string | null
  activeConversationId: string | null
  onSelect: (conversation: Conversation) => void
}

export function Chats({
  conversations,
  loading,
  error,
  activeConversationId,
  onSelect,
}: ChatsProps) {

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-1 px-2 py-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="px-4 py-8 text-sm text-center text-[#666]">
        {error}
      </div>
    )
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (conversations.length === 0) {
    return (
      <div className="px-4 py-10 text-sm text-center text-[#666] leading-relaxed">
        No conversations yet.
        <br />
        Start one with the <span className="font-semibold text-white">New</span> button above.
      </div>
    )
  }

  // ── List ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col overflow-y-auto">
      {conversations.map(conv => (
        <ChatProfile
          key={conv.id}
          conversation={conv}
          isActive={conv.id === activeConversationId}
          onClick={() => onSelect(conv)}
        />
      ))}
    </div>
  )
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-11 h-11 rounded-full bg-[#2a2a2a] shrink-0" />
      <div className="flex flex-col flex-1 min-w-0 gap-2">
        <div className="flex justify-between gap-4">
          <div className="h-3 bg-[#2a2a2a] rounded w-2/5" />
          <div className="h-3 bg-[#2a2a2a] rounded w-1/5" />
        </div>
        <div className="h-3 bg-[#2a2a2a] rounded w-3/4" />
      </div>
    </div>
  )
}