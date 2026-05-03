import { create } from 'zustand'
import {
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/api/notifications/notificationsAPI'
import { getSocket, connectSocket, getCurrentToken } from '@/services/api/messaging/socketService'
import { useAuthStore } from '@/stores/auth.store'

interface NotificationStore {
  unreadCount: number
  isLoadingCount: boolean

  fetchUnreadCount: () => Promise<void>
  refreshUnreadCount: () => Promise<void>
  markOneAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  setupNotificationListeners: () => void
  teardownNotificationListeners: () => void
}

const UNREAD_COUNT_CACHE_TTL = 15 * 60 * 1_000
let lastUnreadCountFetchAt = 0

// Module-level stable reference so socket.off() only removes our listener
let onNotificationCreated: (() => void) | null = null

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  unreadCount: 0,
  isLoadingCount: false,

  // ── Respects TTL — use on app mount ─────────────────────────────────────
  fetchUnreadCount: async () => {
    const now = Date.now()
    if (now - lastUnreadCountFetchAt < UNREAD_COUNT_CACHE_TTL) return
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

  // ── Bypasses TTL — call after marking read / receiving socket event ──────
  refreshUnreadCount: async () => {
    lastUnreadCountFetchAt = 0
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
      // Optimistic decrement then re-sync from server
      set(state => ({ unreadCount: Math.max(0, state.unreadCount - 1) }))
      // Reset TTL so next fetchUnreadCount re-fetches from server
      lastUnreadCountFetchAt = 0
    } catch {
      // silently fail
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllNotificationsRead()
      set({ unreadCount: 0 })
      lastUnreadCountFetchAt = 0
    } catch {
      // silently fail
    }
  },

  // ── Register the global "new notification → increment badge" listener ────
  setupNotificationListeners: () => {
    // Ensure socket exists — connectSocket checks .connected internally
    if (!getSocket()) {
      const token =
        getCurrentToken() ??
        (useAuthStore.getState() as { token?: string }).token ??
        localStorage.getItem('auth_token')

      if (token) {
        connectSocket(token)
      } else {
        console.warn('[NotificationStore] setupNotificationListeners — no auth token')
        return
      }
    }

    const socket = getSocket()
    if (!socket) return

    // Remove stale listener before adding fresh one (idempotent)
    if (onNotificationCreated) {
      socket.off('notification:created', onNotificationCreated)
    }

    onNotificationCreated = () => {
      set(state => ({ unreadCount: state.unreadCount + 1 }))
    }

    socket.on('notification:created', onNotificationCreated)
  },

  teardownNotificationListeners: () => {
    const socket = getSocket()
    if (socket && onNotificationCreated) {
      socket.off('notification:created', onNotificationCreated)
    }
    onNotificationCreated = null
  },
}))