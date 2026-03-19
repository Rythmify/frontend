import { http, HttpResponse } from "msw";
import type {
  ConversationListResponse,
  ConversationDetailResponse,
  MessageCreatedResponse,
  ConversationCreatedResponse,
  UnreadCountResponse,
  MarkMessageReadResponse,
  SuccessMessageResponse,
  ResolvedResource,
  FollowingSearchResponse,
  TrackResponse,
  GlobalSearchResponse,
  BlockCreatedResponse,
  BlockAlreadyExistsResponse,
  ReportCreatedResponse,
  ReportRequest,
  PlaylistResponse,
} from '../../api/messaging/conversationApi';


// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockParticipant = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  username: "soundwave_cairo",
  display_name: "Soundwave",
  bio: "Producer from Cairo.",
  location: "Cairo, EG",
  gender: "male",
  role: "artist",
  profile_picture: "https://i.pravatar.cc/150?img=1",
  cover_photo: "",
  is_private: false,
  is_verified: false,
  followers_count: 120,
  following_count: 30,
  created_at: "2025-01-01T12:00:00Z",
};

const mockParticipant2 = {
  id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  username: "rana_beats",
  display_name: "Rana Ahmed",
  bio: "Music lover.",
  location: "Cairo, EG",
  gender: "female",
  role: "listener",
  profile_picture: "https://i.pravatar.cc/150?img=5",
  cover_photo: "",
  is_private: false,
  is_verified: false,
  followers_count: 40,
  following_count: 10,
  created_at: "2025-02-01T10:00:00Z",
};

const mockParticipant3 = {
  id: 'c3d4d4e5-f6a7-8901-bcde-f12345678901',
  username: 'felfela_beats',
  display_name: 'farah medhat',
  bio: 'Music lover.',
  location: 'Cairo, EG',
  gender: 'female',
  role: 'listener',
  profile_picture: 'https://i.pravatar.cc/150?img=2',
  cover_photo: '',
  is_private: false,
  is_verified: false,
  followers_count: 40,
  following_count: 10,
  created_at: '2025-02-01T10:00:00Z',
};

const mockMessage1 = {
  id: "d4e5f6a7-b8c9-0123-defa-456789abcdef",
  conversation_id: "c1d2e3f4-a5b6-7890-cdef-123456789abc",
  sender_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  body: "Check out this track!",
  embed_type: null,
  embed_id: null,
  is_read: true,
  created_at: "2025-03-10T14:22:00Z",
};

const mockMessage2 = {
  id: "e5f6a7b8-c9d0-1234-efab-567890abcdef",
  conversation_id: "c1d2e3f4-a5b6-7890-cdef-123456789abc",
  sender_id: "current-user-id",
  body: "Thanks for sharing!",
  embed_type: null,
  embed_id: null,
  is_read: true,
  created_at: "2025-03-10T14:25:00Z",
};


const mockTrack = {
  id: 'e5f6a7b8-c9d0-1234-efab-567890abcdef',
  title: 'Mock Track Title',
  stream_url: 'https://example.com/stream',
  preview_url: null,
  waveform_url: null,
  duration: 240,
  bitrate: 128,
  is_public: true,
  is_hidden: false,
  created_at: '2025-01-01T00:00:00Z',
};

const mockPlaylist = {
  id: 'playlist-mock-id-0001',
  title: 'Mock Playlist Title',
  description: 'A mock playlist for testing.',
  is_public: true,
  track_count: 5,
  created_at: '2025-01-01T00:00:00Z',
};

const mockConversations: ConversationListResponse = {
  success: true,
  data: {
    items: [
      {
        id: "c1d2e3f4-a5b6-7890-cdef-123456789abc",
        participant: mockParticipant,
        last_message: mockMessage1,
        unread_count: 3,
        created_at: "2025-03-01T10:00:00Z",
        updated_at: "2025-03-10T14:22:00Z",
      },
      {
        id: "d2e3f4a5-b6c7-8901-defa-234567890bcd",
        participant: mockParticipant2,
        last_message: {
          ...mockMessage2,
          conversation_id: "d2e3f4a5-b6c7-8901-defa-234567890bcd",
          body: "test",
        },
        unread_count: 0,
        created_at: "2025-03-02T10:00:00Z",
        updated_at: "2025-03-10T14:25:00Z",
      },
    ],
    pagination: {
      page: 1,
      per_page: 20,
      total_items: 2,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    },
  },
};

