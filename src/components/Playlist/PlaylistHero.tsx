import { useRef } from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaPause, FaLock, FaGlobeAmericas } from "react-icons/fa";
import type { Playlist } from "@/services/api/playlist/playlist.service";

interface Comment {
  id: number;
  avatarUrl: string;
  timestamp: number;
}

interface PlaylistHeroProps {
  playlist: Playlist;
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

export default function PlaylistHero({
  playlist,
  isPlaying = false,
  onPlayPause,
}: PlaylistHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={heroRef}
      data-test="playlist-hero"
      className="container m-auto px-4 md:px-8 lg:px-10 py-8 w-full flex flex-row items-stretch gap-10 relative overflow-hidden text-white"
      style={{
        background: "#4a3a35",
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
          <div className="flex flex-col gap-1 items-start">
            <div className="bg-[#0b0b0b] px-4 py-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
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
            <div className="bg-[#0b0b0b] px-4 py-1.5">
              <p className="text-[17px] text-text-secondary hover:text-[#484848] font-bold">
                {playlist.owner_user_id}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Circular Stats Badge */}
        <div className="flex items-end">
          <div className="w-24 h-24 rounded-full bg-bg flex flex-col items-center justify-center">
            <span className="text-[28px] font-bold leading-none text-text-upload">
              {playlist.track_count}
            </span>
            <span className="text-[14px] uppercase tracking-widest font-bold text-text-upload mt-1">
              Tracks
            </span>
            {/* Total duration placeholder - usually calculated from tracks list */}
            <span className="text-[14px] text-text-secondary mt-1">
              1:06:29
            </span>
          </div>
        </div>
      </div>

      {/* Right Content Section: Cover Art */}
      <div className="hidden md:flex shrink-0 items-center justify-center py-4">
        <div className="relative group">
          <img
            src={
              playlist.cover_image ||
              "https://picsum.photos/seed/playlist/600/600"
            }
            alt={playlist.name}
            className="w-64 h-64 lg:w-80 lg:h-80 object-cover shadow-2xl rounded-md border border-white/5"
          />
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
        </div>
      </div>
    </div>
  );
}
