import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "@/stores/player.store";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";
import CardOverlay, { AddToPlaylistIcon } from "@/components/UI/CardOverlay/CardOverlay";
import type { Track } from "@/types/track";
import type { Playlist } from "@/services/api/playlist/playlist.service";

export interface AlbumCardItem {
  id: string;
  title: string;
  owner: string;
  ownerId: string;
  ownerUsername?: string | null;
  slug?: string | null;
  coverUrl: string | null;
  trackCount: number;
  likeCount: number;
  createdAt?: string;
  previewTrack?: Track;
  previewTrackId?: string | null;
}

interface AlbumCardProps {
  item: AlbumCardItem;
  widthClassName?: string;
}

export default function AlbumCard({
  item,
  widthClassName = "w-[200px]",
}: AlbumCardProps) {
  const navigate = useNavigate();
  const { isAlbumLiked, toggleAlbum } = useLikesStore();
  const { currentTrack, isPlaying, togglePlay, setTrack } = usePlayerStore();
  const { addPlaylist } = useHistoryStore();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const liked = isAlbumLiked(item.id);
  const previewTrackId = item.previewTrack?.id ?? item.previewTrackId ?? null;
  const isThisPlaying =
    isPlaying && !!previewTrackId && currentTrack?.id === previewTrackId;

  const albumPath = `/discover/albums/:${item.slug ?? item.id}`;

  const buildPayload = (): Playlist => ({
    playlist_id: item.id,
    owner_user_id: item.ownerId,
    name: item.title,
    description: null,
    is_public: true,
    cover_image: item.coverUrl,
    subtype: "album",
    track_count: item.trackCount,
    like_count: item.likeCount,
    created_at: item.createdAt ?? new Date().toISOString(),
  });

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.previewTrack) return;
    if (currentTrack?.id === previewTrackId) {
      togglePlay();
    } else {
      setTrack(item.previewTrack);
      addPlaylist({ id: item.id, title: item.title, owner: item.owner, coverUrl: item.coverUrl, isAlbumView: true });
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleAlbum(buildPayload());
  };

  return (
    <div
      className={`group flex flex-col gap-2 ${widthClassName} shrink-0 cursor-pointer`}
      onClick={() => navigate(albumPath)}
      data-test="album-card"
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

      <div>
        <p className="text-white text-sm font-semibold truncate w-full">{item.title}</p>
        <p className="text-gray-400 text-xs truncate w-full">{item.owner}</p>
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
