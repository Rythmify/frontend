import { FaPlay, FaPause, FaLock } from "react-icons/fa";
import { type PlaylistDetails } from "@/services/api/playlist/playlist.service";
import { useAuthStore } from "@/stores/auth.store";
import PlaylistCover from "./PlaylistCover";
import PlaylistStatsWaveform from "./PlaylistStatsWaveform";

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
  colorIndex?: number;
  isMix?: boolean;
  moreOfLikeTitle?: string;
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
  colorIndex = 0,
  isMix = false,
  moreOfLikeTitle,
}: PlaylistHeroProps) {
  const { user } = useAuthStore();
  const heroTitle = moreOfLike
    ? `Related Tracks: ${moreOfLikeTitle ?? playlist.tracks[0]?.title ?? "Related Tracks"}`
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
      data-for-you={isForYou ? "true" : undefined}
      className="container m-auto px-4 py-6 w-full flex flex-row md:flex-row items-stretch gap-6 relative overflow-hidden"
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
                ) : null}
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
      <PlaylistCover
        playlistId={playlist.playlist_id}
        playlistName={playlist.name}
        coverImage={playlist.cover_image}
        coverImages={coverImages}
        showUploadButton={showUploadButton}
        onImageUpload={onImageUpload}
        isStation={isStation}
        isForYou={isForYou}
        isMix={isMix}
        isMoreOfLike={moreOfLike}
        colorIndex={colorIndex}
      />
    </div>
  );
}
