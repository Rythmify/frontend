// src/stores/notification.store.ts
import { create } from 'zustand'
import {
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/api/notifications/notificationsAPI'

interface NotificationStore {
  unreadCount: number
  isLoadingCount: boolean

  fetchUnreadCount: () => Promise<void>
  markOneAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const UNREAD_COUNT_CACHE_TTL = 15 * 60 * 1000 // 15 minutes in milliseconds
let lastUnreadCountFetchAt = 0

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  unreadCount: 0,
  isLoadingCount: false,

  fetchUnreadCount: async () => {
    const now = Date.now()
    if (now - lastUnreadCountFetchAt < UNREAD_COUNT_CACHE_TTL) {
      return
    }

    lastUnreadCountFetchAt = now
    set({ isLoadingCount: true })
    try {
      const res = await fetchUnreadNotificationCount()
      set({ unreadCount: res.data.unread_count })
    } catch {
      // silently fail
    } finally {
      set({ isLoadingCount: false })
    }
  },

  markOneAsRead: async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId)
      set(state => ({
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch {
      // silently fail
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllNotificationsRead()
      set({ unreadCount: 0 })
    } catch {
      // silently fail
    }
  },
}))