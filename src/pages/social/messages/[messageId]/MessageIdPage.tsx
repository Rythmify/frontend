import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chats } from '@/components/MessagingComponents/Chats'
import MessagingHeader from '@/components/MessagingComponents/MessagingHeader'
import { fetchConversations, type Conversation } from '@/services/api/messaging/conversationApi'
import ConversationHeader from '@/components/MessagingComponents/ConversationHeader'
import SendMessageForm from '@/components/MessagingComponents/SendMessageForm'

type ActiveModal = 'none' | 'report' | 'spam'

export default function MessageIdPage() {
  const navigate = useNavigate()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId]   = useState<string | null>(null)
  const [loadingConvs, setLoadingConvs]   = useState(true)
  const [error, setError]                 = useState<string | null>(null)

  const activeConv = conversations.find(c => c.id === activeConvId) ?? null

  useEffect(() => {
    setLoadingConvs(true)
    setError(null)
    fetchConversations()
      .then(res => setConversations(res.data.items))
      .catch(() => setError('Could not load conversations.'))
      .finally(() => setLoadingConvs(false))
  }, [])

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConvId(conv.id)
    navigate(`/messages/${conv.participant.id}`)
  }

  return (
    <div data-test="message-id-page" className="container flex px-4 py-6 md:px-8 lg:px-20">

      {/* ── Left: conversation list ── */}
      <div className="flex flex-col gap-4 mr-30">
        <MessagingHeader />
        <Chats
          conversations={conversations}
          loading={loadingConvs}
          error={error}
          activeConversationId={activeConvId}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* ── Right: active conversation ── */}
      <div className="flex flex-col flex-1 gap-4 ml-6">
        {activeConv ? (
          <>
            <ConversationHeader
              conversationId={activeConv.id}
              reciepiantId={activeConv.participant.id}
            />
            <SendMessageForm
              conversationId={activeConv.id}
              currentUser={{
                display_name: 'Me',
                profile_picture: null,
              }}
            />
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-sm text-[#666]">
            Select a conversation to start messaging.
          </div>
        )}
      </div>

    </div>
  )
}