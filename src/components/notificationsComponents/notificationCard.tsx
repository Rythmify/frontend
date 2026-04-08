import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { type Notification } from '@/services/api/notifications/notificationsAPI'
import FollowButton from '@/components/UI/FollowButton'
import { Modal } from '@/components/UI/Modal'
import { BlockUserModal } from '@/components/UI/BlockModal'
import { ReportModal } from '@/components/UI/ReportModal'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatRelativeTime = (dateStr: string): string => {
  const diff    = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours   = Math.floor(diff / 3_600_000)
  const days    = Math.floor(diff / 86_400_000)

  if (minutes < 60) return `${minutes} minutes ago`
  if (hours   < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

const buildActionText = (n: Notification): string => {
  switch (n.type) {
    case 'follow':  return 'started following you'
    case 'like':    return `liked your track "${n.resource?.title ?? n.resource?.id ?? ''}"`
    case 'repost':  return `reposted your track "${n.resource?.title ?? n.resource?.id ?? ''}"`
    case 'comment': return `commented "${n.resource?.body ?? ''}" on your track`
    default:        return ''
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  row:            `flex items-center gap-4 py-4 border-b border-border cursor-pointer`,
  avatar:         `w-11 h-11 rounded-full bg-[#333] flex-shrink-0 overflow-hidden`,
  avatarImg:      `w-full h-full object-cover`,
  avatarFallback: `w-full h-full flex items-center justify-center`,
  fallbackIcon:   `fa-solid fa-user text-[#666] text-lg`,
  content:        `flex-1 min-w-0`,
  textRow:        `text-sm text-white leading-snug`,
  username:       `font-bold`,
  actionText:     `font-normal text-white`,
  timeRow:        `flex items-center gap-1 text-xs text-text-secondary mt-1`,
  timeIcon:       `fa-solid fa-user text-[10px]`,
  actions:        `flex items-center gap-2 flex-shrink-0`,
  dotsBtn:        `w-9 h-9 flex items-center justify-center bg-[#1a1a1a] border border-border rounded-sm hover:bg-[#2a2a2a] transition-colors`,
  dotsIcon:       `fa-solid fa-ellipsis text-white text-sm`,

  // Dropdown
  dropdownWrapper: `relative`,
  dropdown:        `absolute right-0 top-full mt-1 bg-bg border border-border rounded-sm z-20 min-w-[200px] py-1 shadow-xl`,
  dropdownItem:    `w-full text-left px-4 py-3 text-sm font-bold text-white hover:bg-[#2a2a2a] transition-colors`,
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationCardProps {
  notification: Notification
  showActions?: boolean
  'data-test'?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

const NotificationCard = ({ notification: n, showActions = true }: NotificationCardProps) => {
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen]       = useState(false)
  const [isBlockOpen, setIsBlockOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const handleCellClick = () => {
    if (n.type === 'follow') {
      navigate(`/${n.actor.username}`)
    } else {
      navigate(`/tracks/${n.resource?.id}`)
    }
  }

  return (
    <>
      <div data-test={`notification-card-${n.id}`} className={styles.row} onClick={handleCellClick}>

        {/* Avatar */}
        <div data-test={`notification-avatar-${n.id}`} className={styles.avatar}>
          {n.actor.profile_picture ? (
            <img
              data-test={`notification-avatar-img-${n.id}`}
              src={n.actor.profile_picture}
              alt={n.actor.display_name}
              className={styles.avatarImg}
            />
          ) : (
            <div data-test={`notification-avatar-fallback-${n.id}`} className={styles.avatarFallback}>
              <i className={styles.fallbackIcon} />
            </div>
          )}
        </div>

        {/* Text */}
        <div data-test={`notification-content-${n.id}`} className={styles.content}>
          <p className={styles.textRow}>
            <span data-test={`notification-username-${n.id}`} className={styles.username}>{n.actor.display_name}</span>
            {'  '}
            <span data-test={`notification-action-text-${n.id}`} className={styles.actionText}>{buildActionText(n)}</span>
          </p>
          <div data-test={`notification-time-${n.id}`} className={styles.timeRow}>
            <i className={styles.timeIcon} />
            {formatRelativeTime(n.created_at)}
          </div>
        </div>

        {/* Actions */}
        <div
          data-test={`notification-actions-${n.id}`}
          className={styles.actions}
          onClick={e => e.stopPropagation()}
        >
          {n.type === 'follow' && (
            <FollowButton username={n.actor.username} />
          )}

          {/* 3 dots */}
          {showActions && (
            <div data-test={`notification-menu-wrapper-${n.id}`} className={styles.dropdownWrapper}>
              <button
                data-test={`notification-menu-btn-${n.id}`}
                className={styles.dotsBtn}
                onClick={() => setMenuOpen(p => !p)}
              >
                <i className={styles.dotsIcon} />
              </button>

              {menuOpen && (
                <div data-test={`notification-menu-${n.id}`} className={styles.dropdown}>
                  <button
                    data-test={`notification-block-btn-${n.id}`}
                    className={styles.dropdownItem}
                    onClick={() => { setIsBlockOpen(true); setMenuOpen(false) }}
                  >
                    Block {n.actor.display_name}
                  </button>
                  <button
                    data-test={`notification-report-btn-${n.id}`}
                    className={styles.dropdownItem}
                    onClick={() => { setIsReportOpen(true); setMenuOpen(false) }}
                  >
                    Report {n.actor.display_name}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Block Modal */}
      <Modal isOpen={isBlockOpen} onClose={() => setIsBlockOpen(false)}>
        <BlockUserModal
          userId={n.actor.id}
          username={n.actor.display_name}
          onClose={() => setIsBlockOpen(false)}
          onBlocked={() => setIsBlockOpen(false)}
        />
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)}>
        <ReportModal
          userId={n.actor.id}
          username={n.actor.display_name}
          onClose={() => setIsReportOpen(false)}
          onSpamSelected={() => setIsReportOpen(false)}
        />
      </Modal>
    </>
  )
}

export default NotificationCard