import axiosInstance from "./api/axiosInstance";
import type { TrackSummary, ListMeta } from "./api/discover.service";
import type { Playlist } from "./api/playlist/playlist.service";

/**
 * Rythmify Engagement Service
 * Handles social interactions: likes and reposts for tracks and playlists.
 */

// ─── Track Engagement ─────────────────────────────────────────────────────────

export async function likeTrack(trackId: string | number) {
  const { data } = await axiosInstance.post(`/tracks/${trackId}/like`);
  return data;
}

export async function unlikeTrack(trackId: string | number) {
  const { data } = await axiosInstance.delete(`/tracks/${trackId}/like`);
  return data;
}

export async function repostTrack(trackId: string | number) {
  const { data } = await axiosInstance.post(`/tracks/${trackId}/repost`);
  return data;
}

export async function removeRepost(trackId: string | number) {
  const { data } = await axiosInstance.delete(`/tracks/${trackId}/repost`);
  return data;
}

// ─── Liked Content Fetching ───────────────────────────────────────────────────

/**
 * GET /me/liked-tracks
 * Owner only — no public equivalent exists in the API.
 */
export async function getMyLikedTracks(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: TrackSummary[]; pagination: ListMeta }> {
  const res = await axiosInstance.get<{
    data: { items: any[]; pagination: any };
  }>("/me/liked-tracks", { params });
  return {
    data: res.data.data.items ?? [],
    pagination: res.data.data.pagination ?? { limit: 0, offset: 0, total: 0 },
  };
}

/**
 * GET /me/reposted-tracks
 * Owner only — the API has no GET /users/{userId}/reposts endpoint.
 * Do not add a getUserRepostedTracks equivalent; it will 404.
 */
export async function getMyRepostedTracks(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: any[]; pagination: any }> {
  const res = await axiosInstance.get<{
    data: { items: any[]; pagination: any };
  }>("/me/reposted-tracks", { params });
  return {
    data: res.data.data.items ?? [],
    pagination: res.data.data.pagination ?? { limit: 0, offset: 0, total: 0 },
  };
}

/**
 * GET /me/liked-playlists
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
    data: res.data.data.items ?? [],
    total: res.data.data.meta?.total ?? 0,
  };
}

// ─── Album Engagement ─────────────────────────────────────────────────────────

/**
 * POST /albums/{album_id}/like
 */
export async function likeAlbum(albumId: string) {
  const { data } = await axiosInstance.post(`/albums/${albumId}/like`);
  return data;
}

/**
 * DELETE /albums/{album_id}/like
 */
export async function unlikeAlbum(albumId: string) {
  const { data } = await axiosInstance.delete(`/albums/${albumId}/like`);
  return data;
}

// ─── Playlist Engagement ──────────────────────────────────────────────────────

export async function likePlaylist(playlistId: string | number) {
  const { data } = await axiosInstance.post(`/playlists/${playlistId}/like`);
  return data;
}

export async function unlikePlaylist(playlistId: string | number) {
  const { data } = await axiosInstance.delete(`/playlists/${playlistId}/like`);
  return data;
}

export async function repostPlaylist(playlistId: string | number) {
  const { data } = await axiosInstance.post(`/playlists/${playlistId}/repost`);
  return data;
}

export async function removePlaylistRepost(playlistId: string | number) {
  const { data } = await axiosInstance.delete(
    `/playlists/${playlistId}/repost`,
  );
  return data;
}

// ─── Comment Engagement ───────────────────────────────────────────────────────

export async function likeComment(commentId: string | number) {
  const { data } = await axiosInstance.post(`/comments/${commentId}/like`);
  return data.data;
}

export async function unlikeComment(commentId: string | number) {
  const { data } = await axiosInstance.delete(`/comments/${commentId}/like`);
  return data;
}

export async function deleteComment(commentId: string | number) {
  const { data } = await axiosInstance.delete(`/comments/${commentId}`);
  return data;
}
