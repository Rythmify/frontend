import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"; 
import {
  reorderPlaylistTracks,
  removeTrackFromPlaylist,
  type PlaylistTrackItem, // ← use this, not Track
} from "@/services/api/playlist/playlist.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SortableTrackRowProps {
  track: PlaylistTrackItem;
  playlistId: string;
  onRemoved: (id: string) => void; 
}

interface TrackReorderListProps {
  playlistId: string;
  initialTracks: PlaylistTrackItem[];
  onTracksChanged?: (tracks: PlaylistTrackItem[]) => void;
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function SortableTrackRow({
  track,
  playlistId,
  onRemoved,
}: SortableTrackRowProps) {
  const [removing, setRemoving] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.track_id });

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeTrackFromPlaylist(playlistId, track.track_id);
      onRemoved(track.track_id);
    } catch (err) {
      console.error("Failed to remove track:", err);
      setRemoving(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 p-3 rounded-md bg-bg hover:bg-[#303030]
                 transition-opacity ${isDragging ? "opacity-40" : "opacity-100"}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-[#555] hover:text-[#888] transition-colors shrink-0"
        aria-label="Drag to reorder"
      >
        <i className="fa-solid fa-grip-lines" />
      </button>

      <img
        src={track.cover_image || "https://via.placeholder.com/40"}
        alt={track.title ?? "Track"}
        className="w-10 h-10 object-cover shrink-0"
      />

      <div className="flex justify-start gap-2 min-w-0">
        <p className="text-text-secondary text-sm truncate">
          {track.artist_name ?? "Unknown Artist"} --
        </p>
        <p className="text-white text-sm font-bold truncate">
          {track.title ?? "Unknown Track"}
        </p>
      </div>

      {/* Remove */}

      <button
        onClick={handleRemove}
        disabled={removing}
        className="text-text-secondary hover:text-[#717171] transition-colors disabled:opacity-40 flex justify-end cursor-pointer shrink-0"
        aria-label="Remove from playlist"
      >
        {removing ? (
          <i className="fa-solid fa-spinner animate-spin text-sm" />
        ) : (
          <i className="fa-solid fa-xmark" />
        )}
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TrackReorderList({
  playlistId,
  initialTracks,
  onTracksChanged,
}: TrackReorderListProps) {
  const [tracks, setTracks] = useState<PlaylistTrackItem[]>(initialTracks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // prevents accidental drags on click
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tracks.findIndex((t) => t.track_id === active.id);
    const newIndex = tracks.findIndex((t) => t.track_id === over.id);
    const reordered = arrayMove(tracks, oldIndex, newIndex).map((t, i) => ({
      ...t,
      position: i + 1,
    }));

    setTracks(reordered); // optimistic update
    onTracksChanged?.(reordered);

    try {
      await reorderPlaylistTracks(
        playlistId,
        reordered.map((t) => ({ track_id: t.track_id, position: t.position })),
      );
    } catch (err) {
      console.error("Failed to reorder tracks:", err);
      setTracks(tracks); // revert on failure
      onTracksChanged?.(tracks);
    }
  };

  const handleRemoved = (id: string) => {
    const updated = tracks
      .filter((t) => t.track_id !== id)
      .map((t, i) => ({ ...t, position: i + 1 }));
    setTracks(updated);
    onTracksChanged?.(updated);
  };

  if (tracks.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-6">
        No tracks in this playlist yet.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tracks.map((t) => t.track_id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {tracks.map((t) => (
            <SortableTrackRow
              key={t.track_id}
              track={t}
              playlistId={playlistId}
              onRemoved={handleRemoved}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
