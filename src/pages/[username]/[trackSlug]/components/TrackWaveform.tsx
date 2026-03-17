import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import WaveSurfer from "wavesurfer.js";
import type { Track } from "../../../../types/track"; 

export interface TrackWaveformHandle {
  playPause: () => void;
}

const TrackWaveform = forwardRef<TrackWaveformHandle, { track: Track }>(
  ({ track }, ref) => {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const timeRef = useRef<HTMLDivElement | null>(null);
  const durationRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  const [isHover, setIsHover] = useState(false);

  useImperativeHandle(ref, () => ({
    playPause: () => {
      const ws = waveSurferRef.current;
      if (!ws) return;
      ws.playPause();
    },
  }));

  useEffect(() => {
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

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: gradient,
      progressColor: progressGradient,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      backend: "MediaElement",
    });

    waveSurferRef.current = ws;

    ws.load(track.audioUrl);

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

    return () => {
      ws.destroy();
    };
  }, [track.audioUrl]);

  const handlePlayPause = () => {
    const ws = waveSurferRef.current;
    if (!ws) return;
    ws.playPause();
  };

  return (
    <div>
    
      <div
        style={{
          position: "relative",
          cursor: "pointer",
          width: "100%",
        }}
        // onClick={handlePlayPause}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <div
          ref={waveformRef}
          style={{
            transform: "scaleY(-1)",
          }}
        />

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