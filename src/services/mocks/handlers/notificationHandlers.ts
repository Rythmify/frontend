import { http, HttpResponse } from "msw";
import type {
  NotificationListResponse,
  UnreadCountResponse,
  SuccessMessageResponse,
  Notification,
  NotificationType,
  FollowingSearchResponse,
  FollowCreatedResponse,
  FollowAlreadyExistsResponse,
} from '@/services/api/notifications/notificationsAPI';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'follow',
    actor: { id: 'u1', username: 'farah_medhat', display_name: 'Farah medhat', avatar: null },
    resource_type: null,
    resource_id: null,
    resource_details: null,
    is_read: false,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'comment',
    actor: { id: 'u2', username: 'rana_ahmed', display_name: 'rana ahmed', avatar: null },
    resource_type: 'track',
    resource_id: 'track-001',
    resource_details: { content: 'hiii' },
    is_read: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'follow',
    actor: { id: 'u3', username: 'nour_abosaif', display_name: 'NourAbosaif04', avatar: null },
    resource_type: null,
    resource_id: null,
    resource_details: null,
    is_read: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'repost',
    actor: { id: 'u4', username: 'farah_medhat2', display_name: 'Farah medhat', avatar: null },
    resource_type: 'track',
    resource_id: 'track-002',
    resource_details: { title: 'voice memo - April 3, 2026 at 12:23 AM' },
    is_read: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'like',
    actor: { id: 'u4', username: 'farah_medhat2', display_name: 'Farah medhat', avatar: null },
    resource_type: 'track',
    resource_id: 'track-002',
    resource_details: { title: 'voice memo - April 3, 2026 at 12:23 AM' },
    is_read: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    type: 'follow',
    actor: { id: 'u5', username: 'gamila', display_name: 'Gamila', avatar: null },
    resource_type: null,
    resource_id: null,
    resource_details: null,
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
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    resource_type: null,
    resource_id: null,
    resource_details: null,
    is_read: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockFollowers = [
  { id: 'u1', username: 'farah_medhat',  display_name: 'Farah medhat',  profile_picture: null, is_verified: false },
  { id: 'u3', username: 'nour_abosaif',  display_name: 'NourAbosaif04', profile_picture: null, is_verified: false },
  { id: 'u5', username: 'gamila',        display_name: 'Gamila',        profile_picture: null, is_verified: false },
  { id: 'u6', username: 'alyaa_mohamed', display_name: 'Alyaa Mohamed', profile_picture: 'https://i.pravatar.cc/150?img=5', is_verified: false },
];

// ─── In-memory Mutable State ──────────────────────────────────────────────────

let notifications = [...mockNotifications];

// Tracks which userIds the current user is following.
// Pre-populated with 'u3' so NourAbosaif04 starts in "Following" state
// and you can test both the unfollow → follow flows immediately.
let followingIds = new Set<string>(['u3']);

// ─── Scenario Config ──────────────────────────────────────────────────────────

type MockScenario = 'success' | 'empty' | 'error' | 'loading'

// Extends the scenario config to support type-specific overrides.
// Set `typeScenario` to force a specific type filter in the mock response,
// independently of the `notifications` scenario.
//
// Examples:
//   notificationMockConfig.notifications = 'success'
//   → normal success, respects ?type= from the actual request
//
//   notificationMockConfig.typeScenario = 'follow'
//   → forces the mock to only return 'follow' notifications regardless of request params
//   (useful for isolated component tests that don't control the query string)
//
//   notificationMockConfig.typeScenario = undefined
//   → no override; ?type= from the request is used as-is (default behaviour)
export const notificationMockConfig = {
  notifications: 'success' as MockScenario,
  typeScenario: undefined as NotificationType | undefined,
};

// ─── Reset Helper ─────────────────────────────────────────────────────────────

export const resetNotificationMockConfig = () => {
  notificationMockConfig.notifications = 'success';
  notificationMockConfig.typeScenario  = undefined;
  notifications = [...mockNotifications];
  followingIds  = new Set<string>(['u3']);
};

// ─── Type Filter Test Helpers ─────────────────────────────────────────────────

// Convenience setters for type-filter scenarios.
// Use these in tests to isolate a specific notification type without
// having to manually set notificationMockConfig.typeScenario each time.
//
// Usage:
//   beforeEach(() => setNotificationTypeScenario('like'))
//   afterEach(() => resetNotificationMockConfig())

export const setNotificationTypeScenario = (type: NotificationType | undefined) => {
  notificationMockConfig.typeScenario = type;
};

// Pre-built scenario activators — one per supported type + the "all types" case.
// Each function switches the mock into the corresponding filter mode.

/** Show only 'follow' notifications */
export const useFollowNotificationsOnly  = () => setNotificationTypeScenario('follow');

/** Show only 'like' notifications */
export const useLikeNotificationsOnly    = () => setNotificationTypeScenario('like');