const mockConversationDetail: ConversationDetailResponse = {
  success: true,
  data: {
    conversation: mockConversations.data.items[0],
    messages: [mockMessage1, mockMessage2],
    pagination: {
      page: 1,
      per_page: 50,
      total_items: 2,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    },
  },
};

const mockFollowingPool = [
  {
    id: mockParticipant.id,
    username: mockParticipant.username,
    display_name: mockParticipant.display_name,
    profile_picture: mockParticipant.profile_picture,
    is_verified: mockParticipant.is_verified,
  },
  {
    id: mockParticipant2.id,
    username: mockParticipant2.username,
    display_name: mockParticipant2.display_name,
    profile_picture: mockParticipant2.profile_picture,
    is_verified: mockParticipant2.is_verified,
  },
];

const mockGlobalUserPool = [
  {
    id: mockParticipant.id,
    username: mockParticipant.username,
    display_name: mockParticipant.display_name,
    profile_picture: mockParticipant.profile_picture,
    score: 0.95,
  },
  {
    id: mockParticipant2.id,
    username: mockParticipant2.username,
    display_name: mockParticipant2.display_name,
    profile_picture: mockParticipant2.profile_picture,
    score: 0.90,
  },
  {
    id: mockParticipant3.id,
    username: mockParticipant3.username,
    display_name: mockParticipant3.display_name,
    profile_picture: mockParticipant3.profile_picture,
    score: 0.80,
  },
];

// ─── Scenario Config ──────────────────────────────────────────────────────────

type MockScenario = "success" | "empty" | "error" | "loading";

// Scenario config for block endpoint lets you simulate edge-cases in tests.
type BlockScenario = 'success' | 'already_blocked' | 'block_self' | 'not_found';

// Scenario config for report endpoint.
type ReportScenario =
  | 'success'
  | 'validation_error'
  | 'not_found'
  | 'already_reported'
  | 'rate_limited';

