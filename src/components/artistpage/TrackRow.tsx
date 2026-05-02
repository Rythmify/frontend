import { useState, useRef, useEffect } from "react";
import CoverImage from "@/components/UI/CoverImage";
import type { Track } from "@/services/api/upload/track.service";
import { formatDuration, formatDate } from "./utils";

interface Props {
  track: Track;
  selected: boolean;
  onToggle: (id: string) => void;
  onEdit: () => void;
  onAddToPlaylist: () => void;
  onDelete: () => void;
}

export function TrackRow({ track, selected, onToggle, onEdit, onAddToPlaylist, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div
      className={`grid grid-cols-[20px_3fr_1fr_1fr_2fr_1fr_28px] gap-x-2 px-2 py-4 border-b border-[#1e1e1e] items-center hover:bg-[#1a1a1a] group transition-colors ${selected ? "bg-[#1a1a1a]" : ""}`}
      data-test={`track-row-${track.id}`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(track.id)}
        className="w-4 h-4 accent-accent cursor-pointer ring-white rounded-sm"
        data-test={`track-checkbox-${track.id}`}
      />

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-14 h-14 shrink-0 rounded-sm overflow-hidden">
          <CoverImage src={track.cover_image} alt={track.title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-text-hover text-sm font-semibold truncate">{track.title}</span>
            {track.status === "ready" && (
              <span className="shrink-0 text-[10px] font-bold border border-[#555] text-text-hover px-1 py-px rounded-sm leading-tight">
                HD
              </span>
            )}
          </div>
          {track.artists && (
            <span className="text-text-hover text-xs truncate opacity-60">{track.artists}</span>
          )}
        </div>
      </div>

      <span className="text-text-hover text-sm tabular-nums">{formatDuration(track.duration)}</span>
      <span className="text-text-hover text-sm">{formatDate(track.created_at)}</span>

      <div className="flex items-center gap-3 text-text-hover text-xs">
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {track.like_count ?? "-"}
        </span>
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
          {track.comment_count ?? "-"}
        </span>
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
          </svg>
          {track.repost_count ?? "-"}
        </span>
        <span className="flex items-center gap-1 opacity-40">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
          -
        </span>
      </div>

      <span className="text-text-hover text-sm tabular-nums font-semibold">{track.play_count ?? 0}</span>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-text-hover hover:bg-input-bg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
          aria-label="Track options"
          data-test={`track-options-btn-${track.id}`}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 z-50 w-48 bg-[#212121] rounded-lg shadow-xl border border-[#333] overflow-hidden">
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onEdit(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-hover hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              data-test={`track-edit-btn-${track.id}`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
              Edit track
            </button>
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onAddToPlaylist(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-hover hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              data-test={`track-add-to-playlist-btn-${track.id}`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
                <path d="M14 10H3v2h11v-2zm0-4H3v2h11V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM3 16h7v-2H3v2z" />
              </svg>
              Add to playlist
            </button>
            <div className="border-t border-[#333]" />
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onDelete(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              data-test={`track-delete-btn-${track.id}`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
              Delete track
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
