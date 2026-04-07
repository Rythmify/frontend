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
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-play text-black text-sm ml-0.5" />
            </div>
          </div>
          <button
            className="absolute bottom-2 right-10 text-[#e74c3c] text-base hover:scale-110 transition-transform z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fa-solid fa-heart" />
          </button>
          <button
            className="absolute bottom-2.5 right-2.5 text-white/80 text-xs hover:text-white transition-colors tracking-widest z-10"
            onClick={(e) => e.stopPropagation()}
          >
            •••
          </button>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-text-secondary text-xs truncate">
        {item.track_count} tracks
      </p>
    </div>
  );
}
