import { useNavigate } from 'react-router-dom'
import { type Notification } from '@/services/api/notifications/notificationsAPI'
import FollowButton from '@/components/UI/FollowButton'

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
}

interface notificationCardProps {
  notification: Notification
}

const NotificationCard = ({ notification: n }: notificationCardProps) => {
  const navigate = useNavigate()

  const handleCellClick = () => {
    if (n.type === 'follow') {
      navigate(`/${n.actor.username}`)
    } else {
      navigate(`/tracks/${n.resource?.id}`)
    }
  }

  return (
    <div className={styles.row} onClick={handleCellClick}>
      <div className={styles.avatar}>
        {n.actor.profile_picture ? (
          <img
            src={n.actor.profile_picture}
            alt={n.actor.display_name}
            className={styles.avatarImg}
          />
        ) : (
          <div className={styles.avatarFallback}>
            <i className={styles.fallbackIcon} />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <p className={styles.textRow}>
          <span className={styles.username}>{n.actor.display_name}</span>
          {'  '}
          <span className={styles.actionText}>{buildActionText(n)}</span>
        </p>
        <div className={styles.timeRow}>
          <i className={styles.timeIcon} />
          {formatRelativeTime(n.created_at)}
        </div>
      </div>

      <div
        className={styles.actions}
        onClick={e => e.stopPropagation()} // prevent cell click when clicking buttons
      >
        {n.type === 'follow' && (
          <FollowButton username={n.actor.username} />
        )}

        <button className={styles.dotsBtn}>
          <i className={styles.dotsIcon} />
        </button>
      </div>

    </div>
  )
}

export default NotificationCard