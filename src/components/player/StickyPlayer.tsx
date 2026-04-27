// Import audioService so its module-level code runs once and sets up everything (NOT FINISHED)
import "../../services/audioService";
import { seekAudio } from "../../services/audioService";
import { useState } from "react";
import { Link } from "react-router-dom";
import { usePlayerStore } from "../../stores/player.store";
import { useLikesStore } from "../../stores/likes.store";
import { useAuthStore } from "../../stores/auth.store";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";
import VolumeSlider from "./VolumeSlider";
import QueuePanel from "./QueuePanel";
import { FaHeart, FaUserPlus, FaUserCheck } from "react-icons/fa";
import { MdQueueMusic } from "react-icons/md";
import FollowButton from "../UI/FollowButton";

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
  const { user } = useAuthStore();

  const [queueOpen, setQueueOpen] = useState(false);

  const isLiked = currentTrack ? isTrackLiked(currentTrack.id) : false;
  const isFollowing = currentTrack
    ? (user?.following_ids ?? []).includes(currentTrack.artistId || currentTrack.artistUsername)
    : false;

  if (!currentTrack) return null;

  return (
    <div
      data-test="sticky-player"
      className="fixed z-999 h-14 bg-input-bg bottom-0 left-0 right-0"
    >
      <div className="container  flex items-center h-full px-4 md:px-12 lg:px-12 el:px-20 gap-3">
      {/* 1. Controls — far left */}
      <PlayerControls />

      {/* 2. Progress bar with time — takes remaining space */}
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
      {/* 7. Artwork + Track Info — far right */}
      <div className="flex items-center gap-2 shrink-0 w-40">
        {currentTrack.coverUrl && (
          <Link to={`/${currentTrack.artistUsername || currentTrack.artistName || "share"}/${currentTrack.trackSlug || currentTrack.id}`}>
            <img
              data-test="player-track-artwork"
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-10 h-10 rounded object-cover shrink-0 hover:opacity-80 transition-opacity"
            />
          </Link>
        )}
        <div className="flex flex-col min-w-0">
          <Link
            to={`/${currentTrack.artistUsername || currentTrack.artistName || "share"}/${currentTrack.trackSlug || currentTrack.id}`}
            data-test="player-track-title"
            className="text-white text-md font-semibold truncate leading-tight hover:text-accent transition-colors"
          >
            {currentTrack.title}
          </Link>
          <Link
            to={`/${currentTrack.artistUsername || currentTrack.artistName || "share"}`}
            data-test="player-artist-name"
            className="text-text-muted text-[14px] truncate hover:text-white transition-colors leading-tight"
          >
            {currentTrack.artistName}
          </Link>
        </div>
      </div>

      

      {/* 4. Like */}
      <button
        data-test="player-button-like"
        onClick={() => currentTrack && toggleTrack(currentTrack)}
        className={`w-10 h-10 flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer text-base
          ${isLiked ? "text-accent hover:text-accent/80" : "text-white hover:text-text-muted"}`}
      >
        <FaHeart />
      </button>

      {/* 5. Follow */}
      <div className="shrink-0 flex items-center justify-center w-10 h-10">
        <FollowButton
          userId={currentTrack.artistId || currentTrack.artistUsername}
          username={currentTrack.artistUsername}
          className={`!p-0 !bg-transparent !w-full !h-full flex items-center justify-center text-base transition-colors duration-150
            ${!user ? "opacity-30 grayscale" : ""}
            ${isFollowing ? "text-accent hover:text-accent/80" : "text-white hover:text-text-muted"}`}
        >
          {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
        </FollowButton>
      </div>

      {/* 6. Queue */}
      <button
        data-test="player-button-queue"
        onClick={() => setQueueOpen((o) => !o)}
        className={`w-10 h-10 flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer text-xl
          ${queueOpen ? "text-accent" : "text-white hover:text-text-muted"}`}
      >
        <MdQueueMusic />
      </button>

      {/* Queue panel */}
      {queueOpen && <QueuePanel onClose={() => setQueueOpen(false)} />}

      

      </div>
    </div>
  );
}