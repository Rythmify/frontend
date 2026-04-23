import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import ShareLayout from "../../[username]/shareLayout";
import ShareModal from "@/components/Profile/ShareModal/ShareModal";
import EditProfileModal from "@/components/Profile/EditProfileModal/EditProfileModal";
import { getMyTracks } from "@/services/api/upload/track.service";
import {
  getFollowers,
  getFollowing,
  getMyProfile,
  getUserById,
  getUserByUsername,
  updateMyProfile,
  type OwnUser,
  type PublicUser,
  type UserSummary,
} from "@/services/user.service";
import { getMyRepostedTracks } from "@/services/engagement.service";
import type { Track } from "@/types/track";

export default function RepostsPage() {
  const { username } = useParams();
  const { user: currentUser, setUser } = useAuthStore();
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<OwnUser | PublicUser | null>(
    null,
  );
  const [followers, setFollowers] = useState<UserSummary[]>([]);
  const [following, setFollowing] = useState<UserSummary[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, tracks: 0 });
  const [repostedTracks, setRepostedTracks] = useState<Track[]>([]);
  const [loadingReposts, setLoadingReposts] = useState(false);

  if (!currentUser) return null;

  const activeUser = currentUser;
  const isOwner = !username || username === currentUser.username;
  //const followingCount = currentUser.following_ids?.length ?? 0;

  useEffect(() => {
    if (isOwner) {
      getMyProfile()
        .then((profile) => {
          setProfileData(profile);
          setStats({
            followers: profile.followers_count,
            following: profile.following_count,
            tracks: 0,
          });
          const latestUser = useAuthStore.getState().user ?? activeUser;
          setUser({
            ...latestUser,
            bio: profile.bio || "",
            avatar: profile.profile_picture ?? latestUser.avatar,
            coverUrl: profile.cover_photo ?? latestUser.coverUrl,
            location:
              [(profile as OwnUser).city, (profile as OwnUser).country]
                .filter(Boolean)
                .join(", ") || latestUser.location,
          });
        })
        .catch(console.error);

      getMyTracks({ page: 1, limit: 1 })
        .then((res) => {
          setStats((s) => ({
            ...s,
            tracks: res.pagination?.total ?? s.tracks,
          }));
        })
        .catch(console.error);

      setLoadingReposts(true);
      getMyRepostedTracks({ limit: 50 })
        .then((res) => {
          setRepostedTracks(res.data);
          setLoadingReposts(false);
        })
        .catch((err) => {
          console.error(err);
          setLoadingReposts(false);
        });

      if (activeUser.id) {
        getFollowers(activeUser.id, { limit: 100 })
          .then((res) => {
            setFollowers(res.items);
            setStats((s) => ({ ...s, followers: res.meta.total }));
          })
          .catch(console.error);
        getFollowing(activeUser.id, { limit: 100 })
          .then((res) => {
            setFollowing(res.items);
            setStats((s) => ({ ...s, following: res.meta.total }));
          })
          .catch(console.error);
      }
    } else {
      if (!username) return;
      getUserByUsername(username)
        .then((profile) => {
          setProfileData(profile);
          setStats({
            followers: profile.followers_count,
            following: profile.following_count,
            tracks: 0,
          });
        })
        .catch(console.error);
    }
  }, [username, isOwner]);

  useEffect(() => {
    if (!isOwner && profileData) {
      getFollowers(profileData.id, { limit: 100 })
        .then((res) => {
          setFollowers(res.items);
          setStats((s) => ({ ...s, followers: res.meta.total }));
        })
        .catch(console.error);
      getFollowing(profileData.id, { limit: 100 })
        .then((res) => {
          setFollowing(res.items);
          setStats((s) => ({ ...s, following: res.meta.total }));
        })
        .catch(console.error);
    }
  }, [profileData?.id, isOwner]);

  const handleTabChange = (tab: string) => {
    const targetUsername = isOwner ? currentUser.username : username || "";
    const tabRoutes: Record<string, string> = {
      All: `/${targetUsername}`,
      "Popular tracks": `/${targetUsername}/popular-tracks`,
      Tracks: `/${targetUsername}/tracks`,
      Albums: `/${targetUsername}/albums`,
      Playlists: `/${targetUsername}/sets`,
      Reposts: `/${targetUsername}/reposts`,
    };
    const route = tabRoutes[tab];
    if (route) navigate(route);
  };

  const user = isOwner
    ? currentUser
    : {
        ...currentUser,
        username: profileData?.username || username || currentUser.username,
        displayName:
          profileData?.display_name || username || currentUser.username,
        bio: profileData?.bio || "",
        avatar: profileData?.profile_picture || "",
        coverUrl: profileData?.cover_photo || "",
        location: (profileData as PublicUser | null)?.location || "",
      };
  const displayedStats = stats;

  const followersMapped = followers.map((u) => ({
    userId: u.id,
    username: u.username || u.id,
    displayName: u.display_name,
    avatar: "",
    followers: 0,
    tracks: 0,
    isVerified: u.is_verified,
  }));

  const followingMapped = following.map((u) => ({
    userId: u.id,
    username: u.username || u.id,
    displayName: u.display_name,
    avatar: "",
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
        onTabChange={handleTabChange}
        onShare={() => setShowShare(true)}
        onEdit={() => setShowEdit(true)}
        followers={followersMapped}
        following={followingMapped}
        stats={displayedStats}
      >
        <div className="py-6 min-h-[400px]">
          {loadingReposts ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
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
          onSave={(data) => {
            updateMyProfile({
              display_name: data.displayName,
              first_name: data.firstName,
              last_name: data.lastName,
              bio: data.bio,
              city: data.city,
              country: data.country,
            }).catch(console.error);

            const latestUser = useAuthStore.getState().user ?? activeUser;
            setUser({
              ...latestUser,
              displayName: data.displayName,
              firstName: data.firstName,
              lastName: data.lastName,
              bio: data.bio,
              city: data.city,
              country: data.country,
              location: data.location,
              avatar: data.avatarFile
                ? URL.createObjectURL(data.avatarFile)
                : latestUser.avatar,
            });
            setShowEdit(false);
          }}
        />
      )}
    </>
  );
}
