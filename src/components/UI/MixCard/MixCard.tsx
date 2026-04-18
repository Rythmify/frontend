import type React from "react";
import { useNavigate } from "react-router-dom";
import type { PersonalMix } from "@/services/api/discover.service";
import { mapDiscoveryTrack } from "@/services/api/discover.mapper";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";
import { usePlayerStore } from "@/stores/player.store";

const BADGE_COLORS: { bg: string; text: string }[] = [
  { bg: "#333333", text: "#000000" }, // MIX 1 — dark gray
  { bg: "#1a6de0", text: "#000000" }, // MIX 2 — blue
  { bg: "#e8e8e8", text: "#000000" }, // MIX 3 — light
  { bg: "#ff6600", text: "#000000" }, // MIX 4 — orange
  { bg: "#ff0000", text: "#000000" }, // MIX 5 — red
];

function stableColorIndex(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return h % BADGE_COLORS.length;
}

function colorIndex(mix: PersonalMix): number {
  const match = (mix.label ?? "").match(/\d+/);
  if (match) return (parseInt(match[0], 10) - 1) % BADGE_COLORS.length;
  return stableColorIndex(mix.id);
}

// ─── Props ────────────────────────────────────────────────

interface MixCardProps {
  mix: PersonalMix;
  widthClassName?: string;
}

// ─── Component ────────────────────────────────────────────

export default function MixCard({
  mix,
  widthClassName = "w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]",
}: MixCardProps) {
  const badge = BADGE_COLORS[colorIndex(mix)];
  const { isMixLiked, toggleMix, togglePlaylist } = useLikesStore();
  const { addMix } = useHistoryStore();
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const navigate = useNavigate();
  const liked = isMixLiked(mix.id);

  // Guard against stale persisted history entries that predate the non-null contract
  const previewTrack = mix.preview_track ? mapDiscoveryTrack(mix.preview_track) : null;
  const isThisMixPlaying = isPlaying && !!previewTrack && currentTrack?.id === previewTrack.id;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewTrack) return;
    if (currentTrack?.id === previewTrack.id) {
      togglePlay();
    } else {
      setTrack(previewTrack);
      addMix(mix);
    }
  };

  const mixSlug = (mix.label ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const mixPath = `/discover/sets/${mixSlug}:${mix.id}`;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMix(mix);
    togglePlaylist({
      id: mix.id,
      title: mix.label ?? "",
      owner: `${mix.track_count} tracks`,
      coverUrl: mix.cover_image ?? mix.preview_track.cover_image ?? null,
    });
  };

  return (
    <div
      className={`group flex flex-col gap-2 ${widthClassName} shrink-0 cursor-pointer`}
      data-test={`mix-card-${mix.id}`}
      onClick={() => navigate(mixPath)}
    >
      {/* Cover */}
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        {(mix.cover_image ?? mix.preview_track.cover_image) && (
          <img
            src={(mix.cover_image ?? mix.preview_track.cover_image) as string}
            alt={mix.label ?? ""}
            className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-200"
            data-test="mix-card-image"
          />
        )}

        {/* MIX badge */}
        <div
          className="w-[90%] absolute left-2 bottom-2 px-2 py-1 rounded-sm flex items-baseline gap-1"
          style={{ backgroundColor: badge.bg }}
          data-test="mix-card-badge"
        >
          <span
            className="text-2xl tracking-widest uppercase leading-none"
            style={{
              color: badge.text,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
            }}
          >
            {mix.label ?? ""}
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
              <i
                className={`fa-solid ${isThisMixPlaying ? "fa-pause" : "fa-play"} text-black text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] ${!isThisMixPlaying ? "ml-0.5" : ""}`}
              />
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

      {/* Subtitle */}
      <p
        className="text-text-secondary text-xs truncate"
        data-test="mix-card-subtitle"
      >
        {mix.track_count} tracks
      </p>
    </div>
  );
}
