import { useState } from "react";
import type { Track as ServiceTrack } from "@/services/api/upload/track.service";
import type { Track as UITrack } from "@/types/track";
import { TrackRow } from "./TrackRow";
import EditTrackModal from "@/components/track/EditTrackModal";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";

interface Props {
  tracks: ServiceTrack[];
  filter: "Public" | "Private";
  onDeleteTrack: (id: string) => void;
}

function toUITrack(t: ServiceTrack): UITrack {
  return {
    id: t.id,
    title: t.title,
    artistName: t.artists ?? "",
    artistUsername: "",
    coverUrl: t.cover_image ?? "",
    genre: t.genre ?? "",
    likeCount: t.like_count ?? 0,
    repostCount: t.repost_count ?? 0,
    playCount: t.play_count ?? 0,
    commentCount: t.comment_count ?? 0,
    duration: String(t.duration ?? 0),
    postedAt: t.created_at,
    waveformData: [],
    audioUrl: t.audio_url,
    isPrivate: !t.is_public,
  };
}

export function TrackTable({ tracks, filter, onDeleteTrack }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editTrack, setEditTrack] = useState<ServiceTrack | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<ServiceTrack[]>([]);

  const allSelected = tracks.length > 0 && selected.size === tracks.length;
  const anySelected = selected.size > 0;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tracks.map((t) => t.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function openEdit() {
    const firstId = [...selected][0];
    const track = tracks.find((t) => t.id === firstId) ?? null;
    setEditTrack(track);
  }

  function openPlaylist(ids: Iterable<string> = selected) {
    const selectedTracks = tracks.filter((t) => [...ids].includes(t.id));
    setPlaylistTracks(selectedTracks);
  }

  return (
    <div className="mt-5 border-[#2a2a2a]" data-test="track-table">
      {anySelected ? (
        <div className="grid grid-cols-[20px_3fr_1fr_1fr_2fr_1fr_28px] gap-x-2 px-2 py-2.5 border-b border-[#2a2a2a] items-center" data-test="track-table-selection-header">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="w-4 h-4 accent-accent cursor-pointer ring-2 ring-white rounded-sm"
            data-test="select-all-checkbox"
          />
          <div className="flex items-center gap-3">
            <span className="text-text-hover text-xs font-bold uppercase tracking-wider">
              {selected.size} Selected
            </span>
            <div className="relative group/tip">
              <button
                type="button"
                onClick={openEdit}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2a2a2a] text-text-hover hover:bg-[#333] transition-colors cursor-pointer"
                data-test="edit-track-btn"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[11px] font-semibold text-white bg-[#333] rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none">
                Edit track
              </span>
            </div>
            <div className="relative group/tip">
              <button
                type="button"
                onClick={() => openPlaylist()}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2a2a2a] text-text-hover hover:bg-[#333] transition-colors cursor-pointer"
                data-test="add-to-playlist-btn"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M14 10H3v2h11v-2zm0-4H3v2h11V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM3 16h7v-2H3v2z" />
                </svg>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[11px] font-semibold text-white bg-[#333] rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none">
                Add to playlist
              </span>
            </div>
          </div>
          <div className="text-[11px] font-bold text-text-hover uppercase tracking-wider">Duration</div>
          <div className="text-[11px] font-bold text-text-hover uppercase tracking-wider">Date</div>
          <div />
          <div />
          <div />
        </div>
      ) : (
        <div className="grid grid-cols-[20px_3fr_1fr_1fr_2fr_1fr_25px] gap-x-2 px-2 py-2.5 text-[13px] font-bold text-text-hover uppercase tracking-wider border-b border-text-hover" data-test="track-table-header">
          <input
            type="checkbox"
            checked={false}
            onChange={toggleAll}
            className="w-4 h-4  accent-accent cursor-pointer"
            data-test="select-all-checkbox"
          />
          <div>Tracks</div>
          <div>Duration</div>
          <div>Date</div>
          <div>Engagements</div>
          <div>Plays</div>
          <div />
        </div>
      )}

      {tracks.length === 0 ? (
        <div className="py-12 text-center text-text-hover text-sm" data-test="track-table-empty">
          No {filter.toLowerCase()} tracks found.
        </div>
      ) : (
        tracks.map((track) => (
          <TrackRow
            key={track.id}
            track={track}
            selected={selected.has(track.id)}
            onToggle={toggleOne}
            onEdit={() => setEditTrack(track)}
            onAddToPlaylist={() => openPlaylist([track.id])}
            onDelete={() => onDeleteTrack(track.id)}
          />
        ))
      )}

      {editTrack && (
        <EditTrackModal
          track={toUITrack(editTrack)}
          onClose={() => setEditTrack(null)}
          onSaved={() => setEditTrack(null)}
        />
      )}

      {playlistTracks.length > 0 && (
        <AddToPlaylistModal
          trackTitle={
            playlistTracks.length === 1
              ? playlistTracks[0].title
              : `${playlistTracks.length} selected tracks`
          }
          initialTracks={playlistTracks.map((t) => ({
            id: t.id,
            title: t.title,
            artistName: t.artists ?? undefined,
            coverUrl: t.cover_image ?? undefined,
          }))}
          onClose={() => setPlaylistTracks([])}
        />
      )}
    </div>
  );
}
