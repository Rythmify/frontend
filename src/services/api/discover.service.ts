import axiosInstance from "./axiosInstance";

// =============================================================================
// TYPES — API response shapes (aligned to OpenAPI spec)
// =============================================================================

export interface DiscoveryTrack {
  id: string;
  title: string;
  cover_image: string | null;
  duration: number | null;
  genre_name: string | null;
  play_count: number;
  like_count: number;
  repost_count: number | null;
  user_id: string;
  artist_name: string | null; // flat string now, not a nested object
  stream_url: string | null;
  created_at: string;
}

export interface PersonalMix {
  id: string;
  label: string | null;
  flavor: "listening_history"; // taste_profile was removed from spec
  genre_name: string | null;
  cover_image: string | null;
  track_count: number;
  generated_at: string;
  preview_track: DiscoveryTrack | null; // new — one track embedded inside each mix
}

export interface CuratedMixSummary {
  id: string;
  label: string;
  description: string;
  track_count: number;
  refreshes_at: string;
  preview_track: DiscoveryTrack | null;
}

export interface DiscoveryStation {
  id: string;
  name: string;
  artist_id: string;
  artist_name: string;
  cover_image: string | null;
  track_count: number;
  follower_count: number;
}

export interface EmergingArtist {
  id: string;
  display_name: string;
  profile_picture: string | null;
  top_genre: string | null;
  play_velocity: number;
  track_count: number;
}

export interface HomeData {
  more_of_what_you_like: {
    tracks: DiscoveryTrack[];
    source: "personalized" | "trending_fallback";
  } | null;
  trending_by_genre: {
    genres: { genre_id: string; genre_name: string }[];
    initial_tab: {
      genre_id: string;
      genre_name: string;
      tracks: DiscoveryTrack[];
    };
  };

  mixed_for_you: PersonalMix[];

  made_for_you: {
    daily_mix: CuratedMixSummary;
    weekly_mix: CuratedMixSummary;
  } | null; // null for guests

  discover_with_stations: DiscoveryStation[];

  artists_to_watch: EmergingArtist[];
}

// Missing artist name — user_id only. needs getUserById()
export interface TrackSummary {
  id: string;
  title: string;
  genre: string | null;
  duration: number | null;
  cover_image: string | null;
  user_id: string;
  play_count: number;
  like_count: number;
  stream_url: string | null;
}

// GET /me/history
export interface RecentlyPlayedEntry {
  track: TrackSummary;
  last_played_at: string;
}

// GET /me/listening-history
export interface ListeningHistoryEntry {
  id: string;
  track: TrackSummary;
  played_at: string;
}

export interface ListMeta {
  total: number;
  limit: number;
  offset: number;
}

// GET /users/suggested
export interface SuggestedUser {
  id: string;
  display_name: string;
  username: string | null;
  profile_picture: string | null;
  is_verified: boolean;
  follower_count: number;
  mutual_count: number | null;
  suggestion_source: "mutual" | "popular";
  is_following: boolean;
}

// GET /users/suggested/artists
export interface SuggestedArtist {
  id: string;
  display_name: string;
  username: string | null;
  profile_picture: string | null;
  is_verified: boolean;
  follower_count: number;
  top_genre: string | null;
  is_following: boolean;
}

// GET /home/albums-for-you
export interface DiscoveryAlbum {
  id: string;
  name: string;
  cover_image: string | null;
  owner_id: string;
  owner_name: string;
  track_count: number;
  like_count: number;
  created_at?: string;
}

// =============================================================================
// API CALLS
// =============================================================================

// GET /home — main call for the discover page
export const getHome = async (): Promise<HomeData> => {
  const res = await axiosInstance.get<{ data: HomeData; message: string }>(
    "/home",
  );
  // res.data is the full response body — we only need res.data.data (the payload)
  return res.data.data;
};

// GET /me/history
export const getRecentlyPlayed = async (): Promise<RecentlyPlayedEntry[]> => {
  const res = await axiosInstance.get<{ data: RecentlyPlayedEntry[] }>(
    "/me/history",
  );
  return res.data.data;
};

// GET /me/listening-history
export const getListeningHistory = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: ListeningHistoryEntry[]; pagination: ListMeta }> => {
  const res = await axiosInstance.get<{
    data: ListeningHistoryEntry[];
    pagination: ListMeta;
  }>("/me/listening-history", { params });
  return res.data;
};

// New crew suggested for you, GET /users/suggested/artists
export const getSuggestedUsers = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: SuggestedUser[]; pagination: ListMeta }> => {
  const res = await axiosInstance.get<{
    data: SuggestedUser[];
    pagination: ListMeta;
  }>("/users/suggested", { params });
  return res.data;
};

// Artist you should follow (sidebar), GET /users/suggested/artists
export const getSuggestedArtists = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: SuggestedArtist[]; pagination: ListMeta }> => {
  const res = await axiosInstance.get<{
    data: SuggestedArtist[];
    pagination: ListMeta;
  }>("/users/suggested/artists", { params });
  return res.data;
};

// GET /home/albums-for-you
export const getAlbumsForYou = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<{
  data: DiscoveryAlbum[];
  source: "followed_artists" | "global_fallback";
  pagination: ListMeta;
}> => {
  const res = await axiosInstance.get<{
    data: DiscoveryAlbum[];
    source: "followed_artists" | "global_fallback";
    pagination: ListMeta;
  }>("/home/albums-for-you", { params });
  return res.data;
};

// GET /home/mixes/:mixId/tracks — tracks for a personal mix
export const getMixTracks = async (
  mixId: string,
): Promise<{ mix: PersonalMix; tracks: DiscoveryTrack[] }> => {
  const res = await axiosInstance.get<{
    data: { mix: PersonalMix; tracks: DiscoveryTrack[] };
  }>(`/home/mixes/${mixId}/tracks`);
  return res.data.data;
};

// to do
// get liked tracks
// GET /home/trending-by-genre/{genre_id}
export const getTrendingByGenre = async (
  genreId: string,
  params?: { limit?: number; offset?: number }
): Promise<{ genre_id: string; genre_name: string; tracks: DiscoveryTrack[] }> => {
  const res = await axiosInstance.get<{
    data: { genre_id: string; genre_name: string; tracks: DiscoveryTrack[] };
    message: string;
  }>(`/home/trending-by-genre/${genreId}`, { params });
  return res.data.data;
};
