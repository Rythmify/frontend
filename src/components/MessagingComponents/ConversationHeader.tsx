import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './Modal'
import DeleteConversationButton from '@/components/MessagingComponents/DeleteConversationButton'
import { BlockUserModal } from './BlockModal'
import { ReportModal } from './ReportModal'
import { SpamModal } from './SpamModal'
import { markMessageReadState } from '@/services/api/messaging/conversationApi'
import { unblockUser } from '@/services/api/messaging/conversationApi'

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
    <div data-test="conversation-header" className="flex justify-between items-center border-b border-border pb-3 sticky top-0 bg-your-background-color z-10">

      <div className="flex items-center gap-2 text-text">
        <button
          data-test="conversation-profile-button"
          className="p-2 text-sm font-bold text-text hover:text-text-hover"
          onClick={() => navigate(`/users/${reciepiantId}`)}
        >
          {recipientName}
        </button>

        <button
          data-test="conversation-block-button"
          className="p-2 text-sm font-bold text-text-secondary hover:text-text-hover"
          onClick={isBlocked ? handleUnblock : () => setIsBlockOpen(true)}
        >
          {isBlocked ? 'Unblock' : 'Block'}
        </button>

        <button
          data-test="conversation-report-button"
          className="p-2 text-sm font-bold text-text-secondary hover:text-text-hover"
          onClick={() => setIsReportOpen(true)}
        >
          Report
        </button>
      </div>

      <div className="flex gap-2 items-center">
        <button
          onClick={handleToggleRead}
          disabled={loadingRead || !lastMessageId}
          className="px-4 py-2 text-sm font-bold text-text bg-bg-inverted rounded-sm border border-border hover:bg-input-bg disabled:opacity-50"
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