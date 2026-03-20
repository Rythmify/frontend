import { useState } from 'react'
import { Modal } from './Modal'
import DeleteConversationButton from '@/components/MessagingComponents/DeleteConversationButton'
import { BlockUserModal } from './BlockModal'
import { ReportModal } from './ReportModal'

interface ConversationHeaderProps {
  reciepiantId: string
  conversationId: string
}

const ConversationHeader = ({ reciepiantId, conversationId }: ConversationHeaderProps) => {
  const [isBlockOpen, setIsBlockOpen]   = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  return (
    <div data-test="conversation-header" className="flex justify-between">

      <div className="flex text-white">
        <button
          data-test="conversation-new-button"
          className="p-2 text-sm font-bold w-14 hover:text-grey-300"
        >
          Profile
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
          onClose={() => setIsBlockOpen(false)}
        />
      </Modal>

      <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)}>
        <ReportModal
          userId={reciepiantId}
          onClose={() => setIsReportOpen(false)}
        />
      </Modal>

    </div>
  )
}

export default ConversationHeader