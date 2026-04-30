import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import ShareLayout from "../../[username]/shareLayout";
import ShareModal from "@/components/Profile/ShareModal/ShareModal";
import EditProfileModal from "@/components/Profile/EditProfileModal/EditProfileModal";
import NotFound from "@/pages/not-found/NotFound";
import { useProfileData } from "@/services/hooks/useProfileData";
import { getMyTracks, getUserTracks } from "@/services/track.service";
import { TrackCard } from "@/components/track";
import type { Track } from "@/types/track";

export default function PopularTracksPage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [profileLookupStarted, setProfileLookupStarted] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    user,
    profileData,
    stats,
    followers,
    following,
    isOwner,
    isLoadingProfile,
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

  useEffect(() => {
    if (!isOwner && !profileData?.id) return;

    setLoading(true);
    const fetch = isOwner
      ? getMyTracks(1, 100)
      : getUserTracks(profileData!.id, 1, 100);

    fetch
      .then((res) => {
        const sorted = [...res.tracks].sort(
          (a, b) => (b.playCount ?? 0) - (a.playCount ?? 0),
        );
        setTracks(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOwner, profileData?.id]);

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
        selectedTab="Popular tracks"
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
          ) : tracks.length > 0 ? (
            <div className="flex flex-col gap-4">
              {tracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  onCopyLink={() =>
                    navigator.clipboard.writeText(
                      `${window.location.origin}/${track.artistUsername}/${track.trackSlug ?? ""}`,
                    )
                  }
                  onEdit={() =>
                    navigate(
                      `/${track.artistUsername}/${track.trackSlug ?? ""}`,
                    )
                  }
                  onReplaceFile={() => {}}
                  onDelete={() => {}}
                  onDistribute={() => {}}
                  onAddToPlaylist={() => {}}
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
                No tracks yet
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
