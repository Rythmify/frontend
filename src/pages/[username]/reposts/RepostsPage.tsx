import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import ShareLayout from "../../[username]/shareLayout";
import ShareModal from "@/components/Profile/ShareModal/ShareModal";
import EditProfileModal from "@/components/Profile/EditProfileModal/EditProfileModal";
import { useProfileData } from "@/services/hooks/useProfileData";
import { getMyRepostedTracks } from "@/services/engagement.service";
import type { Track } from "@/types/track";

export default function RepostsPage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [repostedTracks, setRepostedTracks] = useState<Track[]>([]);
  const [loadingReposts, setLoadingReposts] = useState(false);

  const {
    user,
    stats,
    followers,
    following,
    isOwner,
    handleTabChange,
    handleSave,
  } = useProfileData(username);

  useEffect(() => {
    if (!isOwner) return;
    setLoadingReposts(true);
    getMyRepostedTracks({ limit: 50 })
      .then((res) => setRepostedTracks(res.data))
      .catch(console.error)
      .finally(() => setLoadingReposts(false));
  }, [isOwner]);

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
        selectedTab="Reposts"
        onTabChange={(tab) => handleTabChange(tab, navigate)}
        onShare={() => setShowShare(true)}
        onEdit={() => setShowEdit(true)}
        followers={followersMapped}
        following={followingMapped}
        stats={stats}
      >
        <div className="py-6 min-h-100">
          {loadingReposts ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : repostedTracks.length > 0 ? (
            <div className="flex flex-col gap-4">
              {repostedTracks.map((track: any) => (
                <div
                  key={track.id}
                  className="p-4 bg-[#111111] rounded-lg border border-[#222222] hover:border-orange-500/30 transition-all"
                >
                  <div className="flex gap-4">
                    <img
                      src={
                        track.cover_image ||
                        "https://picsum.photos/seed/rythmify/200/200"
                      }
                      alt={track.title}
                      className="w-24 h-24 rounded object-cover shadow-lg"
                    />
                    <div className="flex flex-col justify-center">
                      <h3 className="text-white font-bold text-lg">
                        {track.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {track.artist_name || track.user?.display_name}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          {track.like_count || 0}
                        </span>
                        <span className="text-xs text-orange-500 flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                          </svg>
                          Reposted
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
                  d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
                />
              </svg>
              <p
                data-test="empty-state-message"
                className="text-white text-17px"
              >
                No reposts yet
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
