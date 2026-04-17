import axiosInstance from "../api/axiosInstance";

/**
 * Rythmify Engagement Service
 * Handles social interactions including likes and reposts for tracks and playlists.
 * Based on Rythmify API v2.0 Specification.
 */

// ─── Track Engagement ─────────────────────────────────────────────────────────

/** 
 * POST /tracks/{track_id}/like
 * Records a like on the specified track for the authenticated user.
 */
export async function likeTrack(trackId: string | number) {
  const { data } = await axiosInstance.post(`/tracks/${trackId}/like`);
  return data;
}

/** 
 * DELETE /tracks/{track_id}/like
 * Removes the authenticated user's like from the specified track.
 */
export async function unlikeTrack(trackId: string | number) {
  const { data } = await axiosInstance.delete(`/tracks/${trackId}/like`);
  return data;
}

/** 
 * POST /tracks/{track_id}/repost
 * Reposts the specified track to the authenticated user's profile.
 */
export async function repostTrack(trackId: string | number) {
  const { data } = await axiosInstance.post(`/tracks/${trackId}/repost`);
  return data;
}

/** 
 * DELETE /tracks/{track_id}/repost
 * Removes the authenticated user's repost of the specified track.
 */
export async function removeRepost(trackId: string | number) {
  const { data } = await axiosInstance.delete(`/tracks/${trackId}/repost`);
  return data;
}

// ─── Playlist Engagement ──────────────────────────────────────────────────────

/** 
 * POST /playlists/{playlist_id}/like
 * Records a like on the specified playlist for the authenticated user.
 */
export async function likePlaylist(playlistId: string | number) {
  const { data } = await axiosInstance.post(`/playlists/${playlistId}/like`);
  return data;
}

/** 
 * DELETE /playlists/{playlist_id}/like
 * Removes the authenticated user's like from the specified playlist.
 */
export async function unlikePlaylist(playlistId: string | number) {
  const { data } = await axiosInstance.delete(`/playlists/${playlistId}/like`);
  return data;
}

/** 
 * POST /playlists/{playlist_id}/repost
 * Reposts the specified playlist to the authenticated user's profile.
 */
export async function repostPlaylist(playlistId: string | number) {
  const { data } = await axiosInstance.post(`/playlists/${playlistId}/repost`);
  return data;
}

/** 
 * DELETE /playlists/{playlist_id}/repost
 * Removes the authenticated user's repost of the specified playlist.
 */
export async function removePlaylistRepost(playlistId: string | number) {
  const { data } = await axiosInstance.delete(`/playlists/${playlistId}/repost`);
  return data;
}
