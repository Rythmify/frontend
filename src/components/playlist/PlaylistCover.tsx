import { useEffect, useRef, useState } from "react";

const COLOR_SCHEMES = [
  { a: "#e91e8c", b: "#00bcd4" },
  { a: "#ff6d00", b: "#7c4dff" },
  { a: "#00e676", b: "#2979ff" },
  { a: "#ff1744", b: "#ffea00" },
  { a: "#d500f9", b: "#00bfa5" },
];

const BADGE_COLORS: { bg: string; text: string }[] = [
  { bg: "#333333", text: "#000000" },
  { bg: "#1a6de0", text: "#000000" },
  { bg: "#e8e8e8", text: "#000000" },
  { bg: "#ff6600", text: "#000000" },
  { bg: "#ff0000", text: "#000000" },
];

const RADII = [18, 36, 54, 72, 90, 108, 126, 144];

function StationRings({ colorIndex = 0 }: { colorIndex?: number }) {
  const { a, b } = COLOR_SCHEMES[colorIndex % COLOR_SCHEMES.length];

  return (
    <svg
      viewBox="0 0 200 200"
      data-test="playlist-cover-station-rings"
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

interface PlaylistCoverProps {
  playlistId: string;
  playlistName: string;
  coverImage?: string | null;
  previewUrl?: string | null;
  coverImages?: Array<string | null | undefined>;
  showUploadButton?: boolean;
  onUploadClick?: () => void;
  onImageUpload?: (file: File) => void | Promise<void>;
  isStation?: boolean;
  isForYou?: boolean;
  isMix?: boolean;
  isMoreOfLike?: boolean;
  colorIndex?: number;
}

export default function PlaylistCover({
  playlistId,
  playlistName,
  coverImage,
  previewUrl,
  coverImages,
  showUploadButton = true,
  onUploadClick,
  onImageUpload,
  isStation = false,
  isForYou = false,
  isMix = false,
  isMoreOfLike = false,
  colorIndex = 0,
}: PlaylistCoverProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const badge = BADGE_COLORS[colorIndex % BADGE_COLORS.length];
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setLocalPreviewUrl(null);
  }, [playlistId]);

  const handleUploadClick = () => {
    if (onUploadClick) {
      onUploadClick();
      return;
    }
    fileInputRef.current?.click();
  };

  const src =
    previewUrl ||
    localPreviewUrl ||
    coverImages?.[0] ||
    coverImage ||
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80";

  const body = (
    <div data-test="playlist-cover-body" className="relative group">
      {isForYou ? (
        <div className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-md overflow-hidden shadow-2xl border border-white/5 bg-input-bg">
          <img
            src={src}
            alt={playlistName}
            className="w-full h-full object-cover transition-all duration-200"
          />

          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 opacity-70 z-10">
            <i className="fa-brands fa-soundcloud text-white text-xs sm:text-base" />
          </div>

          <div
            className="w-[90%] absolute left-2 bottom-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-sm flex items-baseline gap-1"
            style={{ backgroundColor: badge.bg }}
            data-test="for-you-card-badge"
          >
            <span
              className="text-sm sm:text-lg md:text-xl lg:text-2xl uppercase leading-none text-white"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontStyle: "italic",
              }}
            >
              FOR
            </span>
            <span
              className="text-sm sm:text-lg md:text-xl lg:text-2xl uppercase leading-none text-white"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
              }}
            >
              YOU
            </span>
          </div>
        </div>
      ) : coverImages?.some(Boolean) ? (
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
                  {playlistName}
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

          {isMoreOfLike && (
            <div
              className="absolute left-3 bottom-3 px-2 py-1 rounded-sm flex items-center gap-2 shadow-lg"
              style={{ backgroundColor: badge.bg }}
              data-test="more-of-like-card-badge"
            >
              <span
                className="text-sm sm:text-lg md:text-xl lg:text-2xl tracking-widest uppercase leading-none"
                style={{
                  color: badge.text,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                }}
              >
                RELATED
              </span>
            </div>
          )}

          {!isStation && !isForYou && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_28%)]" />
          )}

          <div className="absolute top-[6%] left-[4%] w-[30%] aspect-square rounded-full overflow-hidden border-[2px] border-white/20">
            <img
              src={previewUrl || localPreviewUrl || coverImages?.[0] || coverImage || "https://unsplash.com/photos/close-up-view-of-retro-audio-cassette-and-pencils-on-pink-backdrop-DWWjwQfLmqE"}
              alt={playlistName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-[22%] left-[24%] w-[50%] aspect-square rounded-full overflow-hidden border-[2px] border-white/25">
            <img
              src={previewUrl || localPreviewUrl || coverImages?.[1] || coverImages?.[0] || coverImage || "https://picsum.photos/seed/playlist-2/600/600"}
              alt={playlistName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-[14%] right-[4%] w-[30%] aspect-square rounded-full overflow-hidden border-[2px] border-white/20">
            <img
              src={previewUrl || localPreviewUrl || coverImages?.[2] || coverImages?.[1] || coverImage || "https://picsum.photos/seed/playlist-3/600/600"}
              alt={playlistName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={playlistName}
          className="w-64 h-64 lg:w-80 lg:h-80 object-cover shadow-2xl rounded-md border border-white/5"
        />
      )}

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
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setLocalPreviewUrl(URL.createObjectURL(file));
              if (onImageUpload) {
                void onImageUpload(file);
              }
            }}
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      data-test="playlist-cover-wrapper"
      className="hidden md:flex shrink-0 items-center justify-center py-4 z-10"
    >
      {body}
    </div>
  );
}
