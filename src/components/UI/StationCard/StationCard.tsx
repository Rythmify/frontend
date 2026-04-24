import type React from "react";
import { useState } from "react";
import type { Station } from "@/types/station";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";
import { usePlayerStore } from "@/stores/player.store";
import { useNavigate } from "react-router-dom";
import CardOverlay, { AddToPlaylistIcon } from "@/components/UI/CardOverlay/CardOverlay";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";
// ─── Color Schemes ────────────────────────────────────────

const COLOR_SCHEMES = [
  { a: "#e91e8c", b: "#00bcd4" }, // pink   + teal
  { a: "#ff6d00", b: "#7c4dff" }, // orange + purple
  { a: "#00e676", b: "#2979ff" }, // green  + blue
  { a: "#ff1744", b: "#ffea00" }, // red    + yellow
  { a: "#d500f9", b: "#00bfa5" }, // violet + mint
];

// ─── Rings SVG Background ─────────────────────────────────

const RADII = [18, 36, 54, 72, 90, 108, 126, 144];

function StationRings({ colorIndex = 0 }: { colorIndex?: number }) {
  const { a, b } = COLOR_SCHEMES[colorIndex % COLOR_SCHEMES.length];

  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Color A rings — lower-left focal point */}
      {RADII.map((r, i) => (
        <circle
          key={`a${i}`}
          cx="55"
          cy="155"
          r={r}
          fill="none"
          stroke={a}
          strokeWidth="1.2"
          opacity={Math.max(0.04, 0.45 - i * 0.055)}
        />
      ))}
      {/* Color B rings — upper-right focal point */}
      {RADII.map((r, i) => (
        <circle
          key={`b${i}`}
          cx="155"
          cy="55"
          r={r}
          fill="none"
          stroke={b}
          strokeWidth="1.2"
          opacity={Math.max(0.04, 0.45 - i * 0.055)}
        />
      ))}
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────

interface StationCardProps {
  station: Station;
  widthClassName?: string;
  colorIndex?: number;
}

// ─── Component ────────────────────────────────────────────

export default function StationCard({
  station,
  widthClassName = "w-[200px]",
  colorIndex = 0,
}: StationCardProps) {
  const { isStationLiked, toggleStation } = useLikesStore();
  const { addStation } = useHistoryStore();
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const liked = isStationLiked(station.id);
  const navigate = useNavigate();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const isThisStationPlaying =
    isPlaying && !!station.previewTrack && currentTrack?.id === station.previewTrack.id;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!station.previewTrack) return;
    if (currentTrack?.id === station.previewTrack.id) {
      togglePlay();
    } else {
      setTrack(station.previewTrack);
      addStation(station);
    }
  };
  // Use the artists array if available, otherwise fall back to seedArtist for all 3
  const artists = station.artists?.length
    ? station.artists
    : [
        {
          avatarUrl: station.seedArtist.avatarUrl,
          displayName: station.seedArtist.displayName,
        },
        { avatarUrl: station.coverUrl ?? undefined, displayName: "" },
        { avatarUrl: undefined, displayName: "" },
      ];

  const stationSlug = (station.name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const stationPath = `/discover/stations/${stationSlug}:${station.id}`;

  return (
    <div
      className={`group flex flex-col gap-2 ${widthClassName} shrink-0 cursor-pointer`}
      data-test={`station-card-${station.id}`}
      onClick={() => navigate(stationPath)}
    >
      {/* ── Card art ─────────────────────────────────────── */}
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-[#0d0d1a]">
        {/* Rings background */}
        <StationRings colorIndex={colorIndex} />

        {/* Three artist circles */}
        {/* Circle 1 — top-left, small */}
        <div className="absolute top-[6%] left-[4%] w-[30%] aspect-square rounded-full overflow-hidden border-[2px] border-white/20 z-10">
          {artists[0]?.avatarUrl ? (
            <img
              src={artists[0].avatarUrl}
              alt={artists[0].displayName ?? ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#2a2a3a]" />
          )}
        </div>

        {/* Circle 2 — center, largest */}
        <div className="absolute top-[22%] left-[24%] w-[50%] aspect-square rounded-full overflow-hidden border-[2px] border-white/25 z-20">
          {artists[1]?.avatarUrl ? (
            <img
              src={artists[1].avatarUrl}
              alt={artists[1].displayName ?? ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#2a2a3a]" />
          )}
        </div>

        {/* Circle 3 — bottom-right, small */}
        <div className="absolute bottom-[14%] right-[4%] w-[30%] aspect-square rounded-full overflow-hidden border-[2px] border-white/20 z-10">
          {artists[2]?.avatarUrl ? (
            <img
              src={artists[2].avatarUrl}
              alt={artists[2].displayName ?? ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#2a2a3a]" />
          )}
        </div>

        {/* SoundCloud logo — top-right */}
        <div className="absolute top-2 right-2 opacity-60 z-30">
          <i className="fa-brands fa-soundcloud text-text-hover" />
        </div>

        {/* "STATION" + name overlay — bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-30">
          <p className="text-[9px] font-bold tracking-widest text-white/80 uppercase leading-none mb-0.5">
            STATION
          </p>
          <p className="text-white text-sm font-semibold truncate leading-tight drop-shadow">
            {station.name}
          </p>
        </div>

        <CardOverlay
          isPlaying={isThisStationPlaying}
          onPlay={handlePlay}
          isLiked={liked}
          onLike={(e) => { e.stopPropagation(); toggleStation(station); }}
          overlayZClass="z-40"
          dataTestPrefix="station-card"
          itemId={station.id}
          moreMenuItems={[
            {
              label: "Add to playlist",
              iconNode: AddToPlaylistIcon,
              onClick: () => setShowPlaylistModal(true),
            },
          ]}
        />
      </div>

      {/* ── Below-card text ───────────────────────────────── */}
      <div className="flex flex-col gap-0.5">
        <p className="text-white text-sm font-semibold truncate leading-tight">
          {station.name}
        </p>
        <p className="text-[#999] text-xs truncate">
          {station.seedArtist.displayName} · Artist station
        </p>
      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal
          trackId={station.previewTrack?.id}
          trackTitle={station.name}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
}
