import type { Track } from "@/types/track";
import { useRef, useState } from "react";
import { Tooltip } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "@/stores/player.store";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";
import AddToPlaylistModal from "@/components/Playlist/AddToPlaylistModal";
import { createPortal } from "react-dom";

// ─── Props ────────────────────────────────────────────────
interface TrackCardProps {
  track: Track;
  widthClassName?: string;
}

// ─── Styles ───────────────────────────────────────────────
const styles = {
  card: (widthClassName?: string) => `
    group flex flex-col gap-2
    ${widthClassName ?? "w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]"}
    cursor-pointer shrink-0
  `,
  imageWrapper: `
    relative w-full aspect-square
    rounded-md overflow-hidden
  `,
  image: `
    w-full h-full object-cover
    text-white
    transition-all duration-200
  `,
  overlay: `
    absolute inset-0
    flex flex-col
    justify-between
    opacity-0 group-hover:opacity-100
    transition-opacity duration-200
  `,
  overlayBg: `
    absolute inset-0 bg-black/30 pointer-events-none
  `,
  overlayCenter: `
    flex items-center justify-center
    flex-1
  `,
  overlayBottom: `
    flex items-center justify-end
    gap-2 px-2 pb-2
  `,
  likeButton: `
    fa-sharp fa-regular fa-heart
    text-[10px] text-white
  `,
  likeButtonActive: `
    fa-sharp fa-solid fa-heart
    text-[10px] text-[#e74c3c]
  `,
  moreButton: `
    fa-solid fa-ellipsis
    text-[10px] text-white
  `,
  playButton: `
    w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
    bg-white
    rounded-full
    flex items-center justify-center
  `,
  playIcon: `
    text-white text-lg pl-1
  `,
  title: `
    text-white text-sm font-semibold
    truncate w-full
  `,
  artist: `
    text-gray-400 text-xs
    truncate w-full
  `,
  actionButton: `
    flex flex-col items-center gap-0.5
    group/btn
  `,
  actionIcon: `
    text-[12px] text-white
    group-hover/btn:opacity-50
    transition-opacity duration-150
  `,
  actionIconActive: `
    text-[12px] text-red-500
    group-hover/btn:opacity-50
    transition-opacity duration-150
  `,
  actionLabel: `
    text-white text-[8px]
    opacity-0 group-hover/btn:opacity-100
    transition-opacity duration-150
  `,
};

const tooltipStyles = {
  base: "bg-gray-700 rounded-md",
  content: "bg-gray-700 text-white text-xs px-2 py-1 rounded-md",
  tooltip: "bg-gray-700",
};

// ─── Component ────────────────────────────────────────────
const TrackCard = ({ track, widthClassName }: TrackCardProps) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { isTrackLiked, toggleTrack } = useLikesStore();
  const { addTrack } = useHistoryStore();

  const liked = isTrackLiked(track.id);

  // Check if this card's track is the one currently playing
  const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

  // Handler for play button click (play/pause toggle)
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      setTrack(track);
      addTrack(track);
    }
  };

  return (
    <div
      className={styles.card(widthClassName)}
      onClick={() => navigate(`/${track.artistUsername}/${track.trackSlug}`)}
      data-test="card-track"
    >
      <div className={styles.imageWrapper}>
        <img
          src={track.coverUrl}
          alt={track.title}
          className={styles.image}
          data-test="trackcard-image"
        />
        <div className={styles.overlay}>
          {/* Dark overlay */}
          <div className={styles.overlayBg} />

          {/* Top spacer */}
          <div />

          {/* Center — Play Button */}
          <div className={styles.overlayCenter}>
            <button
              className={styles.playButton}
              onClick={handlePlayClick}
              data-test="button-play"
            >
              <i
                className={`fa-sharp fa-solid ${isThisTrackPlaying ? "fa-pause" : "fa-play"} text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] ${isThisTrackPlaying ? "pl-0" : "pl-0.5"}`}
              ></i>
            </button>
          </div>

          {/* Bottom — Like + More */}
          <div className={styles.overlayBottom}>
            {/* Like Button */}
            <Tooltip
              content="Like"
              showArrow
              placement="bottom"
              classNames={tooltipStyles}
              closeDelay={0}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTrack(track);
                }}
                className={styles.actionButton}
                data-test="button-like"
              >
                <i
                  className={`fa-solid fa-heart ${liked ? styles.actionIconActive : styles.actionIcon}`}
                ></i>
              </button>
            </Tooltip>

            {/* More Button */}
            <div
              ref={menuRef}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip
                content="More"
                showArrow
                placement="bottom"
                classNames={tooltipStyles}
              >
                <button
                  className={styles.actionButton}
                  data-test="button-more"
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    setMenuPos({
                      top: rect.bottom + window.scrollY,
                      left: rect.right - 176,
                    });
                    setShowMoreMenu((prev) => !prev);
                  }}
                >
                  <i
                    className={`fa-solid fa-ellipsis ${showMoreMenu ? "text-accent" : styles.actionIcon}`}
                  />
                </button>
              </Tooltip>

              {showMoreMenu &&
                createPortal(
                  <div
                    style={{ top: menuPos.top, left: menuPos.left }}
                    className="fixed z-[9999] bg-bg w-44 border font-bold border-[#353535] rounded shadow-xl overflow-hidden "
                  >
                    <button
                      className="w-full text-left px-3 py-2 text-[14px] text-white hover:text-[#717171] cursor-pointer transition-colors flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMoreMenu(false);
                        setShowPlaylistModal(true);
                      }}
                    >
                      <svg
                        viewBox="0 0 16 16"
                        className="w-4 h-4 fill-current shrink-0 hover:text-[#717171] cursor-pointer"
                      >
                        <path d="M3.25 7V4.75H1v-1.5h2.25V1h1.5v2.25H7v1.5H4.75V7h-1.5zM9 4.75h6v-1.5H9v1.5zM15 9.875H1v-1.5h14v1.5zM1 15h14v-1.5H1V15z" />
                      </svg>
                      Add to playlist
                    </button>
                  </div>,
                  document.body,
                )}
            </div>
          </div>
        </div>
      </div>
      <p className={styles.title} data-test="trackcard-title">
        {track.title}
      </p>
      <p className={styles.artist} data-test="trackcard-artist">
        {track.artistName}
      </p>

      {showPlaylistModal && (
        <AddToPlaylistModal
          trackTitle={track.title}
          trackId={track.id}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
};

export default TrackCard;
