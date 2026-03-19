import { useRef, useCallback } from "react";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export default function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const pct = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec) || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getTimeFromEvent = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!trackRef.current || !duration) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    onSeek(getTimeFromEvent(e));

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      onSeek(getTimeFromEvent(e));
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      onSeek(getTimeFromEvent(e));
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      data-test="player-progress-bar"
      className="flex items-center gap-3 w-full select-none"
    >
      {/* Current time */}
      <span
        data-test="player-current-time"
        className="text-[var(--color-text-muted)] text-[11px] tabular-nums shrink-0 w-8 text-right"
      >
        {formatTime(currentTime)}
      </span>

      {/* Seekable track */}
      <div
        ref={trackRef}
        data-test="player-seek-track"
        onMouseDown={handleMouseDown}
        className="flex-1 h-[3px] rounded-full cursor-pointer relative group bg-[#333]"
      >
        {/* Played — orange */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[var(--color-accent)] pointer-events-none"
          style={{ width: `${pct}%` }}
        />
        {/* Thumb — appears on hover */}
        <div
          className="
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-3 h-3 rounded-full bg-white shadow
            opacity-0 group-hover:opacity-100
            transition-opacity duration-150 pointer-events-none
          "
          style={{ left: `${pct}%` }}
        />
      </div>

      {/* Duration */}
      <span
        data-test="player-duration"
        className="text-[var(--color-text-muted)] text-[11px] tabular-nums shrink-0 w-8"
      >
        {formatTime(duration)}
      </span>
    </div>
  );
}