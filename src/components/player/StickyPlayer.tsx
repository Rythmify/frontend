// Import audioService so its module-level code runs once and sets up everything (NOT FINISHED)
import "../../services/audioService";
import { seekAudio } from "../../services/audioService";
import { Link } from "react-router-dom";
import { usePlayerStore } from "../../stores/player.store";
import { useLikesStore } from "../../stores/likes.store";
import { useAuthStore } from "../../stores/auth.store";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";
import VolumeSlider from "./VolumeSlider";
import { FaHeart, FaUserPlus, FaUserCheck } from "react-icons/fa";
import { MdQueueMusic } from "react-icons/md";

export default function StickyPlayer() {
  const {
    currentTrack,
    currentTime,
    duration,
    volume,
    isMuted,
    setVolume,
    toggleMute,
  } = usePlayerStore();

  const { isTrackLiked, toggleTrack } = useLikesStore();
  const { user, toggleFollow } = useAuthStore();

  const isLiked = currentTrack ? isTrackLiked(currentTrack.id) : false;
  const isFollowing = currentTrack
    ? (user?.following_ids ?? []).includes(currentTrack.artistUsername)
    : false;

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec) || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) return null;

  return (
    <div
      data-test="sticky-player"
      className="fixed z-999 h-[50px] sm:h-[60px] bg-[#1a1a1a] border-t border-white/5 bottom-0 left-0 right-0"
    >
      <div className="container mx-auto h-full px-4 flex items-center gap-4 lg:gap-8">
        
        {/* 1. Left: Playback Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <PlayerControls />
        </div>

        {/* 2. Middle: Progress Bar (Desktop only, for mobile we show a thin bar at the top) */}
        <div className="hidden md:flex flex-1 items-center gap-3 min-w-0">
          <span className="text-[11px] text-white font-mono w-8 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 h-full flex items-center">
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={seekAudio}
            />
          </div>
          <span className="text-[11px] text-white font-mono w-8 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        {/* Mobile Progress Bar Overlay */}
        <div className="md:hidden absolute top-0 left-0 right-0 h-[2px]">
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={seekAudio}
          />
        </div>

        {/* 3. Right: Volume + Track Info + Secondary Actions */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto md:ml-0 shrink-0">
          
          {/* Volume */}
          <div className="hidden lg:block">
            <VolumeSlider
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={setVolume}
              onToggleMute={toggleMute}
            />
          </div>

          {/* Track Info */}
          <div className="flex items-center gap-2 max-w-[140px] sm:max-w-[200px] lg:max-w-[240px]">
            {currentTrack.coverUrl && (
              <img
                data-test="player-track-artwork"
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm object-cover shrink-0"
              />
            )}
            <div className="flex flex-col min-w-0">
              <span
                data-test="player-track-title"
                className="text-white text-[11px] sm:text-xs font-bold truncate leading-tight"
              >
                {currentTrack.title}
              </span>
              <Link
                to={`/${currentTrack.artistUsername}`}
                data-test="player-artist-name"
                className="text-white/50 text-[10px] sm:text-[11px] truncate hover:text-white transition-colors"
              >
                {currentTrack.artistName}
              </Link>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              data-test="player-button-like"
              onClick={() => currentTrack && toggleTrack(currentTrack)}
              className={`w-8 h-8 flex items-center justify-center transition-colors ${isLiked ? "text-[#f50]" : "text-white hover:text-white/70"}`}
            >
              <FaHeart size={14} />
            </button>

            <button
              data-test="player-button-follow"
              onClick={() => currentTrack && toggleFollow(currentTrack.artistUsername)}
              className={`hidden sm:flex w-8 h-8 items-center justify-center transition-colors ${isFollowing ? "text-[#f50]" : "text-white hover:text-white/70"}`}
            >
              {isFollowing ? <FaUserCheck size={15} /> : <FaUserPlus size={15} />}
            </button>

            <button
              data-test="player-button-queue"
              className="hidden sm:flex w-8 h-8 items-center justify-center text-white hover:text-white/70 transition-colors"
            >
              <MdQueueMusic size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
