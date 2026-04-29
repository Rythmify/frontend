import { create } from 'zustand'
import { fetchUnreadCount } from '@/services/api/messaging/conversationApi'
import { getSocket, connectSocket, getCurrentToken } from '@/services/api/messaging/socketService'
import { useAuthStore } from '@/stores/auth.store'

interface MessagingStore {
  unreadCount: number
  isLoadingCount: boolean
  activeConversationId: string | null
  fetchUnreadCount: () => Promise<void>
  refreshUnreadCount: () => Promise<void>
  setupSocketListeners: () => void
  teardownSocketListeners: () => void
}

const UNREAD_COUNT_CACHE_TTL = 15 * 60 * 1_000
let lastUnreadCountFetchAt = 0

// Module-level stable reference so socket.off() only removes our listener
// and not any other listener registered elsewhere (e.g. MessageIdPage).
let onMessageReceived: ((data: { conversationId: string; message: unknown }) => void) | null = null

export const useMessagingStore = create<MessagingStore>((set, get) => ({
  unreadCount: 0,
  isLoadingCount: false,
  activeConversationId: null,

  // ── Respects 15-min TTL — use on app mount ──────────────────────────────
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

  // ── Bypasses cache — call after the user reads messages ────────────────
  refreshUnreadCount: async () => {
    // Reset the timestamp so fetchUnreadCount always fires
    lastUnreadCountFetchAt = 0
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

  // ── Register the global "new message → increment badge" listener ────────
  //
  // Rules:
  //   • connectSocket only if no socket exists yet (uses the token from the
  //     auth store, which is the single source of truth).
  //   • Remove any old listener before adding a new one (idempotent).
  //   • Only increment when the incoming message is NOT in the currently
  //     open conversation (MessageIdPage handles that case itself).
setupSocketListeners: () => {
  const token =
    getCurrentToken() ??
    (useAuthStore.getState() as { token?: string }).token ??
    null;

  // KEY CHANGE: always attempt connect (connectSocket checks .connected internally now)
  if (token) {
    connectSocket(token);
  } else {
    console.warn('[MessagingStore] No auth token');
    return;
  }

  const socket = getSocket();
  if (!socket) return;

  if (onMessageReceived) {
    socket.off('message:received', onMessageReceived);
  }

  onMessageReceived = (data) => {
    const { activeConversationId } = get();
    if (data.conversationId !== activeConversationId) {
      set((state) => ({ unreadCount: state.unreadCount + 1 }));
    }
  };

  socket.on('message:received', onMessageReceived);
},

  // ── Remove the global listener ──────────────────────────────────────────
  //
  // NOTE: The Navbar calls this on unmount. Since this listener is global
  // app-level state (not component-scoped), the Navbar should ideally NOT
  // call teardown — see MainNavbar comment. teardownSocketListeners is kept
  // here for completeness (e.g. on logout) but the Navbar's useEffect
  // cleanup has been changed to a no-op.
  teardownSocketListeners: () => {
    const socket = getSocket()
    if (socket && onMessageReceived) {
      socket.off('message:received', onMessageReceived)
    }
    onMessageReceived = null
  },
}))