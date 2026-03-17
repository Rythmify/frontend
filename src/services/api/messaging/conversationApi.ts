import axiosInstance from '../axiosInstance';

// ─── Shared Types ────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  location: string;
  gender: string;
  role: string;
  profile_picture: string;
  cover_photo: string;
  is_private: boolean;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  embed_type: string | null;
  embed_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Pagination {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface Conversation {
  id: string;
  participant: Participant;
  last_message: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface ConversationListResponse {
  success: boolean;
  data: {
    items: Conversation[];
    pagination: Pagination;
  };
}

export interface ConversationDetailResponse {
  success: boolean;
  data: {
    conversation: Conversation;
    messages: Message[];
    pagination: Pagination;
  };
}

export interface MessageCreatedResponse {
  success: boolean;
  data: Message;
}

export interface ConversationCreatedResponse {
  success: boolean;
  data: {
    conversation: Conversation;
    message: Message;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
}

export interface MarkMessageReadResponse {
  success: boolean;
  data: {
    message_id: string;
    is_read: boolean;
    conversation_unread_count: number;
  };
}

export interface SuccessMessageResponse {
  success: boolean;
  message: string;
}

export interface ResolvedResource {
  data: {
    type: 'track' | 'user' | 'playlist';
    id: string;
    permalink: string;
  };
}

export interface FollowingUser {
  id: string;
  username: string;
  display_name: string;
  profile_picture: string;
  is_verified: boolean;
}

export interface FollowingSearchResponse {
  success: boolean;
  data: {
    items: FollowingUser[];
    pagination: Pagination;
  };
}

export interface Track {
  id: string;
  title: string;
  stream_url: string | null;
  preview_url: string | null;
  waveform_url: string | null;
  duration: number | null;
  bitrate: number | null;
  is_public: boolean;
  is_hidden: boolean;
  created_at: string;
}

export interface TrackResponse {
  success: boolean;
  data: Track;
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface SendMessageRequest {
  body?: string;
  resource?: {
    type: 'track' | 'playlist';
    id: string;
  };
}

export interface StartConversationRequest {
  recipient_id: string;
  body?: string;
  resource?: {
    type: 'track' | 'playlist';
    id: string;
  };
}

export interface MarkMessageReadRequest {
  is_read: boolean;
}

// ─── API Functions ────────────────────────────────────────────────────────────

// GET /messages/conversations
export const fetchConversations = async (
  page: number = 1,
  limit: number = 20
): Promise<ConversationListResponse> => {
  const response = await axiosInstance.get<ConversationListResponse>(
    '/messages/conversations',
    { params: { page, limit } }
  );
  return response.data;
};

// GET /messages/conversations/:conversationId
export const fetchConversation = async (
  conversationId: string,
  page: number = 1,
  limit: number = 50
): Promise<ConversationDetailResponse> => {
  const response = await axiosInstance.get<ConversationDetailResponse>(
    `/messages/conversations/${conversationId}`,
    { params: { page, limit } }
  );
  return response.data;
};

// DELETE /messages/conversations/:conversationId
export const deleteConversation = async (
  conversationId: string
): Promise<SuccessMessageResponse> => {
  const response = await axiosInstance.delete<SuccessMessageResponse>(
    `/messages/conversations/${conversationId}`
  );
  return response.data;
};

// POST /messages/conversations/:conversationId/messages
export const sendMessage = async (
  conversationId: string,
  payload: SendMessageRequest
): Promise<MessageCreatedResponse> => {
  const response = await axiosInstance.post<MessageCreatedResponse>(
    `/messages/conversations/${conversationId}/messages`,
    payload
  );
  return response.data;
};

// DELETE /messages/conversations/:conversationId/messages/:messageId
export const deleteMessage = async (
  conversationId: string,
  messageId: string
): Promise<SuccessMessageResponse> => {
  const response = await axiosInstance.delete<SuccessMessageResponse>(
    `/messages/conversations/${conversationId}/messages/${messageId}`
  );
  return response.data;
};

// POST /messages/new
export const startConversation = async (
  payload: StartConversationRequest
): Promise<ConversationCreatedResponse | MessageCreatedResponse> => {
  const response = await axiosInstance.post
   < ConversationCreatedResponse | MessageCreatedResponse>
  ('/messages/new', payload);
  return response.data;
};

// GET /messages/unread-count
export const fetchUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await axiosInstance.get<UnreadCountResponse>(
    '/messages/unread-count'
  );
  return response.data;
};

// PATCH /messages/conversations/:conversationId/messages/:messageId/read
export const markMessageReadState = async (
  conversationId: string,
  messageId: string,
  is_read: boolean
): Promise<MarkMessageReadResponse> => {
  const response = await axiosInstance.patch<MarkMessageReadResponse>(
    `/messages/conversations/${conversationId}/messages/${messageId}/read`,
    { is_read } satisfies MarkMessageReadRequest
  );
  return response.data;
};

// GET /resolve
export const resolvePermalink = async (
  url: string
): Promise<ResolvedResource> => {
  const response = await axiosInstance.get<ResolvedResource>('/resolve', {
    params: { url },
  });
  return response.data;
};

// GET /users/me/following/search
export const searchFollowing = async (
  q: string = '',
  limit: number = 10,
  offset: number = 0
): Promise<FollowingSearchResponse> => {
  const response = await axiosInstance.get<FollowingSearchResponse>(
    '/users/me/following/search',
    { params: { q, limit, offset } }
  );
  return response.data;
};

// GET /tracks/:trackId
export const fetchTrack = async (trackId: string): Promise<TrackResponse> => {
  const response = await axiosInstance.get<TrackResponse>(
    `/tracks/${trackId}`
  );
  return response.data;
};