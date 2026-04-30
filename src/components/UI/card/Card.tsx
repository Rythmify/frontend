import type { Track } from "@/types/track";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "@/stores/player.store";
import { useLikesStore } from "@/stores/likes.store";
import { getRelatedTracks } from "@/services/track.service";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";
import CardOverlay, {
  AddToPlaylistIcon,
} from "@/components/UI/CardOverlay/CardOverlay";

// ─── Props ────────────────────────────────────────────────
interface TrackCardProps {
  track: Track;
  widthClassName?: string;
  addToPlaylistTracks?: Track[];
  contextQueue?: Track[];
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
  overlay: `
    absolute inset-0
    flex flex-col
    justify-between
    opacity-0 group-hover:opacity-100
    transition-opacity duration-200
  `,
  overlayBg: `
    absolute inset-0 bg-black/30 pointer-events-none
  `,
  overlayCenter: `
    flex items-center justify-center
    flex-1
  `,
  overlayBottom: `
    flex items-center justify-end
    gap-2 px-2 pb-2
  `,
  likeButton: `
    fa-sharp fa-regular fa-heart
    text-[10px] text-white
  `,
  likeButtonActive: `
    fa-sharp fa-solid fa-heart
    text-[10px] text-[#e74c3c]
  `,
  moreButton: `
    fa-solid fa-ellipsis
    text-[10px] text-white
  `,
  playButton: `
    w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
    bg-white
    rounded-full
    flex items-center justify-center
  `,
  playIcon: `
    text-white text-lg pl-1
  `,
  title: `
    text-text-hover text-sm font-semibold
    truncate w-full
  `,
  artist: `
    text-text-secondary text-xs
    truncate w-full
  `,
  actionButton: `
    flex flex-col items-center gap-0.5
    group/btn
  `,
  actionIcon: `
    text-[12px] text-white
    group-hover/btn:opacity-50
    transition-opacity duration-150
  `,
  actionIconActive: `
    text-[12px] text-red-500
    group-hover/btn:opacity-50
    transition-opacity duration-150
  `,
  actionLabel: `
    text-white text-[8px]
    opacity-0 group-hover/btn:opacity-100
    transition-opacity duration-150
  `,
};

// ─── Component ────────────────────────────────────────────
const TrackCard = ({
  track,
  widthClassName,
  addToPlaylistTracks,
  contextQueue,
}: TrackCardProps) => {
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const navigate = useNavigate();
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { isTrackLiked, toggleTrack } = useLikesStore();

  const fetchTracksForModal = useCallback(async () => {
    if (addToPlaylistTracks?.length) {
      const { tracks } = await getRelatedTracks(String(track.id));
      return tracks.map((t) => ({
        id: String(t.id),
        title: t.title,
        artistName: t.artistName ?? "",
        coverUrl: t.coverUrl ?? undefined,
      }));
    }
    return [
      {
        id: String(track.id),
        title: track.title,
        artistName: track.artistName,
        coverUrl: track.coverUrl ?? undefined,
      },
    ];
  }, [track.id, track.title, track.artistName, track.coverUrl, addToPlaylistTracks]);

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
      if (contextQueue) {
        setTrack(track, contextQueue);
      } else {
        usePlayerStore.getState().playContext("track", track.id, track);
      }
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
          onLike={(e) => {
            e.stopPropagation();
            toggleTrack(track);
          }}
          moreMenuItems={[
            {
              label: "Add to playlist",
              iconNode: AddToPlaylistIcon,
              onClick: () => setShowPlaylistModal(true),
            },
          ]}
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
          trackTitle={
            addToPlaylistTracks?.length ? "More of what you like" : track.title
          }
          fetchTracks={fetchTracksForModal}
          moreOfLike={!!addToPlaylistTracks?.length}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
};

export default TrackCard;
