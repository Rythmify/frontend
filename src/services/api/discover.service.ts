import axiosInstance from "./axiosInstance";

// =============================================================================
// TYPES — API response shapes
// =============================================================================

export interface FeedTrack {
  track_id: string;
  title: string;
  artist_id: string;
  artist_username: string;
  artist_display_name: string;
  cover_url: string;
  genre: string;
  genre_id: string;
  like_count: number;
  repost_count: number;
  play_count: number;
  comment_count: number;
  duration: number;
  uploaded_at: string;
  audio_url: string;
  waveform_data?: number[];
}

export interface PersonalMix {
  id: string;
  label: string; // e.g. "Mixed for Omar", "Based on your recent listening"
  flavor: "listening_history" | "taste_profile";
  cover_url: string | null;
  track_count: number;
  generated_at: string; // ISO date — mixes are regenerated every 24h
}

export interface HotForYou {
  track: FeedTrack;
  valid_until: string; // ISO date — cache expiry
}

export interface HomeStation {
  id: string;
  name: string;
  seed_artist: {
    id: string;
    display_name: string;
    username: string;
    avatar_url?: string;
  };
  cover_url: string | null;
  track_count: number;
}

export interface HomeData {
  mixed_for_you: PersonalMix[]; //
  more_of_what_you_like: PersonalMix[];
  hot_for_you: HotForYou | null; // why is it null?
  discover_with_stations: HomeStation[];
  artists_to_watch: SuggestedUser[];
}

// missing artist_name, cover_url, and audio_url.
export interface TrackSummary {
  id: string;
  title: string;
  genre: string | null;
  duration: number | null; // seconds, nullable if not set on the track
  user_id: string; // the artist's user ID — use to link to their profile
}

export interface RecentlyPlayedEntry {
  track: TrackSummary;
  last_played_at: string; // ISO date — when this track was last played
}

export interface ListeningHistoryEntry {
  id: string; // UUID of this specific play event
  track: TrackSummary;
  played_at: string; // ISO date — when this specific play happened
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// back returns buzzing playlist, check exact return type
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
// =============================================================================
// CONFIRMED ENDPOINTS
// =============================================================================

//GET /home, main call for discover page
export const getHome = async (): Promise<HomeData> => {
  // axiosInstance.get<T> means: "I expect the response body to have this shape"
  // The backend wraps everything in { data: ..., message: ... }
  const res = await axiosInstance.get<{ data: HomeData; message: string }>(
    "/home",
  );
  // res.data is the full response body — we only need res.data.data (the payload)
  return res.data.data;
};

//GET /me/history, Used in the "Recently played" row on the discover page.
export const getRecentlyPlayed = async (): Promise<RecentlyPlayedEntry[]> => {
  const res = await axiosInstance.get<{ data: RecentlyPlayedEntry[] }>(
    "/me/history",
  );
  return res.data.data;
};

/**
 * GET /me/listening-history
 * Used in the "Listening history" list in the discover page sidebar (/you/history).
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
 * GET /users/suggested
 * Used in the "Artists you should follow" section in the discover sidebar.
 *
 * @param params.limit  — number of results
 * @param params.offset — pagination offset
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
// STUBS — endpoints not yet confirmed
// =============================================================================

/**
 * TODO: awaiting backend confirmation
 * Will return album-style playlists recommended for the user.
 */
export const getAlbumsForYou = async (): Promise<PersonalMix[]> => {
  throw new Error(
    "getAlbumsForYou: not implemented — awaiting backend confirmation",
  );
};

/**
 * TODO: awaiting Module 6 (Engagement) spec
 * Will return the authenticated user's liked tracks.
 */
export const getLikedTracks = async (): Promise<FeedTrack[]> => {
  throw new Error("getLikedTracks: not implemented — awaiting Module 6 spec");
};
