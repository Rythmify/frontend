import type React from "react";
import { useNavigate } from "react-router-dom";
import { useLikesStore } from "@/stores/likes.store";
import { usePlayerStore } from "@/stores/player.store";
import { useHistoryStore } from "@/stores/history.store";
import type { Track } from "@/types/track";

// ─── Types ────────────────────────────────────────────────

export interface MadeForYouItem {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  madeKind?: "daily" | "weekly";
  /** e.g. ["DAILY", "DROPS"] or ["WEEKLY", "WAVE"] */
  badgeWords: [string, string];
  badgeBg?: string;
  previewTrack?: Track;
}

// ─── Props ────────────────────────────────────────────────

interface MadeForYouCardProps {
  item: MadeForYouItem;
  widthClassName?: string;
}

// ─── Component ────────────────────────────────────────────

export default function MadeForYouCard({
  item,
  widthClassName = "w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]",
}: MadeForYouCardProps) {
  const bg = item.badgeBg ?? "#1a237e";
  const navigate = useNavigate();
  const { isPlaylistLiked, togglePlaylist } = useLikesStore();
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { addMadeForYou } = useHistoryStore();
  const liked = isPlaylistLiked(item.id);
  const isThisPlaying = isPlaying && !!item.previewTrack && currentTrack?.id === item.previewTrack.id;
  const handleNavigate = () => {
    if (!item.madeKind) return;
    navigate(`/discover/sets/new-for-you/${item.madeKind}/${item.id}`);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.previewTrack) return;
    if (currentTrack?.id === item.previewTrack.id) {
      togglePlay();
    } else {
      setTrack(item.previewTrack);
      addMadeForYou(item);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlaylist({
      id: item.id,
      title: item.title,
      owner: item.subtitle,
      coverUrl: item.coverUrl,
    });
  };

  return (
    <div
      className={`group flex flex-col gap-2 ${widthClassName} shrink-0 ${item.madeKind ? "cursor-pointer" : ""}`}
      data-test={`made-for-you-card-${item.id}`}
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (!item.madeKind) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNavigate();
        }
      }}
      role={item.madeKind ? "link" : undefined}
      tabIndex={item.madeKind ? 0 : undefined}
    >
      {/* Cover */}
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        <img
          src={item.coverUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-all duration-200"
          data-test="made-for-you-card-image"
        />

        {/* SoundCloud logo — top-right */}
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 opacity-70 z-10">
          <i className="fa-brands fa-soundcloud text-white text-xs sm:text-base" />
        </div>

        {/* Badge — bottom */}
        <div
          className="w-[90%] absolute left-2 bottom-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-sm flex items-baseline gap-1"
          style={{ backgroundColor: bg }}
          data-test="made-for-you-card-badge"
        >
          <span
            className="text-sm sm:text-lg md:text-xl lg:text-2xl uppercase leading-none text-white"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontStyle: "italic",
            }}
          >
            {item.badgeWords[0]}
          </span>
          <span
            className="text-sm sm:text-lg md:text-xl lg:text-2xl uppercase leading-none text-white"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
            }}
          >
            {item.badgeWords[1]}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          <div />
          <div className="flex items-center justify-center flex-1">
            <button
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
              onClick={handlePlay}
              data-test="button-play"
            >
              <i className={`fa-solid ${isThisPlaying ? "fa-pause" : "fa-play"} text-black text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] ${!isThisPlaying ? "ml-0.5" : ""}`} />
            </button>
          </div>
          <div className="flex items-center justify-end gap-2 px-2 pb-2">
            <button
              className="flex flex-col items-center gap-0.5 group/btn"
              onClick={handleLike}
              data-test="button-like"
            >
              <i
                className={`fa-sharp ${liked ? "fa-solid fa-heart text-[#e74c3c]" : "fa-regular fa-heart text-white"} text-[12px] group-hover/btn:opacity-50 transition-opacity duration-150`}
              />
            </button>
            <button
              className="flex flex-col items-center gap-0.5 group/btn"
              onClick={(e) => e.stopPropagation()}
              data-test="button-more"
            >
              <i className="fa-solid fa-ellipsis text-[12px] text-white group-hover/btn:opacity-50 transition-opacity duration-150" />
            </button>
          </div>
        </div>
      </div>

      {/* Text */}
      <p
        className="text-text-hover text-xs sm:text-sm font-semibold truncate"
        data-test="made-for-you-card-title"
      >
        {item.title}
      </p>
      <p
        className="text-text-secondary text-xs truncate"
        data-test="made-for-you-card-subtitle"
      >
        {item.subtitle}
      </p>
    </div>
  );
}
