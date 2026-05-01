import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { getUsernameFromId } from "@/services/user.service";
import { usePlayerStore } from "@/stores/player.store";
import { useLikesStore } from "@/stores/likes.store";
import type { Track } from "@/types/track";
import type { PlaylistTrackItem } from "@/services/api/playlist/playlist.service";

const FALLBACK_COVER_URL =
  "https://cdn.prod.website-files.com/62a0a0168756b795debc65bc/65df5bfb519e57f33c35d493_419679-1x1_SoundCloudLogo_cloudmark-f5912b-large-1645807040%20(2).jpg";
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
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const navigate = useNavigate();
  const setTrack = usePlayerStore((state) => state.setTrack);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const { isTrackLiked, toggleTrack } = useLikesStore();
  const [addedToQueue, setAddedToQueue] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [artistName, setArtistName] = useState(
    (track.artist_username ?? "unknown").trim() || "unknown",
  );
  const repostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const artistStationId = track.artist_id ?? track.artist_username ?? "";
  const stationSlug = artistName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  const coverImage =
    track.cover_image ?? FALLBACK_COVER_URL;
  const playCount = track.play_count ?? 0;
  const liked = isTrackLiked(track.track_id);

  useEffect(() => {
    let cancelled = false;
    const fallbackUsername = (track.artist_username ?? "unknown").trim() || "unknown";

    setArtistName(fallbackUsername);

    if (!track.artist_id?.trim()) {
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const username = await getUsernameFromId(track.artist_id?.trim() ?? "1");
        if (!cancelled) {
          setArtistName(username || fallbackUsername);
        }
      } catch {
        if (!cancelled) {
          setArtistName(fallbackUsername);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [track.artist_id, track.artist_username]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTrack({
      id: track.track_id,
      title: track.title ?? "Untitled track",
      artistName,
      artistUsername: artistName,
      coverUrl: coverImage,
      genre: "",
      likeCount: 0,
      repostCount: 0,
      playCount,
      commentCount: 0,
      duration: formatDuration(track.duration),
      postedAt: track.added_at ?? "",
      waveformData: [],
      audioUrl: track.audio_url ?? "",
      isPrivate: !track.is_public,
    });
    onLike();
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await repostTrack(track.track_id);
      setReposted(true);
      if (repostTimerRef.current) clearTimeout(repostTimerRef.current);
      repostTimerRef.current = setTimeout(() => {
        repostTimerRef.current = null;
      }, 2000);
    } catch (err) {
      console.error("Failed to repost track:", err);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${artistName}/${track.track_id}`,
      );
      setCopySuccess(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => {
        setCopySuccess(false);
        copyTimerRef.current = null;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (repostTimerRef.current) clearTimeout(repostTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

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
      artistUsername: artistName,
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
          flex items-center gap-0 py-2 rounded min-w-0 w-full
          transition-colors duration-100 cursor-pointer relative group
           last:border-b-0
          ${isCurrent ? "bg-bg" : "hover:bg-[#303030]/50"}
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
            onError={(event) => {
              event.currentTarget.src = FALLBACK_COVER_URL;
            }}
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

        <div data-test={`track-item-meta-${track.track_id}`} className="flex-1 min-w-0 flex items-baseline gap-1.5 overflow-hidden">
          <span
            className={`text-sm shrink-0 w-5 font-bold text-right ${playbackTextClass}`}
          >
            {index}
          </span>
          <span className="text-[var(--color-text-muted)] text-sm shrink-0">
            ·
          </span>
          <Link
            to={`/${artistName}`}
            onClick={(e) => e.stopPropagation()}
            className={`text-sm shrink-0 max-w-[30%] truncate font-bold transition-colors ${playbackTextClass} hover:text-text-muted/60`}
          >
            {track.artist_name}
          </Link>
          <span className="text-[var(--color-text-muted)] text-sm shrink-0">
            ·
          </span>
          <Link
            to={`/${artistName}/${track.trackSlug ?? track.track_id}`}
            onClick={(e) => e.stopPropagation()}
            className={`text-sm font-bold truncate transition-colors ${playbackTitleClass} hover:text-text-muted/60`}
            data-test={`link-track-title-${track.track_id}`}
          >
            {track.title ?? "Untitled track"}
          </Link>
        </div>

        <div className="flex items-center shrink-0 ml-3">
          <div
            data-test={`track-item-actions-${track.track_id}`}
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
              tooltip={reposted ? "Reposted" : "Repost"}
              data-test={`button-repost-track-${track.track_id}`}
              onClick={handleRepost}
              active={reposted}
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
              onClick={handleCopyLink}
            >
              <FaRegCopy />
            </TipBtn>

            <div className="relative" data-test={`track-item-more-wrap-${track.track_id}`}>
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
                    label={addedToQueue ? "Added!" : "Add to Next up"}
                    onClick={() => {
                      // Build a Track object from the PlaylistTrackItem
                      const trackForQueue: Track = {
                        id: track.track_id,
                        title: track.title ?? "Untitled track",
                        artistName,
                        artistUsername: artistName,
                        coverUrl: coverImage,
                        genre: "",
                        likeCount: 0,
                        repostCount: 0,
                        playCount,
                        commentCount: 0,
                        duration: formatDuration(track.duration),
                        postedAt: track.added_at ?? "",
                        waveformData: [],
                        audioUrl: track.audio_url ?? "",
                        isPrivate: !track.is_public,
                      };
                      addToQueue(trackForQueue);
                      setAddedToQueue(true);
                      setTimeout(() => setAddedToQueue(false), 2000);
                      setMoreOpen(false);
                    }}
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
                    onClick={() => {
                      setMoreOpen(false);
                      if (!artistStationId) return;
                      navigate(
                        `/discover/stations/${stationSlug}:${artistStationId}`,
                      );
                    }}
                    data-test={`dropdown-station-track-${track.track_id}`}
                  />
                </div>
              )}
            </div>
          </div>

          <span
            data-test={`track-item-play-count-${track.track_id}`}
            className={`inline-flex items-center justify-end gap-1 px-2 text-[11px] text-text-muted tabular-nums w-14 text-right transition-opacity duration-150 ${
              hovered ? "opacity-0" : "opacity-100"
            }`}
          >
            <svg
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="w-3 h-3 shrink-0" 
            >
              <path
                d="M12.322 7.576a.5.5 0 0 1 0 .848l-6.557 4.098A.5.5 0 0 1 5 12.098V3.902a.5.5 0 0 1 .765-.424l6.557 4.098Z"
                fill="currentColor"
              ></path>
            </svg>
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

      {copySuccess && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 rounded-md bg-black/90 px-3 py-2 text-xs font-semibold text-white shadow-lg"
        >
          Link copied
        </div>
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
                : "text-text-upload hover:text-[var(--color-text-muted)]"
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
