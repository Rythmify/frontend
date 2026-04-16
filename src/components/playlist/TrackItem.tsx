import { useState, type MouseEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { LuListEnd } from "react-icons/lu";
import {
  FaPlay,
  FaPause,
  FaHeart,
  FaEllipsisH,
  FaListUl as FaAddToPlaylist,
  FaBroadcastTower,
} from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { HiUpload } from "react-icons/hi";
import { FaRegCopy } from "react-icons/fa";
import AddToPlaylistModal from "./AddToPlaylistModal";
import SharePopup from "../../pages/[username]/[trackSlug]/components/SharePopup";
import { repostTrack } from "@/services/mocks/Track.service";
import { usePlayerStore } from "@/stores/player.store";
import type { Track } from "@/types/track";
import type { PlaylistTrackItem } from "@/services/api/playlist/playlist.service";

function TrackItem({
  track,
  index,
  isCurrent,
  isPlaying,
  onPlay,
  onLike,
}: {
  track: PlaylistTrackItem;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay?: () => void;
  onLike: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const setTrack = usePlayerStore((state) => state.setTrack);

  const artistName = track.artist_name ?? track.artist_name ?? "Unknown Artist";
  const artistSlug =
    track.artist_username ?? track.artist_username ?? "unknown";
  const coverImage =
    track.cover_image ?? track.cover_image ?? "https://via.placeholder.com/150";
  const playCount = track.play_count ?? track.play_count ?? 0;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => !prev);
    onLike();
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await repostTrack(track.track_id);
    } catch (err) {
      console.error("Failed to repost track:", err);
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (typeof seconds !== "number" || Number.isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.max(0, Math.floor(seconds % 60));
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onPlay) {
      onPlay();
      return;
    }

    const trackForPlayer: Track = {
      id: track.track_id,
      title: track.title ?? "Untitled track",
      artistName,
      artistUsername: artistSlug,
      coverUrl: coverImage,
      genre: "",
      likeCount: 0,
      repostCount: 0,
      playCount: playCount,
      commentCount: 0,
      duration: formatDuration(track.duration),
      postedAt: track.added_at ?? "",
      waveformData: [],
      audioUrl: track.audio_url ?? "",
      isPrivate: !track.is_public,
    };

    setTrack(trackForPlayer);
  };

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  const playbackTextClass = isPlaying
    ? "text-[var(--color-accent)]"
    : "text-[var(--color-text-muted)]";
  const playbackTitleClass = isPlaying
    ? "text-[var(--color-accent)]"
    : "text-[var(--color-text-hover)]";

  return (
    <>
      <div
        data-test={`track-Item-${track.track_id}`}
        className={`
          flex items-center gap-0 py-2 rounded
          transition-colors duration-100 cursor-pointer relative group
          border-b border-[var(--color-border)] last:border-b-0
          ${isCurrent ? "bg-[#303030]" : "hover:bg-[#303030]"}
        `}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setMoreOpen(false);
        }}
        onClick={handlePlay}
      >
        <div className="relative w-10 h-10 shrink-0 mr-3">
          <img
            src={coverImage}
            alt={track.title ?? "Track"}
            className="w-10 h-10 object-cover rounded"
          />
          {(hovered || isCurrent) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
              <button
                data-test={`button-play-track-${track.track_id}`}
                onClick={(e) => {
                  handlePlay(e);
                }}
                className="text-white cursor-pointer"
              >
                {isPlaying ? (
                  <FaPause className="text-[var(--color-accent)] text-sm" />
                ) : (
                  <FaPlay
                    className={`text-sm ${isCurrent ? "text-[var(--color-accent)]" : "text-white"}`}
                  />
                )}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex items-baseline gap-1.5 overflow-hidden">
          <span
            className={`text-sm shrink-0 w-5 font-bold text-right ${playbackTextClass}`}
          >
            {index}
          </span>
          <span className="text-[var(--color-text-muted)] text-sm shrink-0">
            ·
          </span>
          <Link
            to={`/${artistSlug}`}
            onClick={(e) => e.stopPropagation()}
            className={`text-sm shrink-0 font-bold transition-colors ${playbackTextClass}`}
          >
            {artistName}
          </Link>
          <span className="text-[var(--color-text-muted)] text-sm shrink-0">
            ·
          </span>
          <span
            className={`text-sm font-bold truncate ${playbackTitleClass}`}
          >
            {track.title ?? "Untitled track"}
          </span>
        </div>

        <div className="flex items-center shrink-0 ml-3">
          <div
            className={`flex items-center gap-0.5 transition-opacity duration-150 ${hovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <TipBtn
              tooltip="Like"
              data-test={`button-like-track-${track.track_id}`}
              onClick={handleLike}
              active={liked}
            >
              <FaHeart />
            </TipBtn>

            <TipBtn
              tooltip="Repost"
              data-test={`button-repost-track-${track.track_id}`}
              onClick={handleRepost}
            >
              <BiRepost className="text-base" />
            </TipBtn>

            <TipBtn
              tooltip="Share"
              data-test="button-share-track"
              onClick={(e) => {
                e.stopPropagation();
                setShareOpen(true);
              }}
            >
              <HiUpload />
            </TipBtn>

            <TipBtn
              tooltip="Copy link"
              data-test={`button-copy-link-track-${track.track_id}`}
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(
                  `${window.location.origin}/${artistSlug}/${track.track_id}`,
                );
              }}
            >
              <FaRegCopy />
            </TipBtn>

            <div className="relative">
              <TipBtn
                tooltip="More"
                data-test={`button-more-track-${track.track_id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setMoreOpen((prev) => !prev);
                }}
              >
                <FaEllipsisH />
              </TipBtn>

              {moreOpen && (
                <div
                  data-test={`dropdown-more-track-${track.track_id}`}
                  className="absolute right-0 top-[110%] z-[100] bg-bg w-44 border font-bold border-[#353535] rounded shadow-xl overflow-hidden"
                >
                  <MiniDropItem
                    icon={<LuListEnd />}
                    label="Add to Next up"
                    onClick={() => setMoreOpen(false)}
                    data-test={`dropdown-next-up-playlist-${track.track_id}`}
                  />
                  <MiniDropItem
                    icon={<FaAddToPlaylist />}
                    label="Add to Playlist"
                    onClick={() => {
                      setMoreOpen(false);
                      setPlaylistModalOpen(true);
                    }}
                    data-test={`dropdown-playlist-track-${track.track_id}`}
                  />
                  <MiniDropItem
                    icon={<FaBroadcastTower />}
                    label="Station"
                    onClick={() => setMoreOpen(false)}
                    data-test={`dropdown-station-track-${track.track_id}`}
                  />
                </div>
              )}
            </div>
          </div>

          <span
            className={`text-xs text-text-muted tabular-nums w-14 text-right transition-opacity duration-150 ${hovered ? "opacity-0" : "opacity-100"}`}
          >
            {formatCount(playCount)}
          </span>
        </div>
      </div>

      {shareOpen && (
        <SharePopup track={track as any} onClose={() => setShareOpen(false)} />
      )}

      {playlistModalOpen && (
        <AddToPlaylistModal
          trackId={track.track_id}
          trackTitle={track.title ?? "Untitled track"}
          trackCoverUrl={coverImage}
          artistName={artistName}
          onClose={() => setPlaylistModalOpen(false)}
        />
      )}
    </>
  );
}

