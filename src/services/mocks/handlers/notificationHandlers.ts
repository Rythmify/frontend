import { http, HttpResponse } from "msw";
import type {
  NotificationListResponse,
  UnreadCountResponse,
  SuccessMessageResponse,
  Notification,
} from '@/services/api/notifications/notificationsAPI';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'follow',
    actor: { id: 'u1', username: 'nour_abosaif', display_name: 'NourAbosaif04', profile_picture: null },
    resource: null,
    is_read: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'repost',
    actor: { id: 'u2', username: 'farah_medhat', display_name: 'Farah medhat', profile_picture: null },
    resource: { type: 'track', id: 't1' },
    is_read: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'like',
    actor: { id: 'u2', username: 'farah_medhat', display_name: 'Farah medhat', profile_picture: null },
    resource: { type: 'track', id: 't1' },
    is_read: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'follow',
    actor: { id: 'u3', username: 'gamila', display_name: 'Gamila', profile_picture: null },
    resource: null,
    is_read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'comment',
    actor: { id: 'u4', username: 'alyaa_mohamed', display_name: 'Alyaa Mohamed', profile_picture: null },
    resource: { type: 'track', id: 't2' },
    is_read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    type: 'follow',
    actor: { id: 'u5', username: 'rana_ahmed', display_name: 'rana ahmed', profile_picture: null },
    resource: null,
    is_read: true,
    created_at: new Date('2026-03-07').toISOString(),
  },
]

// in-memory store so delete/read mutations persist during the session
let notifications = [...mockNotifications]

// ─── Scenario Config ──────────────────────────────────────────────────────────

type MockScenario = 'success' | 'empty' | 'error' | 'loading'

export const notificationMockConfig = {
  notifications: 'success' as MockScenario,
}

// ─── Reset helper ─────────────────────────────────────────────────────────────

export const resetNotificationMockConfig = () => {
  notificationMockConfig.notifications = 'success'
  notifications = [...mockNotifications]
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const notificationHandlers = [

  // GET /notifications
  http.get('*/notifications', ({ request }) => {
    switch (notificationMockConfig.notifications) {
      case 'empty':
        return HttpResponse.json({
          success: true,
          data: {
            items: [],
            pagination: {
              page: 1, per_page: 20,
              total_items: 0, total_pages: 0,
              has_next: false, has_prev: false,
            },
          },
        } satisfies NotificationListResponse)

      case 'error':
        return HttpResponse.json(
          { success: false, message: 'Internal server error' },
          { status: 500 }
        )

      case 'loading':
        return new Promise(() => {})

      default: { // 'success'
        const url         = new URL(request.url)
        const page        = parseInt(url.searchParams.get('page')  ?? '1')
        const limit       = parseInt(url.searchParams.get('limit') ?? '20')
        const unread_only = url.searchParams.get('unread_only') === 'true'
        const type        = url.searchParams.get('type')

        let result = [...notifications]

        if (unread_only) result = result.filter(n => !n.is_read)
        if (type)        result = result.filter(n => n.type === type)

        const total_items = result.length
        const total_pages = Math.ceil(total_items / limit)
        const start       = (page - 1) * limit

        return HttpResponse.json({
          success: true,
          data: {
            items: result.slice(start, start + limit),
            pagination: {
              page,
              per_page:    limit,
              total_items,
              total_pages,
              has_next: page < total_pages,
              has_prev: page > 1,
            },
          },
        } satisfies NotificationListResponse)
      }
    }
  }),

  // GET /notifications/unread-count
  http.get('*/notifications/unread-count', () => {
    return HttpResponse.json({
      success: true,
      data: { unread_count: notifications.filter(n => !n.is_read).length },
    } satisfies UnreadCountResponse)
  }),

  // POST /notifications/read-all
  http.post('*/notifications/read-all', () => {
    notifications = notifications.map(n => ({ ...n, is_read: true }))
    return HttpResponse.json({
      data: { success: true },
      message: 'All notifications marked as read.',
    } satisfies SuccessMessageResponse)
  }),

  // PATCH /notifications/:notificationId/read
  http.patch('*/notifications/:notificationId/read', ({ params }) => {
    const { notificationId } = params
    const index = notifications.findIndex(n => n.id === notificationId)

    if (index === -1) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Notification not found.' } },
        { status: 404 }
      )
    }

    notifications[index] = { ...notifications[index], is_read: true }
    return HttpResponse.json({
      data: { success: true },
      message: 'Notification marked as read.',
    } satisfies SuccessMessageResponse)
  }),

  // DELETE /notifications/:notificationId
  http.delete('*/notifications/:notificationId', ({ params }) => {
    const { notificationId } = params
    const exists = notifications.find(n => n.id === notificationId)

    if (!exists) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Notification not found.' } },
        { status: 404 }
      )
    }

    notifications = notifications.filter(n => n.id !== notificationId)
    return HttpResponse.json({
      data: { success: true },
      message: 'Notification deleted.',
    } satisfies SuccessMessageResponse)
  }),
]