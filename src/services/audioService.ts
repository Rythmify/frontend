import { usePlayerStore } from "../stores/player.store";

// Single <audio> element — shared between the sticky player, the waveform, and everything else.
// Exported so WaveSurfer (TrackWaveform) can pass it as the `media` option and share playback.
export const audio = new Audio();
(window as any).__globalAudio = audio;

let loadedAudioTrackId: string | null = null;
export let globalWaveSurfer: any = null;
export let globalWaveSurferTrackId: string | null = null;

// Cross-tab synchronization: Only one tab should play at a time.
// We use the 'storage' event which is highly reliable across all browsers.
window.addEventListener("storage", (event) => {
  if (event.key === "rythmify_playing_tab") {
    const state = usePlayerStore.getState();
    if (state.isPlaying) {
      // If we receive this event, it means another tab just started playing.
      // We should pause this tab.
      usePlayerStore.getState().pause();
    }
  }
});

function notifyOtherTabs() {
  // Update a localStorage key with a unique value to trigger 'storage' events in other tabs.
  localStorage.setItem("rythmify_playing_tab", Date.now().toString());
}

// ─── Sync Current Time to Storage (Only if playing) ──────────────────────
// This allows other tabs to "follow" the active player without constant persistence writes.
setInterval(() => {
  const state = usePlayerStore.getState();
  if (state.isPlaying) {
    // We update a lightweight key instead of the whole bulky store state
    localStorage.setItem("rythmify_sync_time", JSON.stringify({
      trackId: state.currentTrack?.id,
      time: audio.currentTime,
      ts: Date.now()
    }));
  }
}, 1000);

window.addEventListener("storage", (event) => {
  if (event.key === "rythmify_sync_time") {
    const data = JSON.parse(event.newValue || "{}");
    const state = usePlayerStore.getState();
    if (!state.isPlaying && data.trackId === state.currentTrack?.id) {
       // Only sync if the gap is large enough to be a seek or a fresh load
       if (Math.abs(state.currentTime - data.time) > 2) {
         usePlayerStore.getState().setCurrentTime(data.time);
       }
    }
  }
});

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

/**
 * setTrackLoadedLocally - signals that the audio source for a specific track
 * has already been set on the global audio element (e.g. by a WaveSurfer instance).
 * This prevents the subscriber from redundantly reloading audio.src.
 */
export function setTrackLoadedLocally(trackId: string | null) {
  loadedAudioTrackId = trackId;
}

// Wire store -> audio directly via subscribe (no React, no useEffect)
usePlayerStore.subscribe((state, prev) => {


    if (state.currentTrack && state.currentTrack.id !== loadedAudioTrackId) {
        if (globalWaveSurfer && globalWaveSurferTrackId !== state.currentTrack.id) {
          try { globalWaveSurfer.destroy(); } catch (e) {}
          globalWaveSurfer = null;
          globalWaveSurferTrackId = null;
        }

    loadedAudioTrackId = state.currentTrack.id;
    const targetTime = state.currentTime;
    const url = (state.currentTrack.audioUrl || "").trim();

        audio.pause();
        if (!audio.src || audio.src === window.location.href || !audio.src.includes(state.currentTrack.audioUrl)) {
          audio.src = state.currentTrack.audioUrl;
          audio.load();
        }

    // Seek to the preserved position once metadata is ready.
      const onLoaded = () => {
          if (targetTime > 0) {
            audio.currentTime = targetTime;
          }
          audio.removeEventListener("loadedmetadata", onLoaded);
        };

        if (audio.readyState >= 1) {
          onLoaded();
        } else {
          audio.addEventListener("loadedmetadata", onLoaded);
        }

        if (state.isPlaying) {
          notifyOtherTabs();
          audio.play().catch(() => {});
        }
        return;
      }

  if (state.isPlaying !== prev.isPlaying) {
      if (state.isPlaying) {
        notifyOtherTabs();
        if (!seekInProgress) {
          audio.play().catch(() => { });
        } else {
          setTimeout(() => audio.play().catch(() => {}), 350);
        }
      } else {
        audio.pause();
      }
    }

  // Removed the automatic same-track restart heuristic because it conflicted with WaveSurfer
  // seeks and buffering, causing tracks to spontaneously repeat or jump to 0:00.
  // Volume / mute changed
  if (state.volume !== prev.volume || state.isMuted !== prev.isMuted) {
    audio.volume = state.isMuted ? 0 : Math.max(0, Math.min(1, state.volume));
  }

  // Cross-tab time sync (significant jumps only)
  // CRITICAL: We only sync FROM the storage IF we are not the one currently playing.
  // This prevents the "Time War" where two tabs fight over the position.
  if (!state.isPlaying && state.currentTrack?.id === loadedAudioTrackId && 
      Math.abs(state.currentTime - audio.currentTime) > 2) {
     audio.currentTime = state.currentTime;
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
  if (globalWaveSurfer && globalWaveSurferTrackId === usePlayerStore.getState().currentTrack?.id) {
    globalWaveSurfer.setTime(time);
  } else {
    audio.currentTime = time;
  }
  // Don't call seekTo — it pollutes the store and causes isPlaying side effects
}

(window as any).__seekAudio = seekAudio;