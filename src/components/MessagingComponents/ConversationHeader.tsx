import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './Modal'
import DeleteConversationButton from '@/components/MessagingComponents/DeleteConversationButton'
import { BlockUserModal } from '../UI/BlockModal'
import { ReportModal } from '../UI/ReportModal'
import { SpamModal } from '../UI/SpamModal'
import { markMessageReadState } from '@/services/api/messaging/conversationApi'
import { unblockUser } from '@/services/api/messaging/conversationApi'
import Tooltip from '@/components/UI/Tooltip'
interface ConversationHeaderProps {
  reciepiantId: string
  conversationId: string
  recipientName: string
  lastMessageId: string | null
  onReadStateChange: (isUnread: boolean) => void
  onDeleted?: (conversationId: string) => void
}

const ConversationHeader = ({
  reciepiantId,
  conversationId,
  recipientName,
  lastMessageId,
  onReadStateChange,
  onDeleted,
}: ConversationHeaderProps) => {
  const navigate = useNavigate()

  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isSpamOpen, setIsSpamOpen]     = useState(false)
  const [isBlockOpen, setIsBlockOpen]   = useState(false)
  const [loadingRead, setLoadingRead]   = useState(false)
  const [isUnread, setIsUnread]         = useState(false)
  const [isBlocked, setIsBlocked]       = useState(false)

  useEffect(() => {
    setIsUnread(false)
  }, [conversationId])

  const handleToggleRead = async () => {
    if (!lastMessageId) return
    setLoadingRead(true)
    try {
      await markMessageReadState(conversationId, lastMessageId, isUnread)
      setIsUnread(prev => !prev)
      onReadStateChange(!isUnread)
    } finally {
      setLoadingRead(false)
    }
  }

  const handleUnblock = async () => {
    try {
      await unblockUser(reciepiantId)
      setIsBlocked(false)
    } catch {
      // silently fail
    }
  }

  return (
    <div data-test="conversation-header" className="flex justify-between items-center border-b border-border pb-3  top-0 bg-your-background-color z-10 ">

      <div className="flex items-center gap-2 text-text  ">
        <button
          data-test="conversation-profile-button"
          className="p-2 text-sm font-bold text-white hover:text-text-secondary transition-colors cursor-pointer"
          onClick={() => navigate(`/${recipientName}`)}
        >
          {recipientName}
        </button>
<Tooltip text="Block">
        <button
          data-test="conversation-block-button"
          className="p-2 text-sm font-bold text-white hover:text-text-secondary transition-colors cursor-pointer"
          onClick={isBlocked ? handleUnblock : () => setIsBlockOpen(true)}
        >
          {isBlocked ? 'Unblock' : 'Block'}
        </button>
</Tooltip>
<Tooltip text="Report">

        <button
          data-test="conversation-report-button"
          className="p-2 text-sm font-bold text-white hover:text-text-secondary transition-colors cursor-pointer"
          onClick={() => setIsReportOpen(true)}
        >
          Report
        </button>
        </Tooltip>
      </div>

      <div className="flex gap-2 items-center">
        <Tooltip text="Mark as read/unread">

        <button
          onClick={handleToggleRead}
          disabled={loadingRead || !lastMessageId}
          className="px-4 py-2 text-sm font-bold text-white bg-input-bg rounded-sm border border-border hover:bg-input-bg disabled:opacity-50 hover:text-text-secondary"
        >
          {isUnread ? 'Mark as read' : 'Mark as unread'}
        </button>
</Tooltip>
        <Tooltip text="Archive this conversation  ">

        <DeleteConversationButton
          conversationId={conversationId}
          participantId={reciepiantId}
          onDeleted={onDeleted}
        />
        </Tooltip>
      </div>

      <Modal isOpen={isBlockOpen} onClose={() => setIsBlockOpen(false)}>
        <BlockUserModal
          userId={reciepiantId}
          username={recipientName}
          onClose={() => setIsBlockOpen(false)}
          onBlocked={() => {
            setIsBlocked(true)
            setIsBlockOpen(false)
          }}
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

      <Modal isOpen={isSpamOpen} onClose={() => setIsSpamOpen(false)}>
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