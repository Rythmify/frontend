import type React from "react";
import { useHistoryStore } from "@/stores/history.store";
export interface BuzzingPlaylist {
  id: string;
  genre: string;
  cover_image: string | null;
  track_count: number;
}
import { useLikesStore } from "@/stores/likes.store";

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

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          <div />
          <div className="flex items-center justify-center flex-1">
            <button
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
              onClick={(e) => { e.stopPropagation(); addGenre(item); }}
              data-test="button-play"
            >
              <i className="fa-solid fa-play text-black text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] ml-0.5" />
            </button>
          </div>
          <div className="flex items-center justify-end gap-2 px-2 pb-2">
            <button
              className="flex flex-col items-center gap-0.5 group/btn"
              data-test={`button-like-genre-${item.id}`}
              onClick={handleLike}
            >
              <i
                className={`fa-sharp ${liked ? "fa-solid fa-heart text-[#e74c3c]" : "fa-regular fa-heart text-white"} text-[12px] group-hover/btn:opacity-50 transition-opacity duration-150`}
              />
            </button>
            {/* <button
              className="flex flex-col items-center gap-0.5 group/btn"
              data-test={`button-more-genre-${item.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <i className="fa-solid fa-ellipsis text-[12px] text-white group-hover/btn:opacity-50 transition-opacity duration-150" />
            </button> */}
          </div>
        </div>
      </div>

    </div>
  );
}