function TipBtn({
  children,
  onClick,
  tooltip,
  active = false,
  "data-test": dataTest,
}: {
  children: ReactNode;
  onClick: (e: MouseEvent) => void;
  tooltip: string;
  active?: boolean;
  "data-test"?: string;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          data-test={dataTest}
          onClick={onClick}
          className={`
            py-1-.5 px-3 rounded text-sm transition-colors duration-150 cursor-pointer hover:text-[#717171]
            ${
              active
                ? "text-[var(--color-accent)]"
                : "text-white hover:text-[var(--color-text-muted)]"
            }
          `}
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="bottom"
          sideOffset={4}
          className="
            bg-[var(--color-input-bg)] border border-[var(--color-border)]
            text-[var(--color-text-hover)] text-[11px] font-medium
            px-2 py-1 rounded-[var(--radius-xs)]
            shadow-[var(--shadow-md)] z-[100]
            data-[state=delayed-open]:animate-in
            data-[state=delayed-open]:fade-in-0
            data-[state=delayed-open]:zoom-in-95
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=closed]:zoom-out-95
          "
        >
          {tooltip}
          <Tooltip.Arrow className="fill-[var(--color-border)]" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function MiniDropItem({
  icon,
  label,
  onClick,
  "data-test": dataTest,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  "data-test"?: string;
}) {
  return (
    <button
      data-test={dataTest}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:text-[#717171] transition-colors cursor-pointer"
    >
      <span className="text-sm opacity-70">{icon}</span>
      {label}
    </button>
  );
}

export default TrackItem;
