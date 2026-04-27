// NotificationsPage.tsx
import { useState, useEffect, useCallback,useRef } from 'react'
import { fetchNotifications, type Notification, type NotificationType } from '@/services/api/notifications/notificationsAPI'
import { fetchMyFollowing } from '@/services/api/notifications/notificationsAPI'
import ArtistListSection, { type Artist } from '@/components/UI/ArtistListSection'
import NotificationHeader, { type FilterType } from '@/components/notificationsComponents/notificationHeader'
import Spinner from '@/components/UI/Spinner'
import GoMobileSection from '@/components/UI/GoMobile'
import NotificationCard from '@/components/notificationsComponents/notificationCard'
import { useNotificationStore } from '@/stores/notification.store'

type Status = 'loading' | 'success' | 'empty' | 'error'

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [status, setStatus]               = useState<Status>('loading')
  const [selectedType, setSelectedType]   = useState<FilterType>('all')
  const [recentFollowers, setRecentFollowers] = useState<Artist[]>([])
  const [page, setPage]                   = useState(1)
  const [hasNext, setHasNext]             = useState(false)
  const [loadingMore, setLoadingMore]     = useState(false)
  const { fetchUnreadCount, unreadCount } = useNotificationStore()
  const sentinelRef = useRef<HTMLDivElement>(null)
 const PAGE_SIZE = 20
  const loadNotifications = useCallback(async (type: FilterType) => {
    setStatus('loading')
    setPage(1)
    try {
      const typeParam = type === 'all' ? undefined : type as NotificationType
      const res = await fetchNotifications(1, PAGE_SIZE, typeParam)
      const { items, pagination } = res.data
      setNotifications(items)
      setHasNext(pagination.has_next)
      setStatus(items.length === 0 ? 'empty' : 'success')
    } catch {
      setStatus('error')
    }
  }, [])

  const loadMore = useCallback(async () => {
  if (loadingMore || !hasNext) return
  setLoadingMore(true)
  try {
    const nextPage = page + 1
    const typeParam = selectedType === 'all' ? undefined : selectedType as NotificationType
    const res = await fetchNotifications(nextPage, PAGE_SIZE, typeParam)
    const { items, pagination } = res.data
    setNotifications(prev => [...prev, ...items])
    setHasNext(pagination.has_next)
    setPage(nextPage)
  } catch {
    // silently fail
  } finally {
    setLoadingMore(false)
  }
}, [loadingMore, hasNext, page, selectedType])

    const handleMarkRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
    fetchUnreadCount()  // keep the badge in sync
  }

  const loadRecentFollowers = useCallback(async () => {
    try {
      const res = await fetchMyFollowing(undefined, 4, 0)
      setRecentFollowers(
        res.data.items.map(u => ({
          id:         u.id,
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

  const handleTypeChange = (type: FilterType) => {
    if (type === selectedType) return
    setSelectedType(type)
  }

  useEffect(() => {
    loadNotifications(selectedType)
  }, [selectedType, loadNotifications])

  useEffect(() => {
    loadRecentFollowers()
    fetchUnreadCount()
  }, [loadRecentFollowers, fetchUnreadCount])

    useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, hasNext])

  return (
    <div data-test="notifications-page" className="min-h-screen w-full container px-4 md:px-8 lg:px-20 bg-bg">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-11 p-0">

        {/* Main Content */}
        <div className="flex flex-col gap-8 lg:gap-10 flex-1 lg:flex-8 min-w-0 pt-6 lg:pt-10">

          <NotificationHeader
            selectedType={selectedType}
            onTypeChange={handleTypeChange}
          />

          {status === 'loading' && <Spinner data-test="notifications-loading" />}

{status === 'success' && (
  <div data-test="notifications-list" className="flex flex-col gap-2">
    {notifications
      .filter(n => n.type !== 'new_post_by_followed')
      .map(n => (
        <NotificationCard key={n.id} notification={n} showActions={true} onMarkRead={handleMarkRead} data-test={`notification-card-${n.id}`} />
      ))}
  </div>
)}

{/* sentinel: observed by IntersectionObserver to trigger loadMore */}
<div ref={sentinelRef} className="h-4" />
{loadingMore && <Spinner />}

{status === 'empty' && <p data-test="notifications-empty">You don't have any notifications</p>}
{status === 'error'  && <p data-test="notifications-error">Something went wrong.</p>}
        </div>

        {/* Sidebar — hidden on mobile, visible on lg+ */}
        <div className="hidden lg:flex flex-col gap-6 flex-2 ps-2 pt-8">
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