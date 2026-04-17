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
 *
 * Supported permalink shapes (per API spec):
 *   https://rythmify.com/tracks/{id}
 *   https://rythmify.com/users/{username}
 *   https://rythmify.com/playlists/{id}
 *
 * The URL in the browser uses /{username}/{slug} so we first try resolving
 * the track-style permalink built from the slug segment, falling back to a
 * direct UUID lookup when the slug is already a valid UUID.
 */
export async function getTrackBySlug(
  _username: string,
  trackId: string
): Promise<Track> {
  const { data } = await axiosInstance.get<{ data: Track }>(`/tracks/${trackId}`);
  return data.data;
}

/**
 * No related-tracks endpoint exists in the API spec.
 * Returns an empty array so callers don't break.
 */
export async function getRelatedTracks(_trackId: string): Promise<Track[]> {
  return [];
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
  // API shape: { data: { items: Comment[], meta: ListMeta } }
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