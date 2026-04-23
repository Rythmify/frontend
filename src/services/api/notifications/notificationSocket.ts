import { getSocket } from '@/services/socket/socket' // ← your existing shared socket file
import type { Notification } from '@/services/api/notifications/notificationsAPI'
 
// ─── Payload shapes (mirror the backend emits) ────────────────────────────────
 
export interface NotificationCreatedPayload {
  notification: Notification
}
 
export interface NotificationReadPayload {
  notification_id: string
}
 
export type OnNotificationCreated = (payload: NotificationCreatedPayload) => void
export type OnNotificationRead    = (payload: NotificationReadPayload)    => void
 
// ─── Outgoing ─────────────────────────────────────────────────────────────────
 
/** Tell the server to add us to the notifications room. */
export const subscribeToNotifications = (): void => {
  getSocket()?.emit('notification:subscribe')
}
 
/** Tell the server to remove us from the notifications room. */
export const unsubscribeFromNotifications = (): void => {
  getSocket()?.emit('notification:unsubscribe')
}
 
// ─── Incoming ─────────────────────────────────────────────────────────────────
 
/** Register a handler for notification:created. Returns a cleanup fn. */
export const onNotificationCreated = (handler: OnNotificationCreated): (() => void) => {
  const s = getSocket()
  if (!s) return () => {}
  s.on('notification:created', handler)
  return () => s.off('notification:created', handler)
}
 
/** Register a handler for notification:read. Returns a cleanup fn. */
export const onNotificationRead = (handler: OnNotificationRead): (() => void) => {
  const s = getSocket()
  if (!s) return () => {}
  s.on('notification:read', handler)
  return () => s.off('notification:read', handler)
}
 