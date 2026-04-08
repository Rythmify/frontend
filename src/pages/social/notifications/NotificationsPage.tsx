// NotificationsPage.tsx
import { useState, useEffect, useCallback } from 'react'
import { fetchNotifications, type Notification, type NotificationType } from '@/services/api/notifications/notificationsAPI'
import { fetchMyFollowing } from '@/services/api/notifications/notificationsAPI'
import ArtistListSection from '@/components/UI/ArtistListSection'
import NotificationHeader, { type FilterType } from '@/components/notificationsComponents/notificationHeader'
import Spinner from '@/components/UI/Spinner'
import GoMobileSection from '@/components/UI/GoMobile'
import NotificationCard from '@/components/notificationsComponents/notificationCard'
import { useNotificationStore } from '@/stores/notification.store'

interface Artist {
  username: string
  avatar?: string
  followers: number
  tracks?: number
  isVerified?: boolean
}

type Status = 'loading' | 'success' | 'empty' | 'error'

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [status, setStatus]               = useState<Status>('loading')
  const [selectedType, setSelectedType]   = useState<FilterType>('all')
  const [recentFollowers, setRecentFollowers] = useState<Artist[]>([])

  const { fetchUnreadCount, markAllAsRead, unreadCount } = useNotificationStore()

  const loadNotifications = useCallback(async (type: FilterType) => {
    setStatus('loading')
    try {
      // 'all' means no type filter — pass undefined so the param is omitted
      const typeParam = type === 'all' ? undefined : type as NotificationType
      const res = await fetchNotifications(1, 50, false, typeParam)
      const items = res.data.items
      setNotifications(items)
      setStatus(items.length === 0 ? 'empty' : 'success')
    } catch {
      setStatus('error')
    }
  }, [])

  const loadRecentFollowers = useCallback(async () => {
    try {
      const res = await fetchMyFollowing(undefined, 4, 0)
      setRecentFollowers(
        res.data.items.map(u => ({
          username:   u.username,
          avatar:     u.profile_picture ?? undefined,
          followers:  0,
          isVerified: u.is_verified,
        }))
      )
    } catch {
      // silently fail — sidebar is non-critical
    }
  }, [])

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    // Optimistically flip all local notifications to read
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const handleTypeChange = (type: FilterType) => {
    if (type === selectedType) return   // already selected, no re-fetch needed
    setSelectedType(type)
  }

  useEffect(() => {
    loadNotifications(selectedType)
  }, [selectedType, loadNotifications])

  useEffect(() => {
    loadRecentFollowers()
    fetchUnreadCount()  // initialize global unread count on page mount
  }, [loadRecentFollowers, fetchUnreadCount])

  return (
    <div data-test="notifications-page" className="min-h-screen w-full container px-4 md:px-8 lg:px-20 bg-bg">
      <div className="flex gap-11 p-0">

        {/* Main Content */}
        <div className="flex flex-col gap-10 flex-[8] min-w-0 pt-10">
          <div className="flex items-center justify-between">
            <NotificationHeader
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
            />
            {unreadCount > 0 && (
              <button
                data-test="btn-mark-all-as-read"
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold text-text-secondary hover:text-white transition-colors"
              >
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>

          {status === 'loading' && <Spinner data-test="notifications-loading" />}

          {status === 'success' && (
            <div data-test="notifications-list" className="flex flex-col">
              {notifications.map(n => (
                <NotificationCard key={n.id} notification={n} showActions={true} data-test={`notification-card-${n.id}`} />
              ))}
            </div>
          )}

          {status === 'empty' && <p data-test="notifications-empty">You don't have any notifications</p>}
          {status === 'error'  && <p data-test="notifications-error">Something went wrong.</p>}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 flex-[2] ps-2 pt-8">
          <ArtistListSection
            title="RECENT FOLLOWERS"
            artists={recentFollowers}
            viewAllLink="/followers"
            maxDisplay={4}
          />
          <GoMobileSection />
        </div>

      </div>
    </div>
  )
}

export default NotificationsPage