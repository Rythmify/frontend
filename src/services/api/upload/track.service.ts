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
  cover_image: string | null;
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
export async function uploadTrack(
  payload: UploadTrackPayload,
  onProgress?: (pct: number) => void,
) {
  const formData = buildTrackFormData(payload);

  let fakeProgress = 0;
  let interval: ReturnType<typeof setInterval> | null = null;

  if (onProgress) {
    // Crawl while waiting for server
    interval = setInterval(() => {
      fakeProgress = Math.min(fakeProgress + Math.random() * 8, 90);
      onProgress(Math.round(fakeProgress));
    }, 600);
  }

  try {
    const res = await axiosInstance.post<{
      data: Track;
      message: string;
    }>("/tracks", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (interval) clearInterval(interval);
    onProgress?.(100);

    return res.data;
  } catch (err) {
    if (interval) clearInterval(interval);
    throw err;
  }
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

/** PATCH /tracks/:id — update track metadata (JSON, no files) */
export async function updateTrack(
  trackId: string,
  payload: Partial<Omit<UploadTrackPayload, "audio_file" | "cover_image">>,
) {
  const res = await axiosInstance.patch<{
    data: Track;
    message: string;
  }>(`/tracks/${trackId}`, payload);

  return res.data;
}

/** PATCH /tracks/:id/cover — replace cover artwork (multipart/form-data) */
export async function updateTrackCover(trackId: string, coverFile: File) {
  const formData = new FormData();
  formData.append("cover_image", coverFile);

  const res = await axiosInstance.patch<{
    data: Track;
    message: string;
  }>(`/tracks/${trackId}/cover`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

/** PATCH /tracks/:id/audio — replace the audio file and re-queue processing (multipart/form-data) */
export async function replaceTrackAudio(
  trackId: string,
  audioFile: File,
  onProgress?: (pct: number) => void,
) {
  const formData = new FormData();
  formData.append("audio_file", audioFile);

  let fakeProgress = 0;
  let interval: ReturnType<typeof setInterval> | null = null;
  if (onProgress) {
    interval = setInterval(() => {
      fakeProgress = Math.min(fakeProgress + Math.random() * 8, 90);
      onProgress(Math.round(fakeProgress));
    }, 500);
  }

  try {
    const res = await axiosInstance.patch<{
      data: { track_id: string; status: string; audio_url: string };
      message: string;
    }>(`/tracks/${trackId}/audio`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (interval) clearInterval(interval);
    onProgress?.(100);
    return res.data;
  } catch (err) {
    if (interval) clearInterval(interval);
    throw err;
  }
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

// ─── Genre API ────────────────────────────────────────────────────────────────

export interface GenreOption {
  id: string;
  name: string;
}

/** GET /genres — fetch all available genres. */
export async function getGenres(): Promise<GenreOption[]> {
  try {
    const res = await axiosInstance.get<{
      data: { id: string; name: string }[];
    }>("/genres");

    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (error) {
    console.error("Backend error fetching genres:", error);
    return [];
  }
}
