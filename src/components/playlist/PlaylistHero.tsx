import { FaPlay, FaPause, FaLock } from "react-icons/fa";
import { type PlaylistDetails } from "@/services/api/playlist/playlist.service";
import { useAuthStore } from "@/stores/auth.store";
import { useRef, useState, useEffect } from "react";
import PlaylistStatsWaveform from "./PlaylistStatsWaveform";

const COLOR_SCHEMES = [
  { a: "#e91e8c", b: "#00bcd4" },
  { a: "#ff6d00", b: "#7c4dff" },
  { a: "#00e676", b: "#2979ff" },
  { a: "#ff1744", b: "#ffea00" },
  { a: "#d500f9", b: "#00bfa5" },
];

const BADGE_COLORS: { bg: string; text: string }[] = [
  { bg: "#333333", text: "#000000" }, // MIX 1 — dark gray
  { bg: "#1a6de0", text: "#000000" }, // MIX 2 — blue
  { bg: "#e8e8e8", text: "#000000" }, // MIX 3 — light
  { bg: "#ff6600", text: "#000000" }, // MIX 4 — orange
  { bg: "#ff0000", text: "#000000" }, // MIX 5 — red
];

const RADII = [18, 36, 54, 72, 90, 108, 126, 144];

function StationRings({ colorIndex = 0 }: { colorIndex?: number }) {
  const { a, b } = COLOR_SCHEMES[colorIndex % COLOR_SCHEMES.length];

  return (
    <svg
      viewBox="0 0 200 200"
      data-test="playlist-hero-station-rings"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
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

interface PlaylistHeroProps {
  playlist: PlaylistDetails;
  isPlaying?: boolean;
  activeTrackId?: string;
  onPlayPause?: () => void;
  onImageUpload?: (file: File) => void | Promise<void>;
  showUploadButton?: boolean;
  ownerUsername?: string | null;
  moreOfLike?: boolean;
  coverImages?: Array<string | null | undefined>;
  isStation?: boolean;
  colorIndex?: number;
  isMix?: boolean;
}

export default function PlaylistHero({
  playlist,
  isPlaying = false,
  activeTrackId,
  onPlayPause,
  onImageUpload,
  showUploadButton = true,
  ownerUsername,
  moreOfLike = false,
  coverImages,
  isStation = false,
  colorIndex = 0,
  isMix = false,
}: PlaylistHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const badge = BADGE_COLORS[colorIndex % BADGE_COLORS.length];

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    setPreviewUrl(null);
  }, [playlist.playlist_id]);

  const heroTitle = moreOfLike
    ? `Related Tracks: ${playlist.tracks[0]?.title ?? "Related Tracks"}`
    : isStation
      ? ownerUsername
        ? `${ownerUsername}'s Station`
        : "Station"
      : playlist.name;

  const ownerLabel = moreOfLike
    ? `Made for ${user?.displayName ?? "you"}`
    : isStation
      ? "Artist Station"
      : user?.username === ownerUsername || user?.id === playlist.owner_user_id
        ? user?.displayName
        : ownerUsername || playlist.owner_user_id;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);

      if (onImageUpload) {
        void onImageUpload(file);
      }
    }
  };

  return (
    <div
      ref={heroRef}
      data-test="playlist-hero"
      className="container m-auto px-4 md:px-8 lg:px-5 py-6 w-full flex flex-row md:flex-row items-stretch gap-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #6b7280 100%)",
        minHeight: "380px",
      }}
    >
      {/* Left Content Section */}
      <div className="flex-1 flex flex-col justify-between z-10">
        {/* Top Section: Play + Title */}
        <div className="flex items-start gap-6">
          {/* Play / Pause Button */}
          <button
            data-test="button-play-pause-hero-playlist"
            onClick={onPlayPause}
            className="w-14 h-14 rounded-full bg-[#111] border-0 cursor-pointer flex items-center justify-center shrink-0 transition-transform hover:scale-105"
          >
            {isPlaying ? (
              <FaPause className="text-white text-xl" />
            ) : (
              <FaPlay className="text-white text-xl ml-1" />
            )}
          </button>

          {/* Title Block */}
          <div className="flex flex-col items-start">
            <div className="bg-[#121212] px-4 py-3">
              <h1 className="text-2xl md:text-3xl text-white font-bold tracking-tight leading-tight">
                {heroTitle}
              </h1>

              {/* Privacy Badge inside Title Block */}
              <div className="mt-2">
                {!playlist.is_public ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#333] rounded text-[10px] uppercase tracking-wider font-bold text-gray-300">
                    <FaLock size={8} /> Private
                  </span>
                ) : (
                  ""
                )}
              </div>
            </div>

            {/* "Playlist owner" */}
            <div className="bg-[#121212] px-4 py-1.5">
              <p className="text-[17px] text-white hover:text-[#484848] font-bold cursor-pointer transition-colors">
                {ownerLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Circular Stats Badge + Comments */}
        <div className="flex items-end w-full">
          <PlaylistStatsWaveform
            playlist={playlist}
            isPlaying={isPlaying}
            activeTrackId={activeTrackId}
          />
        </div>
      </div>

      {/* Right Content Section: Cover Art */}
      <div className="hidden md:flex shrink-0 items-center justify-center py-4 z-10">
        <div className="relative group">
          {coverImages?.some(Boolean) ? (
            <div className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-md overflow-hidden shadow-2xl border border-white/5 bg-[#0d0d1a]">
              {isStation && (
                <>
                  <StationRings colorIndex={colorIndex} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_28%)]" />
                  <div className="absolute top-2 right-2 opacity-60 z-30">
                    <i className="fa-brands fa-soundcloud text-text-hover" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-30">
                    <p className="text-[9px] font-bold tracking-widest text-white/80 uppercase leading-none mb-0.5">
                      STATION
                    </p>
                    <p className="text-white text-sm font-semibold truncate leading-tight drop-shadow">
                      {heroTitle}
                    </p>
                  </div>
                </>
              )}
              {isMix && (
                <div
                  className="absolute left-3 bottom-3 px-2 py-1 rounded-sm flex items-center gap-2 shadow-lg"
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
                    MIX
                  </span>
                </div>
              )}
              {!isStation && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_28%)]" />
              )}
              <div className="absolute top-[6%] left-[4%] w-[30%] aspect-square rounded-full overflow-hidden border-[2px] border-white/20">
                <img
                  src={
                    previewUrl ||
                    coverImages?.[0] ||
                    playlist.cover_image ||
                    "https://picsum.photos/seed/playlist-1/600/600"
                  }
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-[22%] left-[24%] w-[50%] aspect-square rounded-full overflow-hidden border-[2px] border-white/25">
                <img
                  src={
                    previewUrl ||
                    coverImages?.[1] ||
                    coverImages?.[0] ||
                    playlist.cover_image ||
                    "https://picsum.photos/seed/playlist-2/600/600"
                  }
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-[14%] right-[4%] w-[30%] aspect-square rounded-full overflow-hidden border-[2px] border-white/20">
                <img
                  src={
                    previewUrl ||
                    coverImages?.[2] ||
                    coverImages?.[1] ||
                    playlist.cover_image ||
                    "https://picsum.photos/seed/playlist-3/600/600"
                  }
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <img
              src={
                previewUrl ||
                playlist.cover_image ||
                "https://picsum.photos/seed/playlist/600/600"
              }
              alt={playlist.name}
              className="w-64 h-64 lg:w-80 lg:h-80 object-cover shadow-2xl rounded-md border border-white/5"
            />
          )}
          {/*Show Upload Button*/}
          {showUploadButton ? (
            <div className="absolute inset-0 transition-all flex flex-col justify-end items-center pb-4">
              <button
                data-test="button-upload-cover-hero-playlist"
                onClick={handleUploadClick}
                className="flex items-center gap-2 bg-bg hover:text-[#717171] text-white text-sm font-bold py-2.5 px-3 rounded-sm transition-colors cursor-pointer"
              >
                Replace image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
