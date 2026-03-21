import { useState } from 'react'
import { Modal } from './Modal'
import DeleteConversationButton from '@/components/MessagingComponents/DeleteConversationButton'
import { BlockUserModal } from './BlockModal'
import { ReportModal } from './ReportModal'
import { SpamModal } from './SpamModal'
import { useNavigate } from 'react-router-dom'
import { markMessageReadState } from '@/services/api/messaging/conversationApi'
interface ConversationHeaderProps {
  reciepiantId: string
  conversationId: string
  recipientName: string
  lastMessageId: string | null         
  isUnread: boolean                   
  onReadStateChange: (isUnread: boolean) => void  
  onDeleted?: (conversationId: string) => void
}


const ConversationHeader = ({ reciepiantId, conversationId, recipientName, onDeleted , lastMessageId, isUnread, onReadStateChange }: ConversationHeaderProps) => {
  const [isBlockOpen, setIsBlockOpen]   = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isSpamOpen, setIsSpamOpen]     = useState(false)
  const [loadingRead, setLoadingRead]   = useState(false)  
  const navigate = useNavigate()

    const handleToggleRead = async () => {
    if (!lastMessageId) return
    setLoadingRead(true)
    try {
      await markMessageReadState(conversationId, lastMessageId, isUnread) // if currently unread → mark as read (is_read: true), and vice versa
      onReadStateChange(!isUnread)
    } finally {
      setLoadingRead(false)
    }
  }

  return (
    <div data-test="conversation-header" className="flex justify-between">

      <div className="flex text-white">
       <button
  data-test="conversation-profile-button"
  className="p-2 text-sm font-bold hover:text-grey-300"
  onClick={() => navigate(`/users/${reciepiantId}`)}
  >
  {recipientName}
</button>

        <button
          data-test="conversation-block-button"
          className="p-2 text-sm font-bold w-14 hover:text-grey-300"
          onClick={() => setIsBlockOpen(true)}
        >
          Block
        </button>

        <button
          data-test="conversation-report-button"
          className="p-2 text-sm font-bold w-14 hover:text-grey-300"
          onClick={() => setIsReportOpen(true)}
        >
          Report
        </button>
      </div>

      <div className="flex gap-2">
      
         <button
          onClick={handleToggleRead}
          disabled={loadingRead || !lastMessageId}
          className="px-4 py-2 text-sm font-bold text-black bg-white rounded-sm hover:bg-gray-200 disabled:opacity-50"
        >
          {isUnread ? 'Mark as read' : 'Mark as unread'}
        </button>

        <DeleteConversationButton
          conversationId={conversationId}
          participantId={reciepiantId}
          onDeleted={onDeleted}
        />
      </div>

      <Modal isOpen={isBlockOpen} onClose={() => setIsBlockOpen(false)}>
        <BlockUserModal
          userId={reciepiantId}
          username={recipientName}
          onClose={() => setIsBlockOpen(false)}
        />
      </Modal>

      <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)}>
        <ReportModal
          userId={reciepiantId}
          username={recipientName}
          onClose={() => setIsReportOpen(false)}
           onSpamSelected={() => {           
            setIsReportOpen(false)
            setIsSpamOpen(true)
          }}
        />
      </Modal>
        <Modal isOpen={isSpamOpen} onClose={() => setIsSpamOpen(false)}>  {/* ← add */}
        <SpamModal
          userId={reciepiantId}
          username={recipientName}
          onClose={() => setIsSpamOpen(false)}
        />
      </Modal>

    </div>
  )
}

export default ConversationHeader