import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { type Notification,markNotificationRead } from '@/services/api/notifications/notificationsAPI'
import FollowButton from '@/components/UI/FollowButton'
import { Modal } from '@/components/UI/Modal'
import { BlockUserModal } from '@/components/UI/BlockModal'
import { ReportModal } from '@/components/UI/ReportModal'
import { SpamModal } from '@/components/UI/SpamModal'
import UserAvatar from '@/components/UI/UserAvatar'
import { useAuthStore } from '@/stores/auth.store'
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
    case 'follow':
      return 'started following you'
    case 'like':
      return `liked your ${n.resource_type}  "${n.resource_details?.title ?? ''}"`
    case 'repost':
      return `reposted your ${n.resource_type} "${n.resource_details?.title ?? ''}"`
    case 'comment':
      return `commented "${n.resource_details?.content ?? ''}" on your ${n.resource_type}`
    default:
      return ''
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  row:            `flex items-start sm:items-center gap-4 cursor-pointer p-3`,
  unreadDot:      `w-2 h-2 rounded-full bg-red-500 flex-shrink-0`,
  unreadDotHidden:`w-2 h-2 flex-shrink-0`,
  avatarWrapper:  `relative w-11 h-11 flex-shrink-0 overflow-visible`,
  avatar:         `w-full h-full rounded-full bg-[#EEEEEE] overflow-hidden`,
  avatarImg:      `w-full h-full object-cover`,
  avatarFallback: `w-full h-full flex items-center justify-center rounded-full bg-zinc-800 text-white text-sm font-bold`,
  unreadDotOverlay:`absolute -top-1 -left-1 w-2 h-2 rounded-full bg-red-500 z-10`,
  content:        `flex-1 min-w-0`,
  textRow:        `text-sm text-white leading-snug`,
  username:       `font-bold mr-1`,
  actionText:     `font-normal text-text-secondary`,
  timeRow:        `flex items-center gap-1 text-xs text-text-secondary mt-1`,
  timeIcon:       `fa-solid fa-user text-[10px]`,
  actions:        `flex items-center gap-2 flex-shrink-0 self-start sm:self-auto`,
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
 onMarkRead?: (id: string) => void
'data-test'?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

const NotificationCard = ({ notification: n, showActions = true, onMarkRead }: NotificationCardProps) => {
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen]         = useState(false)
  const [isBlockOpen, setIsBlockOpen]   = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isSpamOpen, setIsSpamOpen]     = useState(false)
  const { user } = useAuthStore()

    const handleCellClick = async () => {
    if (!n.is_read) {
      try {
        await markNotificationRead(n.id)
        onMarkRead?.(n.id)
      } catch {
        // non-critical — still navigate
      }
    }
    if (n.type === 'follow') {
      navigate(`/${n.actor.username}`)
    } else {
      navigate(`/${n.resource_type}/${n.resource_id}`)
    }
  }

  return (
    <>
      <div data-test={`notification-card-${n.id}`} className={styles.row } onClick={handleCellClick}>

        {/* Avatar */}
        <div data-test={`notification-avatar-${n.id}`} className={styles.avatarWrapper}>
          {/* Unread dot */}
          {!n.is_read && <div className={styles.unreadDotOverlay} />}

          <UserAvatar
            src={n.actor?.avatar}
            name={n.actor?.display_name ?? n.actor?.username ?? ""}
            alt={n.actor?.display_name ?? n.actor?.username ?? "User"}
            imageDataTest={`notification-avatar-img-${n.id}`}
            fallbackDataTest={`notification-avatar-fallback-${n.id}`}
            wrapperClassName={styles.avatar}
            imageClassName={styles.avatarImg}
            initialsClassName={styles.avatarFallback}
          />
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
        <FollowButton
         username={n.actor.username}
         userId={n.actor.id}
         initialIsFollowing={user?.following_ids?.includes(n.actor.id) ?? false}
          />
          )}

          {/* more button */}
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
          onSpamSelected={() => { setIsReportOpen(false); setIsSpamOpen(true) }}
        />
      </Modal>

      {/* Spam Modal */}
      <Modal isOpen={isSpamOpen} onClose={() => setIsSpamOpen(false)}>
        <SpamModal
          userId={n.actor.id}
          username={n.actor.display_name}
          onClose={() => setIsSpamOpen(false)}
        />
      </Modal>
    </>
  )
}

export default NotificationCard