/** Show only 'repost' notifications */
export const useRepostNotificationsOnly  = () => setNotificationTypeScenario('repost');

/** Show only 'comment' notifications */
export const useCommentNotificationsOnly = () => setNotificationTypeScenario('comment');

/** Remove the type override — handler will use the ?type= param from the request (or return all) */
export const useAllNotificationTypes     = () => setNotificationTypeScenario(undefined);

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
    } satisfies UnreadCountResponse);
  }),

  // POST /notifications/read-all
  http.post('*/notifications/read-all', () => {
    notifications = notifications.map(n => ({ ...n, is_read: true }));
    return HttpResponse.json({
      data: { success: true },
      message: 'All notifications marked as read.',
    } satisfies SuccessMessageResponse);
  }),

  // PATCH /notifications/:notificationId/read
  http.patch('*/notifications/:notificationId/read', ({ params }) => {
    const { notificationId } = params;
    const index = notifications.findIndex(n => n.id === notificationId);

    if (index === -1) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Notification not found.' } },
        { status: 404 }
      );
    }

    notifications[index] = { ...notifications[index], is_read: true };
    return HttpResponse.json({
      data: { success: true },
      message: 'Notification marked as read.',
    } satisfies SuccessMessageResponse);
  }),

  // DELETE /notifications/:notificationId
  http.delete('*/notifications/:notificationId', ({ params }) => {
    const { notificationId } = params;
    const exists = notifications.find(n => n.id === notificationId);

    if (!exists) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Notification not found.' } },
        { status: 404 }
      );
    }

    notifications = notifications.filter(n => n.id !== notificationId);
    return HttpResponse.json({
      data: { success: true },
      message: 'Notification deleted.',
    } satisfies SuccessMessageResponse);
  }),

  // ── Notification: generic route last ─────────────────────────────────────

  // GET /notifications
  //
  // Supports the following query params:
  //   ?page=<n>          — page number (default: 1)
  //   ?limit=<n>         — items per page (default: 20, max: 50)
  //   ?unread_only=true  — only unread notifications
  //   ?type=<type>       — filter by notification type: follow | like | repost | comment
  //                        omitting `type` returns all notifications regardless of type
  //
  // The `typeScenario` config override (set via setNotificationTypeScenario) takes
  // precedence over the ?type= query param, allowing tests to force a specific type
  // without controlling the request URL.
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
        } satisfies NotificationListResponse);

      case 'error':
        return HttpResponse.json(
          { success: false, message: 'Internal server error' },
          { status: 500 }
        );

      case 'loading':
        return new Promise(() => {});

      default: {
        const url         = new URL(request.url);
        const page        = parseInt(url.searchParams.get('page')  ?? '1');
        const limit       = parseInt(url.searchParams.get('limit') ?? '20');
        const unread_only = url.searchParams.get('unread_only') === 'true';

        // typeScenario config takes precedence; falls back to ?type= query param;
        // if neither is set, no type filter is applied (all types returned).
        const typeParam = url.searchParams.get('type') as NotificationType | null;
        const activeType: NotificationType | undefined =
          notificationMockConfig.typeScenario ?? typeParam ?? undefined;

        let result = [...notifications];
        if (unread_only) result = result.filter(n => !n.is_read);
        if (activeType)  result = result.filter(n => n.type === activeType);

        const total_items = result.length;
        const total_pages = Math.ceil(total_items / limit);
        const start       = (page - 1) * limit;

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
        } satisfies NotificationListResponse);
      }
    }
  }),

  // ── Follow / Unfollow ─────────────────────────────────────────────────────

  // POST /users/:userId/follow
  http.post('*/users/:userId/follow', ({ params }) => {
    const userId = params.userId as string;

    if (followingIds.has(userId)) {
      return HttpResponse.json(
        { message: 'Already following this user.' } satisfies FollowAlreadyExistsResponse,
        { status: 200 }
      );
    }

    followingIds.add(userId);
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
    );
  }),

  // DELETE /users/:userId/follow
  http.delete('*/users/:userId/follow', ({ params }) => {
    const userId = params.userId as string;
    followingIds.delete(userId);
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Following list ────────────────────────────────────────────────────────

  // GET /users/me/following
  http.get('*/users/me/following', ({ request }) => {
    const url    = new URL(request.url);
    const q      = url.searchParams.get('q') ?? '';
    const limit  = parseInt(url.searchParams.get('limit')  ?? '10');
    const offset = parseInt(url.searchParams.get('offset') ?? '0');

    const filtered = q.trim()
      ? mockFollowers.filter(
          u =>
            u.display_name.toLowerCase().includes(q.toLowerCase()) ||
            u.username.toLowerCase().includes(q.toLowerCase())
        )
      : mockFollowers;

    const sliced      = filtered.slice(offset, offset + limit);
    const total_items = filtered.length;
    const total_pages = Math.ceil(total_items / limit);
    const page        = Math.floor(offset / limit) + 1;

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
    } satisfies FollowingSearchResponse);
  }),
];