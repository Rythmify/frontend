import type React from "react";
import { useLikesStore } from "@/stores/likes.store";

// ─── Types ────────────────────────────────────────────────

export interface MadeForYouItem {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  /** e.g. ["DAILY", "DROPS"] or ["WEEKLY", "WAVE"] */
  badgeWords: [string, string];
  badgeBg?: string;
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
  const { isPlaylistLiked, togglePlaylist } = useLikesStore();
  const liked = isPlaylistLiked(item.id);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlaylist({ id: item.id, title: item.title, owner: item.subtitle, coverUrl: item.coverUrl });
  };

  return (
    <div className={`group flex flex-col gap-2 ${widthClassName} cursor-pointer`}>
      {/* Cover */}
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        <img
          src={item.coverUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-all duration-200"
        />

        {/* SoundCloud logo — top-right */}
        <div className="absolute top-2 right-2 opacity-70 z-10">
          <i className="fa-brands fa-soundcloud text-white text-base" />
        </div>

        {/* Badge — bottom */}
        <div
          className="w-[90%] absolute left-2 bottom-2 px-2 py-1 rounded-sm flex items-baseline gap-1.5"
          style={{ backgroundColor: bg }}
        >
          <span
            className="text-2xl uppercase leading-none text-white"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: "italic" }}
          >
            {item.badgeWords[0]}
          </span>
          <span
            className="text-2xl uppercase leading-none text-white"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
          >
            {item.badgeWords[1]}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          <div />
          <div className="flex items-center justify-center flex-1">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-play text-black text-sm ml-0.5" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-2 pb-2">
            <button className="flex flex-col items-center gap-0.5 group/btn" onClick={handleLike}>
              <i className={`fa-sharp ${liked ? "fa-solid fa-heart text-[#e74c3c]" : "fa-regular fa-heart text-white"} text-[12px] group-hover/btn:opacity-50 transition-opacity duration-150`} />
            </button>
            <button className="flex flex-col items-center gap-0.5 group/btn" onClick={(e) => e.stopPropagation()}>
              <i className="fa-solid fa-ellipsis text-[12px] text-white group-hover/btn:opacity-50 transition-opacity duration-150" />
            </button>
          </div>
        </div>
      </div>

      {/* Text */}
      <p className="text-white text-sm font-semibold truncate">{item.title}</p>
      <p className="text-text-secondary text-xs truncate">{item.subtitle}</p>
    </div>
  );
}
