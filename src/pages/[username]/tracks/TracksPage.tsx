import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import ShareLayout from "../../[username]/shareLayout";
import TrackCard from "@/components/track/TrackCard";
import ShareModal from "@/components/Profile/ShareModal/ShareModal";
import EditProfileModal from "@/components/Profile/EditProfileModal/EditProfileModal";
import NotFound from "@/pages/not-found/NotFound";
import { useProfileData } from "@/services/hooks/useProfileData";
import { getMyTracks, getUserTracks } from "@/services/track.service";
import type { Track } from "@/types/track";

export default function TracksPage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [profileLookupStarted, setProfileLookupStarted] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);

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

  // Fetch the full track list (useProfileData fetches count via the same call,
  // but we need the actual Track[] objects for rendering cards here)
  useEffect(() => {
    let cancelled = false;
    setLoadingTracks(true);

    const load = async () => {
      try {
        if (isOwner) {
          const { tracks: ownedTracks } = await getMyTracks(1, 100);
          if (!cancelled) setTracks(ownedTracks);
        } else if (profileData?.id) {
          const { tracks: publicTracks } = await getUserTracks(
            profileData.id,
            1,
            100,
          );
          if (!cancelled) setTracks(publicTracks);
        }
      } catch (err) {
        console.error("[TracksPage] load error:", err);
      } finally {
        if (!cancelled) setLoadingTracks(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
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
        selectedTab="Tracks"
        onTabChange={(tab) => handleTabChange(tab, navigate)}
        onShare={() => setShowShare(true)}
        onEdit={() => setShowEdit(true)}
        profileId={profileData?.id}
        followers={followersMapped}
        following={followingMapped}
        stats={stats}
      >
        <div className="flex flex-col gap-4">
          {tracks.length > 0 ? (
            tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onCopyLink={() =>
                  navigator.clipboard.writeText(
                    `${window.location.origin}/${track.artistUsername}/${track.id}`,
                  )
                }
                onEdit={() => navigate(`/${track.artistUsername}/${track.id}`)}
                onReplaceFile={() =>
                  console.log("[TrackCard] replace file:", track.id)
                }
                onDelete={() => console.log("[TrackCard] delete:", track.id)}
                onDistribute={() =>
                  console.log("[TrackCard] distribute:", track.id)
                }
                onAddToPlaylist={() => {}}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <p
                data-test="empty-state-message"
                className="text-white font-bold text-17px"
              >
                {loadingTracks ? "Loading tracks…" : "No tracks yet."}
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
