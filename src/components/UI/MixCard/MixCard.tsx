import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PersonalMix } from "@/services/api/discover.service";
import { mapDiscoveryTrack } from "@/services/api/discover.mapper";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";
import { usePlayerStore } from "@/stores/player.store";
import CardOverlay, { AddToPlaylistIcon } from "@/components/UI/CardOverlay/CardOverlay";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";

const BADGE_COLORS: { bg: string; text: string }[] = [
  { bg: "#333333", text: "#000000" }, // MIX 1 — dark gray
  { bg: "#1a6de0", text: "#000000" }, // MIX 2 — blue
  { bg: "#e8e8e8", text: "#000000" }, // MIX 3 — light
  { bg: "#ff6600", text: "#000000" }, // MIX 4 — orange
  { bg: "#ff0000", text: "#000000" }, // MIX 5 — red
];

function stableColorIndex(id: string): number {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
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
  const mixId = mix.mix_id ?? mix.id;
  const badge = BADGE_COLORS[colorIndex(mix)];
  const { isMixLiked, toggleMix } = useLikesStore();
  const { addMix } = useHistoryStore();
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const navigate = useNavigate();
  // API sends mix_id; the TypeScript interface says id — coalesce both
  const liked = isMixLiked(mixId);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

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
      addMix({ ...mix, id: mixId });
    }
  };


 const mixPath = `/discover/sets/${mixId}`;
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMix(mix);
  };

  return (
    <div
      className={`group flex flex-col gap-2 ${widthClassName} shrink-0 cursor-pointer`}
      data-test={`mix-card-${mixId}`}
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
          className="w-[90%] absolute left-2 bottom-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-sm flex items-baseline gap-1"
          style={{ backgroundColor: badge.bg }}
          data-test="mix-card-badge"
        >
          <span
            className="text-sm sm:text-lg md:text-xl lg:text-2xl tracking-widest uppercase leading-none"
            style={{
              color: badge.text,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
            }}
          >
            {mix.label ?? ""}
          </span>
        </div>

        <CardOverlay
          isPlaying={isThisMixPlaying}
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

      {/* Subtitle */}
      <p
        className="text-text-secondary text-[10px] sm:text-xs truncate"
        data-test="mix-card-subtitle"
      >
        {mix.track_count} tracks
      </p>

      {showPlaylistModal && (
        <AddToPlaylistModal
          playlistId={mixId}
          trackTitle={mix.label ?? ""}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
}
