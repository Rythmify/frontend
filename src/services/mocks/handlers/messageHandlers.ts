import { http, HttpResponse } from 'msw';
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
} from '../../api/messaging/conversationApi';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockParticipant = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  username: 'soundwave_cairo',
  display_name: 'Soundwave',
  bio: 'Producer from Cairo.',
  location: 'Cairo, EG',
  gender: 'male',
  role: 'artist',
  profile_picture: 'https://i.pravatar.cc/150?img=1',
  cover_photo: '',
  is_private: false,
  is_verified: false,
  followers_count: 120,
  following_count: 30,
  created_at: '2025-01-01T12:00:00Z',
};

const mockParticipant2 = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  username: 'rana_beats',
  display_name: 'Rana Ahmed',
  bio: 'Music lover.',
  location: 'Cairo, EG',
  gender: 'female',
  role: 'listener',
  profile_picture: 'https://i.pravatar.cc/150?img=5',
  cover_photo: '',
  is_private: false,
  is_verified: false,
  followers_count: 40,
  following_count: 10,
  created_at: '2025-02-01T10:00:00Z',
};

const mockMessage1 = {
  id: 'd4e5f6a7-b8c9-0123-defa-456789abcdef',
  conversation_id: 'c1d2e3f4-a5b6-7890-cdef-123456789abc',
  sender_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  body: 'Check out this track!',
  embed_type: null,
  embed_id: null,
  is_read: true,
  created_at: '2025-03-10T14:22:00Z',
};

const mockMessage2 = {
  id: 'e5f6a7b8-c9d0-1234-efab-567890abcdef',
  conversation_id: 'c1d2e3f4-a5b6-7890-cdef-123456789abc',
  sender_id: 'current-user-id',
  body: 'Thanks for sharing!',
  embed_type: null,
  embed_id: null,
  is_read: true,
  created_at: '2025-03-10T14:25:00Z',
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
        last_message: {
          ...mockMessage2,
          conversation_id: 'd2e3f4a5-b6c7-8901-defa-234567890bcd',
          body: 'test',
        },
        unread_count: 0,
        created_at: '2025-03-02T10:00:00Z',
        updated_at: '2025-03-10T14:25:00Z',
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

// ─── Scenario Config ──────────────────────────────────────────────────────────

type MockScenario = 'success' | 'empty' | 'error' | 'loading';

export const mockConfig = {
  conversations: 'empty' as MockScenario,
  conversationDetail: 'success' as MockScenario,
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const messageHandlers = [

  // GET /messages/conversations
  http.get('*/messages/conversations', () => {
    switch (mockConfig.conversations) {
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
        } satisfies ConversationListResponse);

      case 'error':
        return HttpResponse.json(
          { success: false, message: 'Internal server error' },
          { status: 500 }
        );

      case 'loading':
        return new Promise(() => {});

      default:
        return HttpResponse.json(mockConversations);
    }
  }),

  // GET /messages/conversations/:conversationId
  http.get('*/messages/conversations/:conversationId', () => {
    switch (mockConfig.conversationDetail) {
      case 'error':
        return HttpResponse.json(
          { success: false, message: 'Conversation not found' },
          { status: 404 }
        );
      case 'loading':
        return new Promise(() => {});
      default:
        return HttpResponse.json(mockConversationDetail satisfies ConversationDetailResponse);
    }
  }),

  // DELETE /messages/conversations/:conversationId
  http.delete('*/messages/conversations/:conversationId', () => {
    return HttpResponse.json({
      success: true,
      message: 'Conversation deleted.',
    } satisfies SuccessMessageResponse);
  }),

  // POST /messages/conversations/:conversationId/messages
  http.post('*/messages/conversations/:conversationId/messages', async ({ request }) => {
    const body = await request.json() as { body?: string; resource?: { type: string; id: string } };
    return HttpResponse.json({
      success: true,
      data: {
        id: crypto.randomUUID(),
        conversation_id: 'c1d2e3f4-a5b6-7890-cdef-123456789abc',
        sender_id: 'current-user-id',
        body: body.body ?? '',
        embed_type: body.resource?.type ?? null,
        embed_id: body.resource?.id ?? null,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    } satisfies MessageCreatedResponse);
  }),

  // DELETE /messages/conversations/:conversationId/messages/:messageId
  http.delete('*/messages/conversations/:conversationId/messages/:messageId', () => {
    return HttpResponse.json({
      success: true,
      message: 'Message deleted.',
    } satisfies SuccessMessageResponse);
  }),

  // POST /messages/new
  http.post('*/messages/new', async ({ request }) => {
    const body = await request.json() as { recipient_id: string; body?: string };
    return HttpResponse.json({
      success: true,
      data: {
        conversation: mockConversations.data.items[0],
        message: {
          id: crypto.randomUUID(),
          conversation_id: 'c1d2e3f4-a5b6-7890-cdef-123456789abc',
          sender_id: 'current-user-id',
          body: body.body ?? '',
          embed_type: null,
          embed_id: null,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      },
    } satisfies ConversationCreatedResponse);
  }),

  // GET /messages/unread-count
  http.get('*/messages/unread-count', () => {
    return HttpResponse.json({
      success: true,
      data: { unread_count: 3 },
    } satisfies UnreadCountResponse);
  }),

  // PATCH .../messages/:messageId/read
  http.patch('*/messages/:conversationId/messages/:messageId/read', async ({ request }) => {
    const body = await request.json() as { is_read: boolean };
    return HttpResponse.json({
      success: true,
      data: {
        message_id: crypto.randomUUID(),
        is_read: body.is_read,
        conversation_unread_count: body.is_read ? 0 : 1,
      },
    } satisfies MarkMessageReadResponse);
  }),

  // GET /resolve
  http.get('*/resolve', ({ request }) => {
    const url = new URL(request.url);
    const permalink = url.searchParams.get('url') ?? '';
    return HttpResponse.json({
      data: {
        type: 'track',
        id: 'e5f6a7b8-c9d0-1234-efab-567890abcdef',
        permalink,
      },
    } satisfies ResolvedResource);
  }),

  // GET /users/me/following/search
  http.get('*/users/me/following/search', () => {
    return HttpResponse.json({
      success: true,
      data: {
        items: [
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
        ],
        pagination: {
          page: 1, per_page: 10,
          total_items: 2, total_pages: 1,
          has_next: false, has_prev: false,
        },
      },
    } satisfies FollowingSearchResponse);
  }),

  // GET /tracks/:trackId
  http.get('*/tracks/:trackId', () => {
    return HttpResponse.json({
      success: true,
      data: {
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
      },
    } satisfies TrackResponse);
  }),
];