import { useState, useEffect, useCallback } from 'react'
import { fetchNotifications, type Notification } from '@/services/api/notifications/notificationsAPI'
import { fetchMyFollowing } from '@/services/api/notifications/notificationsAPI'
import ArtistListSection from '@/components/UI/ArtistListSection'
import NotificationHeader, { type FilterType } from '@/components/notificationsComponents/notificationHeader'
import Spinner from '@/components/UI/Spinner'

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
  const [recentFollowers, setRecentFollowers] = useState<Artist[]>([])   // 👈 1. state here

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
    } catch {
      // silently fail — sidebar is non-critical
    }
  }, [])

  useEffect(() => {                                              
    loadNotifications()
    loadRecentFollowers()
  }, [loadNotifications, loadRecentFollowers])

  return (
    <div className="min-h-screen w-full container px-4 md:px-8 lg:px-20 bg-bg">
      <div className="flex gap-11 p-0">

        {/* Main Content — 70% */}
        <div className="flex flex-col gap-10 flex-[8] min-w-0 pt-10">
          <NotificationHeader
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />

          {status === 'loading' && <Spinner />}
          {status === 'success' && <p className="text-white">Here exist notifications</p>}
          {status === 'empty' && <p className="text-text-secondary">You don't have any notifications</p>}
          {status === 'error' && <p className="text-text-secondary">Something went wrong.</p>}
        </div>

        {/* Sidebar — 30% */}
        <div className="flex flex-col gap-6 flex-[2] ps-2 pt-8">
          <ArtistListSection             
            title="RECENT FOLLOWERS"
            artists={recentFollowers}
            viewAllLink="/followers"
            maxDisplay={4}
          />
        </div>

      </div>
    </div>
  )
}

export default NotificationsPage