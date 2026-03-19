import { useState, useEffect } from 'react'
import { Chats } from '@/components/MessagingComponents/Chats'
import ConversationPage from '@/components/MessagingComponents/ConversationPage'
import MessagingHeader from '@/components/MessagingComponents/MessagingHeader'
import { fetchConversations, type Conversation } from '@/services/api/messaging/conversationApi'
import { BlockUserModal } from '@/components/MessagingComponents/BlockModal'
import ConversationHeader from '@/components/MessagingComponents/ConversationHeader'
import { Modal } from '@/components/MessagingComponents/Modal'
import { ReportModal } from "@/components/MessagingComponents/ReportModal"
import { SpamModal } from "@/components/MessagingComponents/SpamModal"
import {MessageBox} from '@/components/MessagingComponents/MessageBox'
type ActiveModal = 'none' | 'report' | 'spam'

export default function MessageIdPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId]   = useState<string | null>(null)
  const [loadingConvs, setLoadingConvs]   = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [activeModal, setActiveModal]     = useState<ActiveModal>('none')

  const activeConv = conversations.find(c => c.id === activeConvId) ?? null

  useEffect(() => {
    setLoadingConvs(true)
    setError(null)
    fetchConversations()
      .then(res => setConversations(res.data.items))
      .catch(() => setError('Could not load conversations.'))
      .finally(() => setLoadingConvs(false))
  }, [])

  return (
    <div className="container flex px-4 py-6 md:px-8 lg:px-20">
      <div className="flex flex-col gap-4">
        <MessagingHeader />
        <Chats
          conversations={conversations}
          loading={loadingConvs}
          error={error}
          activeConversationId={activeConvId}
          onSelect={(conv) => setActiveConvId(conv.id)}
        />
      </div>
      <ConversationHeader />

      <button
        className="p-2 text-sm font-bold text-black border bg-text-hover rounded-[5px] w-14 hover:text-grey-300"
        onClick={() => setActiveModal('report')}
      >
        Report
      </button>

      {/* Report reason picker */}
      <Modal isOpen={activeModal === 'report'} onClose={() => setActiveModal('none')}>
        <ReportModal
          username="sondos ahmed"
          userId="12345678"
          onClose={() => setActiveModal('none')}
          onSpamSelected={() => setActiveModal('spam')}
        />
      </Modal>

      {/* Spam confirmation — only reachable after clicking Spam in ReportModal */}
      <Modal isOpen={activeModal === 'spam'} onClose={() => setActiveModal('none')}>
        <SpamModal
          username="sondos ahmed"
          userId="12345678"
          onClose={() => setActiveModal('none')}
          onReported={() => console.log("User reported for spam")}
        />
      </Modal>
<MessageBox onIsEmptyChange={(isEmpty) => console.log("Message box is empty:", isEmpty)} onEmbedResolved={(embed) => console.log("Resolved embed:", embed)} />
      {/*
      <ConversationPage />  conversation={activeConv} */}
    </div>
  )
}