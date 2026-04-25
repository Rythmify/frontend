import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PersonalMix } from "@/services/api/discover.service";
import { getMixTracks } from "@/services/api/discover.service";
import { mapDiscoveryTrack } from "@/services/api/discover.mapper";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";
import { usePlayerStore } from "@/stores/player.store";
import CardOverlay, { AddToPlaylistIcon } from "@/components/UI/CardOverlay/CardOverlay";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";

const BADGE_COLORS: { bg: string; text: string }[] = [
  { bg: "#B3A2F2", text: "#000000" }, // MIX 1 — dark gray
  { bg: "#4D83DB", text: "#000000" }, // MIX 2 — blue
  { bg: "#ffffff", text: "#000000" }, // MIX 5 — red
  { bg: "#FE5500", text: "#000000" }, // MIX 3 — light
  { bg: "#000000", text: "#ffffff" }, // MIX 4 — orange
  
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
  index?: number;
  widthClassName?: string;
}

// ─── Component ────────────────────────────────────────────

export default function MixCard({
  mix,
  index,
  widthClassName = "w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]",
}: MixCardProps) {
  const mixId = mix.mix_id ?? mix.id;
  const displayLabel = index !== undefined ? `Mix ${index + 1}` : (mix.label ?? "");
  const badge = BADGE_COLORS[index !== undefined ? index % BADGE_COLORS.length : colorIndex(mix)];
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
          className="w-[90%] absolute left-2 bottom-2 px-1.5 py-0.3 sm:px-2 sm:py-0.5 rounded-sm flex items-baseline gap-1"
          style={{ backgroundColor: badge.bg }}
          data-test="mix-card-badge"
        >
          <span
            className="text-sm sm:text-md md:text-lg lg:text-xl tracking-tighter uppercase leading-none"
            style={{
              color: badge.text,
              fontFamily: "Söhne, system-ui, -apple-system, Roboto, Ubuntu, Cantarell, sans-serif, Roboto, sans-serif",
              fontWeight: 900,
            
            }}
          >
            {displayLabel}
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
          trackTitle={mix.label ?? ""}
          fetchTracks={async () => {
            const data = await getMixTracks(mixId);
            return data.tracks.map((t) => ({
              id: t.id,
              title: t.title,
              artistName: t.artist_name ?? undefined,
              coverUrl: t.cover_image ?? undefined,
            }));
          }}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
}
