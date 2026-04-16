import { FaPlay, FaPause, FaLock } from "react-icons/fa";
import { type PlaylistDetails } from "@/services/api/playlist/playlist.service";
import { useAuthStore } from "@/stores/auth.store";
import { useRef, useState, useEffect } from "react";
import PlaylistStatsWaveform from "./PlaylistStatsWaveform";

interface PlaylistHeroProps {
  playlist: PlaylistDetails;
  isPlaying?: boolean;
  activeTrackId?: string;
  onPlayPause?: () => void;
  onImageUpload?: (file: File) => void;
  showUploadButton?: boolean;
}

export default function PlaylistHero({
  playlist,
  isPlaying = false,
  activeTrackId,
  onPlayPause,
  onImageUpload,
  showUploadButton = true,
}: PlaylistHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    setPreviewUrl(null);
  }, [playlist.cover_image]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);

      if (onImageUpload) {
        onImageUpload(file);
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
            <div className="bg-bg px-4 py-3">
              <h1 className="text-2xl md:text-3xl text-text-upload font-bold tracking-tight leading-tight">
                {playlist.name}
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
            <div className="bg-bg px-4 py-1.5">
              <p className="text-[17px] text-text-upload hover:text-[#484848] font-bold cursor-pointer transition-colors">
                {user?.displayName === playlist.owner_user_id
                  ? user?.displayName
                  : playlist.owner_user_id}
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
      <div className="hidden md:flex shrink-0 items-center justify-center py-4">
        <div className="relative group">
          <img
            src={
              previewUrl ||
              playlist.cover_image ||
              "https://picsum.photos/seed/playlist/600/600"
            }
            alt={playlist.name}
            className="w-64 h-64 lg:w-80 lg:h-80 object-cover shadow-2xl rounded-md border border-white/5"
          />
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
