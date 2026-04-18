import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Tooltip } from "@heroui/react";
import { usePlayerStore } from "@/stores/player.store";
import { useLikesStore } from "@/stores/likes.store";
import { useAuthStore } from "@/stores/auth.store";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PlaylistCardData = {
  id: string;
  title: string;
  owner: string;
  ownerUsername?: string;
  slug?: string | null;
  coverUrl: string | null;
  isPrivate?: boolean;
  isLiked?: boolean;
  isAlbumView?: boolean;
};

interface PlaylistCardProps {
  item: PlaylistCardData;
  widthClassName?: string;
}

// ─── Styles ───────────────────────────────────────────────
const tooltipStyles = {
  base: "bg-gray-700 rounded-md",
  content: "bg-gray-700 text-white text-xs px-2 py-1 rounded-md",
};

// ─── Component ────────────────────────────────────────────

export default function PlaylistCard({
  item,
  widthClassName = "w-[200px]",
}: PlaylistCardProps) {
  const navigate = useNavigate();
  const { isPlaylistLiked, togglePlaylist } = useLikesStore();
  const { currentTrack, isPlaying, togglePlay, setTrack } = usePlayerStore();
  const { user } = useAuthStore();

  // Local State
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Derived State
  const liked = isPlaylistLiked(item.id);
  const isThisPlaylistPlaying =
    isPlaying &&
    (currentTrack as any)?.context?.type === "playlist" &&
    (currentTrack as any)?.context?.playlist_id === item.id;

  const ownerDisplay = UUID_RE.test(item.owner)
    ? (user?.displayName ?? user?.username ?? item.owner)
    : item.ownerUsername?? item.owner;
    

  // SoundCloud navigation format: /[username]/sets/[slug]
  const playlistPath = item.isAlbumView
    ? `/${item.ownerUsername || item.owner}/album/${item.slug || item.id}`
    : `/${item.ownerUsername || item.owner}/sets/${item.slug || item.id}`;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((currentTrack as any)?.context?.playlist_id === item.id) {
      togglePlay();
      return;
    }
    setTrack({
      id: item.id,
      title: item.title,
      artistName: ownerDisplay,
      artistUsername: item.ownerUsername ?? "",
      coverUrl: item.coverUrl ?? "",
      genre: "",
      likeCount: 0,
      repostCount: 0,
      playCount: 0,
      commentCount: 0,
      duration: "0:00",
      postedAt: "",
      audioUrl: "",
      waveformData: [],
      context: { type: "playlist", playlist_id: item.id },
    } as any);
  };

  const handleOpenMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + window.scrollY,
      left: rect.right - 176,
    });
    setShowMoreMenu((prev) => !prev);
  };

  return (
    <div
      className={`group flex flex-col gap-2 ${widthClassName} shrink-0 cursor-pointer`}
      onClick={() => navigate(playlistPath)}
      data-test="playlist-card"
    >
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-75"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fa-solid fa-music text-3xl text-gray-500" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20">
          <div />

          {/* Play Button */}
          <div className="flex items-center justify-center flex-1">
            <button
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              onClick={handlePlayClick}
            >
              <i
                className={`fa-solid ${isThisPlaylistPlaying ? "fa-pause" : "fa-play"} text-black text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] ${!isThisPlaylistPlaying && "ml-0.5"}`}
              />
            </button>
          </div>

          {/* Bottom Actions */}
          <div
            className="flex items-center justify-end gap-2 px-2 pb-2"
            data-test={`playlist-card-like-${item.id}`}
          >
            <Tooltip content="Like" showArrow classNames={tooltipStyles}>
              <button
                className="flex items-center justify-center w-7 h-7 group/btn"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlaylist(item);
                }}
              >
                <i
                  className={`fa-sharp fa-solid fa-heart ${liked ? "text-[#e74c3c]" : "text-white"} text-[12px] group-hover/btn:opacity-50 transition-opacity duration-150`}
                />
              </button>
            </Tooltip>
            <Tooltip content="More" showArrow classNames={tooltipStyles}>
              <button
                data-test={`playlist-card-more-${item.id}`}
                className="flex items-center justify-center w-7 h-7 group/btn"
                onClick={handleOpenMore}
              >
                <i
                  className={`fa-solid fa-ellipsis text-[12px] ${showMoreMenu ? "text-accent" : "text-white"} group-hover/btn:opacity-50 transition-opacity duration-150`}
                />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Title & Metadata */}
      <div>
        <p className="text-white text-sm font-semibold truncate w-full flex items-center gap-1">
          {item.isPrivate && (
            <i className="fa-solid fa-lock text-[10px] text-gray-400 shrink-0" />
          )}
          {item.isLiked && (
            <i className="fa-solid fa-heart text-[10px] text-white shrink-0" />
          )}
          <span className="truncate">{item.title}</span>
        </p>
        <p className="text-gray-400 text-xs truncate w-full">{ownerDisplay}</p>
      </div>

      {/* Portal Menu */}
      {showMoreMenu &&
        createPortal(
          <div
            style={{ top: menuPos.top, left: menuPos.left }}
            className="fixed z-[9999] bg-bg w-44 border font-bold border-[#353535] rounded shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full text-left px-3 py-2 text-[14px] text-white hover:bg-white/10 cursor-pointer transition-colors flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreMenu(false);
                setShowPlaylistModal(true);
              }}
            >
              <svg
                viewBox="0 0 16 16"
                className="w-4 h-4 fill-current shrink-0"
              >
                <path d="M3.25 7V4.75H1v-1.5h2.25V1h1.5v2.25H7v1.5H4.75V7h-1.5zM9 4.75h6v-1.5H9v1.5zM15 9.875H1v-1.5h14v1.5zM1 15h14v-1.5H1V15z" />
              </svg>
              Add to playlist
            </button>
          </div>,
          document.body,
        )}

      {showPlaylistModal && (
        <AddToPlaylistModal
          playlistId={item.id}
          trackTitle={item.title}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
}
