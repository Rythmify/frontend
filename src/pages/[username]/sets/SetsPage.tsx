import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import ShareLayout from "../../[username]/shareLayout";
import ShareModal from "@/components/Profile/ShareModal/ShareModal";
import EditProfileModal from "@/components/Profile/EditProfileModal/EditProfileModal";
import { useProfileData } from "@/services/hooks/useProfileData";

export default function SetsPage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const {
    user,
    profileData,
    stats,
    followers,
    following,
    isOwner,
    handleTabChange,
    handleSave,
  } = useProfileData(username);

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
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <p
            data-test="empty-state-message"
            className="text-white font-bold text-17px"
          >
            Sets Page
          </p>
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
