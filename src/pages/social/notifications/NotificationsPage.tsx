// NotificationsPage.tsx
import { useState, useEffect, useCallback } from 'react'
import { fetchNotifications, type Notification } from '@/services/api/notifications/notificationsAPI'
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

  const loadNotifications = useCallback(async () => {
    setStatus('loading')
    try {
      const res = await fetchNotifications(1, 50, false)
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
    } catch {}
  }, [])

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    // Optimistically flip all local notifications to read
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  useEffect(() => {
    loadNotifications()
    loadRecentFollowers()
    fetchUnreadCount()  // initialize global unread count on page mount
  }, [loadNotifications, loadRecentFollowers, fetchUnreadCount])

  return (
    <div className="min-h-screen w-full container px-4 md:px-8 lg:px-20 bg-bg">
      <div className="flex gap-11 p-0">

        {/* Main Content */}
        <div className="flex flex-col gap-10 flex-[8] min-w-0 pt-10">
          <div className="flex items-center justify-between">
            <NotificationHeader
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold text-text-secondary hover:text-white transition-colors"
              >
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>

          {status === 'loading' && <Spinner />}

          {status === 'success' && (
            <div className="flex flex-col">
              {notifications.map(n => (
                <NotificationCard key={n.id} notification={n} showActions={true} />
              ))}
            </div>
          )}

          {status === 'empty' && <p className="text-text-secondary">You don't have any notifications</p>}
          {status === 'error'  && <p className="text-text-secondary">Something went wrong.</p>}
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