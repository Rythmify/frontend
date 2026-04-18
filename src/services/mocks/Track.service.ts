import axiosInstance from "../api/axiosInstance";
import type { Track } from "../../types/track";

/**
 * GET /users/{user_id}/tracks
 * Returns paginated public tracks for a specific user.
 */
export async function getUserTracks(
  userId: string,
  page = 1,
  limit = 20
): Promise<Track[]> {
  const { data } = await axiosInstance.get<{
    data: Track[];
    pagination: unknown;
  }>(`/users/${userId}/tracks`, { params: { page, limit } });
  return data.data;
}

/**
 * GET /tracks/me
 * Returns the authenticated user's own tracks (including private ones).
 */
export async function getMyTracks(page = 1, limit = 20): Promise<Track[]> {
  const { data } = await axiosInstance.get<{
    data: Track[];
    pagination: unknown;
  }>("/tracks/me", { params: { page, limit } });
  return data.data;
}

/**
 * GET /tracks/{track_id}
 * Fetches a single track by its UUID.
 * For private tracks pass secretToken to gain access.
 */
export async function getTrackById(
  id: string,
  secretToken?: string
): Promise<Track> {
  const { data } = await axiosInstance.get<{ data: Track }>(`/tracks/${id}`, {
    params: secretToken ? { secret_token: secretToken } : undefined,
  });
  return data.data;
}

/**
 * GET /resolve?url=<permalink>
 * Resolves a Rythmify permalink to its resource type + UUID, then fetches the track.
 */
export async function getTrackBySlug(
  _username: string,
  trackId: string
): Promise<Track> {
  const { data } = await axiosInstance.get<{ data: Track }>(`/tracks/${trackId}`);
  return data.data;
}

/**
 * GET /tracks/{track_id}/related
 * Returns tracks related to the given track.
 */
interface RelatedTrackItem {
  id: string;
  title: string;
  cover_image: string;
  duration: number;
  genre_name: string;
  play_count: number;
  like_count: number;
  repost_count: number;
  user_id: string;
  artist_name: string;
  stream_url: string;
  created_at: string;
}

interface RelatedTracksResponse {
  reference_track: RelatedTrackItem;
  data: RelatedTrackItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export async function getRelatedTracks(trackId: string): Promise<{
  referenceTrack: Track;
  tracks: Track[];
}> {
  const response = await axiosInstance.get<RelatedTracksResponse>(
    `/tracks/${trackId}/related`,
  );

  // The API returns { reference_track, data: [...], pagination }
  // axiosInstance wraps this in response.data
  const payload = response.data;

  const mapItem = (item: RelatedTrackItem): Track => ({
    id: item.id,
    title: item.title,
    coverUrl: item.cover_image ?? "",
    duration: item.duration
      ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, "0")}`
      : "0:00",
    genre: item.genre_name ?? "",
    playCount: item.play_count ?? 0,
    likeCount: item.like_count ?? 0,
    repostCount: item.repost_count ?? 0,
    commentCount: 0,
    artistName: item.artist_name ?? "",
    artistUsername: item.user_id ?? "",
    audioUrl: item.stream_url ?? "",
    postedAt: item.created_at ?? "",
    waveformData: [],
    isPrivate: false,
  });

  return {
    referenceTrack: mapItem(payload.reference_track),
    tracks: Array.isArray(payload.data) ? payload.data.map(mapItem) : [],
  };
}


/**
 * GET /tracks/{track_id}/comments
 * Returns top-level comments for a track.
 */
export async function getTrackComments(
  trackId: string,
  limit = 20,
  offset = 0
) {
  const { data } = await axiosInstance.get(
    `/tracks/${trackId}/comments`,
    { params: { limit, offset } }
  );
  return data?.data?.items ?? [];
}

/**
 * POST /tracks/{track_id}/comments
 * Posts a timestamped comment on a track.
 */
export async function postComment(
  trackId: string,
  text: string,
  timestamp: number
) {
  const { data } = await axiosInstance.post(`/tracks/${trackId}/comments`, {
    content: text,
    track_timestamp: Math.floor(timestamp),
  });
  return data;
}

/**
 * POST /tracks/{track_id}/repost
 * Reposts a track on the authenticated user's profile.
 */
export async function repostTrack(trackId: string): Promise<void> {
  await axiosInstance.post(`/tracks/${trackId}/repost`);
}