export const mockConfig = {
  conversations: "empty" as MockScenario,
  conversationDetail: "success" as MockScenario,
  block: 'success' as BlockScenario,
  report: 'success' as ReportScenario,
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const messageHandlers = [
  // GET /messages/conversations
  http.get("*/messages/conversations", () => {
    switch (mockConfig.conversations) {
      case "empty":
        return HttpResponse.json({
          success: true,
          data: {
            items: [],
            pagination: {
              page: 1,
              per_page: 20,
              total_items: 0,
              total_pages: 0,
              has_next: false,
              has_prev: false,
            },
          },
        } satisfies ConversationListResponse);

      case "error":
        return HttpResponse.json(
          { success: false, message: "Internal server error" },
          { status: 500 },
        );

      case "loading":
        return new Promise(() => {});

      default:
        return HttpResponse.json(mockConversations);
    }
  }),

  // GET /messages/conversations/:conversationId
  http.get("*/messages/conversations/:conversationId", () => {
    switch (mockConfig.conversationDetail) {
      case "error":
        return HttpResponse.json(
          { success: false, message: "Conversation not found" },
          { status: 404 },
        );
      case "loading":
        return new Promise(() => {});
      default:
        return HttpResponse.json(
          mockConversationDetail satisfies ConversationDetailResponse,
        );
    }
  }),

  // DELETE /messages/conversations/:conversationId
  http.delete("*/messages/conversations/:conversationId", () => {
    return HttpResponse.json({
      success: true,
      message: "Conversation deleted.",
    } satisfies SuccessMessageResponse);
  }),

  // POST /messages/conversations/:conversationId/messages
  http.post(
    "*/messages/conversations/:conversationId/messages",
    async ({ request }) => {
      const body = (await request.json()) as {
        body?: string;
        resource?: { type: string; id: string };
      };
      return HttpResponse.json({
        success: true,
        data: {
          id: crypto.randomUUID(),
          conversation_id: "c1d2e3f4-a5b6-7890-cdef-123456789abc",
          sender_id: "current-user-id",
          body: body.body ?? "",
          embed_type: body.resource?.type ?? null,
          embed_id: body.resource?.id ?? null,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      } satisfies MessageCreatedResponse);
    },
  ),

  // DELETE /messages/conversations/:conversationId/messages/:messageId
  http.delete(
    "*/messages/conversations/:conversationId/messages/:messageId",
    () => {
      return HttpResponse.json({
        success: true,
        message: "Message deleted.",
      } satisfies SuccessMessageResponse);
    },
  ),

  // POST /messages/new
  http.post("*/messages/new", async ({ request }) => {
    const body = (await request.json()) as {
      recipient_id: string;
      body?: string;
    };
    return HttpResponse.json({
      success: true,
      data: {
        conversation: mockConversations.data.items[0],
        message: {
          id: crypto.randomUUID(),
          conversation_id: "c1d2e3f4-a5b6-7890-cdef-123456789abc",
          sender_id: "current-user-id",
          body: body.body ?? "",
          embed_type: null,
          embed_id: null,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      },
    } satisfies ConversationCreatedResponse);
  }),

  // GET /messages/unread-count
  http.get("*/messages/unread-count", () => {
    return HttpResponse.json({
      success: true,
      data: { unread_count: 3 },
    } satisfies UnreadCountResponse);
  }),

  // PATCH .../messages/:messageId/read
  http.patch(
    "*/messages/:conversationId/messages/:messageId/read",
    async ({ request }) => {
      const body = (await request.json()) as { is_read: boolean };
      return HttpResponse.json({
        success: true,
        data: {
          message_id: crypto.randomUUID(),
          is_read: body.is_read,
          conversation_unread_count: body.is_read ? 0 : 1,
        },
      } satisfies MarkMessageReadResponse);
    },
  ),

  // GET /resolve
  // Parses the incoming rythmify.com URL to return the correct type and the
  // matching mock ID so the subsequent fetch hits the right mock object.
  //
  // Test URLs to paste in the MessageInput textarea:
  //   track    → https://rythmify.com/tracks/e5f6a7b8-c9d0-1234-efab-567890abcdef
  //   playlist → https://rythmify.com/playlists/playlist-mock-id-0001
  http.get('*/resolve', ({ request }) => {
    const url = new URL(request.url);
    const permalink = url.searchParams.get('url') ?? '';

    let type: 'track' | 'playlist' | 'user' = 'track';
    if (permalink.includes('/playlists/')) type = 'playlist';
    else if (permalink.includes('/users/')) type = 'user';

    const id = type === 'track'
      ? mockTrack.id
      : type === 'playlist'
      ? mockPlaylist.id
      : permalink.split('/users/')[1] ?? 'unknown-user';

    return HttpResponse.json({
      data: { type, id, permalink },
    } satisfies ResolvedResource);
  }),

  // GET /users/me/following/search
  http.get('*/users/me/following/search', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') ?? '';

    const filtered = q.trim()
      ? mockFollowingPool.filter(
          u =>
            u.display_name.toLowerCase().includes(q.toLowerCase()) ||
            u.username.toLowerCase().includes(q.toLowerCase())
        )
      : mockFollowingPool;

    return HttpResponse.json({
      success: true,
      data: {
        items: filtered,
        pagination: {
          page: 1,
          per_page: 10,
          total_items: filtered.length,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      },
    } satisfies FollowingSearchResponse);
  }),

  // GET /search
  http.get('*/search', ({ request }) => {
    const url  = new URL(request.url);
    const q    = url.searchParams.get('q') ?? '';
    const type = url.searchParams.get('type');

    if (q.trim().length < 2) {
      return HttpResponse.json({
        data: { tracks: [], users: [], playlists: [] },
        pagination: {
          page: 1, per_page: 20,
          total_items: 0, total_pages: 0,
          has_next: false, has_prev: false,
        },
      } satisfies GlobalSearchResponse);
    }

    const matchedUsers = (!type || type === 'users')
      ? mockGlobalUserPool.filter(
          u =>
            u.display_name.toLowerCase().includes(q.toLowerCase()) ||
            u.username.toLowerCase().includes(q.toLowerCase())
        )
      : [];

    return HttpResponse.json({
      data: {
        tracks:    [],
        users:     matchedUsers,
        playlists: [],
      },
      pagination: {
        page: 1,
        per_page: 20,
        total_items: matchedUsers.length,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
    } satisfies GlobalSearchResponse);
  }),

  // GET /tracks/:trackId
  http.get('*/tracks/:trackId', ({ params }) => {
    const trackId = params.trackId as string;
    if (trackId !== mockTrack.id) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Track not found.' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: mockTrack,
    } satisfies TrackResponse);
  }),


  // GET /playlists/:playlistId
  http.get('*/playlists/:playlistId', ({ params }) => {
    const playlistId = params.playlistId as string;
    if (playlistId !== mockPlaylist.id) {
      return HttpResponse.json(
        { error: { code: 'PLAYLIST_NOT_FOUND', message: 'Playlist not found.' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: mockPlaylist,
    } satisfies PlaylistResponse);
  }),

  // ─── Block ─────────────────────────────────────────────────────────────────

  // POST /users/:user_id/block
  // Switch on mockConfig.block to simulate different scenarios in tests.
  http.post('*/users/:user_id/block', ({ params }) => {
    const userId = params.user_id as string;

    switch (mockConfig.block) {
      case 'already_blocked':
        return HttpResponse.json(
          { message: 'User is already blocked.' } satisfies BlockAlreadyExistsResponse,
          { status: 200 }
        );

      case 'block_self':
        return HttpResponse.json(
          {
            error: {
              code: 'BLOCK_SELF',
              message: 'You cannot block yourself.',
            },
          },
          { status: 400 }
        );

      case 'not_found':
        return HttpResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'User not found.',
            },
          },
          { status: 404 }
        );

      default: // 'success'
        return HttpResponse.json(
          {
            data: {
              blocker_id: 'current-user-id',
              blocked_id: userId,
              created_at: new Date().toISOString(),
            },
            message: 'User has been blocked.',
          } satisfies BlockCreatedResponse,
          { status: 201 }
        );
    }
  }),

  // DELETE /users/:user_id/block
  http.delete('*/users/:user_id/block', () => {
    // 204 No Content — no body per spec.
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Reports ───────────────────────────────────────────────────────────────

  // POST /reports
  http.post('*/reports', async ({ request }) => {
    const body = await request.json() as ReportRequest;

    switch (mockConfig.report) {
      case 'validation_error':
        return HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_FAILED',
              message: 'Validation failed',
              details: [
                {
                  field: 'reason',
                  issue: 'Copyright reason is only valid for track reports.',
                },
              ],
            },
          },
          { status: 400 }
        );

      case 'not_found':
        return HttpResponse.json(
          {
            error: {
              code: 'RESOURCE_NOT_FOUND',
              message: 'The reported resource was not found',
            },
          },
          { status: 404 }
        );

      case 'already_reported':
        return HttpResponse.json(
          {
            error: {
              code: 'RESOURCE_ALREADY_EXISTS',
              message: 'You have already reported this resource',
            },
          },
          { status: 409 }
        );

      case 'rate_limited':
        return HttpResponse.json(
          {
            error: {
              code: 'RATE_LIMITED',
              message: 'Too many reports. Please try again later.',
            },
          },
          { status: 429 }
        );

      default: // 'success'
        return HttpResponse.json(
          {
            data: {
              id: crypto.randomUUID(),
              resource_type: body.resource_type,
              resource_id: body.resource_id,
              reason: body.reason,
              description: body.description ?? null,
              status: 'pending',
              created_at: new Date().toISOString(),
            },
            message: 'Report submitted successfully. Our team will review it shortly.',
          } satisfies ReportCreatedResponse,
          { status: 201 }
        );
    }
  }),
];
