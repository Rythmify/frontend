import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chats } from '@/components/MessagingComponents/Chats'
import MessagingHeader from '@/components/MessagingComponents/MessagingHeader'
import { fetchConversations, fetchConversation, type Conversation, type Message } from '@/services/api/messaging/conversationApi'
import ConversationHeader from '@/components/MessagingComponents/ConversationHeader'
import SendMessageForm from '@/components/MessagingComponents/SendMessageForm'

export default function MessageIdPage() {
  const navigate = useNavigate()

  const [conversations, setConversations]   = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId]     = useState<string | null>(null)
  const [activeMessages, setActiveMessages] = useState<Message[]>([])
  const [loadingConvs, setLoadingConvs]     = useState(true)
  const [loadingMsgs, setLoadingMsgs]       = useState(false)
  const [error, setError]                   = useState<string | null>(null)

  const activeConv = conversations.find(c => c.id === activeConvId) ?? null

  // 1. Fetch all conversations, then auto-open the first one
  useEffect(() => {
    setLoadingConvs(true)
    fetchConversations()
      .then(res => {
        const items = res.data.items
        setConversations(items)
        if (items.length > 0) {
          loadConversation(items[0])
        }
      })
      .catch(() => setError('Could not load conversations.'))
      .finally(() => setLoadingConvs(false))
  }, [])

  // 2. Load messages for a given conversation
  const loadConversation = (conv: Conversation) => {
    setActiveConvId(conv.id)
    setActiveMessages([])
    setLoadingMsgs(true)
    fetchConversation(conv.id)
      .then(res => setActiveMessages(res.data.messages))
      .catch(() => setError('Could not load messages.'))
      .finally(() => setLoadingMsgs(false))
  }

  // 3. On message sent — append to messages + update chat profile preview
  const handleMessageSent = (msg: Message) => {
    setActiveMessages(prev => [...prev, msg])
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConvId
          ? { ...c, last_message: msg, updated_at: msg.created_at }
          : c
      )
    )
  }

  const handleSelectConversation = (conv: Conversation) => {
    navigate(`/messages/${conv.participant.id}`)
    loadConversation(conv)
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
              recipientName={activeConv.participant.display_name}
            />
            <SendMessageForm
              conversationId={activeConv.id}
              existingMessages={activeMessages}
              loadingMessages={loadingMsgs}
              onMessageSent={handleMessageSent}
              currentUser={{
                display_name: 'Me',
                profile_picture: null,
              }}
            />
          </>
        ) : (
          !loadingConvs && (
            <div className="flex items-center justify-center flex-1 text-sm text-[#666]">
              Select a conversation to start messaging.
            </div>
          )
        )}
      </div>

    </div>
  )
}