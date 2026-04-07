import type { BuzzingPlaylist } from "@/services/api/discover.service";

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

  return (
    <div className={`group flex flex-col gap-2 ${widthClassName} cursor-pointer`}>
      {/* Cover */}
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        {item.cover_image && (
          <img
            src={item.cover_image}
            alt={item.genre}
            className="w-full h-full object-cover transition-all duration-200"
          />
        )}

        {/* Genre badge — bottom-left */}
        <div
          className="w-[90%] absolute left-2 bottom-2 px-2 py-1 rounded-sm"
          style={{ backgroundColor: badge.bg }}
        >
          <span
            className="text-base tracking-widest uppercase leading-none"
            style={{ color: badge.text, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
          >
            {item.genre}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute inset-0 bg-black/30" />
          <div />
          <div className="flex items-center justify-center flex-1">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-play text-black text-sm ml-0.5" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-2 pb-2">
            <button className="flex flex-col items-center gap-0.5 group/btn" onClick={(e) => e.stopPropagation()}>
              <i className="fa-sharp fa-regular fa-heart text-[12px] text-white group-hover/btn:opacity-50 transition-opacity duration-150" />
            </button>
            <button className="flex flex-col items-center gap-0.5 group/btn" onClick={(e) => e.stopPropagation()}>
              <i className="fa-solid fa-ellipsis text-[12px] text-white group-hover/btn:opacity-50 transition-opacity duration-150" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-text-secondary text-xs truncate">
        {item.track_count} tracks
      </p>
    </div>
  );
}
