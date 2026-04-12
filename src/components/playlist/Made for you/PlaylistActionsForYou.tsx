import { useState, useRef, useEffect } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { FaHeart, FaEllipsisH, FaLink, FaGlobe } from "react-icons/fa";
import { LuListEnd, LuShare } from "react-icons/lu";
import { FaListUl as FaAddToPlaylist } from "react-icons/fa";
import SharePopup from "../../../pages/[username]/[trackSlug]/components/SharePopup";
import {
  updatePlaylist,
  type Playlist,
} from "@/services/api/playlist/playlist.service";
import { useLikesStore } from "@/stores/likes.store";
import AddToPlaylistModal from "../AddToPlaylistModal";

interface PlaylistActionsProps {
  playlist: Playlist;
  onAddToNextUp?: () => void;
  onPlaylistUpdated?: (updated: Playlist) => void;
}

export default function PlaylistActions({
  playlist,
  onAddToNextUp,
  onPlaylistUpdated,
}: PlaylistActionsProps) {
  const { isPlaylistLiked, togglePlaylist } = useLikesStore();
  const liked = isPlaylistLiked(playlist.playlist_id);

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setMoreOpen(false);
  };

  const handleMakePublic = async () => {
    try {
      const res = await updatePlaylist(playlist.playlist_id, {
        is_public: true,
      });
      onPlaylistUpdated?.(res.data);
      setMoreOpen(false);
    } catch (err) {
      console.error("Failed to make playlist public:", err);
    }
  };

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
      <div
        data-test="playlist-action-bar"
        className="flex flex-row items-center gap-2 py-4"
      >
        {/* Like Button */}
        <ActionButton
          onClick={() =>
            togglePlaylist({
              id: playlist.playlist_id,
              title: playlist.name,
              owner: playlist.owner_user_id,
              coverUrl: playlist.cover_image || null,
            })
          }
          active={liked}
        >
          <FaHeart
            className={`text-[14px] ${liked ? "text-accent" : "text-white"}`}
          />
          {liked ? "Liked" : "Like"}
        </ActionButton>

        {/* Share Button */}
        <ActionButton onClick={() => setShareOpen(true)} active={shareOpen}>
          <LuShare className="text-[16px]" />
          Share
        </ActionButton>

        {/* Add to Next up Button */}
        <ActionButton onClick={onAddToNextUp}>
          <LuListEnd className="text-[18px]" />
          Add to Next up
        </ActionButton>

        {/* More Dropdown */}
        <div ref={moreRef} className="relative">
          <ActionButton
            onClick={() => setMoreOpen((p) => !p)}
            active={moreOpen}
          >
            <FaEllipsisH className="text-[14px]" />
            More
          </ActionButton>

          {moreOpen && (
            <div
              className="fixed z-[2000] bg-bg w-44 border font-bold border-[#353535] rounded shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownItem
                icon={<FaAddToPlaylist />}
                label="Add to playlist"
                onClick={() => {
                  setMoreOpen(false);
                  setShowPlaylistModal(true);
                }}
              />

              {/* Only show "Make public" if the playlist is currently private */}
              {!playlist.is_public && (
                <DropdownItem
                  icon={<FaGlobe />}
                  label="Make public"
                  onClick={handleMakePublic}
                />
              )}
            </div>
          )}
        </div>

        {shareOpen && (
          <SharePopup playlist={playlist} onClose={() => setShareOpen(false)} />
        )}

        {showPlaylistModal && (
          <AddToPlaylistModal
            playlistId={playlist.playlist_id}
            trackTitle={playlist.name}
            onClose={() => setShowPlaylistModal(false)}
          />
        )}
      </div>
    </Tooltip.Provider>
  );
}

// ── Components ───────────────────────────────────────────────────────────────

function ActionButton({
  children,
  onClick,
  active = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-1.5 h-[32px]
        rounded-[4px] transition-colors duration-150 cursor-pointer
        bg-[#303030] font-bold text-[14px] 
        ${
          active
            ? "text-accent"
            : "text-white border-transparent hover:text-[#717171]"
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}

function DropdownItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-bold text-white hover:bg-white/10 transition-colors cursor-pointer text-left"
    >
      <span className="text-[14px]">{icon}</span>
      {label}
    </button>
  );
}
