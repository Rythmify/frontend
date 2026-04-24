// src/hooks/useNotificationSocket.ts
// Connects to the notification socket, subscribes to the user's room,
// and wires incoming events into both local React state and the Zustand store.
//
// Usage (NotificationsPage):
//   useNotificationSocket({
//     token,
//     onNewNotification: (n) => setNotifications(prev => [n, ...prev]),
//     onReadNotification: (id) => setNotifications(prev =>
//       prev.map(n => n.id === id ? { ...n, is_read: true } : n)
//     ),
//   })
//
// Usage (anywhere that only needs the badge bump, e.g. MainNavbar):
//   useNotificationSocket({ token })

import { useEffect, useRef } from 'react'
import type { Socket } from 'socket.io-client'
import type { Notification } from '@/services/api/notifications/notificationsAPI'
import {
  getNotificationSocket,
  subscribeToNotifications,
  onNotificationCreated,
  onNotificationRead,
  disconnectNotificationSocket,
} from '@/services/socket/notificationSocket'
import { useNotificationStore } from '@/stores/notification.store'

// ─── Options ──────────────────────────────────────────────────────────────────

interface UseNotificationSocketOptions {
  /** JWT access token — must be present before calling this hook */
  token: string | null

  /**
   * Called when `notification:created` fires.
   * Typically used to prepend the new notification to the local list.
   */
  onNewNotification?: (notification: Notification) => void

  /**
   * Called when `notification:read` fires.
   * Typically used to flip `is_read` on the matching item in the local list.
   */
  onReadNotification?: (notificationId: string) => void
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useNotificationSocket = ({
  token,
  onNewNotification,
  onReadNotification,
}: UseNotificationSocketOptions): void => {
  const socketRef = useRef<Socket | null>(null)

  // Pull store actions — stable references, safe in deps
  const { fetchUnreadCount } = useNotificationStore()

  useEffect(() => {
    // Don't connect until we have a token (user is logged in)
    if (!token) return

    const s = getNotificationSocket(token)
    socketRef.current = s

    // ── Subscribe to the room ────────────────────────────────────────────────
    // The backend joins us automatically on connect, but we also emit
    // notification:subscribe to cover reconnect scenarios.
    const handleConnect = () => subscribeToNotifications(s)
    s.on('connect', handleConnect)

    // If already connected, subscribe immediately
    if (s.connected) subscribeToNotifications(s)

    // ── notification:created ─────────────────────────────────────────────────
    // 1. Prepend to the local list (if a handler was provided)
    // 2. Re-fetch the unread count so the badge stays accurate
    const cleanupCreated = onNotificationCreated(s, ({ notification }) => {
      onNewNotification?.(notification)
      // Bypass the TTL cache by resetting the timestamp so the next
      // fetchUnreadCount call always hits the server
      fetchUnreadCount()
    })

    // ── notification:read ────────────────────────────────────────────────────
    // Update the local list (if a handler was provided).
    // The store's unread count will drift by −1; re-fetch to stay in sync.
    const cleanupRead = onNotificationRead(s, ({ notification_id }) => {
      onReadNotification?.(notification_id)
      fetchUnreadCount()
    })

    // ── Debug helpers (stripped in production) ───────────────────────────────
    if (import.meta.env.DEV) {
      s.on('connect',         () => console.debug('[socket] connected',    s.id))
      s.on('disconnect',      (r)  => console.debug('[socket] disconnected', r))
      s.on('connect_error',   (e)  => console.debug('[socket] error',       e.message))
    }

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      s.off('connect', handleConnect)
      cleanupCreated()
      cleanupRead()
      // We do NOT disconnect here — the socket is a singleton shared across
      // the app (navbar badge + notifications page). Call
      // disconnectNotificationSocket() explicitly on logout instead.
    }
  }, [token, onNewNotification, onReadNotification, fetchUnreadCount])
}
