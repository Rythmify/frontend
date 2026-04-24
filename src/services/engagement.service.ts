import axiosInstance from "./api/axiosInstance";
import type { TrackSummary, ListMeta } from "./api/discover.service";
import type { Playlist } from "./api/playlist/playlist.service";
import type { Track } from "@/types/track";

/**
 * Rythmify Engagement Service
 * Handles social interactions: likes and reposts for tracks and playlists.
 */

// ─── Track Engagement ─────────────────────────────────────────────────────────

/**
 * POST /tracks/{track_id}/like
 */
export async function likeTrack(trackId: string | number) {
  const { data } = await axiosInstance.post(`/tracks/${trackId}/like`);
  return data;
}

/**
 * DELETE /tracks/{track_id}/like
 */
export async function unlikeTrack(trackId: string | number) {
  const { data } = await axiosInstance.delete(`/tracks/${trackId}/like`);
  return data;
}

/**
 * POST /tracks/{track_id}/repost
 */
export async function repostTrack(trackId: string | number) {
  const { data } = await axiosInstance.post(`/tracks/${trackId}/repost`);
  return data;
}

/**
 * DELETE /tracks/{track_id}/repost
 */
export async function removeRepost(trackId: string | number) {
  const { data } = await axiosInstance.delete(`/tracks/${trackId}/repost`);
  return data;
}

// ─── Liked Content Fetching ───────────────────────────────────────────────────

/**
 * GET /me/liked-tracks — paginated list of tracks the user has liked
 */
export async function getMyLikedTracks(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: TrackSummary[]; pagination: ListMeta }> {
  const res = await axiosInstance.get<{
    data: { items: any[]; pagination: any };
  }>("/me/liked-tracks", { params });
  return {
    data: res.data.data.items,
    pagination: res.data.data.pagination,
  };
}

/**
 * GET /me/reposted-tracks — paginated list of tracks the user has reposted
 */
export async function getMyRepostedTracks(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: any[]; pagination: any }> {
  const res = await axiosInstance.get<{
    data: { items: any[]; pagination: any };
  }>("/me/reposted-tracks", { params });
  return {
    data: res.data.data.items,
    pagination: res.data.data.pagination,
  };
}

/**
 * GET /me/liked-playlists — paginated list of playlists the user has liked
 */
export async function getMyLikedPlaylistsApi(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: Playlist[]; total: number }> {
  const res = await axiosInstance.get<{
    data: { items: Playlist[]; meta: { total: number } };
    message: string;
  }>("/me/liked-playlists", { params });
  return {
    data: res.data.data.items,
    total: res.data.data.meta.total,
  };
}

// ─── Playlist Engagement ──────────────────────────────────────────────────────

/**
 * POST /playlists/{playlist_id}/like
 */
export async function likePlaylist(playlistId: string | number) {
  const { data } = await axiosInstance.post(`/playlists/${playlistId}/like`);
  return data;
}

/**
 * DELETE /playlists/{playlist_id}/like
 */
export async function unlikePlaylist(playlistId: string | number) {
  const { data } = await axiosInstance.delete(`/playlists/${playlistId}/like`);
  return data;
}

/**
 * POST /playlists/{playlist_id}/repost
 */
export async function repostPlaylist(playlistId: string | number) {
  const { data } = await axiosInstance.post(`/playlists/${playlistId}/repost`);
  return data;
}

/**
 * DELETE /playlists/{playlist_id}/repost
 */
export async function removePlaylistRepost(playlistId: string | number) {
  const { data } = await axiosInstance.delete(
    `/playlists/${playlistId}/repost`,
  );
  return data;
}

// ─── Comment Engagement ───────────────────────────────────────────────────────

/**
 * POST /comments/{comment_id}/like
 */
export async function likeComment(commentId: string | number) {
  const { data } = await axiosInstance.post(`/comments/${commentId}/like`);
  return data;
}

/**
 * DELETE /comments/{comment_id}/like
 */
export async function unlikeComment(commentId: string | number) {
  const { data } = await axiosInstance.delete(`/comments/${commentId}/like`);
  return data;
}

/**
 * DELETE /comments/{comment_id}
 */
export async function deleteComment(commentId: string | number) {
  const { data } = await axiosInstance.delete(`/comments/${commentId}`);
  return data;
}

export async function getUserRepostedTracks(
  userId: string,
  params?: { limit?: number; offset?: number },
): Promise<{ data: Track[] }> {
  const { data } = await axiosInstance.get(`/users/${userId}/reposts`, {
    params,
  });
  return data;
}
