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
 * Owner only endpoint for the authenticated user's reposted tracks.
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
 * GET /users/{user_id}/reposted-tracks
 * Public profile endpoint used to show reposts on another user's page.
 */
export async function getUserRepostedTracks(
  userId: string,
  params?: { limit?: number; offset?: number },
): Promise<{ data: any[]; pagination: any }> {
  const res = await axiosInstance.get<{
    data: any[] | { items: any[]; pagination?: any; meta?: any };
    pagination?: any;
  }>(`/users/${userId}/reposted-tracks`, { params });

  const raw = res.data.data;
  const pagination = res.data.pagination;

  if (Array.isArray(raw)) {
    return {
      data: raw,
      pagination: pagination ?? { limit: 0, offset: 0, total: raw.length },
    };
  }

  return {
    data: raw.items ?? [],
    pagination:
      raw.pagination ??
      raw.meta ??
      pagination ??
      { limit: 0, offset: 0, total: raw.items?.length ?? 0 },
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

// ─── Mix Engagement ───────────────────────────────────────────────────────────

export async function likeMix(mixId: string) {
  const { data } = await axiosInstance.post(`/home/mixes/${mixId}/like`);
  return data;
}

export async function unlikeMix(mixId: string) {
  const { data } = await axiosInstance.delete(`/home/mixes/${mixId}/like`);
  return data;
}

// ─── Genre Trending Engagement ────────────────────────────────────────────────

export async function likeGenreTrending(genreId: string) {
  const { data } = await axiosInstance.post(`/genres/${genreId}/like`);
  return data;
}

export async function unlikeGenreTrending(genreId: string) {
  const { data } = await axiosInstance.delete(`/genres/${genreId}/like`);
  return data;
}

// ─── Station Engagement ───────────────────────────────────────────────────────

export async function likeStation(artistId: string) {
  const { data } = await axiosInstance.post(`/stations/${artistId}/like`);
  return data;
}

export async function unlikeStation(artistId: string) {
  const { data } = await axiosInstance.delete(`/stations/${artistId}/like`);
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
