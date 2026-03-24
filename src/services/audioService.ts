import { usePlayerStore } from "../stores/player.store";

// Single <audio> element — shared between the sticky player, the waveform, and everything else.
// Exported so WaveSurfer (TrackWaveform) can pass it as the `media` option and share playback.
export const audio = new Audio();
(window as any).__globalAudio = audio;

let currentLoadedId: number | null = null;
export let globalWaveSurfer: any = null;

export function setGlobalWaveSurfer(ws: any) {
  globalWaveSurfer = ws;
}

export function setTrackLoadedLocally(id: number) {
  currentLoadedId = id;
}

// Wire store -> audio directly via subscribe (no React, no useEffect)
usePlayerStore.subscribe((state, prev) => {

  // New track loaded (only proceeds if it explicitly has a NEW id)
  if (state.currentTrack && state.currentTrack.id !== currentLoadedId) {
    // Kill the old WaveSurfer instance synchronously before we change audio.src.
    // This prevents WaveSurfer from intercepting the `play` event and forcefully reverting the track.
    if (globalWaveSurfer) {
      globalWaveSurfer.destroy();
      globalWaveSurfer = null;
    }

    currentLoadedId = state.currentTrack.id;
    const targetTime = state.currentTime;

    audio.pause();
    audio.src = state.currentTrack.audioUrl;
    audio.load();

    // We can only seek the global audio element once its metadata is loaded.
    const onLoaded = () => {
      // If the user seeked the track before hitting play, adopt their selected time!
      if (targetTime > 0) {
        audio.currentTime = targetTime;
      }
      audio.removeEventListener('loadedmetadata', onLoaded);
    };
    audio.addEventListener('loadedmetadata', onLoaded);

    audio.play().catch(() => { });
    return;
  }

  // Play / pause toggled
  if (state.isPlaying !== prev.isPlaying) {
    if (state.isPlaying) {
      audio.play().catch(() => { });
    } else {
      audio.pause();
    }
  }

  // Volume or mute changed
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
 * Seek the shared audio element to `time` seconds.
 * Also updates the store immediately so the progress bar thumb
 * doesn't wait for the next `timeupdate` event to catch up.
 */
export function seekAudio(time: number) {
  audio.currentTime = time;
  usePlayerStore.getState().setCurrentTime(time);
}