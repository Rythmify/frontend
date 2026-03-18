import axiosInstance from "../axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrackStatus = "processing" | "ready" | "failed";
export interface Track {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  tags: string[];
  duration: number | null;
  file_size: number | null;
  bitrate: number | null;
  status: TrackStatus;
  is_public: boolean;
  is_hidden: boolean;
  user_id: string;
  play_count: number;
  like_count: number;
  comment_count: number;
  repost_count: number;
  audio_url: string;
  stream_url: string | null;
  preview_url: string | null;
  waveform_url: string | null;
  created_at: string;
  updated_at: string | null;
  artists: string | null;
}

export interface TrackSummary {
  id: string;
  title: string;
  genre: string | null;
  duration: number | null;
  user_id: string;
}

export interface UploadTrackPayload {
  // Required
  audio_file: File | Blob;
  title: string;
  // Optional
  description?: string;
  genre?: string;
  tags?: string[]; // tag UUIDs from GET /tags
  is_public?: boolean;
  cover_image?: File | null;
  artists?: string; // comma-separated e.g. "Ahmed Sami, DJ Karim"
}

// ─── FormData builder ─────────────────────────────────────────────────────────

function buildTrackFormData(payload: UploadTrackPayload): FormData {
  const formData = new FormData();

  // ── Required ──────────────────────────────────────────────────────────────
  const audioFile =
    payload.audio_file instanceof File
      ? payload.audio_file
      : new File([payload.audio_file], "recorded_audio.wav", {
          type: "audio/wav",
        });

  formData.append("audio_file", audioFile);
  formData.append("title", payload.title.trim());

  // ── Optional ──────────────────────────────────────────────────────────────
  if (payload.description) formData.append("description", payload.description);
  if (payload.genre) formData.append("genre", payload.genre);
  if (payload.artists) formData.append("artists", payload.artists);
  if (payload.is_public !== undefined)
    formData.append("is_public", String(payload.is_public));
  if (payload.cover_image) formData.append("cover_image", payload.cover_image);
  if (payload.tags?.length) {
    // API expects repeated field values for arrays in multipart
    payload.tags.forEach((tagId) => formData.append("tags[]", tagId));
  }

  return formData;
}

// ─── Track API functions ──────────────────────────────────────────────────────

/** POST /tracks — upload a new audio track (multipart/form-data) */
export async function uploadTrack(payload: UploadTrackPayload) {
  const formData = buildTrackFormData(payload);

  const res = await axiosInstance.post<{
    data: Track;
    message: string;
  }>("/tracks", formData, {
    headers: {
      // Let axios/browser set Content-Type with the multipart boundary automatically
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

/** GET /tracks/me — list the authenticated user's own tracks */
export async function getMyTracks(params?: {
  page?: number;
  limit?: number;
  status?: TrackStatus;
}) {
  const res = await axiosInstance.get<{
    data: TrackSummary[];
    pagination: { page: number; limit: number; total: number };
  }>("/tracks/me", { params });

  return res.data;
}

/** GET /tracks/:id — get full track details */
export async function getTrack(trackId: string) {
  const res = await axiosInstance.get<{
    data: Track;
  }>(`/tracks/${trackId}`);

  return res.data;
}

/** PATCH /tracks/:id — update track metadata */
export async function updateTrack(
  trackId: string,
  payload: Partial<Omit<UploadTrackPayload, "audio_file">>,
) {
  const res = await axiosInstance.patch<{
    data: Track;
    message: string;
  }>(`/tracks/${trackId}`, payload);

  return res.data;
}

/** DELETE /tracks/:id — delete a track */
export async function deleteTrack(trackId: string) {
  const res = await axiosInstance.delete<{
    data: { success: boolean };
    message: string;
  }>(`/tracks/${trackId}`);

  return res.data;
}

/** PATCH /tracks/:id/visibility — toggle public/private */
export async function setTrackVisibility(trackId: string, is_public: boolean) {
  const res = await axiosInstance.patch<{
    data: { success: boolean };
    message: string;
  }>(`/tracks/${trackId}/visibility`, { is_public });

  return res.data;
}
