import axiosInstance from "./api/axiosInstance";

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
    `/playlists/${playlistId}/repost`
  );
  return data;
}