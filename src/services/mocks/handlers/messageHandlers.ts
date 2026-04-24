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
import type { avatar } from "@heroui/react";


// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockParticipant = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  username: "soundwave_cairo",
  display_name: "Soundwave",
  bio: "Producer from Cairo.",
  location: "Cairo, EG",
  gender: "male",
  role: "artist",
  avatar: "https://i.pravatar.cc/150?img=1",
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
  avatar: "https://i.pravatar.cc/150?img=5",
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
  avatar: 'https://i.pravatar.cc/150?img=2',
  cover_photo: '',
  is_private: false,
  is_verified: false,
  followers_count: 40,
  following_count: 10,
  created_at: '2025-02-01T10:00:00Z',
};

const mockParticipant4 = {
  id: 'd4e5f6a7-b8c9-0123-defa-456789abcdef',
  username: 'ahmed_music',
  display_name: 'Ahmed Music',
  bio: 'Music producer.',
  location: 'Cairo, EG',
  gender: 'male',
  role: 'artist',
  avatar: 'https://i.pravatar.cc/150?img=3',
  cover_photo: '',
  is_private: false,
  is_verified: true,
  followers_count: 200,
  following_count: 50,
  created_at: '2025-03-01T10:00:00Z',
}

const mockParticipant5 = {
  id: 'e5f6a7b8-c9d0-1234-efab-567890abcdef',
  username: 'nour_beats',
  display_name: 'Nour Beats',
  bio: 'DJ and producer.',
  location: 'Alex, EG',
  gender: 'female',
  role: 'artist',
  avatar: 'https://i.pravatar.cc/150?img=6',
  cover_photo: '',
  is_private: false,
  is_verified: false,
  followers_count: 80,
  following_count: 20,
  created_at: '2025-03-05T10:00:00Z',
}

const mockParticipant6 = {
  id: 'f6a7b8c9-d0e1-2345-fabc-678901abcdef',
  username: 'karim_wav',
  display_name: 'Karim Wav',
  bio: 'Sound engineer.',
  location: 'Giza, EG',
  gender: 'male',
  role: 'artist',
  avatar: '',
  cover_photo: '',
  is_private: false,
  is_verified: false,
  followers_count: 30,
  following_count: 15,
  created_at: '2025-03-08T10:00:00Z',
}

const mockParticipant7 = {
  id: 'a7b8c9d0-e1f2-3456-abcd-789012abcdef',
  username: 'layla_sounds',
  display_name: 'Layla Sounds',
  bio: 'Vocalist.',
  location: 'Cairo, EG',
  gender: 'female',
  role: 'artist',
  avatar: 'https://i.pravatar.cc/150?img=9',
  cover_photo: '',
  is_private: false,
  is_verified: false,
  followers_count: 55,
  following_count: 25,
  created_at: '2025-03-09T10:00:00Z',
}

const mockParticipant8 = {
  id: 'b8c9d0e1-f2a3-4567-bcde-890123abcdef',
  username: 'omar_studio',
  display_name: 'Omar Studio',
  bio: 'Mixing and mastering.',
  location: 'Cairo, EG',
  gender: 'male',
  role: 'artist',
  avatar: 'https://i.pravatar.cc/150?img=12',
  cover_photo: '',
  is_private: false,
  is_verified: true,
  followers_count: 300,
  following_count: 60,
  created_at: '2025-03-10T10:00:00Z',
}

const mockParticipant9 = {
  id: 'c9d0e1f2-a3b4-5678-cdef-901234abcdef',
  username: 'sara_melody',
  display_name: 'Sara Melody',
  bio: 'Singer-songwriter.',
  location: 'Cairo, EG',
  gender: 'female',
  role: 'artist',
  avatar: '',
  cover_photo: '',
  is_private: false,
  is_verified: false,
  followers_count: 45,
  following_count: 18,
  created_at: '2025-03-11T10:00:00Z',
}
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

const mockMessage3 = {
  id: "e5f6a7b8-c9d0-1234-efab-567890abcdef",
  conversation_id: "c1d2e3f4-a5b6-7890-cdef-123456789abc",
  sender_id: "current-user-id",
  body: "test",
  embed_type: null,
  embed_id: null,
  is_read: true,
  created_at: "2025-03-10T14:25:00Z",
};

// ─── Block-specific mock message ──────────────────────────────────────────────
const mockMessageUnread = {
  id: "f6a7b8c9-d0e1-2345-fabc-678901abcdef",
  conversation_id: "c1d2e3f4-a5b6-7890-cdef-123456789abc",
  sender_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  body: "Check out this track!",
  embed_type: null,
  embed_id: null,
  is_read: false,
  created_at: "2025-03-10T14:22:00Z",
};

