import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@heroui/react";
import { createPortal } from "react-dom";
import {
  type Playlist,
  getPlaylist,
} from "@/services/api/playlist/playlist.service";
import { usePlayerStore } from "@/stores/player.store";

// ─── Styles ───────────────────────────────────────────────
const styles = {
  card: `
    group flex flex-col gap-2
    w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]
    cursor-pointer shrink-0
  `,
  imageWrapper: `
    relative w-full aspect-square
    rounded-md overflow-hidden bg-[#303030]
  `,
  image: `
    w-full h-full object-cover
    text-white
    group-hover:brightness-75
    transition-all duration-200
  `,
  overlay: `
    absolute inset-0
    flex flex-col
    justify-between
    opacity-0 group-hover:opacity-100
    transition-opacity duration-200
  `,
  overlayCenter: `
    flex items-center justify-center
    flex-1
  `,
  overlayBottom: `
    flex items-center justify-end
    gap-2 px-2 pb-2
  `,
  playButton: `
    w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
    bg-white
    rounded-full
    flex items-center justify-center
  `,
  title: `
    text-white text-sm font-semibold
    truncate w-full
  `,
  actionButton: `
    flex flex-col items-center gap-0.5
    group/btn
  `,
  actionIcon: `
    text-[12px] text-black
    group-hover/btn:opacity-50
    transition-opacity duration-150
  `,
  actionIconActive: `
    text-[12px] text-red-500
    group-hover/btn:opacity-50
    transition-opacity duration-150
  `,
  subtitle: `text-gray-400 text-xs truncate`,
};

const tooltipStyles = {
  base: "bg-gray-700 rounded-md",
  content: "bg-gray-700 text-white text-xs px-2 py-1 rounded-md",
  tooltip: "bg-gray-700",
};

const PlaylistCard = ({ playlist }: { playlist: Playlist }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const [loadingPlay, setLoadingPlay] = useState(false);

  const { currentTrack, isPlaying, togglePlay, setTrack } = usePlayerStore();

  const isThisPlaylistPlaying =
    isPlaying &&
    (currentTrack as any)?.context?.type === "playlist" &&
    (currentTrack as any)?.context?.playlist_id === playlist.playlist_id;

  // ── Play: fetch tracks, set first track with playlist context ──────────────
  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If this playlist is already loaded, just toggle play/pause
    if ((currentTrack as any)?.context?.playlist_id === playlist.playlist_id) {
      togglePlay();
      return;
    }

    try {
      setLoadingPlay(true);
      const res = await getPlaylist(playlist.playlist_id, {
        include_tracks: true,
      });
      const tracks = res.data.tracks;

      if (!tracks || tracks.length === 0) return;

      // Sort by position and grab the first track
      const sorted = [...tracks].sort((a, b) => a.position - b.position);
      const firstTrackId = sorted[0].track_id;

      // Build the queue (all track IDs in order) and attach playlist context
      setTrack({
        id: firstTrackId,
        // carry whatever shape your player store expects — adjust fields as needed
        context: {
          type: "playlist",
          playlist_id: playlist.playlist_id,
          queue: sorted.map((t) => t.track_id),
        },
      } as any);
    } catch (err) {
      console.error("Failed to load playlist tracks:", err);
    } finally {
      setLoadingPlay(false);
    }
  };

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/you/sets/${playlist.playlist_id}`)}
      data-test="playlist-card"
    >
      {/* Cover */}
      <div className={styles.imageWrapper}>
        {(playlist as any).cover_image ? (
          <img
            src={(playlist as any).cover_image}
            alt={playlist.name}
            className={styles.image}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fa-solid fa-music text-3xl text-gray-500" />
          </div>
        )}

        <div className={styles.overlay}>
          <div />

          {/* Play button */}
          <div className={styles.overlayCenter}>
            <button
              className={styles.playButton}
              onClick={handlePlayClick}
              disabled={loadingPlay}
              data-test="button-play"
            >
              {loadingPlay ? (
                <i className="fa-solid fa-spinner animate-spin text-black text-lg" />
              ) : (
                <i
                  className={`fa-sharp fa-solid ${
                    isThisPlaylistPlaying ? "fa-pause" : "fa-play"
                  } text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] ${
                    isThisPlaylistPlaying ? "pl-0" : "pl-0.5"
                  }`}
                />
              )}
            </button>
          </div>

          {/* Actions */}
          <div className={styles.overlayBottom}>
            {/* Like */}
            <Tooltip content="Like" showArrow classNames={tooltipStyles}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLiked((prev) => !prev);
                }}
                className={styles.actionButton}
                data-test="button-like"
              >
                <i
                  className={`fa-solid fa-heart ${
                    liked ? styles.actionIconActive : styles.actionIcon
                  }`}
                />
              </button>
            </Tooltip>

            {/* More */}
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
                    className={`fa-solid fa-ellipsis ${
                      showMoreMenu ? "text-accent" : styles.actionIcon
                    }`}
                  />
                </button>
              </Tooltip>

              {showMoreMenu &&
                createPortal(
                  <div
                    style={{ top: menuPos.top, left: menuPos.left }}
                    className="fixed z-[9999] bg-bg w-44 border font-bold border-[#353535] rounded shadow-xl overflow-hidden"
                  >
                    <button
                      className="w-full text-left px-3 py-2 text-[14px] text-white hover:text-[#717171] cursor-pointer transition-colors flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMoreMenu(false);
                        navigate(`/you/sets/${playlist.playlist_id}`);
                      }}
                    >
                      <i className="fa-solid fa-list text-sm" />
                      View playlist
                    </button>
                  </div>,
                  document.body,
                )}
            </div>
          </div>
        </div>
      </div>

      <p className={styles.title}>{playlist.name}</p>
    </div>
  );
};

export default PlaylistCard;
