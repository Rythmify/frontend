import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './Modal'
import DeleteConversationButton from '@/components/MessagingComponents/DeleteConversationButton'
import { BlockUserModal } from '../UI/BlockModal'
import { ReportModal } from '../UI/ReportModal'
import { SpamModal } from '../UI/SpamModal'
import { markMessageReadState, unblockUser, fetchFollowStatus } from '@/services/api/messaging/conversationApi'
import Tooltip from '@/components/UI/Tooltip'

interface ConversationHeaderProps {
  reciepiantId: string
  conversationId: string
  recipientName: string
  lastMessageId: string | null
  onReadStateChange: (isUnread: boolean) => void
  onDeleted?: (conversationId: string) => void
  onBack?: () => void
}

const ConversationHeader = ({
  reciepiantId,
  conversationId,
  recipientName,
  lastMessageId,
  onReadStateChange,
  onDeleted,
  onBack,
}: ConversationHeaderProps) => {
  const navigate = useNavigate()

  const [isReportOpen, setIsReportOpen]     = useState(false)
  const [isSpamOpen, setIsSpamOpen]         = useState(false)
  const [isBlockOpen, setIsBlockOpen]       = useState(false)
  const [loadingRead, setLoadingRead]       = useState(false)
  const [isUnread, setIsUnread]             = useState(false)
  const [isBlocked, setIsBlocked]           = useState(false)
  const [loadingBlock, setLoadingBlock]     = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsUnread(false)
  }, [conversationId])

  useEffect(() => {
    if (!reciepiantId) return
    setLoadingBlock(true)
    fetchFollowStatus(reciepiantId)
      .then((res) => setIsBlocked(res.data.is_blocking))
      .catch(() => setIsBlocked(false))
      .finally(() => setLoadingBlock(false))
  }, [reciepiantId])

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
    <div data-test="conversation-header" className="flex justify-between items-center border-b border-border pb-3 top-0 bg-your-background-color z-[10]">

      {/* Left: back + name + [desktop: block + report] */}
      <div className="flex items-center gap-2 text-text">
        {onBack && (
          <button
            data-test="conversation-back-button"
            className="md:hidden p-2 text-white hover:text-text-secondary transition-colors"
            onClick={onBack}
          >
            <i className="fa-solid fa-arrow-left" />
          </button>
        )}
        <button
          data-test="conversation-profile-button"
          className="p-2 text-sm font-bold text-white hover:text-text-secondary transition-colors cursor-pointer"
          onClick={() => navigate(`/${recipientName}`)}
        >
          {recipientName}
        </button>
        {/* Desktop only */}
        <div className="hidden md:flex items-center gap-2">
          <Tooltip text={isBlocked ? 'Unblock' : 'Block'}>
            <button
              data-test="conversation-block-button"
              className="p-2 text-sm font-bold text-white hover:text-text-secondary transition-colors cursor-pointer disabled:opacity-50"
              disabled={loadingBlock}
              onClick={isBlocked ? handleUnblock : () => setIsBlockOpen(true)}
            >
              {loadingBlock ? '...' : isBlocked ? 'Unblock' : 'Block'}
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
      </div>

      {/* Right: [desktop: mark as read] + delete + [mobile: ... menu] */}
      <div className="flex gap-2 items-center">
        {/* Desktop only */}
        <div className="hidden md:flex gap-2 items-center">
          <Tooltip text="Mark as read/unread">
            <button
              data-test="conversation-toggle-read-button"
              onClick={handleToggleRead}
              disabled={loadingRead || !lastMessageId}
              className="px-2 py-1.5 text-sm font-bold text-white bg-input-bg rounded-sm border border-border hover:bg-input-bg disabled:opacity-50 hover:text-text-secondary"
            >
              {isUnread ? 'Mark as read' : 'Mark as unread'}
            </button>
          </Tooltip>
        </div>
        <Tooltip text="Archive this conversation">
          <DeleteConversationButton
            conversationId={conversationId}
            participantId={reciepiantId}
            onDeleted={onDeleted}
          />
        </Tooltip>
        {/* Mobile only: ... menu */}
        <div className="md:hidden relative">
          <button
            data-test="conversation-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(p => !p)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2a2a2a] text-white hover:text-text-secondary transition-colors"
          >
            <i className="fa-solid fa-ellipsis" />
          </button>
          {mobileMenuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-bg border border-border rounded-sm z-20 min-w-[180px] py-1 shadow-xl">
              <button
                data-test="conversation-block-button-mobile"
                className="w-full text-left px-4 py-3 text-sm font-bold text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
                disabled={loadingBlock}
                onClick={() => {
                  if (isBlocked) { handleUnblock() } else { setIsBlockOpen(true) }
                  setMobileMenuOpen(false)
                }}
              >
                {loadingBlock ? '...' : `${isBlocked ? 'Unblock' : 'Block'} ${recipientName}`}
              </button>
              <button
                data-test="conversation-report-button-mobile"
                className="w-full text-left px-4 py-3 text-sm font-bold text-white hover:bg-[#2a2a2a] transition-colors"
                onClick={() => { setIsReportOpen(true); setMobileMenuOpen(false) }}
              >
                Report {recipientName}
              </button>
              <button
                data-test="conversation-toggle-read-button-mobile"
                disabled={loadingRead || !lastMessageId}
                className="w-full text-left px-4 py-3 text-sm font-bold text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
                onClick={() => { handleToggleRead(); setMobileMenuOpen(false) }}
              >
                {isUnread ? 'Mark as read' : 'Mark as unread'}
              </button>
            </div>
          )}
        </div>
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