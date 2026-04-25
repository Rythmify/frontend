import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import ShareLayout from "../../[username]/shareLayout";
import ShareModal from "@/components/Profile/ShareModal/ShareModal";
import EditProfileModal from "@/components/Profile/EditProfileModal/EditProfileModal";
import { useProfileData } from "@/services/hooks/useProfileData";
import PlaylistCard, {
  type PlaylistCardData,
} from "@/components/UI/PlaylistCard/PlaylistCard";
import {
  getPlaylistsByUser,
  type Playlist,
} from "@/services/api/playlist/playlist.service";

export default function AlbumsPage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [albums, setAlbums] = useState<PlaylistCardData[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);

  const {
    user,
    profileData,
    stats,
    followers,
    following,
    isOwner,
    activeUser,
    handleTabChange,
    handleSave,
  } = useProfileData(username);

  const fetchAlbums = useCallback(() => {
    const ownerId = isOwner ? activeUser?.id : profileData?.id;
    if (!ownerId) return;

    const mapPlaylistToCard = (playlist: Playlist): PlaylistCardData => ({
      id: playlist.playlist_id,
      title: playlist.name,
      owner: profileData?.display_name || user.displayName,
      ownerUsername: profileData?.username || user.username,
      ownerDisplayName: profileData?.display_name || user.displayName,
      slug: playlist.slug ?? undefined,
      coverUrl: playlist.cover_image ?? null,
      isPrivate: !playlist.is_public,
      isLiked: playlist.like_count > 0,
      isAlbumView: true,
    });

    setLoadingAlbums(true);
    getPlaylistsByUser(ownerId, activeUser?.id, { limit: 100 })
      .then((res) => {
        const albumItems = (res.data.items ?? []).filter(
          (p) => p.is_album_view || p.subtype === "album",
        );
        setAlbums(albumItems.map(mapPlaylistToCard));
      })
      .catch(console.error)
      .finally(() => setLoadingAlbums(false));
  }, [
    isOwner,
    activeUser?.id,
    profileData?.id,
    profileData?.display_name,
    profileData?.username,
    user.displayName,
    user.username,
  ]);

  useEffect(() => {
    fetchAlbums();

    const handlePlaylistUpdated = () => {
      fetchAlbums();
    };

    window.addEventListener("playlist-updated", handlePlaylistUpdated);
    return () => {
      window.removeEventListener("playlist-updated", handlePlaylistUpdated);
    };
  }, [fetchAlbums]);

  if (!currentUser) return null;

  const followersMapped = followers.map((u) => ({
    userId: u.id,
    username: u.username || u.id,
    displayName: u.display_name,
    avatar: u.profile_picture ?? "",
    followers: 0,
    tracks: 0,
    isVerified: u.is_verified,
  }));

  const followingMapped = following.map((u) => ({
    userId: u.id,
    username: u.username || u.id,
    displayName: u.display_name,
    avatar: u.profile_picture ?? "",
    followers: 0,
    tracks: 0,
    isVerified: u.is_verified,
    isFollowing: u.isFollowing,
  }));

  return (
    <>
      <ShareLayout
        user={user}
        isOwner={isOwner}
        selectedTab="Albums"
        onTabChange={(tab) => handleTabChange(tab, navigate)}
        onShare={() => setShowShare(true)}
        onEdit={() => setShowEdit(true)}
        profileId={profileData?.id}
        followers={followersMapped}
        following={followingMapped}
        stats={stats}
      >
        <div className="py-6 min-h-100">
          {loadingAlbums ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : albums.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {albums.map((album) => (
                <PlaylistCard
                  key={album.id}
                  item={album}
                  widthClassName="w-[180px] sm:w-[200px] md:w-[220px]"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16 opacity-50">
              <svg
                className="w-16 h-16 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              <p
                data-test="empty-state-message"
                className="text-white text-17px"
              >
                No albums yet
              </p>
            </div>
          )}
        </div>
      </ShareLayout>

      {showShare && (
        <ShareModal
          url={`https://rythmify.com/${user.username}`}
          onClose={() => setShowShare(false)}
        />
      )}
      {showEdit && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSave={(data) => handleSave(data, () => setShowEdit(false))}
        />
      )}
    </>
  );
}
