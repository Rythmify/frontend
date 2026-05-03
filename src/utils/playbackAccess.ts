import type { Track } from "../types/track";

/**
 * Playback access for region / tier restrictions
 * -----------------------------------------------
 * - playable: full `stream_url` (or legacy `audio_url`) is available for the client.
 * - preview: only `preview_url` is available (short clip).
 * - blocked: geo-blocked, app playback disabled, or no usable audio URL.
 *
 * The backend may set `is_geo_blocked` and null out URLs; preview-only uploads
 * omit `stream_url` but keep `preview_url`. This module stays pure so it can
 * run in stores, services, and hooks without React.
 */

export type PlaybackAccessState = "playable" | "preview" | "blocked";

const REGION_RESTRICTED = "region_restricted";

/**
 * The backend sometimes returns snake_case fields (e.g. `stream_url`), while the
 * frontend `Track` type is camelCase. We accept "any track-like object" here so
 * this works with raw API payloads, normalized `Track`, and queue items.
 */
type TrackLike = Partial<Track> | (Record<string, unknown> & { [key: string]: unknown });

function readEnableAppPlayback(track: TrackLike): boolean {
  const t = track as any;
  if (t.enableAppPlayback === false) return false;
  if (t.enable_app_playback === false) return false;
  return true;
}

function readIsGeoBlocked(track: TrackLike): boolean {
  const t = track as any;
  return t.isGeoBlocked === true || t.is_geo_blocked === true;
}

function readRestrictionReason(track: TrackLike): string | null {
  const t = track as any;
  const r =
    t.playbackRestrictionReason ??
    (typeof t.playback_restriction_reason === "string"
      ? t.playback_restriction_reason
      : null);
  return r ?? null;
}

function readStreamUrl(track: TrackLike): string {
  const t = track as any;
  if (typeof t.streamUrl === "string" && t.streamUrl.trim()) {
    return t.streamUrl.trim();
  }
  if (typeof t.stream_url === "string" && t.stream_url.trim()) {
    return t.stream_url.trim();
  }
  if (typeof t.audio_url === "string" && t.audio_url.trim()) {
    return t.audio_url.trim();
  }
  return "";
}

function readPreviewUrl(track: TrackLike): string {
  const t = track as any;
  if (typeof t.previewUrl === "string" && t.previewUrl.trim()) {
    return t.previewUrl.trim();
  }
  if (typeof t.preview_url === "string" && t.preview_url.trim()) {
    return t.preview_url.trim();
  }
  return "";
}

/**
 * Determines playback access from track metadata returned by the API
 * (after normalization, camelCase fields are preferred; snake_case still works).
 */
export function getPlaybackState(
  track: TrackLike | null | undefined,
): PlaybackAccessState {
  if (!track) return "blocked";

  if (!readEnableAppPlayback(track)) return "blocked";

  if (readIsGeoBlocked(track) || readRestrictionReason(track) === REGION_RESTRICTED) {
    return "blocked";
  }

  const stream = readStreamUrl(track);
  const preview = readPreviewUrl(track);

  if (stream) return "playable";
  if (preview) return "preview";

  // Legacy queue/items that only set `audioUrl` without stream/preview split
  const legacy = String((track as any).audioUrl || "").trim();
  if (legacy) return "playable";

  return "blocked";
}

/**
 * Resolves the URL to load into the shared `<audio>` element.
 * Returns an empty string when blocked or when the expected URL is missing.
 */
export function resolvePlaybackAudioUrl(
  track: TrackLike | null | undefined,
): string {
  if (!track) return "";

  const state = getPlaybackState(track);
  const stream = readStreamUrl(track);
  const preview = readPreviewUrl(track);
  const legacy = String((track as any).audioUrl || "").trim();

  if (state === "playable") {
    return stream || legacy || "";
  }
  if (state === "preview") {
    return preview || "";
  }
  return "";
}
