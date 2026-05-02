import { useState } from "react";
import { Link } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  FaPlay,
  FaPause,
  FaHeart,
  FaEllipsisH,
  FaListUl,
  FaPlus,
  FaBroadcastTower,
} from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { HiUpload } from "react-icons/hi";
import { FaRegCopy } from "react-icons/fa";
import SharePopup from "./SharePopup";
import type { Track } from "../../../../types/track";

interface TrackListProps {
  tracks: Track[];
  currentTrackId?: string;
  isPlaying?: boolean;
  onTrackPlay?: (track: Track) => void;
  onTrackLike?: (track: Track) => void;
}

export default function TrackList({
  tracks,
  currentTrackId,
  isPlaying = false,
  onTrackPlay,
  onTrackLike,
}: TrackListProps) {
  // Guard against undefined / non-array during loading
  const safeTracks = Array.isArray(tracks) ? tracks : [];

  return (
    <Tooltip.Provider delayDuration={400} skipDelayDuration={100}>
      <div data-test="track-list" className="flex flex-col w-full">
        {safeTracks.map((track, index) => (
          <TrackRow
            key={track.id}
            track={track}
            index={index + 1}
            isCurrent={track.id === currentTrackId}
            isPlaying={isPlaying && track.id === currentTrackId}
            onPlay={() => onTrackPlay?.(track)}
            onLike={() => onTrackLike?.(track)}
          />
        ))}
      </div>
    </Tooltip.Provider>
  );
}

// Individual Row
function TrackRow({
  track,
  index,
  isCurrent,
  isPlaying,
  onPlay,
  onLike,
}: {
  track: Track;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onLike: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((p) => !p);
    onLike();
  };

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <>
      <div
        data-test={`track-row-${track.id}`}
        className={`
          flex items-center gap-0 py-2 rounded
          transition-colors duration-100 cursor-pointer relative group
          border-b border-[var(--color-border)] last:border-b-0
          ${isCurrent ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"}
        `}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setMoreOpen(false);
        }}
        onClick={onPlay}
      >
        {/* Artwork with play/pause overlay */}
        <div className="relative w-10 h-10 shrink-0 mr-3">
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-10 h-10 object-cover rounded"
          />
          {(hovered || isCurrent) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
              <button
                data-test={`button-play-track-${track.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay();
                }}
                className="text-white cursor-pointer"
              >
                {isPlaying ? (
                  <FaPause className="text-[var(--color-accent)] text-sm" />
                ) : (
                  <FaPlay className="text-sm ml-[1px]" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Number · Artist · Title */}
        <div className="flex-1 min-w-0 flex items-baseline gap-1.5 overflow-hidden">
          <span
            className={`text-sm shrink-0 w-5 text-right ${isCurrent ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}`}
          >
            {index}
          </span>
          <span className="text-[var(--color-text-muted)] text-xs shrink-0">
            ·
          </span>
          <Link
            to={`/${track.artistUsername}`}
            onClick={(e) => e.stopPropagation()}
            className={`text-sm shrink-0 font-medium transition-colors hover:underline ${
              isCurrent
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-hover)]"
            }`}
          >
            {track.artistName}
          </Link>
          <span className="text-[var(--color-text-muted)] text-xs shrink-0">
            ·
          </span>
          <Link
            to={`/${track.artistUsername || "unknown"}/${track.trackSlug || track.id}`}
            onClick={(e) => e.stopPropagation()}
            className={`text-sm font-bold truncate hover:underline ${isCurrent ? "text-[var(--color-accent)]" : "text-[var(--color-text-hover)]"}`}
          >
            {track.title}
          </Link>
        </div>

        {/* ── Right: hover icons OR play count ── */}
        <div className="flex items-center shrink-0 ml-3">
          {/* Hover action icons */}
          <div
            className={`flex items-center gap-0.5 transition-opacity duration-150 ${hovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            {/* Like */}
            <TipBtn
              tooltip="Like"
              data-test={`button-like-track-${track.id}`}
              onClick={handleLike}
              active={liked}
            >
              <FaHeart />
            </TipBtn>

            {/* Repost */}
            <TipBtn
              tooltip="Repost"
              data-test={`button-repost-track-${track.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <BiRepost className="text-base" />
            </TipBtn>

            {/* Share — opens SharePopup */}
            <TipBtn
              tooltip="Share"
              data-test={`button-share-track-${track.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setShareOpen(true);
              }}
            >
              <HiUpload />
            </TipBtn>

            {/* Copy link */}
            <TipBtn
              tooltip="Copy link"
              data-test={`button-copy-link-track-${track.id}`}
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(
                  `${window.location.origin}/${track.artistUsername}/${track.id}`,
                );
              }}
            >
              <FaRegCopy />
            </TipBtn>

            {/* More (...) */}
            <div className="relative">
              <TipBtn
                tooltip="More"
                data-test={`button-more-track-${track.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setMoreOpen((p) => !p);
                }}
              >
                <FaEllipsisH />
              </TipBtn>

              {moreOpen && (
                <div
                  data-test={`dropdown-more-track-${track.id}`}
                  className="absolute right-0 top-full mt-1 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] shadow-[var(--shadow-md)] z-50 min-w-[180px] py-1"
                >
                  <MiniDropItem
                    icon={<FaPlus />}
                    label="Add to Next up"
                    onClick={() => setMoreOpen(false)}
                    data-test={`dropdown-next-up-track-${track.id}`}
                  />
                  <MiniDropItem
                    icon={<FaListUl />}
                    label="Add to Playlist"
                    onClick={() => setMoreOpen(false)}
                    data-test={`dropdown-playlist-track-${track.id}`}
                  />
                  <MiniDropItem
                    icon={<FaBroadcastTower />}
                    label="Station"
                    onClick={() => setMoreOpen(false)}
                    data-test={`dropdown-station-track-${track.id}`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Play count */}
          <span
            className={`text-xs text-[var(--color-text-muted)] tabular-nums w-14 text-right transition-opacity duration-150 ${hovered ? "opacity-0" : "opacity-100"}`}
          >
            ▶ {formatCount(track.playCount)}
          </span>
        </div>
      </div>

      {/* Share popup — rendered outside the row  */}
      {shareOpen && (
        <SharePopup track={track} onClose={() => setShareOpen(false)} />
      )}
    </>
  );
}

// Tooltip-wrapped action button
// white by default, darker on hover
function TipBtn({
  children,
  onClick,
  tooltip,
  active = false,
  "data-test": dataTest,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
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
            p-2 rounded text-sm transition-colors duration-150 cursor-pointer
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

// Dropdown item
function MiniDropItem({
  icon,
  label,
  onClick,
  "data-test": dataTest,
}: {
  icon: React.ReactNode;
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
      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[var(--color-text)] hover:bg-white/5 hover:text-[var(--color-text-hover)] transition-colors cursor-pointer"
    >
      <span className="text-sm opacity-70">{icon}</span>
      {label}
    </button>
  );
}