const mockTrack = {
  id: 'e5f6a7b8-c9d0-1234-efab-567890abcdef',
  title: 'Mock Track Title',
  description: 'A chill electronic track',
  genre: 'Electronic',
  tags: [],
  duration: 240,
  file_size: 8388608,
  bitrate: 128,
  status: 'ready',
  is_public: true,
  is_hidden: false,
  user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  play_count: 0,
  like_count: 0,
  comment_count: 0,
  repost_count: 0,
  audio_url: null,
  stream_url: 'https://example.com/stream',
  preview_url: null,
  waveform_url: null,
  artists: 'Mock Artist',
  buy_link: null,
  record_label: null,
  publisher: null,
  release_date: null,
  isrc: null,
  p_line: null,
  explicit_content: false,
  include_in_rss_feed: false,
  display_embed_code: false,
  enable_app_playback: true,
  enable_downloads: false,
  enable_offline_listening: false,
  license_type: null,
  allow_comments: true,
  show_comments_public: true,
  show_insights_public: true,
  geo_restriction_type: 'worldwide',
  geo_regions: [],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  artist_name: 'DJ Karim',
cover_image: null,        // or a CDN URL string

};

const mockPlaylist = {
  playlist_id: 'playlist-mock-id-0001', 
  owner_user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Mock Playlist Title',          
  description: 'A mock playlist for testing.',
  is_public: true,
  track_count: 5,
  like_count: 0,
  tracks: [],
  created_at: '2025-01-01T00:00:00Z',
  slug: null,
cover_image: null,
repost_count: 0,
updated_at: new Date().toISOString(),
};

const mockConversations: ConversationListResponse = {
  success: true,
  data: {
    items: [
      {
        id: 'c1d2e3f4-a5b6-7890-cdef-123456789abc',
        participant: mockParticipant,
        last_message: mockMessage1,
        unread_count: 3,
        created_at: '2025-03-01T10:00:00Z',
        updated_at: '2025-03-10T14:22:00Z',
      },
      {
        id: 'd2e3f4a5-b6c7-8901-defa-234567890bcd',
        participant: mockParticipant2,
        last_message: { ...mockMessage2, conversation_id: 'd2e3f4a5-b6c7-8901-defa-234567890bcd', body: 'test' },
        unread_count: 0,
        created_at: '2025-03-02T10:00:00Z',
        updated_at: '2025-03-10T14:25:00Z',
      },
      {
        id: 'e3f4a5b6-c7d8-9012-efab-345678901cde',
        participant: mockParticipant3,
        last_message: { ...mockMessage1, conversation_id: 'e3f4a5b6-c7d8-9012-efab-345678901cde', body: 'Hey there!' },
        unread_count: 1,
        created_at: '2025-03-03T10:00:00Z',
        updated_at: '2025-03-11T09:00:00Z',
      },
      {
        id: 'f4a5b6c7-d8e9-0123-fabc-456789012def',
        participant: mockParticipant4,
        last_message: { ...mockMessage2, conversation_id: 'f4a5b6c7-d8e9-0123-fabc-456789012def', body: 'Check this beat out' },
        unread_count: 2,
        created_at: '2025-03-04T10:00:00Z',
        updated_at: '2025-03-11T10:00:00Z',
      },
      {
        id: 'a5b6c7d8-e9f0-1234-abcd-567890123efa',
        participant: mockParticipant5,
        last_message: { ...mockMessage1, conversation_id: 'a5b6c7d8-e9f0-1234-abcd-567890123efa', body: 'When are you free?' },
        unread_count: 0,
        created_at: '2025-03-05T10:00:00Z',
        updated_at: '2025-03-11T11:00:00Z',
      },
      {
        id: 'b6c7d8e9-f0a1-2345-bcde-678901234fab',
        participant: mockParticipant6,
        last_message: { ...mockMessage2, conversation_id: 'b6c7d8e9-f0a1-2345-bcde-678901234fab', body: 'Sounds great!' },
        unread_count: 0,
        created_at: '2025-03-06T10:00:00Z',
        updated_at: '2025-03-11T12:00:00Z',
      },
      {
        id: 'c7d8e9f0-a1b2-3456-cdef-789012345abc',
        participant: mockParticipant7,
        last_message: { ...mockMessage1, conversation_id: 'c7d8e9f0-a1b2-3456-cdef-789012345abc', body: 'Love your track!' },
        unread_count: 4,
        created_at: '2025-03-07T10:00:00Z',
        updated_at: '2025-03-11T13:00:00Z',
      },
      {
        id: 'd8e9f0a1-b2c3-4567-defa-890123456bcd',
        participant: mockParticipant8,
        last_message: { ...mockMessage2, conversation_id: 'd8e9f0a1-b2c3-4567-defa-890123456bcd', body: 'Let\'s collab!' },
        unread_count: 0,
        created_at: '2025-03-08T10:00:00Z',
        updated_at: '2025-03-11T14:00:00Z',
      },
      {
        id: 'e9f0a1b2-c3d4-5678-efab-901234567cde',
        participant: mockParticipant9,
        last_message: { ...mockMessage1, conversation_id: 'e9f0a1b2-c3d4-5678-efab-901234567cde', body: 'New song dropping soon' },
        unread_count: 1,
        created_at: '2025-03-09T10:00:00Z',
        updated_at: '2025-03-11T15:00:00Z',
      },
    ],
    pagination: {
      page: 1,
      per_page: 20,
      total_items: 9,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    },
  },
}

