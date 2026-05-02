import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { type Notification, markNotificationRead, fetchFollowStatus } from '@/services/api/notifications/notificationsAPI'
import FollowButton from '@/components/UI/FollowButton'
import { Modal } from '@/components/UI/Modal'
import { BlockUserModal } from '@/components/UI/BlockModal'
import { ReportModal } from '@/components/UI/ReportModal'
import { SpamModal } from '@/components/UI/SpamModal'
import UserAvatar from '@/components/UI/UserAvatar'
import { useAuthStore } from '@/stores/auth.store'
import { useNotificationStore } from '@/stores/notification.store'
// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatRelativeTime = (dateStr: string): string => {
 const diff    = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  if (days > 0)    return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0)   return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

const buildActionText = (n: Notification): string => {
  const rType = n.resource_type ?? 'track'
  const title = n.resource_details?.title || n.resource_id || ''

  switch (n.type) {
    case 'follow':
      return 'started following you'
    case 'like':
      return `liked your ${rType} "${title}"`
    case 'repost':
      return `reposted your ${rType} "${title}"`
    case 'comment':
      return `commented "${n.resource_details?.content ?? ''}" on your track`
    case 'new_post_by_followed':
      return `posted a new ${rType} `
    case 'artist_pro_activated':
      return 'You have been upgraded to premium 😉'
    default:
      return ''
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  row:             `flex items-start sm:items-center gap-4 cursor-pointer p-3`,
  unreadDot:       `w-2 h-2 rounded-full bg-red-500 flex-shrink-0`,
  unreadDotHidden: `w-2 h-2 flex-shrink-0`,
  avatarWrapper:   `relative w-11 h-11 flex-shrink-0 overflow-visible`,
  avatar:          `w-full h-full rounded-full bg-[#EEEEEE] overflow-hidden`,
  avatarImg:       `w-full h-full object-cover`,
  avatarFallback:  `w-full h-full flex items-center justify-center rounded-full bg-zinc-800 text-white text-sm font-bold`,
  unreadDotOverlay:`absolute -top-1 -left-1 w-2 h-2 rounded-full bg-red-500 z-10`,
  content:         `flex-1 min-w-0`,
  textRow:         `text-sm text-white leading-snug`,
  username:        `font-bold mr-1`,
  actionText:      `font-normal text-text-secondary`,
  timeRow:         `flex items-center gap-1 text-xs text-text-secondary mt-1`,
  timeIcon:        `fa-solid fa-user text-[10px]`,
  actions:         `flex items-center gap-2 flex-shrink-0 self-start sm:self-auto`,
  dotsBtn:         `w-9 h-9 flex items-center justify-center bg-[#1a1a1a] border border-border rounded-sm hover:bg-[#2a2a2a] transition-colors`,
  dotsIcon:        `fa-solid fa-ellipsis text-white text-sm`,
  dropdownWrapper: `relative`,
  dropdown:        `absolute right-0 top-full mt-1 bg-bg border border-border rounded-sm z-20 min-w-[200px] py-1 shadow-xl`,
  dropdownItem:    `w-full text-left px-4 py-3 text-sm font-bold text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50`,
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

  const [menuOpen, setMenuOpen]           = useState(false)
  const [isBlockOpen, setIsBlockOpen]     = useState(false)
  const [isReportOpen, setIsReportOpen]   = useState(false)
  const [isSpamOpen, setIsSpamOpen]       = useState(false)
  const [isBlocking, setIsBlocking]       = useState(false)
  const [isFollowing, setIsFollowing]     = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const { user } = useAuthStore()
  const { markOneAsRead } = useNotificationStore()

  useEffect(() => {
    if (!n.actor?.id) return
    setLoadingStatus(true)
    fetchFollowStatus(n.actor.id)
      .then((res) => {
        setIsBlocking(res.data.is_blocking)
        setIsFollowing(res.data.is_following)
      })
      .catch(() => {
        setIsBlocking(false)
        setIsFollowing(false)
      })
      .finally(() => setLoadingStatus(false))
  }, [n.actor?.id])

  const handleUnblock = async () => {
    try {
      // call your unblock API here
      setIsBlocking(false)
    } catch {
      // silently fail
    }
  }

  const handleCellClick = async () => {
    if (!n.is_read) {
      try {
        await markOneAsRead(n.id)
        onMarkRead?.(n.id)
      } catch {
        // non-critical — still navigate
      }
    }

    if (n.type === 'artist_pro_activated') return

    if (n.type === 'follow') {
      navigate(`/${n.actor.username}`)
    } else if (n.resource_type === 'track' || n.resource_type === 'comment') {
      navigate(`/track/${n.resource_id}`)
    } else if (n.resource_type === 'playlist') {
      navigate(`/${n.actor.username}/sets/${n.resource_id}`)
    }
  }

  return (
    <>
      <div data-test={`notification-card-${n.id}`} className={styles.row} onClick={handleCellClick}>

        {/* Avatar */}
        <div data-test={`notification-avatar-${n.id}`} className={styles.avatarWrapper}>
          {!n.is_read && <div className={styles.unreadDotOverlay} />}
          <UserAvatar
            src={n.actor?.avatar}
            name={n.actor?.display_name ?? n.actor?.username ?? ''}
            alt={n.actor?.display_name ?? n.actor?.username ?? 'User'}
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
            {n.type !== 'artist_pro_activated' && (
              <span data-test={`notification-username-${n.id}`} className={styles.username}>
                {n.actor.display_name}
              </span>
            )}
            {'  '}
            <span data-test={`notification-action-text-${n.id}`} className={styles.actionText}>
              {buildActionText(n)}
            </span>
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
          {n.type === 'follow' && !loadingStatus && (
            <FollowButton
              username={n.actor.username}
              userId={n.actor.id}
              initialIsFollowing={isFollowing}
            />
          )}

          {/* more button */}
          {showActions && n.type !== 'artist_pro_activated' && (
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
                    disabled={loadingStatus}
                    onClick={() => {
                      if (isBlocking) { handleUnblock() } else { setIsBlockOpen(true) }
                      setMenuOpen(false)
                    }}
                  >
                    {loadingStatus ? '...' : `${isBlocking ? 'Unblock' : 'Block'} ${n.actor.display_name}`}
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
          onBlocked={() => {
            setIsBlocking(true)
            setIsBlockOpen(false)
          }}
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