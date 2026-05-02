/**
 * Main sticky player shell — playback URL selection is done in `track.service` /
 * `utils/playbackAccess` (stream vs preview vs blocked). This component surfaces
 * access state in the chrome and disables transport controls when there is
 * nothing to play.
 */

import { seekAudio } from "../services/audioService";
import { useState } from "react";
import { Link } from "react-router-dom";
import { usePlayerStore } from "../stores/player.store";
import { useLikesStore } from "../stores/likes.store";
import { useAuthStore } from "../stores/auth.store";
import { usePlaybackAccess } from "../hooks/usePlaybackAccess";
import PlayerControls from "./player/PlayerControls";
import ProgressBar from "./player/ProgressBar";
import VolumeSlider from "./player/VolumeSlider";
import QueuePanel from "./player/QueuePanel";
import { FaHeart, FaUserPlus, FaUserCheck } from "react-icons/fa";
import { MdQueueMusic } from "react-icons/md";
import FollowButton from "./UI/FollowButton";

export default function Player() {
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
  const access = usePlaybackAccess(currentTrack ?? undefined);

  const [queueOpen, setQueueOpen] = useState(false);

  const isLiked = currentTrack ? isTrackLiked(currentTrack.id) : false;
  const isFollowing = currentTrack
    ? (user?.following_ids ?? []).includes(currentTrack.artistId || currentTrack.artistUsername)
    : false;

  if (!currentTrack) return null;

  const playbackDisabled = access.isBlocked || !access.effectiveAudioUrl;

  return (
    <div
      data-test="sticky-player"
      className="fixed z-999 h-14 bg-input-bg bottom-0 left-0 right-0"
    >
      <div className="container  flex items-center h-full px-4 md:px-12 lg:px-12 el:px-20 gap-3">
        <PlayerControls playbackDisabled={playbackDisabled} />

        <div className="flex-1 min-w-0 flex flex-col gap-0.5 justify-center">
          {access.isBlocked && (
            <p
              data-test="player-playback-blocked-message"
              className="text-[11px] text-amber-500/90 truncate leading-tight"
            >
              Playback unavailable in your region or for this track.
            </p>
          )}
          {access.isPreview && !access.isBlocked && (
            <p
              data-test="player-preview-badge"
              className="text-[11px] text-amber-400/90 truncate leading-tight"
            >
              Preview only — full track not available here.
            </p>
          )}
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={seekAudio}
            disabled={playbackDisabled}
          />
        </div>

        <VolumeSlider
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={setVolume}
          onToggleMute={toggleMute}
        />

        <div className="flex items-center gap-2 shrink-0 w-40">
          {currentTrack.coverUrl && (
            <Link
              to={`/${currentTrack.artistUsername || currentTrack.artistName || "share"}/${currentTrack.trackSlug || currentTrack.id}`}
            >
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

        <button
          data-test="player-button-like"
          type="button"
          onClick={() => currentTrack && toggleTrack(currentTrack)}
          className={`w-10 h-10 flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer text-base
          ${isLiked ? "text-accent hover:text-accent/80" : "text-white hover:text-text-muted"}`}
        >
          <FaHeart />
        </button>

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

        <button
          data-test="player-button-queue"
          type="button"
          onClick={() => setQueueOpen((o) => !o)}
          className={`w-10 h-10 flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer text-xl
          ${queueOpen ? "text-accent" : "text-white hover:text-text-muted"}`}
        >
          <MdQueueMusic />
        </button>

        {queueOpen && <QueuePanel onClose={() => setQueueOpen(false)} />}
      </div>
    </div>
  );
}
