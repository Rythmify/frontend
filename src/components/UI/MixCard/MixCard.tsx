import type { PersonalMix } from "@/services/api/discover.service";

// ─── Badge colors per mix index ───────────────────────────

const BADGE_COLORS: { bg: string; text: string }[] = [
  { bg: "#333333", text: "#ffffff" }, // MIX 1 — dark gray
  { bg: "#1a6de0", text: "#ffffff" }, // MIX 2 — blue
  { bg: "#e8e8e8", text: "#000000" }, // MIX 3 — light
  { bg: "#ff6600", text: "#ffffff" }, // MIX 4 — orange
  { bg: "#ff0000", text: "#ffffff" }, // MIX 5 — red
];

// ─── Props ────────────────────────────────────────────────

interface MixCardProps {
  mix: PersonalMix;
  index?: number;
  widthClassName?: string;
}

// ─── Component ────────────────────────────────────────────

export default function MixCard({
  mix,
  index = 0,
  widthClassName = "w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]",
}: MixCardProps) {
  const badge = BADGE_COLORS[index % BADGE_COLORS.length];

  return (
    <div className={`group flex flex-col gap-2 ${widthClassName} cursor-pointer`}>
      {/* Cover */}
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        {mix.cover_image && (
          <img
            src={mix.cover_image}
            alt={mix.label}
            className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-200"
          />
        )}

        {/* MIX badge — bottom-left */}
        <div
          className="w-[90%] absolute left-2 bottom-2 px-2 py-1 rounded-sm flex items-baseline gap-1"
          style={{ backgroundColor: badge.bg }}
        >
          <span
            className="text-base tracking-widest uppercase leading-none"
            style={{ color: badge.text, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
          >
            {mix.label}
          </span>
        </div>

        {/* Hover play */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-play text-black text-sm ml-0.5" />
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-text-secondary text-xs truncate">
        {mix.track_count} tracks
      </p>
    </div>
  );
}
