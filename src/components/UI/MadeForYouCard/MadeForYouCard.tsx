import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLikesStore } from "@/stores/likes.store";
import { usePlayerStore } from "@/stores/player.store";
import { useHistoryStore } from "@/stores/history.store";
import type { Track } from "@/types/track";
import CardOverlay, { AddToPlaylistIcon } from "@/components/UI/CardOverlay/CardOverlay";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";
import { getMadeForYouDaily, getMadeForYouWeekly } from "@/services/api/playlist/playlist.service";

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
  const { isMixLiked, toggleMix } = useLikesStore();
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { addMadeForYou } = useHistoryStore();
  const liked = isMixLiked(item.id);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const isThisPlaying =
    isPlaying &&
    !!item.previewTrack &&
    currentTrack?.id === item.previewTrack.id;
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
    toggleMix({ id: item.id });
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

        <CardOverlay
          isPlaying={isThisPlaying}
          onPlay={handlePlay}
          isLiked={liked}
          onLike={handleLike}
          moreMenuItems={[
            {
              label: "Add to playlist",
              iconNode: AddToPlaylistIcon,
              onClick: () => setShowPlaylistModal(true),
            },
          ]}
        />
      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal
          fetchTracks={() =>
            (item.madeKind === "daily"
              ? getMadeForYouDaily()
              : getMadeForYouWeekly()
            ).then((r) =>
              r.tracks.map((t) => ({
                id: t.id,
                title: t.title,
                artistName: t.artist_name,
                coverUrl: t.cover_image ?? undefined,
              })),
            )
          }
          trackTitle={item.title}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}

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
