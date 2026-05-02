import { useMemo } from "react";
import type { Track } from "../types/track";
import {
  getPlaybackState,
  resolvePlaybackAudioUrl,
  type PlaybackAccessState,
} from "../utils/playbackAccess";

export type { PlaybackAccessState };

/**
 * React hook for playback access on a single track.
 * Prefer this in components; use `getPlaybackState` / `resolvePlaybackAudioUrl`
 * in non-React code (stores, services).
 */
export function usePlaybackAccess(track: Track | null | undefined) {
  return useMemo(() => {
    // The access utilities accept raw API (snake_case) and normalized Track objects.
    // We cast here to avoid requiring an index signature on the `Track` interface.
    const trackLike = track as unknown;
    const state = getPlaybackState(trackLike as any);
    const effectiveAudioUrl = resolvePlaybackAudioUrl(trackLike as any);
    return {
      state,
      effectiveAudioUrl,
      isPlayable: state === "playable",
      isPreview: state === "preview",
      isBlocked: state === "blocked",
    };
  }, [track]);
}

export { getPlaybackState, resolvePlaybackAudioUrl } from "../utils/playbackAccess";
