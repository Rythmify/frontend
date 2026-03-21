import { useState } from 'react'
import { Modal } from './Modal'
import DeleteConversationButton from '@/components/MessagingComponents/DeleteConversationButton'
import { BlockUserModal } from './BlockModal'
import { ReportModal } from './ReportModal'
import { SpamModal } from './SpamModal'
import { useNavigate } from 'react-router-dom'
interface ConversationHeaderProps {
  reciepiantId: string
  conversationId: string
  recipientName: string
}


const ConversationHeader = ({ reciepiantId, conversationId, recipientName }: ConversationHeaderProps) => {
  const [isBlockOpen, setIsBlockOpen]   = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isSpamOpen, setIsSpamOpen]     = useState(false) 
  const navigate = useNavigate()
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

      <div className="flex">
        <DeleteConversationButton
          conversationId={conversationId}
          participantId={reciepiantId}
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