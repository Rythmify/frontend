import type { Track } from "@/types/track";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "@/stores/player.store";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";
import CardOverlay, { AddToPlaylistIcon } from "@/components/UI/CardOverlay/CardOverlay";

// ─── Props ────────────────────────────────────────────────
interface TrackCardProps {
  track: Track;
  widthClassName?: string;
}

// ─── Styles ───────────────────────────────────────────────
const styles = {
  card: (widthClassName?: string) => `
    group flex flex-col gap-2
    ${widthClassName ?? "w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]"}
    cursor-pointer shrink-0
  `,
  imageWrapper: `
    relative w-full aspect-square
    rounded-md overflow-hidden
  `,
  image: `
    w-full h-full object-cover
    text-white
    transition-all duration-200
  `,
  title: `
    text-text-hover text-sm font-semibold
    truncate w-full
  `,
  artist: `
    text-text-secondary text-xs
    truncate w-full
  `,
};

// ─── Component ────────────────────────────────────────────
const TrackCard = ({ track, widthClassName }: TrackCardProps) => {
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const navigate = useNavigate();
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { isTrackLiked, toggleTrack } = useLikesStore();
  const { addTrack } = useHistoryStore();

  const liked = isTrackLiked(track.id);

  // Check if this card's track is the one currently playing
  const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;
  const playlistSlug = (track.trackSlug ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const playlistPath = `/discover/personalised/${playlistSlug}:${track.id}`;
  // Handler for play button click (play/pause toggle)
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      setTrack(track);
      addTrack(track);
    }
  };

  return (
    <div
      className={styles.card(widthClassName)}
      onClick={() => navigate(playlistPath)}
      data-test="card-track"
    >
      <div className={styles.imageWrapper}>
        <img
          src={track.coverUrl}
          alt={track.title}
          className={styles.image}
          data-test="trackcard-image"
        />
        <CardOverlay
          isPlaying={isThisTrackPlaying}
          onPlay={handlePlayClick}
          isLiked={liked}
          onLike={(e) => { e.stopPropagation(); toggleTrack(track); }}
          moreMenuItems={[{ label: "Add to playlist", iconNode: AddToPlaylistIcon, onClick: () => setShowPlaylistModal(true) }]}
        />
      </div>
      <p className={styles.title} data-test="trackcard-title">
        {track.title}
      </p>
      <p className={styles.artist} data-test="trackcard-artist">
        {track.artistName}
      </p>

      {showPlaylistModal && (
        <AddToPlaylistModal
          trackTitle={track.title}
          trackId={track.id}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
};

export default TrackCard;
