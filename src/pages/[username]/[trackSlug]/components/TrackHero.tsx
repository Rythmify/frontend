import { useRef } from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaPause, FaLock } from "react-icons/fa";
import TrackWaveform, { type TrackWaveformHandle } from "./TrackWaveform";
import type { Track } from "../../../../types/track";

interface Comment {
  id: number;
  avatarUrl: string;
  timestamp: number; 
}

interface TrackHeroProps {
  track: Track;
  comments?: Comment[];
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

export default function TrackHero({
  track,
  comments = [],
  isPlaying = false,
  onPlayPause,
}: TrackHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<TrackWaveformHandle>(null);

  const handlePlayPause = () => {
    waveformRef.current?.playPause();
    onPlayPause?.();
  };

  return (
    <div
      ref={heroRef}
      data-test="track-hero"
      className="container m-auto px-4 md:px-8 lg:px-5 py-6 w-full flex flex-row md:flex-row items-stretch gap-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #6b7280 100%)",
          minHeight: "380px",
      }}
    >
      {/* ── Left / Main Section ── */}
      <div className="flex-1 flex flex-col justify-between p-4 md:p-6 md:pb-4 min-w-0 z-10">

        {/* Top Row: Play Button + Title Block + Meta */}
        <div className="flex flex-row items-start gap-4 md:gap-4">

          {/* Play / Pause Button */}
          <button
            data-test="button-play-pause-hero"
            onClick={handlePlayPause}
            className="w-12 h-12 md:w-16 md:h-16 min-w-[48px] md:min-w-[64px] rounded-full bg-[#111] border-0 cursor-pointer flex items-center justify-center shrink-0 mt-1 transition-colors duration-150 hover:bg-[#333]"
          >
            {isPlaying ? (
              <FaPause className="text-white text-lg md:text-[22px]" />
            ) : (
              <FaPlay className="text-white text-lg md:text-[22px] ml-[2px] md:ml-[3px]" />
            )}
          </button>

          {/* Title Block — background fits content only, not full width */}
          <div className="inline-block px-3 py-2 md:px-4 md:py-3 rounded-sm max-w-[min(560px,100%)]">

            {/* Title — wraps naturally, no truncation */}
            <div className="bg-black px-3 pt-2">
                <h1
              data-test="track-title"
              className="text-white text-base md:text-[22px] font-bold m-0 leading-[1.3] shrinkwrap"
              style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
            >
              {track.title}
            </h1>


            {/* Private Badge */}
            {track.isPrivate && (
              <div
                data-test="badge-private"
                className="inline-flex items-center gap-[5px] mt-2 bg-white/[0.18] rounded px-[2px] py-[2.5px] text-[10px] text-[#ccc] tracking-[0.06em] uppercase"
              >
                <FaLock className="text-[8px]" />
                Private
              </div>
            )}
            </div>
             <div className="bg-black px-3 inline-block">
            <Link
              data-test="track-artist-link"
              to={`/${track.artistUsername}`}
              className="text-[#837979] text-sm font-bold no-underline inline-block my-0 transition-colors duration-150 hover:text-white pb-2"
            >
              {track.artistName}
            </Link>
          </div>
             </div>
            
          {/* Meta: Posted At + Genre Tag — hidden on very small screens */}
          <div className="hidden sm:flex flex-col items-start justify-end gap-2 ml-auto shrink-0 pt-1.5">
            <span
              data-test="track-posted-at"
              className="text-[#e5e7eb] text-[13px] font-medium whitespace-nowrap"
            >
              {track.postedAt}
            </span>

            {track.genre && (
              <span
                data-test="track-genre-tag"
                className="bg-black/50 text-[#e5e7eb] text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap cursor-pointer transition-colors duration-150 hover:bg-black/75"
              >
                # {track.genre}
              </span>
            )}
          </div>
        </div>

        {/* Meta on small screens — shown below title block */}
        <div className="flex sm:hidden flex-row items-center gap-2 mt-3">
          <span
            data-test="track-posted-at-mobile"
            className="text-[#e5e7eb] text-xs font-medium"
          >
            {track.postedAt}
          </span>
          {track.genre && (
            <span
              data-test="track-genre-tag-mobile"
              className="bg-black/50 text-[#e5e7eb] text-xs font-semibold px-3 py-1 rounded-full cursor-pointer"
            >
              # {track.genre}
            </span>
          )}
        </div>

        {/* ── Waveform + Comment Avatars ── */}
        <div className="mt-6 md:mt-8 relative">

          {/* Waveform */}
          <div data-test="track-waveform-container">
            <TrackWaveform ref={waveformRef} track={track} />
          </div>

          {/* Comment avatars pinned along the waveform */}
          {comments.length > 0 && (
            <div
              data-test="track-comment-avatars"
              className="relative h-7 mt-1"
            >
              {comments.map((c) => {
                const [m, s] = track.duration.split(":").map(Number);
                const totalSec = (m || 0) * 60 + (s || 0) || 191;
                const leftPct = Math.min((c.timestamp / totalSec) * 100, 100);
                return (
                  <img
                    key={c.id}
                    src={c.avatarUrl}
                    alt="commenter"
                    title={`${Math.floor(c.timestamp / 60)}:${String(
                      c.timestamp % 60
                    ).padStart(2, "0")}`}
                    className="absolute top-0 w-6 h-6 rounded-full border border-white/40 object-cover cursor-pointer -translate-x-1/2"
                    style={{ left: `${leftPct}%` }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Track Cover — hidden on mobile ── */}
      {track.coverUrl && (
        <div
          data-test="track-cover"
          className="hidden md:flex w-[280px] lg:w-[340px] shrink-0 items-center justify-center p-4 pl-0"
        >
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full max-h-[300] object-cover object-bottom block rounded-sm"
          />
        </div>
      )}
    </div>
  );
}