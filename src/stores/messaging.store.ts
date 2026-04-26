import { create } from 'zustand'
import { fetchUnreadCount } from '@/services/api/messaging/conversationApi'
import { getSocket, connectSocket } from '@/services/api/messaging/socketService'

interface MessagingStore {
  unreadCount: number
  isLoadingCount: boolean
  activeConversationId: string | null
  fetchUnreadCount: () => Promise<void>
  refreshUnreadCount: () => Promise<void>
  setupSocketListeners: () => void
  teardownSocketListeners: () => void
}

const UNREAD_COUNT_CACHE_TTL = 15 * 60 * 1000
let lastUnreadCountFetchAt = 0

// stable reference so socket.off() only removes our listener, not MessageIdPage's
let onMessageReceived: ((data: { conversationId: string; message: any }) => void) | null = null

export const useMessagingStore = create<MessagingStore>((set, get) => ({
  unreadCount: 0,
  isLoadingCount: false,
  activeConversationId: null,

  // respects 15-min cache — use on app mount
  fetchUnreadCount: async () => {
    const now = Date.now()
    if (now - lastUnreadCountFetchAt < UNREAD_COUNT_CACHE_TTL) return
    lastUnreadCountFetchAt = now
    set({ isLoadingCount: true })
    try {
      const res = await fetchUnreadCount()
      set({ unreadCount: res.data.unread_count })
    } catch {
      // silently fail
    } finally {
      set({ isLoadingCount: false })
    }
  },

  // bypasses cache — call this after the user reads messages in MessageIdPage
  refreshUnreadCount: async () => {
    lastUnreadCountFetchAt = 0
    await get().fetchUnreadCount()
  },

  setupSocketListeners: () => {
    // Reconnect socket if the page was refreshed (connectSocket only called on login)
    if (!getSocket()) {
      const token = localStorage.getItem('auth_token')
      if (token) connectSocket(token)
    }

    const socket = getSocket()
    if (!socket) return

    if (onMessageReceived) socket.off('message:received', onMessageReceived)

    onMessageReceived = (data: { conversationId: string; message: any }) => {
      const state = get()
      if (data.conversationId !== state.activeConversationId) {
        set(state => ({ unreadCount: state.unreadCount + 1 }))
      }
    }

    socket.on('message:received', onMessageReceived)
  },

  teardownSocketListeners: () => {
    const socket = getSocket()
    if (!socket || !onMessageReceived) return
    socket.off('message:received', onMessageReceived)
    onMessageReceived = null
  },
}))
