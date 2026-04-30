import type { Track } from "@/services/api/upload/track.service";
import { formatDuration, formatDate } from "./utils";

export function TrackRow({ track }: { track: Track }) {
  return (
    <div className="grid grid-cols-[20px_1fr_64px_110px_180px_56px_28px] gap-x-4 px-2 py-3 border-b border-[#1e1e1e] items-center hover:bg-[#1a1a1a] group transition-colors">
      <input type="checkbox" className="w-4 h-4 accent-accent cursor-pointer" />

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 shrink-0 rounded-sm bg-input-bg flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-text" fill="currentColor">
            <path d="m10 16.5 6-4.5-6-4.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-text-hover text-sm font-semibold truncate">{track.title}</span>
            {track.status === "ready" && (
              <span className="shrink-0 text-[10px] font-bold border border-[#555] text-text px-1 py-px rounded-sm leading-tight">
                HD
              </span>
            )}
          </div>
          {track.artists && (
            <span className="text-text text-xs truncate">{track.artists}</span>
          )}
        </div>
      </div>

      <span className="text-text text-sm tabular-nums">{formatDuration(track.duration)}</span>

      <span className="text-text text-sm">{formatDate(track.created_at)}</span>

      <div className="flex items-center gap-3 text-text text-xs">
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {track.like_count ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
          {track.comment_count ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
          </svg>
          {track.repost_count ?? 0}
        </span>
        <span className="flex items-center gap-1 opacity-40">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
          —
        </span>
      </div>

      <span className="text-text text-sm tabular-nums font-semibold">{track.play_count ?? 0}</span>

      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded-full text-text hover:text-text-hover hover:bg-input-bg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
        aria-label="Track options"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>
    </div>
  );
}
