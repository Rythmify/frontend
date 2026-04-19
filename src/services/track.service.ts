import axiosInstance from "./api/axiosInstance";
import type { Track } from "../types/track";
import type { Comment } from "../types/comment";
import { formatPostedAt } from "./Time";

/**
 * Normalizes a raw API track object into the frontend Track type.
 * The backend returns snake_case fields; this maps everything consistently.
 */
function normalizeTrack(raw: any): Track {
  if (!raw) {
    return {
      id: "",
      title: "",
      artistName: "",
      artistUsername: "",
      coverUrl: "",
      genre: "",
      likeCount: 0,
      repostCount: 0,
      playCount: 0,
      commentCount: 0,
      duration: "0:00",
      postedAt: "",
      waveformData: [],
      audioUrl: "",
      isPrivate: false,
    };
  }

  const durationRaw = raw.duration;
  let duration = "0:00";
  if (typeof durationRaw === "number") {
    const m = Math.floor(durationRaw / 60);
    const s = Math.round(durationRaw % 60);
    duration = `${m}:${s.toString().padStart(2, "0")}`;
  } else if (typeof durationRaw === "string" && durationRaw) {
    duration = durationRaw;
  }

  return {
    ...raw,
    id:              raw.id,
    title:           raw.title ?? "",
    // FIX: map all possible audio URL field names so the player always has a URL
    audioUrl:        raw.stream_url || raw.audio_url || raw.audioUrl || "",
    coverUrl:        raw.cover_image || raw.cover_url || raw.coverUrl || "",
    artistName:      raw.artist_name  || raw.user?.display_name  || raw.artistName  || "",
    artistUsername:  raw.user?.username || raw.user_id || raw.artistUsername || "",
    // FIX: format ISO timestamp into human-readable string
    postedAt:        formatPostedAt(raw.created_at || raw.postedAt || ""),
    playCount:       raw.play_count    ?? raw.playCount    ?? 0,
    likeCount:       raw.like_count    ?? raw.likeCount    ?? 0,
    repostCount:     raw.repost_count  ?? raw.repostCount  ?? 0,
    commentCount:    raw.comment_count ?? raw.commentCount ?? 0,
    genre:           raw.genre         ?? "",
    waveformData:    raw.waveformData  ?? undefined,
    isLiked:         raw.is_liked_by_me ?? raw.is_liked ?? raw.isLiked ?? false,
    isReposted:      raw.is_reposted_by_me ?? raw.is_reposted ?? raw.isReposted ?? false,
    artistId:        raw.user_id       || raw.artistId || "",
    duration,
  } as Track;
}

// ─── Public API ───────────────────────────────────────────────────────────────

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
    data: any[];
    pagination: unknown;
  }>(`/users/${userId}/tracks`, { params: { page, limit } });
  return (data.data ?? []).map(normalizeTrack);
}

/**
 * GET /tracks/me
 * Returns the authenticated user's own tracks (including private ones).
 */
export async function getMyTracks(page = 1, limit = 20): Promise<Track[]> {
  const { data } = await axiosInstance.get<{
    data: any[];
    pagination: unknown;
  }>("/tracks/me", { params: { page, limit } });
  return (data.data ?? []).map(normalizeTrack);
}

/**
 * GET /tracks/{track_id}
 * Fetches a single track by its UUID.
 */
export async function getTrackById(
  id: string,
  secretToken?: string
): Promise<Track> {
  const { data } = await axiosInstance.get<{ data: any }>(`/tracks/${id}`, {
    params: secretToken ? { secret_token: secretToken } : undefined,
  });
  return normalizeTrack(data.data);
}

/**
 * GET /tracks/{track_id}
 * The second URL segment is always a track UUID — username is ignored.
 */
export async function getTrackBySlug(
  _username: string,
  trackId: string
): Promise<Track> {
  const { data } = await axiosInstance.get<{ data: any }>(`/tracks/${trackId}`);
  return normalizeTrack(data.data);
}

/**
 * GET /tracks/{track_id}/related
 * Returns tracks related to the given track.
 */
interface RelatedTrackResponse {
  reference_track: any;
  data: any[];
  pagination: unknown;
}

export async function getRelatedTracks(
  trackId: string,
  limit = 20,
  offset = 0,
): Promise<{
  referenceTrack: Track;
  tracks: Track[];
  }> {
  const { data } = await axiosInstance.get<RelatedTrackResponse>(
    `/tracks/${trackId}/related`,
    { params: { limit, offset } },
  );

  const payload = (data as any)?.data ?? data;
  const relatedItems = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.items)
      ? payload.items
      : [];

  return {
    referenceTrack: normalizeTrack(
      payload?.reference_track ?? payload?.referenceTrack,
    ),
    tracks: relatedItems
      .map((item: any) => normalizeTrack(item))
      .filter((track: Track) => track.id !== ""),
  };
}

/**
 * GET /tracks/{track_id}/comments
 */
export async function getTrackComments(
  trackId: string,
  limit = 20,
  offset = 0
): Promise<Comment[]> {
  const { data } = await axiosInstance.get(
    `/tracks/${trackId}/comments`,
    { params: { limit, offset } }
  );
  return data?.data?.items ?? [];
}

/**
 * POST /tracks/{track_id}/comments
 */
export async function postComment(trackId: string, content: string, timestampSec: number) {
  const { data } = await axiosInstance.post(`/tracks/${trackId}/comments`, {
    content,
    track_timestamp: Math.floor(timestampSec),
  });
  return data.data; // The backend returns { status: 'success', data: { ... } }
}

export async function postReply(commentId: string, content: string) {
  const { data } = await axiosInstance.post(`/comments/${commentId}/replies`, {
    content,
  });
  return data.data;
}

export async function getReplies(commentId: string) {
  const { data } = await axiosInstance.get(`/comments/${commentId}/replies`);
  const result = data.data;
  // Handle both direct array and { items: [] } formats
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.items)) return result.items;
  return [];
}

/**
 * GET /tracks/{track_id}/waveform
 */
export async function getTrackWaveform(trackId: string): Promise<number[]> {
  try {
    const { data } = await axiosInstance.get(`/tracks/${trackId}/waveform`);
    const peaksPayload =
      data?.data?.waveform_data || data?.data?.peaks || data?.data;

    let peaksArray: number[] = [];
    if (Array.isArray(peaksPayload)) {
      peaksArray = peaksPayload;
    } else if (peaksPayload && Array.isArray(peaksPayload.data)) {
      peaksArray = peaksPayload.data;
    }

    // Normalize to [-1, 1] if raw audiowaveform 8-bit integers
    if (peaksArray.length > 0) {
      const max = Math.max(...peaksArray.map(Math.abs));
      if (max > 1.5) {
        peaksArray = peaksArray.map((p) => p / max);
      }
    }

    return peaksArray;
  } catch {
    return [];
  }
}

/**
 * POST /api/v1/tracks/{track_id}/play
 * Increments the play count for a track.
 */
export async function incrementPlayCount(trackId: string | number) {
  try {
    const { data } = await axiosInstance.post(`/tracks/${trackId}/play`);
    return data;
  } catch (err) {
    console.error("Failed to increment play count", err);
    return null;
  }
}
