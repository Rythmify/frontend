import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "@/stores/player.store";
import { useLikesStore } from "@/stores/likes.store";
import { useAuthStore } from "@/stores/auth.store";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";
import { useHistoryStore } from "@/stores/history.store";
import CardOverlay, {
  AddToPlaylistIcon,
} from "@/components/UI/CardOverlay/CardOverlay";
import type { Track } from "@/types/track";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PlaylistCardData = {
  id: string;
  title: string;
  owner: string;
  ownerUsername?: string;
  slug?: string | null;
  coverUrl: string | null;
  isPrivate?: boolean;
  isLiked?: boolean;
  isAlbumView?: boolean;
  previewTrack?: Track;
};

interface PlaylistCardProps {
  item: PlaylistCardData;
  widthClassName?: string;
}

// ─── Component ────────────────────────────────────────────

export default function PlaylistCard({
  item,
  widthClassName = "w-[200px]",
}: PlaylistCardProps) {
  const navigate = useNavigate();
  const { isPlaylistLiked, togglePlaylist, isAlbumLiked, toggleAlbum } =
    useLikesStore();
  const { currentTrack, isPlaying, togglePlay, setTrack } = usePlayerStore();
  const { user } = useAuthStore();
  const { addPlaylist } = useHistoryStore();

  // Local State
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  // Derived State
  const liked = item.isAlbumView
    ? isAlbumLiked(item.id)
    : isPlaylistLiked(item.id);
  const isThisPlaying =
    isPlaying && !!item.previewTrack && currentTrack?.id === item.previewTrack.id;

  const ownerDisplay = UUID_RE.test(item.owner)
    ? (user?.displayName ?? user?.username ?? item.owner)
    : (item.ownerUsername ?? item.owner);

  // SoundCloud navigation format: /[username]/sets/[slug]
  const playlistPath = item.isAlbumView
    ? `/${item.ownerUsername || item.owner}/album/${item.slug || item.id}`
    : `/${item.ownerUsername || item.owner}/sets/${item.slug || item.id}`;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.previewTrack) return;
    if (currentTrack?.id === item.previewTrack.id) {
      togglePlay();
    } else {
      setTrack(item.previewTrack);
      addPlaylist(item);
    }
  };

  return (
    <div
      className={`group flex flex-col gap-2 ${widthClassName} shrink-0 cursor-pointer`}
      onClick={() => navigate(playlistPath)}
      data-test="playlist-card"
    >
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-75"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fa-solid fa-music text-3xl text-gray-500" />
          </div>
        )}

        <CardOverlay
          isPlaying={isThisPlaying}
          onPlay={handlePlayClick}
          isLiked={liked}
          onLike={(e) => {
            e.stopPropagation();
            if (item.isAlbumView) {
              toggleAlbum({
                playlist_id: item.id,
                name: item.title,
                cover_image: item.coverUrl,
              } as any);
            } else {
              togglePlaylist(item);
            }
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

      {/* Title & Metadata */}
      <div>
        <p className="text-white text-sm font-semibold truncate w-full flex items-center gap-1">
          {item.isPrivate && (
            <i className="fa-solid fa-lock text-[10px] text-gray-400 shrink-0" />
          )}
          {item.isLiked && (
            <i className="fa-solid fa-heart text-[10px] text-white shrink-0" />
          )}
          <span className="truncate">{item.title}</span>
        </p>
        <p className="text-gray-400 text-xs truncate w-full">{ownerDisplay}</p>
      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal
          playlistId={item.id}
          trackTitle={item.title}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
}
