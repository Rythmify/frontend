import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import ShareLayout from "../../[username]/shareLayout";
import ShareModal from "@/components/Profile/ShareModal/ShareModal";
import EditProfileModal from "@/components/Profile/EditProfileModal/EditProfileModal";
import NotFound from "@/pages/not-found/NotFound";
import { useProfileData } from "@/services/hooks/useProfileData";
import PlaylistCard, {
  type PlaylistCardData,
} from "@/components/UI/PlaylistCard/PlaylistCard";
import {
  getPlaylistsByUser,
  type Playlist,
} from "@/services/api/playlist/playlist.service";

export default function SetsPage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [profileLookupStarted, setProfileLookupStarted] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistCardData[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    user,
    profileData,
    stats,
    followers,
    following,
    isOwner,
    isLoadingProfile,
    activeUser,
    handleTabChange,
    handleSave,
  } = useProfileData(username);

  useEffect(() => {
    setProfileLookupStarted(false);
  }, [username]);

  useEffect(() => {
    if (isLoadingProfile) {
      setProfileLookupStarted(true);
    }
  }, [isLoadingProfile]);

  const fetchPlaylists = useCallback(() => {
    const ownerId = isOwner ? activeUser?.id : profileData?.id;
    if (!ownerId) return;

    const mapToCard = (playlist: Playlist): PlaylistCardData => ({
      id: playlist.playlist_id,
      title: playlist.name,
      owner: profileData?.display_name || user.displayName,
      ownerUsername: profileData?.username || user.username,
      slug: playlist.slug ?? undefined,
      coverUrl: playlist.cover_image ?? null,
      isPrivate: !playlist.is_public,
      isLiked: playlist.like_count > 0,
      isAlbumView: false,
    });

    setLoading(true);
    getPlaylistsByUser(ownerId, activeUser?.id, { limit: 100 })
      .then((res) => {
        const sets = (res.data.items ?? []).filter(
          (p) => !p.is_album_view && p.subtype !== "album",
        );
        setPlaylists(sets.map(mapToCard));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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
    fetchPlaylists();

    const handlePlaylistUpdated = () => {
      fetchPlaylists();
    };

    window.addEventListener("playlist-updated", handlePlaylistUpdated);
    return () => {
      window.removeEventListener("playlist-updated", handlePlaylistUpdated);
    };
  }, [fetchPlaylists]);

  if (!isOwner && profileLookupStarted && !isLoadingProfile && !profileData) {
    return <NotFound />;
  }

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
        selectedTab="Playlists"
        onTabChange={(tab) => handleTabChange(tab, navigate)}
        onShare={() => setShowShare(true)}
        onEdit={() => setShowEdit(true)}
        profileId={profileData?.id}
        followers={followersMapped}
        following={followingMapped}
        stats={stats}
      >
        <div className="py-6 min-h-100">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : playlists.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  item={playlist}
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p
                data-test="empty-state-message"
                className="text-white text-17px"
              >
                No playlists yet
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
