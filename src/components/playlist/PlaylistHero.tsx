import { useEffect, useState } from "react";
import { FaPlay, FaPause, FaLock } from "react-icons/fa";
import { type PlaylistDetails } from "@/services/api/playlist/playlist.service";
import { useAuthStore } from "@/stores/auth.store";
import PlaylistCover from "./PlaylistCover";
import PlaylistStatsWaveform from "./PlaylistStatsWaveform";
import { getGenres } from "@/services/api/upload/track.service";

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
  isForYou?: boolean;
  forYouBadgeWords?: [string, string];
  colorIndex?: number;
  isMix?: boolean;
  moreOfLikeTitle?: string;
  genreLabel?: string | null;
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
  isForYou = false,
  forYouBadgeWords,
  colorIndex = 0,
  isMix = false,
  moreOfLikeTitle,
  genreLabel,
}: PlaylistHeroProps) {
  const { user } = useAuthStore();
  const [resolvedGenre, setResolvedGenre] = useState<string | null>(
    genreLabel ?? null,
  );

  const formatTimeAgo = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";

    const diffMs = Date.now() - date.getTime();
    const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const minutes = Math.floor(diffSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years === 1 ? "" : "s"} ago`;
    if (months > 0) return `${months} month${months === 1 ? "" : "s"} ago`;
    if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    return "Just now";
  };

  useEffect(() => {
    let cancelled = false;

    async function resolveGenreName() {
      if (genreLabel) {
        setResolvedGenre(genreLabel);
        return;
      }

      if (!playlist.genre_id) {
        setResolvedGenre(playlist.subtype === "album" ? "Album" : null);
        return;
      }

      const genres = await getGenres();
      const match = genres.find((genre) => genre.id === playlist.genre_id);

      if (!cancelled) {
        setResolvedGenre(match?.name ?? playlist.genre_id ?? null);
      }
    }

    resolveGenreName().catch(() => {
      if (!cancelled) {
        setResolvedGenre(
          playlist.genre_id ?? (playlist.subtype === "album" ? "Album" : null),
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [genreLabel, playlist.genre_id, playlist.subtype]);

  const createdAtLabel = formatTimeAgo(
    playlist.release_date ?? playlist.created_at,
  );

  const heroTitle = moreOfLike
    ? `Related Tracks: ${
        moreOfLikeTitle ?? playlist.tracks[0]?.title ?? "Related Tracks"
      }`
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

  return (
    <div
      data-test="playlist-hero"
      className="container m-auto px-4 py-6 w-full flex flex-col lg:flex-row items-stretch gap-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #6b7280 100%)",
        minHeight: "380px",
      }}
    >
      {/* Left Content Section */}
      <div
        data-test="playlist-hero-main"
        className="flex-1 flex flex-col justify-between z-10"
      >
        {/* Top Section: Play + Title */}
        <div data-test="playlist-hero-header" className="flex items-start gap-6">
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
          <div data-test="playlist-hero-title-block" className="flex flex-col items-start">
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
                ) : null}
              </div>
            </div>

            {/* "Playlist owner" */}
            <div data-test="playlist-hero-owner" className="bg-[#121212] px-4 py-1.5">
              <p className="text-[17px] text-white font-bold cursor-pointer">
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

      {/* Right Side: Metadata and Cover */}
      <div
        data-test="playlist-hero-meta"
        className="flex flex-col items-start lg:items-end gap-4 shrink-0 z-10"
      >
        {/* Time and Genre tags */}
        <div className="flex flex-col items-end gap-2 mt-2">
          <span className="text-white text-[13px] font-medium whitespace-nowrap">
            {createdAtLabel}
          </span>
          {resolvedGenre && (
            <span className="bg-black/50 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
              # {resolvedGenre}
            </span>
          )}
        </div>
      </div>

      {/* Playlist Cover at the bottom right */}
      <div data-test="playlist-hero-cover" className="shrink-0 z-10">
        <PlaylistCover
          playlistId={playlist.playlist_id}
          playlistName={playlist.name}
          coverImage={playlist.cover_image}
          coverImages={coverImages}
          showUploadButton={showUploadButton}
          onImageUpload={onImageUpload}
          isStation={isStation}
          isForYou={isForYou}
          forYouBadgeWords={forYouBadgeWords}
          isMix={isMix}
          isMoreOfLike={moreOfLike}
          colorIndex={colorIndex}
        />
      </div>
    </div>
  );
}
