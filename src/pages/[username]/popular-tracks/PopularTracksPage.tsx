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

export default function PopularTracksPage() {
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
        selectedTab="Popular tracks"
        onTabChange={handleTabChange}
        onShare={() => setShowShare(true)}
        onEdit={() => setShowEdit(true)}
        followers={followersMapped}
        following={followingMapped}
        stats={displayedStats}
      >
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <p
            data-test="empty-state-message"
            className="text-white font-bold text-17px"
          >
            Popular Tracks Page
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
