import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import WaveSurfer from "wavesurfer.js";
import type { Track } from "../../../../types/track";
import {
  audio,
  seekAudio,
  setGlobalWaveSurfer,
} from "../../../../services/audioService";
import { getTrackWaveform } from "../../../../services/track.service";
import { usePlayerStore } from "../../../../stores/player.store";

export interface TrackWaveformHandle {
  playPause: () => void;
}

const TrackWaveform = forwardRef<
  TrackWaveformHandle,
  { track: Track; onPlayPause?: (startTime?: number) => void }
>(({ track, onPlayPause }, ref) => {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const timeRef = useRef<HTMLDivElement | null>(null);
  const durationRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const lastInteractionTimeRef = useRef<number | null>(null);

  const [isHover, setIsHover] = useState(false);

  // Expose a handle that ONLY delegates to the parent — never touches audio directly.
  // The parent (TrackHero) already calls onPlayPause which goes through the store.
  // Having this call audio.play/pause as well caused a double-trigger race condition.
  useImperativeHandle(ref, () => ({
    playPause: () => {
      // Intentionally empty — TrackHero.handlePlayPause already calls onPlayPause().
      // Do NOT call audio.play() / audio.pause() here; that fight with the store.
    },
  }));

  useEffect(() => {
    let ws: WaveSurfer | null = null;
    let isMounted = true;

    const initWaveform = async () => {
      if (!waveformRef.current) return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const gradient = ctx.createLinearGradient(0, 0, 0, 100);
      gradient.addColorStop(0, "#656666");
      gradient.addColorStop(0.7, "#656666");
      gradient.addColorStop(0.71, "#ffffff");
      gradient.addColorStop(0.72, "#ffffff");
      gradient.addColorStop(0.73, "#B1B1B1");
      gradient.addColorStop(1, "#B1B1B1");

      const progressGradient = ctx.createLinearGradient(0, 0, 0, 100);
      progressGradient.addColorStop(0, "#F6B094");
      progressGradient.addColorStop(0.7, "#F6B094");
      progressGradient.addColorStop(0.71, "#ffffff");
      progressGradient.addColorStop(0.72, "#ffffff");
      progressGradient.addColorStop(0.73, "#EB4926");
      progressGradient.addColorStop(1, "#EE772F");

      const peaks =
        Array.isArray(track.waveformData) && track.waveformData.length > 0
          ? track.waveformData
          : await getTrackWaveform(track.id);
      if (!isMounted) return;

      let parsedDur = 0;
      if (track.duration && typeof track.duration === "string") {
        const parts = track.duration.split(":");
        if (parts.length === 2) {
          parsedDur = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }
      }

      // FIX: always use MediaElement backend tied to the shared audio element.
      // Never pass `url` here — that makes WaveSurfer own a second audio source
      // which conflicts with the global player.
      ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: gradient,
        progressColor: progressGradient,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        backend: "MediaElement",
        media: audio,
        peaks: peaks.length > 0 ? [peaks] : undefined,
        duration: parsedDur > 0 ? parsedDur : undefined,
        // FIX: do NOT pass `url` — it causes WaveSurfer to load a second audio
        // context that fights the global <audio> element owned by audioService.
      });

      waveSurferRef.current = ws;

      // FIX: only register as the global waveform if this track is ALREADY the
      // active track in the player. If another track is playing (e.g. user came
      // from the feed) we must NOT steal the global reference — that would break
      // the currently-playing TrackCard waveform.
      const playerState = usePlayerStore.getState();
      if (
        !playerState.currentTrack ||
        playerState.currentTrack.id === track.id
      ) {
        setGlobalWaveSurfer(ws, track.id);
      }

      const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const sec = Math.round(seconds) % 60;
        return `${minutes}:${sec.toString().padStart(2, "0")}`;
      };

      ws.on("decode", (duration) => {
        if (durationRef.current) {
          durationRef.current.textContent = formatTime(duration);
        }
      });

      ws.on("timeupdate", (currentTime) => {
        if (timeRef.current) {
          timeRef.current.textContent = formatTime(currentTime);
        }
      });

      // FIX: on waveform click, only seek — never call ws.play() or audio.play().
      // Playback is controlled exclusively by the store → audioService pipeline.
      // WaveSurfer's built-in "interaction" event fires before our onClick, so we
      // suppress it here and let the div's onClick bubble up to onPlayPause.
      ws.on("interaction", (newTime: number) => {
        lastInteractionTimeRef.current = newTime;
        seekAudio(newTime);
      });

      ws.on("error", () => {});
    };

    initWaveform();

    return () => {
      isMounted = false;
      if (ws) {
        try {
          ws.destroy();
        } catch {
          /* ok */
        }
      }
      waveSurferRef.current = null;
    };
  }, [track.audioUrl, track.id]);

  return (
    <div data-test="track-waveform-component">
      <div
        data-test="track-waveform-interactive-area"
        style={{ position: "relative", cursor: "pointer", width: "100%" }}
        onClick={() => {
          onPlayPause?.(lastInteractionTimeRef.current ?? undefined);
          lastInteractionTimeRef.current = null;
        }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <div ref={waveformRef} style={{ transform: "scaleY(-1)" }} />

        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: "100%",
            background: "rgba(255,255,255,0.08)",
            pointerEvents: "none",
            opacity: isHover ? 0.15 : 0.5,
            transition: "opacity 0.1s ease",
            zIndex: 5,
            borderRadius: "2px",
          }}
        />

        <div
          ref={timeRef}
          data-test="track-waveform-time"
          style={{
            position: "absolute",
            left: 0,
            top: "55%",
            transform: "translateY(-50%)",
            fontSize: "11px",
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            padding: "2px",
            zIndex: 10,
          }}
        >
          0:00
        </div>

        <div
          ref={durationRef}
          data-test="track-waveform-duration"
          style={{
            position: "absolute",
            right: 0,
            top: "55%",
            transform: "translateY(-50%)",
            fontSize: "11px",
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            padding: "2px",
            zIndex: 10,
          }}
        >
          0:00
        </div>
      </div>
    </div>
  );
});

TrackWaveform.displayName = "TrackWaveform";

export default TrackWaveform;