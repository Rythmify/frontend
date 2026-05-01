import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "@/stores/player.store";
import { useLikesStore } from "@/stores/likes.store";
import { useAuthStore } from "@/stores/auth.store";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";
import { useHistoryStore } from "@/stores/history.store";
import CardOverlay, { AddToPlaylistIcon } from "@/components/UI/CardOverlay/CardOverlay";
import CoverImage from "@/components/UI/CoverImage";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PlaylistCardData = {
  id: string;
  title: string;
  owner: string;
  ownerDisplayName?: string;
  ownerUsername?: string;
  slug?: string | null;
  coverUrl: string | null;
  isPrivate?: boolean;
  isLiked?: boolean;
  isAlbumView?: boolean;
  linkTo?: string;
  onLike?: (e: React.MouseEvent) => void;
  isLikedOverride?: boolean;
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
  const { isPlaylistLiked, togglePlaylist, isAlbumLiked, toggleAlbum } = useLikesStore();
  const { currentTrack, isPlaying, togglePlay, setTrack } = usePlayerStore();
  const { user } = useAuthStore();
  const { addPlaylist } = useHistoryStore();

  // Local State
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  // Derived State
  const liked =
    item.isLikedOverride !== undefined
      ? item.isLikedOverride
      : item.isAlbumView
        ? isAlbumLiked(item.id)
        : isPlaylistLiked(item.id);
  const isThisPlaylistPlaying =
    isPlaying &&
    (currentTrack as any)?.context?.type === "playlist" &&
    (currentTrack as any)?.context?.playlist_id === item.id;

  const ownerDisplay =
    item.ownerDisplayName ??
    (UUID_RE.test(item.owner)
      ? (user?.displayName ?? user?.username ?? item.owner)
      : item.ownerUsername ?? item.owner);
    

  // SoundCloud navigation format: /[username]/sets/[slug]
  const playlistPath = item.isAlbumView
    ? `/${item.ownerUsername || item.owner}/album/${item.slug || item.id}`
    : `/${item.ownerUsername || item.owner}/sets/${item.slug || item.id}`;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((currentTrack as any)?.context?.playlist_id === item.id) {
      togglePlay();
      return;
    }
    setTrack({
      id: item.id,
      title: item.title,
      artistName: ownerDisplay,
      artistUsername: item.ownerUsername ?? "",
      coverUrl: item.coverUrl ?? "",
      genre: "",
      likeCount: 0,
      repostCount: 0,
      playCount: 0,
      commentCount: 0,
      duration: "0:00",
      postedAt: "",
      audioUrl: "",
      waveformData: [],
      context: { type: "playlist", playlist_id: item.id },
    } as any);
    addPlaylist(item);
  };

  return (
    <div
      className={`group flex flex-col gap-2 ${widthClassName} shrink-0 cursor-pointer`}
      onClick={() => navigate(item.linkTo ?? playlistPath)}
      data-test="playlist-card"
    >
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        <CoverImage
          src={item.coverUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-75"
        />

        <CardOverlay
          isPlaying={isThisPlaylistPlaying}
          onPlay={handlePlayClick}
          isLiked={liked}
          onLike={(e) => {
            e.stopPropagation();
            if (item.onLike) {
              item.onLike(e);
            } else if (item.isAlbumView) {
              toggleAlbum({ playlist_id: item.id, name: item.title, cover_image: item.coverUrl } as any);
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
