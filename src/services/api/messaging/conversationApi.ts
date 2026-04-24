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
  avatar: string | null;
  cover_photo: string;
  is_private: boolean;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  created_at: string;
}

export interface UserSearchResult {
  id: string;
  username: string;
  display_name: string;
  profile_picture: string | null;
  score: number;
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

// ─── Track Type ───────────────────────────────────────────────────────────────
// Full shape returned by GET /tracks/:id — every field the API sends back.
// Fields used by TrackCard are annotated with what they map to.

export interface Track {
  // Core identity
  id: string;
  title: string;                    // → track.title
  description: string | null;
  genre: string | null;             // → track.genre

  // Ownership
  user_id: string;                  // → track.artistId
  artist_name: string | null;       // → track.artistName
  artist_username?: string | null;   // → track.artistUsername  (add to your API if missing)

  // Media
  stream_url: string | null;        // → track.audioUrl
  preview_url: string | null;
  cover_image: string | null;       // → track.coverUrl
  waveform_url: string | null;

  // Playback metadata
  duration: number | null;          // seconds  → formatted as "m:ss" for track.duration
  bitrate?: number | null;
  artists: string | null;           // comma-separated collaborators

  // Engagement
  play_count: number;               // → track.playCount
  like_count: number;               // → track.likeCount
  repost_count: number;             // → track.repostCount  (add to your API if missing)
  comment_count: number;            // → shown in TrackCard comments button

  // State flags
  status: string;
  is_public: boolean;
  is_hidden: boolean;
  is_liked?: boolean;                // → track.isLiked     (add to your API if missing)
  is_reposted?: boolean;             // → track.isReposted  (add to your API if missing)

  // Routing
  slug?: string | null;              // → track.trackSlug

  // Timestamps
  created_at: string;               // → track.postedAt (formatted by adapter)
  updated_at: string;
}

export interface TrackResponse {
  success: boolean;
  data: Track;
}

// ─── Playlist Track ───────────────────────────────────────────────────────────
// Tracks nested inside a playlist response are the same shape.

export type PlaylistTrack = Track;

// ─── Playlist Type ────────────────────────────────────────────────────────────
// Full shape returned by GET /playlists/:id?include_tracks=true

export interface Playlist {
  // Core identity
  playlist_id: string;              // → playlist.id
  name: string;                     // → playlist.title
  slug: string | null;              // → playlist.playlistSlug
  description: string | null;       // → playlist.description

  // Ownership
  owner_user_id: string;
  creator_name?: string | null;      // → playlist.creatorName  (add to your API if missing)
  creator_username?: string | null;  // → playlist.creatorUsername

  // Media
  cover_image: string | null;       // → playlist.coverUrl

  // Tracks
  track_count: number;              // → playlist.trackCount
  tracks: PlaylistTrack[];          // → playlist.tracks  (populated when include_tracks=true)

  // Engagement
  like_count: number;               // → playlist.likeCount
  repost_count: number;             // → playlist.repostCount

  // State flags
  is_public: boolean;
  is_private?: boolean;              // → playlist.isPrivate  (inverse of is_public)

