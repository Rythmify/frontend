import type React from "react";
import { useState } from "react";
import { useHistoryStore } from "@/stores/history.store";
import { useLikesStore } from "@/stores/likes.store";
import CardOverlay, { AddToPlaylistIcon } from "@/components/UI/CardOverlay/CardOverlay";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";
import { getTrendingByGenre } from "@/services/api/discover.service";

export interface BuzzingPlaylist {
  id: string;
  genre: string;
  cover_image: string | null;
  track_count: number;
}

// ─── Badge colors per genre index ─────────────────────────

const BADGE_COLORS: { bg: string; text: string }[] = [
  { bg: "#333333", text: "#000000" },
  { bg: "#1a6de0", text: "#000000" },
  { bg: "#e8e8e8", text: "#000000" },
  { bg: "#ff6600", text: "#000000" },
  { bg: "#ff0000", text: "#000000" },
];

// ─── Props ────────────────────────────────────────────────

interface GenreCardProps {
  item: BuzzingPlaylist;
  index?: number;
  widthClassName?: string;
}

// ─── Component ────────────────────────────────────────────

export default function GenreCard({
  item,
  index = 0,
  widthClassName = "w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]",
}: GenreCardProps) {
  const badge = BADGE_COLORS[index % BADGE_COLORS.length];
  const { isPlaylistLiked, togglePlaylist } = useLikesStore();
  const { addGenre } = useHistoryStore();
  const liked = isPlaylistLiked(item.id);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    addGenre(item);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlaylist({
      id: item.id,
      title: item.genre,
      owner: `${item.track_count} tracks`,
      coverUrl: item.cover_image,
    });
  };

  return (
    <div
      className={`group flex flex-col gap-2 ${widthClassName} shrink-0 cursor-pointer`}
      data-test={`genre-card-${item.id}`}
    >
      {/* Cover */}
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        {item.cover_image && (
          <img
            src={item.cover_image}
            alt={item.genre}
            className="w-full h-full object-cover transition-all duration-200"
            data-test="genre-card-image"
          />
        )}

        {/* Genre badge — bottom-left */}
        <div
          className="w-[90%] absolute left-2 bottom-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-sm"
          style={{ backgroundColor: badge.bg }}
          data-test="genre-card-badge"
        >
          <span
            className="text-xs sm:text-sm md:text-base lg:text-lg tracking-widest uppercase leading-none"
            style={{
              color: badge.text,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
            }}
          >
            {item.genre}
          </span>
        </div>

        <CardOverlay
          isPlaying={false}
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
            getTrendingByGenre(item.id).then((r) =>
              r.tracks.map((t) => ({
                id: t.id,
                title: t.title,
                artistName: t.artist_name ?? "",
                coverUrl: t.cover_image ?? undefined,
              })),
            )
          }
          trackTitle={item.genre}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
}
