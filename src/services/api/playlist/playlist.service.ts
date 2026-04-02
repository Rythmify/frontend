import axiosInstance from "../axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Playlist {
  playlist_id: string;
  owner_user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  track_count: number;
  like_count: number;
}

export interface PlaylistTrackItem {
  track_id: string;
  position: number;
  added_at: string;
}

export interface PlaylistDetails extends Playlist {
  tracks: PlaylistTrackItem[];
}

export interface CreatePlaylistPayload {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface UpdatePlaylistPayload {
  name?: string;
  description?: string;
  is_public?: boolean;
}

// ─── Playlist API functions ───────────────────────────────────────────────────

/** POST /playlists — create a new playlist */
export async function createPlaylist(payload: CreatePlaylistPayload) {
  const res = await axiosInstance.post<{
    data: Playlist;
    message: string;
  }>("/playlists", payload);

  return res.data;
}

/** GET /playlists?mine=true — get authenticated user's own playlists */
export async function getMyPlaylists(params?: {
  limit?: number;
  offset?: number;
  q?: string;
}) {
  const res = await axiosInstance.get<{
    data: { items: Playlist[]; meta: { limit: number; offset: number; total: number } };
    message: string;
  }>("/playlists", { params: { ...params, mine: true } });

  return res.data;
}

/** GET /playlists/:id — get playlist details with tracks */
export async function getPlaylist(
  playlistId: string,
  params?: { secret_token?: string; include_tracks?: boolean }
) {
  const res = await axiosInstance.get<{
    data: PlaylistDetails;
    message: string;
  }>(`/playlists/${playlistId}`, { params });

  return res.data;
}

/** PATCH /playlists/:id — update playlist metadata */
export async function updatePlaylist(
  playlistId: string,
  payload: UpdatePlaylistPayload
) {
  const res = await axiosInstance.patch<{
    data: Playlist;
    message: string;
  }>(`/playlists/${playlistId}`, payload);

  return res.data;
}

/** DELETE /playlists/:id — delete a playlist */
export async function deletePlaylist(playlistId: string) {
  const res = await axiosInstance.delete<{
    data: { success: boolean };
    message: string;
  }>(`/playlists/${playlistId}`);

  return res.data;
}

/** POST /playlists/:id/tracks — add a track to a playlist */
export async function addTrackToPlaylist(
  playlistId: string,
  trackId: string | number,
  position?: number
) {
  const res = await axiosInstance.post<{
    data: PlaylistDetails;
    message: string;
  }>(`/playlists/${playlistId}/tracks`, { track_id: trackId, position });

  return res.data;
}

/** DELETE /playlists/:id/tracks/:trackId — remove a track from a playlist */
export async function removeTrackFromPlaylist(
  playlistId: string,
  trackId: string
) {
  const res = await axiosInstance.delete<{
    data: PlaylistDetails;
    message: string;
  }>(`/playlists/${playlistId}/tracks/${trackId}`);

  return res.data;
}

/** PATCH /playlists/:id/tracks/reorder — reorder tracks in a playlist */
export async function reorderPlaylistTracks(
  playlistId: string,
  items: { track_id: string; position: number }[]
) {
  const res = await axiosInstance.patch<{
    data: PlaylistDetails;
    message: string;
  }>(`/playlists/${playlistId}/tracks/reorder`, { items });

  return res.data;
}

/** GET /playlists/:id/embed — get embed code for a playlist */
export async function getPlaylistEmbed(
  playlistId: string,
  params?: {
    secret_token?: string;
    theme?: "light" | "dark";
    autoplay?: boolean;
    width?: number;
    height?: number;
  }
) {
  const res = await axiosInstance.get<{
    data: { embed_url: string; iframe_html: string };
    message: string;
  }>(`/playlists/${playlistId}/embed`, { params });

  return res.data;
}