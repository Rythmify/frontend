import type { Track } from "@/types/track";
import { useNavigate } from "react-router-dom";

// ─── Utility: Format large numbers ────────────────────────
const formatCount = (count: number): string => {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
  if (count >= 1000) return (count / 1000).toFixed(1) + "k";
  return count.toString();
};

// ─── Styles ───────────────────────────────────────────────
const styles = {
  trackImage: `
  relative
  w-12 h-12
  rounded-xsm
  flex-shrink-0
  overflow-hidden
`,
  trackCard: `
  group
  flex gap-3
  p-2
  rounded-md
  transition-colors duration-200
  w-[328px]
  cursor-pointer
`,
  playButtonOverlay: `
    absolute
    inset-0
    bg-black/30
    flex items-center justify-center
    opacity-0 group-hover:opacity-100
    transition-opacity duration-200
  `,
  playButton: `
    w-10 h-10
    rounded-full
    bg-purple-700 hover:bg-purple-600
    flex items-center justify-center
    text-white
    text-lg
    transition-colors duration-200
  `,
  trackInfo: `
    flex flex-col gap-1
    flex-1
    min-w-0
    relative
  `,
  trackArtist: `
    text-zinc-600 hover:text-zinc-400
    text-xs
    truncate
    transition-colors duration-200
  `,
  trackTitle: `
    text-white hover:text-zinc-400
    text-sm font-semibold
    truncate
    transition-colors duration-200
  `,
  statsContainer: `
    flex gap-2
    text-xs
    text-zinc-600
  `,
  statItem: `
    flex items-center gap-1
    hover:text-zinc-400
    transition-colors duration-200
  `,
  statIcon: `
    text-xs
  `,
  actionButtons: `
    absolute
    right-0 top-1/2 -translate-y-1/2
    flex gap-1
    opacity-0 group-hover:opacity-100
    transition-opacity duration-200
    drop-shadow-md
    z-10
  `,
  actionBtn: `
    w-8 h-8
    rounded
    bg-zinc-800/80 hover:bg-zinc-700
    flex items-center justify-center
    text-white text-xs
    transition-colors duration-200
  `,
};

// ─── RectangularCard Component ────────────────────────────

interface RectangularCardProps {
  track: Pick<
    Track,
    | "id"
    | "title"
    | "artistName"
    | "coverUrl"
    | "playCount"
    | "likeCount"
    | "repostCount"
    | "commentCount"
    | "trackSlug"
    | "username"
  >;
}

const RectangularCard = ({ track }: RectangularCardProps) => {
  const navigate = useNavigate();
  const handleStatClick = (statType: "likes" | "reposts" | "comments") => {
    navigate(`/${track.username}/${track.trackSlug}/${statType}`);
  };
  return (
    <div className={styles.trackCard}>
      {/* Track Image with Hover Play Button */}
      <div className={styles.trackImage}>
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-full h-full object-cover"
        />

        {/* Play Button Overlay */}
        <div className={styles.playButtonOverlay}>
          <button className={styles.playButton} aria-label="Play track">
            <i className="fa-solid fa-play ml-0.5"></i>
          </button>
        </div>
      </div>

      {/* Track Info */}
      <div className={styles.trackInfo}>
        {/* Artist Name */}
        <p className={styles.trackArtist}>{track.artistName}</p>

        {/* Track Title */}
        <h4 className={styles.trackTitle}>{track.title}</h4>

        {/* Statistics */}
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <i className={`fa-solid fa-play ${styles.statIcon}`}></i>
            <span>{formatCount(track.playCount)}</span>
          </div>
          <div
            className={styles.statItem}
            onClick={() => handleStatClick("likes")}
          >
            <i className={`fa-solid fa-heart ${styles.statIcon}`}></i>
            <span>{formatCount(track.likeCount)}</span>
          </div>
          <div
            className={styles.statItem}
            onClick={() => handleStatClick("reposts")}
          >
            <i className={`fa-solid fa-retweet ${styles.statIcon}`}></i>
            <span>{formatCount(track.repostCount)}</span>
          </div>
          <div
            className={styles.statItem}
            onClick={() => handleStatClick("comments")}
          >
            <i className={`fa-solid fa-comment ${styles.statIcon}`}></i>
            <span>{formatCount(track.commentCount)}</span>
          </div>
        </div>

        {/* Like and More Buttons*/}
        <div className={styles.actionButtons}>
          <button className={styles.actionBtn} aria-label="Like track">
            <i className="fa-solid fa-heart"></i>
          </button>
          <button className={styles.actionBtn} aria-label="More options">
            <i className="fa-solid fa-ellipsis"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RectangularCard;
