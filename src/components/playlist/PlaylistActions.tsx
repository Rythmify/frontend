import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { HiUpload, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { IoCopyOutline } from "react-icons/io5";
import { LuListEnd } from "react-icons/lu";
import SharePopup from "../../pages/[username]/[trackSlug]/components/SharePopup";
import type {
  Playlist,
  PlaylistDetails,
  PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";
import { useLikesStore } from "@/stores/likes.store";
import { usePlayerStore } from "@/stores/player.store";
import EditPlaylistModal from "./EditPlaylistModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import type { Track } from "@/types/track";

interface PlaylistActionsProps {
  playlist: PlaylistDetails;
  onPlaylistUpdated?: (updated: PlaylistDetails) => void;
}

export default function PlaylistActions({
  playlist,
  onPlaylistUpdated,
}: PlaylistActionsProps) {
  const navigate = useNavigate();
  const { isPlaylistLiked, togglePlaylist } = useLikesStore();
  const { addToQueue, queue } = usePlayerStore();
  const liked = isPlaylistLiked(playlist.playlist_id);
  const isQueued =
    playlist.tracks.length > 0 &&
    playlist.tracks.some((track) =>
      queue.some((queuedTrack) => queuedTrack.id === track.track_id),
    );

  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const parseDuration = (duration?: number | null): string => {
    if (typeof duration !== "number" || Number.isNaN(duration)) return "0:00";
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const toPlayerTrack = (track: PlaylistTrackItem): Track => ({
    id: track.track_id,
    title: track.title ?? "Untitled track",
    artistName: track.artist_name ?? "Unknown Artist",
    artistUsername: track.artist_username ?? "",
    coverUrl: track.cover_image ?? "",
    genre: "",
    likeCount: 0,
    repostCount: 0,
    playCount: track.play_count ?? 0,
    commentCount: 0,
    duration: parseDuration(track.duration),
    postedAt: track.added_at ?? "",
    waveformData: [],
    audioUrl: track.audio_url ?? "",
    isPrivate: !track.is_public,
  });

  const handleAddToNextUp = () => {
    const tracks = playlist.tracks.map(toPlayerTrack);
    if (!tracks.length) return;
    tracks.forEach((track) => addToQueue(track));
  };

  return (
    <>
      <div
        data-test="playlist-action-bar"
        className="flex items-center gap-3 py-3"
      >
        {/* Share */}
        <ActionButton
          tooltip="Share"
          data-test="button-share"
          onClick={() => setShareOpen(true)}
          active={shareOpen}
        >
          <HiUpload className="text-[18px]" />
        </ActionButton>

        {/* Copy link */}
        <ActionButton
          tooltip="Copy Link"
          data-test="button-copy-link"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
          }}
        >
          <IoCopyOutline className="text-[18px]" />
        </ActionButton>

        {/* Edit */}
        <ActionButton
          tooltip="Edit"
          data-test="button-edit"
          onClick={() => setEditOpen(true)}
        >
          <HiOutlinePencil className="text-[18px]" />
        </ActionButton>

        {/* Like */}
        <ActionButton
          tooltip={liked ? "Unlike" : "Like"}
          data-test="button-like"
          active={liked}
          onClick={() =>
            togglePlaylist({
              id: playlist.playlist_id,
              title: playlist.name,
              owner: playlist.owner_user_id,
              coverUrl: playlist.cover_image || null,
            })
          }
        >
          {liked ? (
            <FaHeart className="text-[16px] text-[var(--color-accent)]" />
          ) : (
            <FaRegHeart className="text-[16px]" />
          )}
        </ActionButton>

        {/* Add to Next Up */}
        <ActionButton
          tooltip="Add to Next Up"
          data-test="button-add-next-up"
          onClick={handleAddToNextUp}
          active={isQueued}
        >
          <LuListEnd className="text-[18px]" />
        </ActionButton>

        {/* Delete */}
        <ActionButton
          tooltip="Delete"
          data-test="button-delete"
          danger
          onClick={() => setDeleteOpen(true)}
        >
          <HiOutlineTrash className="text-[18px]" />
        </ActionButton>
      </div>

      {shareOpen && (
        <SharePopup playlist={playlist} onClose={() => setShareOpen(false)} />
      )}

      {editOpen && (
        <EditPlaylistModal
          playlist={playlist}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            onPlaylistUpdated?.(updated);
            setEditOpen(false);
          }}
        />
      )}

      {deleteOpen && (
        <DeleteConfirmModal
          playlistId={playlist.playlist_id}
          playlistName={playlist.name}
          onClose={() => setDeleteOpen(false)}
          onDeleted={() => navigate(-1)}
        />
      )}
    </>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────

function ActionButton({
  children,
  onClick,
  active = false,
  danger = false,
  tooltip,
  "data-test": dataTest,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
  tooltip?: string;
  "data-test"?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        data-test={dataTest}
        onClick={onClick}
        className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] bg-bg-actionbutton transition-all duration-150 cursor-pointer group"
      >
        <span
          className={`transition-colors duration-150 ${
            active
              ? "text-[var(--color-accent)]"
              : "text-text-upload group-hover:text-[#717171]"
          }`}
        >
          {children}
        </span>
      </button>

      {tooltip && showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#1a1a1a] border border-[#333] text-white text-[11px] font-medium rounded-md shadow-xl whitespace-nowrap z-[100] pointer-events-none">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#333]" />
        </div>
      )}
    </div>
  );
}