const mockConversationDetail: ConversationDetailResponse = {
  success: true,
  data: {
    conversation: mockConversations.data.items[0],
    messages: [mockMessage1, mockMessage2, mockMessage3],
    pagination: {
      page: 1,
      per_page: 50,
      total_items: 3,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    },
  },
};

// ─── Block-specific conversation detail ───────────────────────────────────────
// uses mockMessageUnread (is_read: false) so mark-as-read flow works in block tests
const mockConversationDetailForBlock: ConversationDetailResponse = {
  success: true,
  data: {
    conversation: mockConversations.data.items[0],
    messages: [mockMessageUnread, mockMessage2, mockMessage3],
    pagination: {
      page: 1,
      per_page: 50,
      total_items: 3,
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
    avatar: mockParticipant.avatar,
    is_verified: mockParticipant.is_verified,
  },
  {
    id: mockParticipant2.id,
    username: mockParticipant2.username,
    display_name: mockParticipant2.display_name,
    avatar: mockParticipant2.avatar,
    is_verified: mockParticipant2.is_verified,
  },
];

const mockGlobalUserPool = [
  {
    id: mockParticipant.id,
    username: mockParticipant.username,
    display_name: mockParticipant.display_name,
    avatar: mockParticipant.avatar,
    score: 0.95,
  },
  {
    id: mockParticipant2.id,
    username: mockParticipant2.username,
    display_name: mockParticipant2.display_name,
    avatar: mockParticipant2.avatar,
    score: 0.90,
  },
  {
    id: mockParticipant3.id,
    username: mockParticipant3.username,
    display_name: mockParticipant3.display_name,
    avatar: mockParticipant3.avatar,
    score: 0.80,
  },
];

// ─── Scenario Config ──────────────────────────────────────────────────────────

type MockScenario = "success" | "empty" | "error" | "loading";
type BlockScenario = 'success' | 'already_blocked' | 'block_self' | 'not_found';
type ReportScenario =
  | 'success'
  | 'validation_error'
  | 'not_found'
  | 'already_reported'
  | 'rate_limited';

export const mockConfig = {
  conversations: "success" as MockScenario,
  conversationDetail: "success" as MockScenario,
  block: 'success' as BlockScenario,
  report: 'success' as ReportScenario,
  // ── Block feature flags ──────────────────────────────────────────────────
  // these are isolated from other tests — only flip during block/unblock tests
  isBlocked: false,         // true = participant has been blocked by current user
  useBlockScenario: false,  // true = use mockConversationDetailForBlock (unread messages)
};

// ─── Reset helper ─────────────────────────────────────────────────────────────
// call this in beforeEach() in your test files to guarantee a clean slate
export const resetMockConfig = () => {
  mockConfig.conversations      = 'success'
  mockConfig.conversationDetail = 'success'
  mockConfig.block              = 'success'
  mockConfig.report             = 'success'
  mockConfig.isBlocked          = false
  mockConfig.useBlockScenario   = false
}

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
      default: {
        // use block-specific detail (unread messages) when in block test scenario
        const detail = mockConfig.useBlockScenario
          ? mockConversationDetailForBlock
          : mockConversationDetail;

        return HttpResponse.json(detail satisfies ConversationDetailResponse);
      }
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
      // reject message sending when participant has blocked current user
      // only active during block tests (useBlockScenario = true)
      if (mockConfig.isBlocked) {
        return HttpResponse.json(
          { error: { code: 'BLOCKED', message: 'You have been blocked by this user.' } },
          { status: 403 }
        )
      }

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
http.get('*/resolve', ({ request }) => {
  const url = new URL(request.url);
  const permalink = url.searchParams.get('url') ?? '';

  // Test permalinks:
  // Track:    https://rythmify.com/tracks/e5f6a7b8-c9d0-1234-efab-567890abcdef
  // Playlist: https://rythmify.com/playlists/playlist-mock-id-0001

  let type: 'track' | 'playlist' | 'user' = 'track';
  if (permalink.includes('/playlists/')) type = 'playlist';
  else if (permalink.includes('/users/')) type = 'user';

  const id = type === 'track'
    ? mockTrack.id
    : type === 'playlist'
    ? mockPlaylist.playlist_id     
    : permalink.split('/users/')[1] ?? 'unknown-user';

  return HttpResponse.json({
    data: { type, id, permalink },
  } satisfies ResolvedResource);
}),

  // // GET /users/me/following/search
  // http.get('*/users/me/following/search', ({ request }) => {
  //   const url = new URL(request.url);
  //   const q = url.searchParams.get('q') ?? '';

  //   const filtered = q.trim()
  //     ? mockFollowingPool.filter(
  //         u =>
  //           u.display_name.toLowerCase().includes(q.toLowerCase()) ||
  //           u.username.toLowerCase().includes(q.toLowerCase())
  //       )
  //     : mockFollowingPool;

  //   return HttpResponse.json({
  //     success: true,
  //     data: {
  //       items: filtered,
  //       pagination: {
  //         page: 1,
  //         per_page: 10,
  //         total_items: filtered.length,
  //         total_pages: 1,
  //         has_next: false,
  //         has_prev: false,
  //       },
  //     },
  //   } satisfies FollowingSearchResponse);
  // }),

  // // GET /search
  // http.get('*/search', ({ request }) => {
  //   const url  = new URL(request.url);
  //   const q    = url.searchParams.get('q') ?? '';
  //   const type = url.searchParams.get('type');

  //   if (q.trim().length < 2) {
  //     return HttpResponse.json({
  //       data: { tracks: [], users: [], playlists: [] },
  //       pagination: {
  //         page: 1, per_page: 20,
  //         total_items: 0, total_pages: 0,
  //         has_next: false, has_prev: false,
  //       },
  //     } satisfies GlobalSearchResponse);
  //   }

  //   const matchedUsers = (!type || type === 'users')
  //     ? mockGlobalUserPool.filter(
  //         u =>
  //           u.display_name.toLowerCase().includes(q.toLowerCase()) ||
  //           u.username.toLowerCase().includes(q.toLowerCase())
  //       )
  //     : [];

  //   return HttpResponse.json({
  //     data: {
  //       tracks:    [],
  //       users:     matchedUsers,
  //       playlists: [],
  //     },
  //     pagination: {
  //       page: 1,
  //       per_page: 20,
  //       total_items: matchedUsers.length,
  //       total_pages: 1,
  //       has_next: false,
  //       has_prev: false,
  //     },
  //   } satisfies GlobalSearchResponse);
  // }),

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
    if (playlistId !== mockPlaylist.playlist_id) {
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
          { error: { code: 'BLOCK_SELF', message: 'You cannot block yourself.' } },
          { status: 400 }
        );

      case 'not_found':
        return HttpResponse.json(
          { error: { code: 'NOT_FOUND', message: 'User not found.' } },
          { status: 404 }
        );

      default: // 'success'
        mockConfig.isBlocked = true  // ← flip to blocked, isolated to block tests
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
    mockConfig.isBlocked = false  // ← flip back to unblocked
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
                { field: 'reason', issue: 'Copyright reason is only valid for track reports.' },
              ],
            },
          },
          { status: 400 }
        );

      case 'not_found':
        return HttpResponse.json(
          { error: { code: 'RESOURCE_NOT_FOUND', message: 'The reported resource was not found' } },
          { status: 404 }
        );

      case 'already_reported':
        return HttpResponse.json(
          { error: { code: 'RESOURCE_ALREADY_EXISTS', message: 'You have already reported this resource' } },
          { status: 409 }
        );

      case 'rate_limited':
        return HttpResponse.json(
          { error: { code: 'RATE_LIMITED', message: 'Too many reports. Please try again later.' } },
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