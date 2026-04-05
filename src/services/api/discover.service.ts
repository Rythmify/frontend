import axiosInstance from "./axiosInstance";

// =============================================================================
// TYPES — API response shapes (aligned to OpenAPI spec)
// =============================================================================

export interface FeedTrack {
  id: string;
  title: string;
  artist: {
    id: string;
    display_name: string;
    avatar: string | null;
    follower_count: number;
    username?: string; // not in spec yet — ask backend to add for artist navigation
  };
  genre: string | null;
  duration: number; // seconds
  play_count: number;
  like_count: number;
  cover_url: string | null;
  stream_url: string;
  created_at: string;
}

export interface PersonalMix {
  id: string;
  label: string;
  flavor: "listening_history" | "taste_profile";
  cover_image: string | null;
  track_count: number;
  generated_at: string;
}

export interface HotForYou {
  track: FeedTrack;
  reason: string;
  valid_until: string;
}

export interface HomeStation {
  id: string;
  name: string;
  seed_artist: {
    user_id: string;
    display_name: string;
    role: "artist" | "listener" | "admin";
    is_verified: boolean;
  };
  cover_image: string | null;
  track_count: number;
}

export interface BuzzingPlaylist {
  id: string;
  title: string;
  genre: string;
  genre_id: string | null;
  cover_image: string | null;
  is_new: boolean;
  track_count: number;
}

export interface HomeData {
  mixed_for_you: PersonalMix[];
  more_of_what_you_like: PersonalMix[];
  hot_for_you: HotForYou | null;
  discover_with_stations: HomeStation[];
  artists_to_watch: BuzzingPlaylist[];
}

// Missing artist info — use getTrackById for full data.
export interface TrackSummary {
  id: string;
  title: string;
  genre: string | null;
  duration: number | null;
  user_id: string;
}

export interface RecentlyPlayedEntry {
  track: TrackSummary;
  last_played_at: string;
}

export interface ListeningHistoryEntry {
  id: string;
  track: TrackSummary;
  played_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Missing avatar, follower_count, username — use getUserById for full data.
export interface SuggestedUser {
  user_id: string;
  email: string;
  display_name: string;
  gender: "male" | "female" | null;
  role: "artist" | "listener" | "admin";
  is_verified: boolean;
}

export interface ListMeta {
  total: number;
  limit: number;
  offset: number;
}

// ApiTrack — returned by GET /tracks/{track_id}.
// Missing artist info (only user_id) — known gap until backend enriches the endpoint.
export interface ApiTrack {
  id: string;
  title: string;
  user_id: string;
  genre: string | null;
  duration: number | null;
  play_count: number;
  like_count: number;
  repost_count: number;
  comment_count: number;
  stream_url: string | null;
  cover_url: string | null;
  waveform_url: string | null;
  created_at: string;
  is_public: boolean;
}

// =============================================================================
// CONFIRMED ENDPOINTS
// =============================================================================

// GET /home — main call for the discover page
export const getHome = async (): Promise<HomeData> => {
  const res = await axiosInstance.get<{ data: HomeData; message: string }>(
    "/home",
  );
  return res.data.data;
};

/**
 * Fetches the actual tracks for a personal mix (mixed_for_you or more_of_what_you_like).
 */
export const getMixTracks = async (
  mixId: string,
  params?: { limit?: number; offset?: number },
): Promise<FeedTrack[]> => {
  const res = await axiosInstance.get<{
    data: { mix: PersonalMix; tracks: FeedTrack[] };
  }>(`/home/mixes/${mixId}/tracks`, { params });
  return res.data.data.tracks;
};

export const getRecentlyPlayed = async (): Promise<RecentlyPlayedEntry[]> => {
  const res = await axiosInstance.get<{ data: RecentlyPlayedEntry[] }>(
    "/me/history",
  );
  return res.data.data;
};

export const getTrackById = async (trackId: string): Promise<ApiTrack> => {
  const res = await axiosInstance.get<{ data: ApiTrack }>(`/tracks/${trackId}`);
  return res.data.data;
};

/**
 * Full paginated play history. Used in the sidebar listening history section.
 *
 * @param params.page  — page number, starts at 1 (default: 1)
 * @param params.limit — entries per page, max 100 (default: 20)
 */
export const getListeningHistory = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: ListeningHistoryEntry[]; pagination: Pagination }> => {
  const res = await axiosInstance.get<{
    data: ListeningHistoryEntry[];
    pagination: Pagination;
  }>("/me/listening-history", { params });
  return res.data;
};

/**
 * Returns UserSummary list (no avatar/followers/username).
 * Use getUserById from User.service for full profile data.
 *
 * @param params.limit  — number of results (default: 20)
 * @param params.offset — pagination offset (default: 0)
 */
export const getSuggestedArtists = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<{ items: SuggestedUser[]; meta: ListMeta }> => {
  const res = await axiosInstance.get<{
    data: { items: SuggestedUser[]; meta: ListMeta };
  }>("/users/suggested", { params });
  return res.data.data;
};

// =============================================================================
// STUBS — endpoints not yet implemented by backend
// =============================================================================

export const getAlbumsForYou = async (): Promise<ApiTrack[]> => {
  throw new Error("getAlbumsForYou: not yet implemented by backend");
};

export const getLikedTracks = async (): Promise<FeedTrack[]> => {
  throw new Error("getLikedTracks: not implemented — awaiting Module 6 spec");
};
