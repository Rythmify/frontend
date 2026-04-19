import type React from "react";
import type { CuratedHomeMixPreview } from "@/services/api/discover.service";
import { mapDiscoveryTrack } from "@/services/api/discover.mapper";
import { usePlayerStore } from "@/stores/player.store";

interface Props {
  mix: CuratedHomeMixPreview;
  widthClassName?: string;
}

export default function CuratedMixCard({
  mix,
  widthClassName = "w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]",
}: Props) {
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();

  const previewTrack = mix.preview_track
    ? mapDiscoveryTrack(mix.preview_track)
    : null;
  const isThisPlaying =
    isPlaying && !!previewTrack && currentTrack?.id === previewTrack.id;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewTrack) return;
    if (currentTrack?.id === previewTrack.id) {
      togglePlay();
    } else {
      setTrack(previewTrack);
    }
  };

  const coverSrc = mix.cover_url ?? mix.preview_track?.cover_image ?? null;

  return (
    <div
      className={`group flex flex-col gap-2 ${widthClassName} shrink-0 cursor-pointer`}
      data-test={`curated-mix-card-${mix.mix_id}`}
    >
      {/* Cover */}
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        {coverSrc && (
          <img
            src={coverSrc}
            alt={mix.title}
            className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-200"
            data-test="curated-mix-card-image"
          />
        )}

        {/* Title badge */}
        <div
          className="w-[90%] absolute left-2 bottom-2 px-2 py-1 rounded-sm"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
          data-test="curated-mix-card-badge"
        >
          <span
            className="text-white text-xs font-semibold leading-tight line-clamp-2 uppercase tracking-wide"
          >
            {mix.title}
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
                className={`fa-solid ${isThisPlaying ? "fa-pause" : "fa-play"} text-black text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] ${!isThisPlaying ? "ml-0.5" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <p
        className="text-text-secondary text-[10px] sm:text-xs truncate"
        data-test="curated-mix-card-subtitle"
      >
        {mix.preview_track?.artist_name ?? mix.preview_track?.genre_name ?? ""}
      </p>
    </div>
  );
}
