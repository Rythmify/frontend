// Import audioService so its module-level code runs once and sets up everything (NOT FINISHED)
import "../../services/audioService";
import { seekAudio } from "../../services/audioService";
import { Link } from "react-router-dom";
import { usePlayerStore } from "../../stores/player.store";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";
import VolumeSlider from "./VolumeSlider";
import { FaHeart, FaUserPlus } from "react-icons/fa";
import { MdQueueMusic } from "react-icons/md";

export default function StickyPlayer() {
  const {
    currentTrack,
    currentTime,
    duration,
    volume,
    isMuted,
    isLiked,
    setVolume,
    toggleMute,
    toggleLike,
  } = usePlayerStore();

  if (!currentTrack) return null;

  return (
    <div
      data-test="sticky-player"
      className="
        fixed bottom-0 left-0 right-0 z-[999]
        h-[56px] flex items-center
        bg-[#111] border-t border-[#2a2a2a]
        px-4 gap-3
      "
    >
      {/* 1. Controls */}
      <PlayerControls />

      {/* 2. Progress bar */}
      <div className="flex-1 min-w-0">
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={seekAudio}
        />
      </div>

      {/* 3. Volume */}
      <VolumeSlider
        volume={volume}
        isMuted={isMuted}
        onVolumeChange={setVolume}
        onToggleMute={toggleMute}
      />

      {/* 4. Artwork */}
      {currentTrack.coverUrl && (
        <img
          data-test="player-track-artwork"
          src={currentTrack.coverUrl}
          alt={currentTrack.title}
          className="w-8 h-8 rounded object-cover shrink-0"
        />
      )}

      {/* 5. Artist + Title */}
      <div className="hidden sm:flex flex-col min-w-0 w-[130px]">
        <Link
          to={`/${currentTrack.artistUsername}`}
          data-test="player-artist-name"
          className="text-[var(--color-text-muted)] text-[11px] truncate hover:text-white transition-colors leading-tight"
        >
          {currentTrack.artistName}
        </Link>
        <span
          data-test="player-track-title"
          className="text-white text-xs font-semibold truncate leading-tight"
        >
          {currentTrack.title}
        </span>
      </div>

      {/* 6. Like */}
      <button
        data-test="player-button-like"
        onClick={toggleLike}
        className={`
          w-8 h-8 flex items-center justify-center rounded shrink-0
          transition-colors duration-150 cursor-pointer text-sm
          ${isLiked
            ? "text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
            : "text-white hover:text-[var(--color-text-muted)]"
          }
        `}
      >
        <FaHeart />
      </button>

      {/* 7. Follow */}
      <button
        data-test="player-button-follow"
        className="
          w-8 h-8 flex items-center justify-center rounded shrink-0
          text-white hover:text-[var(--color-text-muted)]
          transition-colors duration-150 cursor-pointer text-sm
        "
      >
        <FaUserPlus />
      </button>

      {/* 8. Queue */}
      <button
        data-test="player-button-queue"
        className="
          w-8 h-8 flex items-center justify-center rounded shrink-0
          text-white hover:text-[var(--color-text-muted)]
          transition-colors duration-150 cursor-pointer text-lg
        "
      >
        <MdQueueMusic />
      </button>
    </div>
  );
}