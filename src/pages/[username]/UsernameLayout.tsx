import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, useParams } from "react-router-dom";
import ProfileHeader from "../../components/Profile/ProfileHeader/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs/ProfileTabs";
import ProfileSidebar from "../../components/Profile/ProfileSideBar/ProfileSideBar";
import { useAuthStore } from "@/stores/auth.store";
import ShareModal from "../../components/Profile/ShareModal/ShareModal";
import EditProfileModal from "../../components/Profile/EditProfileModal/EditProfileModal";
import {
  mockLikedTracks,
} from "@/components/Profile/MockData/mock";
import {
  getMyProfile,
  getUserById,
  getFollowers,
  getFollowing,
  updateMyProfile,
  type OwnUser,
  type PublicUser,
  type UserSummary,
} from "@/services/mocks/User.service";

export type UsernameLayoutContext = {
  isOwner: boolean;
};

export default function UsernameLayout() {
  const { username } = useParams();
  const { user: currentUser, setUser } = useAuthStore();
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [profileData, setProfileData] = useState<OwnUser | PublicUser | null>(null);
  const [followers, setFollowers] = useState<UserSummary[]>([]);
  const [following, setFollowing] = useState<UserSummary[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, tracks: 0 });

  if (!currentUser) return null;

  const isOwner = !username || username === currentUser.username;

  useEffect(() => {
    if (isOwner) {
      // GET /users/me
      getMyProfile().then((profile) => {
        setProfileData(profile);
        setStats({
          followers: profile.followers_count,
          following: profile.following_count,
          tracks: 0,
        });
        // Sync fresh profile data into auth store so ProfileHeader stays up to date
        setUser({
          ...currentUser,
          bio: profile.bio || "",
          location: [(profile as OwnUser).city, (profile as OwnUser).country]
            .filter(Boolean)
            .join(", ") || currentUser.location,
        });
      }).catch(console.error);

      if (currentUser.id) {
        getFollowers(currentUser.id, { limit: 100 })
          .then((res) => setFollowers(res.items))
          .catch(console.error);
        getFollowing(currentUser.id, { limit: 100 })
          .then((res) => {
            setFollowing(res.items);
            setStats((s) => ({ ...s, following: res.meta.total }));
          })
          .catch(console.error);
      }
    } else {
      // GET /users/{user_id} — backend accepts username in path
      getUserById(username!).then((profile) => {
        setProfileData(profile);
        setStats({
          followers: profile.followers_count,
          following: profile.following_count,
          tracks: 0,
        });
      }).catch(console.error);
    }
  }, [username, isOwner]);

  // Once we have the visited profile's UUID, fetch their social lists
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

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith("/tracks")) return "Tracks";
    if (path.endsWith("/popular-tracks")) return "Popular tracks";
    if (path.endsWith("/albums")) return "Albums";
    if (path.endsWith("/sets")) return "Playlists";
    if (path.endsWith("/reposts")) return "Reposts";
    return "All";
  };

  const selectedTab = getActiveTab();

  const storageKey = `likedTracks_${isOwner ? currentUser.username : username}`;

  const [likedTracks, setLikedTracks] = useState<typeof mockLikedTracks>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : isOwner ? mockLikedTracks : [];
  });

  const handleUnlike = (id: string) => {
    setLikedTracks((prev: typeof mockLikedTracks) => {
      const updated = prev.filter(
        (t: (typeof mockLikedTracks)[0]) => t.id !== id,
      );
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

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

  // Adapt API response back to the camelCase User shape ProfileHeader expects
  const user = isOwner
    ? currentUser
    : {
        ...currentUser,
        username: profileData?.username || username || currentUser.username,
        displayName: profileData?.display_name || username || currentUser.username,
        bio: profileData?.bio || "",
        avatar: profileData?.profile_picture || "",
        coverUrl: profileData?.cover_photo || "",
        location: (profileData as PublicUser | null)?.location || "",
      };

  // Adapt UserSummary[] → the shape ProfileSidebar expects
  const followersMapped = followers.map((u) => ({
    username: u.user_id,
    displayName: u.display_name,
    avatar: "",
    followers: 0,
    tracks: 0,
    isVerified: u.is_verified,
  }));

  const followingMapped = following.map((u) => ({
    username: u.user_id,
    displayName: u.display_name,
    avatar: "",
    followers: 0,
    tracks: 0,
    isVerified: u.is_verified,
  }));

  return (
    <div className="container px-4 md:px-8 lg:px-20">
      <ProfileHeader user={user} isOwner={isOwner} />

      <ProfileTabs
        isOwner={isOwner}
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        onShare={() => setShowShare(true)}
        onEdit={() => setShowEdit(true)}
      />

      <div className="flex gap-6 py-6 items-start">
        <div className="flex-1">
          <Outlet context={{ isOwner } satisfies UsernameLayoutContext} />
        </div>
        <div>
          <ProfileSidebar
            user={user}
            isOwner={isOwner}
            likedTracks={likedTracks}
            followers={followersMapped}
            following={followingMapped}
            stats={stats}
            onTabChange={handleTabChange}
            onUnlike={handleUnlike}
          />
        </div>
      </div>

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
            // PATCH /users/me with the updated fields
            updateMyProfile({
              display_name: data.displayName,
              first_name: data.firstName,
              last_name: data.lastName,
              bio: data.bio,
              city: data.city,
              country: data.country,
            }).catch(console.error);

            // Optimistically update auth store so UI reflects the change immediately
            setUser({
              ...currentUser,
              displayName: data.displayName,
              firstName: data.firstName,
              lastName: data.lastName,
              bio: data.bio,
              city: data.city,
              country: data.country,
              location: data.location,
              avatar: data.avatarFile
                ? URL.createObjectURL(data.avatarFile)
                : currentUser.avatar,
            });
            setShowEdit(false);
          }}
        />
      )}
    </div>
  );
}