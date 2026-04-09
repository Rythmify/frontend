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
import SharePopup from "../../pages/[username]/[trackSlug]/components/SharePopup";
import type { Track } from "../../../src/types/track";

interface TrackListProps {
  tracks: any[];
  currentTrackId?: string;
  isPlaying?: boolean;
  onTrackPlay?: (track: any) => void;
}

export default function TrackList({
  tracks,
  currentTrackId,
  isPlaying,
  onTrackPlay,
}: TrackListProps) {
  const safeTracks = Array.isArray(tracks) ? tracks : [];

  return (
    <Tooltip.Provider delayDuration={400} skipDelayDuration={100}>
      <div data-test="track-list" className="flex flex-col w-full">
        {safeTracks.map((item, index) => {
          // Internal Mapping
          const trackData = {
            id: item.track_id || item.id,
            title: item.title ?? "Untitled",
            artist: item.artist_name || item.artistName || "Unknown Artist",
            artistSlug:
              item.artist_username || item.artistUsername || "unknown",
            image: item.cover_image || item.coverUrl || "",
            plays: item.play_count || item.playCount || 0,
            duration: item.duration || "0:00",
          };

          return (
            <TrackRow
              key={trackData.id}
              data={trackData}
              index={index + 1}
              isCurrent={trackData.id === currentTrackId}
              isPlaying={isPlaying && trackData.id === currentTrackId}
              onPlay={() => onTrackPlay?.(item)}
            />
          );
        })}
      </div>
    </Tooltip.Provider>
  );
}

function TrackRow({ data, index, isCurrent, isPlaying, onPlay }: any) {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <div
        className={`flex items-center gap-0 py-2 transition-colors duration-100 cursor-pointer group border-b border-[#222] ${
          isCurrent ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onPlay}
      >
        {/* Artwork */}
        <div className="relative w-10 h-10 shrink-0 mr-4 ml-2">
          <img
            src={data.image}
            alt=""
            className="w-10 h-10 object-cover rounded"
          />
          {(hovered || isCurrent) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
              {isPlaying ? (
                <FaPause className="text-accent text-xs" />
              ) : (
                <FaPlay
                  className={`text-xs ${isCurrent ? "text-accent" : "text-white"}`}
                />
              )}
            </div>
          )}
        </div>

        {/* Index and Info */}
        <div className="flex-1 min-w-0 flex items-baseline gap-2">
          <span
            className={`text-xs w-4 text-right ${isCurrent ? "text-accent" : "text-gray-500"}`}
          >
            {index}
          </span>
          <Link
            to={`/${data.artistSlug}`}
            className={`text-sm truncate hover:underline ${isCurrent ? "text-accent" : "text-gray-400"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {data.artist}
          </Link>
          <span className="text-gray-600 text-xs">—</span>
          <span
            className={`text-sm truncate font-medium ${isCurrent ? "text-accent" : "text-gray-200"}`}
          >
            {data.title}
          </span>
        </div>

        {/* Right side: Actions / Plays */}
        <div className="flex items-center px-4">
          {hovered ? (
            <div className="flex items-center gap-1">
              <ActionButton
                active={liked}
                onClick={() => setLiked(!liked)}
                data-test={`button-like-track`}
              >
                <FaHeart />
              </ActionButton>
              <ActionButton
                onClick={() => setShareOpen(true)}
                data-test={`button-share-track`}
              >
                <HiUpload />
              </ActionButton>
              <ActionButton data-test={`button-more-track`}>
                <FaEllipsisH />
              </ActionButton>
            </div>
          ) : (
            <span
              className={`text-[11px] tabular-nums ${isCurrent ? "text-accent" : "text-gray-500"}`}
            >
              {data.plays.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {shareOpen && (
        <SharePopup track={data} onClose={() => setShareOpen(false)} />
      )}
    </>
  );
}

function ActionButton({
  children,
  onClick,
  active,
  "data-test": dataTest,
}: any) {
  return (
    <button
      data-test={dataTest}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`p-2 rounded hover:bg-white/10 transition-colors ${active ? "text-accent" : "text-white"}`}
    >
      {children}
    </button>
  );
}
