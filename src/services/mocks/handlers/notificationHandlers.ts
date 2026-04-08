import { http, HttpResponse } from "msw";
import type {
  NotificationListResponse,
  UnreadCountResponse,
  SuccessMessageResponse,
  Notification,
  FollowingSearchResponse,
  FollowCreatedResponse,
  FollowAlreadyExistsResponse,
} from '@/services/api/notifications/notificationsAPI';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'follow',
    actor: { id: 'u1', username: 'farah_medhat', display_name: 'Farah medhat', profile_picture: null },
    resource: null,
    is_read: false,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'comment',
    actor: { id: 'u2', username: 'rana_ahmed', display_name: 'rana ahmed', profile_picture: null },
    resource: { type: 'track', id: 'track-001', body: 'hiii' },
    is_read: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'follow',
    actor: { id: 'u3', username: 'nour_abosaif', display_name: 'NourAbosaif04', profile_picture: null },
    resource: null,
    is_read: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'repost',
    actor: { id: 'u4', username: 'farah_medhat2', display_name: 'Farah medhat', profile_picture: null },
    resource: { type: 'track', id: 'track-002', title: 'voice memo - April 3, 2026 at 12:23 AM' },
    is_read: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'like',
    actor: { id: 'u4', username: 'farah_medhat2', display_name: 'Farah medhat', profile_picture: null },
    resource: { type: 'track', id: 'track-002', title: 'voice memo - April 3, 2026 at 12:23 AM' },
    is_read: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    type: 'follow',
    actor: { id: 'u5', username: 'gamila', display_name: 'Gamila', profile_picture: null },
    resource: null,
    is_read: true,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    type: 'follow',
    actor: {
      id: 'u6',
      username: 'alyaa_mohamed',
      display_name: 'Alyaa Mohamed',
      profile_picture: 'https://i.pravatar.cc/150?img=5',
    },
    resource: null,
    is_read: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const mockFollowers = [
  { id: 'u1', username: 'farah_medhat',  display_name: 'Farah medhat',  profile_picture: null, is_verified: false },
  { id: 'u3', username: 'nour_abosaif',  display_name: 'NourAbosaif04', profile_picture: null, is_verified: false },
  { id: 'u5', username: 'gamila',        display_name: 'Gamila',        profile_picture: null, is_verified: false },
  { id: 'u6', username: 'alyaa_mohamed', display_name: 'Alyaa Mohamed', profile_picture: 'https://i.pravatar.cc/150?img=5', is_verified: false },
]

// ─── In-memory Mutable State ──────────────────────────────────────────────────

let notifications = [...mockNotifications]

// Tracks which userIds the current user is following.
// Pre-populated with 'u3' so NourAbosaif04 starts in "Following" state
// and you can test both the unfollow → follow flows immediately.
let followingIds = new Set<string>(['u3'])

// ─── Scenario Config ──────────────────────────────────────────────────────────

type MockScenario = 'success' | 'empty' | 'error' | 'loading'

export const notificationMockConfig = {
  notifications: 'success' as MockScenario,
}

// ─── Reset Helper ─────────────────────────────────────────────────────────────

export const resetNotificationMockConfig = () => {
  notificationMockConfig.notifications = 'success'
  notifications = [...mockNotifications]
  followingIds  = new Set<string>(['u3'])
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const notificationHandlers = [

  // ── Notification: specific routes first ───────────────────────────────────

  // GET /notifications/unread-count
  // Dynamically computed from live `notifications` array so it stays
  // accurate after individual mark-as-read or mark-all-as-read calls.
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

  // ── Notification: generic route last ─────────────────────────────────────

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

      default: {
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
              page, per_page: limit,
              total_items, total_pages,
              has_next: page < total_pages,
              has_prev: page > 1,
            },
          },
        } satisfies NotificationListResponse)
      }
    }
  }),

  // ── Follow / Unfollow ─────────────────────────────────────────────────────

  // POST /users/:userId/follow
  http.post('*/users/:userId/follow', ({ params }) => {
    const userId = params.userId as string

    if (followingIds.has(userId)) {
      // 200 — already following, no change
      return HttpResponse.json(
        { message: 'Already following this user.' } satisfies FollowAlreadyExistsResponse,
        { status: 200 }
      )
    }

    followingIds.add(userId)
    return HttpResponse.json(
      {
        data: {
          follower_id: 'me',
          followed_id: userId,
          created_at:  new Date().toISOString(),
        },
        message: 'Followed successfully.',
      } satisfies FollowCreatedResponse,
      { status: 201 }
    )
  }),

  // DELETE /users/:userId/follow
  http.delete('*/users/:userId/follow', ({ params }) => {
    const userId = params.userId as string
    followingIds.delete(userId)
    return new HttpResponse(null, { status: 204 })
  }),

  // ── Following list ────────────────────────────────────────────────────────

  // GET /users/me/following
  http.get('*/users/me/following', ({ request }) => {
    const url    = new URL(request.url)
    const q      = url.searchParams.get('q') ?? ''
    const limit  = parseInt(url.searchParams.get('limit')  ?? '10')
    const offset = parseInt(url.searchParams.get('offset') ?? '0')

    const filtered = q.trim()
      ? mockFollowers.filter(
          u =>
            u.display_name.toLowerCase().includes(q.toLowerCase()) ||
            u.username.toLowerCase().includes(q.toLowerCase())
        )
      : mockFollowers

    const sliced      = filtered.slice(offset, offset + limit)
    const total_items = filtered.length
    const total_pages = Math.ceil(total_items / limit)
    const page        = Math.floor(offset / limit) + 1

    return HttpResponse.json({
      success: true,
      data: {
        items: sliced,
        pagination: {
          page, per_page: limit,
          total_items, total_pages,
          has_next: offset + limit < total_items,
          has_prev: offset > 0,
        },
      },
    } satisfies FollowingSearchResponse)
  }),
]