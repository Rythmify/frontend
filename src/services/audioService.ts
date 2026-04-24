import { usePlayerStore } from "../stores/player.store";

// Single <audio> element — shared between the sticky player, the waveform, and everything else.
// Exported so WaveSurfer (TrackWaveform) can pass it as the `media` option and share playback.
export const audio = new Audio();
(window as any).__globalAudio = audio;

let loadedAudioTrackId: string | null = null;
export let globalWaveSurfer: any = null;
export let globalWaveSurferTrackId: string | null = null;

// When a direct seek is in progress (audio.currentTime set externally by WaveSurfer
// or the progress bar), we suppress the isPlaying -> audio.play() branch in the
// subscriber so the seek isn't interrupted. The flag is cleared after a short
// debounce — long enough for the browser's seek to settle, short enough to be
// invisible to the user.
let seekInProgress = false;
let seekDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function markSeekInProgress() {
  seekInProgress = true;
  if (seekDebounceTimer !== null) clearTimeout(seekDebounceTimer);
  seekDebounceTimer = setTimeout(() => {
    seekInProgress = false;
    seekDebounceTimer = null;
  }, 300);
}

export function setGlobalWaveSurfer(ws: any, trackId: string | null = null) {
  globalWaveSurfer = ws;
  globalWaveSurferTrackId = trackId;
}

// Wire store -> audio directly via subscribe (no React, no useEffect)
usePlayerStore.subscribe((state, prev) => {

  // New track 
  // Only fires when the track id genuinely changes (not a same-track seek).
  if (state.currentTrack && state.currentTrack.id !== loadedAudioTrackId) {
    // Kill the old WaveSurfer instance synchronously before we change audio.src.
    // ONLY if the global instance belongs to a different track.
    if (globalWaveSurfer && globalWaveSurferTrackId !== state.currentTrack.id) {
      globalWaveSurfer.destroy();
      globalWaveSurfer = null;
      globalWaveSurferTrackId = null;
    }

    loadedAudioTrackId = state.currentTrack.id;
    const targetTime = state.currentTime;

    audio.pause();
    audio.src = state.currentTrack.audioUrl;
    audio.load();

    // Seek to the preserved position once metadata is ready.
    const onLoaded = () => {
      if (targetTime > 0) {
        audio.currentTime = targetTime;
      }
      audio.removeEventListener("loadedmetadata", onLoaded);
    };
    audio.addEventListener("loadedmetadata", onLoaded);

    if (state.isPlaying) {
      audio.play().catch(() => { });
    }
    return;
  }

  // Play / pause toggled 
  // Guard: if a seek is in progress, skip calling audio.play() here.
  // The seek was already done directly on audio.currentTime; calling play()
  // immediately after would interrupt the browser's seek and restart the track.
  if (state.isPlaying !== prev.isPlaying) {
    if (state.isPlaying) {
      if (!seekInProgress) {
        audio.play().catch(() => { });
      }
    } else {
      audio.pause();
    }
  }

  // Volume / mute changed
  if (state.volume !== prev.volume || state.isMuted !== prev.isMuted) {
    audio.volume = state.isMuted ? 0 : Math.max(0, Math.min(1, state.volume));
  }
});

// Audio -> store (timeupdate, duration, ended)
audio.addEventListener("timeupdate", () => {
  usePlayerStore.getState().setCurrentTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  usePlayerStore.getState().setDuration(audio.duration);
});

audio.addEventListener("ended", () => {
  const state = usePlayerStore.getState();
  if (state.repeatMode === "one") {
    audio.currentTime = 0;
    audio.play().catch(() => { });
  } else {
    state.next();
  }
});

/**
 * seekAudio - seek path used by the sticky player progress bar
 * and any component that wants to seek without touching isPlaying.
 *
 * Sets audio.currentTime directly and marks a seek as in-progress so the
 * store subscriber won't fire audio.play() and interrupt the operation.
 */
export function seekAudio(time: number) {
  markSeekInProgress();
  audio.currentTime = time;
  usePlayerStore.getState().seekTo(time);
}