  // Timestamps
  created_at: string;               // → playlist.postedAt
  updated_at: string;
}

export interface PlaylistResponse {
  success: boolean;
  data: Playlist;
}

// ─── Global Search Types ──────────────────────────────────────────────────────

export interface TrackSearchResult {
  id: string;
  title: string;
  score: number;
}

export interface PlaylistSearchResult {
  id: string;
  title: string;
  score: number;
}

export interface GlobalSearchResponse {
  data: {
    tracks: TrackSearchResult[];
    users: UserSearchResult[];
    playlists: PlaylistSearchResult[];
  };
  pagination: Pagination;
}

// ─── Block Types ──────────────────────────────────────────────────────────────

export interface BlockData {
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface BlockCreatedResponse {
  data: BlockData;
  message: string;
}

export interface BlockAlreadyExistsResponse {
  message: string;
}

// ─── Report Types ─────────────────────────────────────────────────────────────

export type ReportResourceType = 'track' | 'user';
export type ReportReason = 'copyright' | 'inappropriate' | 'spam' | 'impersonation';

export interface ReportRequest {
  resource_type: ReportResourceType;
  resource_id: string;
  reason: ReportReason;
  description?: string;
}

export interface Report {
  id: string;
  resource_type: ReportResourceType;
  resource_id: string;
  reason: ReportReason;
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface ReportCreatedResponse {
  data: Report;
  message: string;
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
  const response = await axiosInstance.post<
    ConversationCreatedResponse | MessageCreatedResponse
  >('/messages/new', payload);
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

// GET /tracks/:trackId  — full track including all engagement + routing fields
export const fetchTrack = async (trackId: string): Promise<TrackResponse> => {
  const response = await axiosInstance.get<TrackResponse>(
    `/tracks/${trackId}`
  );
  return response.data;
};

// GET /playlists/:playlistId  — full playlist, always requests tracks
export const fetchPlaylist = async (
  playlistId: string,
  options?: { secret_token?: string }
): Promise<PlaylistResponse> => {
  const response = await axiosInstance.get<PlaylistResponse>(
    `/playlists/${playlistId}`,
    // include_tracks=true so the tracks[] array is always populated
    { params: { include_tracks: true, ...options } }
  );
  return response.data;
};

// GET /search
export const globalSearch = async (
  q: string,
  options?: {
    type?: 'tracks' | 'users' | 'playlists';
    sort?: 'relevance' | 'newest' | 'plays';
    page?: number;
    limit?: number;
  }
): Promise<GlobalSearchResponse> => {
  const response = await axiosInstance.get<GlobalSearchResponse>('/search', {
    params: { q, ...options },
  });
  return response.data;
};

// POST /users/:userId/block
export const blockUser = async (
  userId: string
): Promise<BlockCreatedResponse | BlockAlreadyExistsResponse> => {
  const response = await axiosInstance.post<
    BlockCreatedResponse | BlockAlreadyExistsResponse
  >(`/users/${userId}/block`);
  return response.data;
};

// DELETE /users/:userId/block
export const unblockUser = async (userId: string): Promise<void> => {
  await axiosInstance.delete(`/users/${userId}/block`);
};

// POST /reports
export const submitReport = async (
  payload: ReportRequest
): Promise<ReportCreatedResponse> => {
  const response = await axiosInstance.post<ReportCreatedResponse>(
    '/reports',
    payload
  );
  return response.data;
};

// ─── My Tracks ────────────────────────────────────────────────────────────────

export type TrackStatus = 'public' | 'private' | 'draft';

export interface MyTrack {
  id: string;
  title: string;
  genre: string;
  duration: number;
  cover_image: string | null;
  user_id: string;
  artist_name: string;
  play_count: number;
  like_count: number;
  stream_url: string;
}

export interface MyTracksPagination {
  limit: number;
  offset: number;
  total: number;
}

export interface MyTracksResponse {
  data: MyTrack[];
  pagination: MyTracksPagination;
  message: string;
}

export const fetchMyTracks = async (
  limit: number = 20,
  offset: number = 0,
  status?: TrackStatus
): Promise<MyTracksResponse> => {
  const response = await axiosInstance.get<MyTracksResponse>('/tracks/me', {
    params: { limit, offset, ...(status ? { status } : {}) },
    headers: { 'Cache-Control': 'no-cache' },
  });
  return response.data;
};

// ─── Repost Types ─────────────────────────────────────────────────────────────

export interface RepostedTrack {
  id: string;
  title: string;
  genre: string;
  duration: number;
  cover_image: string | null;
  user_id: string;
  artist_name: string;
  play_count: number;
  like_count: number;
  stream_url: string;
}

export interface RepostedPlaylist {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  user_id: string;
  track_count: number;
}

export interface RepostPagination {
  limit: number;
  offset: number;
  total: number;
}

export interface RepostedTracksResponse {
  data: RepostedTrack[];
  pagination: RepostPagination;
  message: string;
}

export interface RepostedPlaylistsResponse {
  data: RepostedPlaylist[];
  pagination: RepostPagination;
  message: string;
}

// GET /me/reposted-tracks
export const fetchMyRepostedTracks = async (
  limit: number = 20,
  offset: number = 0
): Promise<RepostedTracksResponse> => {
  const response = await axiosInstance.get<RepostedTracksResponse>(
    '/me/reposted-tracks',
    {
      params: { limit, offset },
      headers: { 'Cache-Control': 'no-cache' },
    }
  );
  return response.data;
};

// GET /me/reposted-playlists
export const fetchMyRepostedPlaylists = async (
  limit: number = 20,
  offset: number = 0
): Promise<RepostedPlaylistsResponse> => {
  const response = await axiosInstance.get<RepostedPlaylistsResponse>(
    '/me/reposted-playlists',
    {
      params: { limit, offset },
      headers: { 'Cache-Control': 'no-cache' },
    }
  );
  return response.data;
};

// GET /me/reposted-albums
export const fetchMyRepostedAlbums = async (
  limit: number = 20,
  offset: number = 0
): Promise<RepostedPlaylistsResponse> => {
  const response = await axiosInstance.get<RepostedPlaylistsResponse>(
    '/me/reposted-albums',
    {
      params: { limit, offset },
      headers: { 'Cache-Control': 'no-cache' },
    }
  );
  return response.data;
};