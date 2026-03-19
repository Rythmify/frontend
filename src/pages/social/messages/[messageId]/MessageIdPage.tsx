import { useState, useEffect } from 'react'
import { Chats } from '@/components/MessagingComponents/Chats'
import MessagingHeader from '@/components/MessagingComponents/MessagingHeader'
import { fetchConversations, type Conversation } from '@/services/api/messaging/conversationApi'
import ConversationHeader from '@/components/MessagingComponents/ConversationHeader'
import SendMessageForm from '@/components/MessagingComponents/SendMessageForm'
// import { Participant } from './../../../../services/api/messaging/conversationApi';
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
    <div data-test="message-id-page" className="container flex px-4 py-6 md:px-8 lg:px-20">
      <div className="flex flex-col gap-4 mr-30">
        <MessagingHeader />
        <Chats
          conversations={conversations}
          loading={loadingConvs}
          error={error}
          activeConversationId={activeConvId}
          onSelect={(conv) => setActiveConvId(conv.id)}
        />
      </div>
      <div className="flex flex-col flex-1 gap-4 ml-6">
      <ConversationHeader conversationId={"783619"} reciepiantId={"12345678"} />
<SendMessageForm conversationId={"783619"} currentUser={{display_name:"sondos ahmed", profile_picture: 'https://i.pravatar.cc/150?img=1'}} />
</div>
  </div>
  )
}
      {/* <button
        data-test="open-report-modal-button"
        className="p-2 text-sm font-bold text-black border bg-text-hover rounded-[5px] w-14 hover:text-grey-300"
        onClick={() => setActiveModal('report')}
      >
        Report */}
      {/* </button> */}

      {/* Report reason picker */}
      {/* <Modal isOpen={activeModal === 'report'} onClose={() => setActiveModal('none')}>
        <ReportModal
          username="sondos ahmed"
          userId="12345678"
          onClose={() => setActiveModal('none')}
          onSpamSelected={() => setActiveModal('spam')}
        />
      </Modal> */}

      {/* Spam confirmation — only reachable after clicking Spam in ReportModal */}
      {/* <Modal isOpen={activeModal === 'spam'} onClose={() => setActiveModal('none')}>
        <SpamModal
          username="sondos ahmed"
          userId="12345678"
          onClose={() => setActiveModal('none')}
          onReported={() => console.log("User reported for spam")}
        />
      </Modal> */}
  {/* <DeleteConversationButton  
  conversationId={"783619"} 
  participantId='123456789'
   onDeleted={(id) => setConversations(prev => prev.filter(c => c.id !== id))}
  /> */}
      {/*
      <ConversationPage />  conversation={activeConv} */}
  