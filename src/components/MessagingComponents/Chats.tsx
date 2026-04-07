import { ChatProfile } from '@/components/MessagingComponents/ChatProfile'
import { type Conversation } from '@/services/api/messaging/conversationApi'
import Spinner from '@/components/UI/Spinner'
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
      // <div className="flex flex-col gap-1 px-2 py-3 width-full">
      //   {Array.from({ length: 6 }).map((_, i) => (
      //     <SkeletonRow key={i} />
      //   ))}
      // </div>
      <Spinner />
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="px-4 py-8 text-sm text-center text-[#666] width-full">
        {error}
      </div>
    )
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (conversations.length === 0) {
    return (
      <div className="px-4 py-10 text-sm text-center text-[#666] leading-relaxed width-full">
        No conversations yet.
        <br />
        Start one with the <span className="font-semibold text-white">New</span> button above.
      </div>
    )
  } //lesa should be checked as i don't know if this is a valid testcase asln as lw mafesh ma haro7 l el empty page w lw kolo deleted nafs el kalam fa eh mmkn ywaslne l el mar7ala de!!!!!!!!1

  // ── List ─────────────────────────────────────────────────────────────────
  return (
    <div data-test="chat-list" className="flex flex-col overflow-y-auto width-full">
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

// function SkeletonRow() { looked better than the spinner but what actually appears in SoundCloud is the spinner But left till we ask the Ta and he acceptes this change 
//   return (
//     <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
//       <div className="w-11 h-11 rounded-full bg-[#2a2a2a] shrink-0" />
//       <div className="flex flex-col flex-1 min-w-0 gap-2">
//         <div className="flex justify-between gap-4">
//           <div className="h-3 bg-[#2a2a2a] rounded w-2/5" />
//           <div className="h-3 bg-[#2a2a2a] rounded w-1/5" />
//         </div>
//         <div className="h-3 bg-[#2a2a2a] rounded w-3/4" />
//       </div>
//     </div>
//   )
//}