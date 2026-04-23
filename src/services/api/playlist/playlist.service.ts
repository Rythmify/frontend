import axiosInstance from "../axiosInstance";

function isUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
}
// ─── Types ────────────────────────────────────────────────────────────────────

export type PlaylistSubtype =
  | "playlist"
  | "album"
  | "ep"
  | "single"
  | "compilation";

export interface PlaylistTag {
  id: string;
  name: string;
}

export interface Playlist {
  playlist_id: string;
  owner_user_id: string;
  name: string;
  slug?: string | null;
  description: string | null;
  is_public: boolean;
  cover_image?: string | null;
  subtype?: PlaylistSubtype;
  release_date?: string | null;
  genre_id?: string | null;
  tags?: PlaylistTag[];
  secret_token?: string | null;
  created_at: string;
  updated_at?: string | null;
  track_count: number;
  like_count: number;
  repost_count?: number;
  is_album_view?: boolean;
}

export interface PlaylistTrackItem {
  track_id: string;
  trackSlug?: string;
  position: number;
  added_at: string;
  title?: string;
  duration?: number | null;
  cover_image?: string | null;
  is_public?: boolean;
  deleted_at?: string | null;
  artist_name?: string | null;
  artist_id?: string;
  artist_username?: string | null; 
  play_count?: number;              
  audio_url?: string | null;        
}

export interface PlaylistDetails extends Playlist {
  tracks: PlaylistTrackItem[];
}

export interface CreatePlaylistPayload {
  name: string;
  description?: string;
  is_public?: boolean;
  subtype?: PlaylistSubtype;
  slug?: string;
  release_date?: string;
  genre_id?: string;
  tags?: string[]; // tag UUIDs
}

export interface UpdatePlaylistPayload {
  name?: string;
  description?: string | null;
  is_public?: boolean;
  cover_image?: File | null;
  /** Set to true to remove the existing cover image */
  remove_cover_image?: boolean;
  subtype?: PlaylistSubtype;
  slug?: string;
  release_date?: string | null;
  /** Send null to clear the existing genre */
  genre_id?: string | null;
  /** Replaces all existing playlist tags when provided */
  tags?: string[];
}

export interface PlaylistTracksPage {
  playlist_id: string;
  tracks: PlaylistTrackItem[];
  pagination: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface StationTracksResponse {
  station: {
    id: string;
    name: string;
    artist_id: string;
    artist_name: string;
    images: {
      left: string | null;
      center: string | null;
      right: string | null;
    };
    preview_track: {
      id: string;
      title: string;
      cover_image: string | null;
      duration: number | null;
      genre_name: string | null;
      play_count: number;
      like_count: number;
      repost_count: number;
      user_id: string;
      artist_name: string;
      stream_url: string | null;
      created_at: string;
    } | null;
    track_count: number;
  };
  tracks: PlaylistTrackItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function getPlaylistTotalDuration(tracks: PlaylistTrackItem[]) {
  const totalSeconds = tracks.reduce((sum, track) => {
    return sum + (track.duration ?? 0);
  }, 0);

  return formatDuration(totalSeconds);
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
  filter?: "created" | "liked";
  subtype?: PlaylistSubtype;
  is_album_view?: boolean;
}) {
  const res = await axiosInstance.get<{
    data: {
      items: Playlist[];
      meta: { limit: number; offset: number; total: number };
    };
    message: string;
  }>("/playlists", { params: { ...params, mine: true } });
  return res.data;
}

/** GET /playlists/:id — get playlist details with tracks */
export async function getPlaylist(
  playlistId: string,
  params?: { secret_token?: string; include_tracks?: boolean },
) {
  const res = await axiosInstance.get<{
    data: PlaylistDetails;
    message: string;
  }>(`/playlists/${playlistId}`, { params });
  return res.data;
}

/**
 * PATCH /playlists/:id — update playlist metadata.
 * Sends multipart/form-data as required by the API spec.
 */
export async function updatePlaylist(
  playlistId: string,
  payload: UpdatePlaylistPayload,
) {
  const formData = new FormData();
  if (payload.name !== undefined) formData.append("name", payload.name);
  if (payload.description !== undefined)
    formData.append("description", payload.description ?? "");
  if (payload.is_public !== undefined)
    formData.append("is_public", String(payload.is_public));
  if (payload.cover_image) formData.append("cover_image", payload.cover_image);
  if (payload.remove_cover_image) formData.append("remove_cover_image", "true");
  if (payload.subtype) formData.append("subtype", payload.subtype);
  if (payload.slug) formData.append("slug", payload.slug);
  if (payload.release_date !== undefined)
    formData.append("release_date", payload.release_date ?? "");
  if (payload.genre_id !== undefined)
    formData.append("genre_id", payload.genre_id ?? "");
  if (payload.tags?.length)
    payload.tags.forEach((id) => formData.append("tags[]", id));

  const res = await axiosInstance.patch<{
    data: Playlist;
    message: string;
  }>(`/playlists/${playlistId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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
  trackId: string,
  position?: number,
) {
  if (!isUUID(trackId)) {
    throw new Error("trackId must be a valid UUID");
  }

  if (!isUUID(playlistId)) {
    throw new Error("playlistId must be a valid UUID");
  }

  const res = await axiosInstance.post(`/playlists/${playlistId}/tracks`, {
    track_id: trackId,
    position,
  });

  return res.data;
}

/**
 * GET /playlists/:id/tracks — paginated track list.
 * Prefer over getPlaylist() when you only need the track list.
 */
export async function getPlaylistTracks(
  playlistId: string,
  params?: { secret_token?: string; page?: number; limit?: number },
) {
  const res = await axiosInstance.get<{
    data: PlaylistTracksPage;
    message: string;
  }>(`/playlists/${playlistId}/tracks`, { params });
  return res.data;
}

/** GET /home/stations/:artist_id/tracks ” station tracks for a given artist */
export async function getStationTracks(
  artistId: string,
): Promise<StationTracksResponse> {
  const res = await axiosInstance.get<{
    station: Omit<StationTracksResponse["station"], "name">;
    data: Array<{
      id: string;
      title: string;
      cover_image: string | null;
      duration: number | null;
      genre_name: string | null;
      play_count: number;
      like_count: number;
      repost_count: number;
      user_id: string;
      artist_name: string;
      stream_url: string | null;
      created_at: string;
    }>;
    pagination: StationTracksResponse["pagination"];
  }>(`/home/stations/${artistId}/tracks`);

  const tracks: PlaylistTrackItem[] = res.data.data.map((track, index) => ({
    track_id: track.id,
    position: index + 1,
    added_at: track.created_at,
    title: track.title,
    duration: track.duration,
    cover_image: track.cover_image,
    is_public: true,
    deleted_at: null,
    artist_name: track.artist_name,
    artist_id: track.user_id,
    play_count: track.play_count,
    audio_url: track.stream_url,
  }));

  return {
    station: {
      ...res.data.station,
      name: `${res.data.station.artist_name}'s Station`,
    },
    tracks,
    pagination: res.data.pagination,
  };
}

