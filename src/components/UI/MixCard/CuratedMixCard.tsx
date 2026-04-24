import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CuratedHomeMixPreview } from "@/services/api/discover.service";
import { mapDiscoveryTrack } from "@/services/api/discover.mapper";
import { usePlayerStore } from "@/stores/player.store";
import { useLikesStore } from "@/stores/likes.store";
import CardOverlay, { AddToPlaylistIcon } from "@/components/UI/CardOverlay/CardOverlay";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";

interface Props {
  mix: CuratedHomeMixPreview;
  widthClassName?: string;
}

export default function CuratedMixCard({
  mix,
  widthClassName = "w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]",
}: Props) {
  const navigate = useNavigate();
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { isPlaylistLiked, togglePlaylist } = useLikesStore();
  const liked = isPlaylistLiked(mix.mix_id);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlaylist({
      id: mix.mix_id,
      title: mix.title,
      owner: mix.preview_track?.artist_name ?? "",
      coverUrl: mix.cover_url ?? null,
    });
  };

  const previewTrack = mix.preview_track
    ? mapDiscoveryTrack(mix.preview_track)
    : null;
  const isThisPlaying =
    isPlaying && !!previewTrack && currentTrack?.id === previewTrack.id;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewTrack) return;
    if (currentTrack?.id === previewTrack.id) {
      togglePlay();
    } else {
      setTrack(previewTrack);
    }
  };

  const coverSrc = mix.cover_url ?? mix.preview_track?.cover_image ?? null;
  const mixPath = `/rythmify/sets/${mix.mix_id}`;

  return (
    <div
      className={`group flex flex-col gap-2 ${widthClassName} shrink-0 cursor-pointer`}
      data-test={`curated-mix-card-${mix.mix_id}`}
      onClick={() => navigate(mixPath)}
    >
      {/* Cover */}
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        {coverSrc && (
          <img
            src={coverSrc}
            alt={mix.title}
            className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-200"
            data-test="curated-mix-card-image"
          />
        )}

        {/* Title badge */}
        <div
          className="w-[90%] absolute left-2 bottom-2 px-2 py-1 rounded-sm"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
          data-test="curated-mix-card-badge"
        >
          <span
            className="text-white text-xs font-semibold leading-tight line-clamp-2 uppercase tracking-wide"
          >
            {mix.title}
          </span>
        </div>

        <CardOverlay
          isPlaying={isThisPlaying}
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
        data-test="curated-mix-card-subtitle"
      >
        {mix.preview_track?.artist_name ?? mix.preview_track?.genre_name ?? ""}
      </p>

      {showPlaylistModal && (
        <AddToPlaylistModal
          playlistId={mix.mix_id}
          trackTitle={mix.title}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
}