/** DELETE /playlists/:id/tracks/:trackId — remove a track from a playlist */
export async function removeTrackFromPlaylist(
  playlistId: string,
  trackId: string,
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
  items: { track_id: string; position: number }[],
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
  },
) {
  const res = await axiosInstance.get<{
    data: { embed_url: string; iframe_html: string };
    message: string;
  }>(`/playlists/${playlistId}/embed`, { params });
  return res.data;
}

/** GET /playlists?mine=true&filter=liked — get playlists the user has liked */
export async function getLikedPlaylists(params?: {
  limit?: number;
  offset?: number;
  q?: string;
}) {
  const res = await axiosInstance.get<{
    data: {
      items: Playlist[];
      meta: { limit: number; offset: number; total: number };
    };
    message: string;
  }>("/playlists", { params: { ...params, mine: true, filter: "liked" } });
  return res.data;
}

/** GET playlists for a given user.
 *  - Own profile → GET /playlists?mine=true (includes private)
 *  - Other user  → GET /playlists filtered by owner_user_id client-side (public only)
 */
export async function getPlaylistsByUser(
  ownerId: string,
  currentUserId: string | undefined,
  params?: { limit?: number; offset?: number; q?: string },
) {
  if (ownerId === currentUserId) {
    // Authenticated user viewing their own — includes private playlists
    const res = await axiosInstance.get<{
      data: {
        items: Playlist[];
        meta: { limit: number; offset: number; total: number };
      };
      message: string;
    }>("/playlists", {
      params: { ...params, mine: true },
    });
    return res.data;
  }

  // Viewing someone else's profile — public only, filter client-side
  const fetchLimit = (params?.limit ?? 3) * 4;
  const res = await axiosInstance.get<{
    data: {
      items: Playlist[];
      meta: { limit: number; offset: number; total: number };
    };
    message: string;
  }>("/playlists", {
    params: { ...params, limit: fetchLimit },
  });

  const filtered = res.data.data.items.filter(
    (p) => p.owner_user_id === ownerId,
  );

  return {
    ...res.data,
    data: {
      ...res.data.data,
      items: filtered.slice(0, params?.limit ?? 3),
    },
  };
}

/** GET /playlists/:id/share-link — get the private secret share URL (owner only) */
export async function getPlaylistShareLink(playlistId: string) {
  const res = await axiosInstance.get<{
    data: { playlist_id: string; secret_token: string; share_url: string };
    message: string;
  }>(`/playlists/${playlistId}/share-link`);
  return res.data;
}

/** POST /playlists/{playlist_id}/repost */
export async function repostPlaylist(playlistId: string) {
  return axiosInstance.post(`/playlists/${playlistId}/repost`);
}

/** DELETE /playlists/{playlist_id}/repost */
export async function removePlaylistRepost(playlistId: string) {
  return axiosInstance.delete(`/playlists/${playlistId}/repost`);
}
