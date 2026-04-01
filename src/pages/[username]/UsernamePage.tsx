import { useState, useEffect, useRef } from "react";
import ProfileHeader from "../../components/Profile/ProfileHeader/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs/ProfileTabs";
import ProfileSidebar from "../../components/Profile/ProfileSideBar/ProfileSideBar";
import { useAuthStore } from "@/stores/auth.store";
import ShareModal from "../../components/Profile/ShareModal/ShareModal";
import EditProfileModal from "../../components/Profile/EditProfileModal/EditProfileModal";
import { useNavigate, useLocation } from "react-router-dom";
import {
  mockLikedTracks,
} from "@/components/Profile/MockData/mock";
import { useParams } from "react-router-dom";
import { TrackCard } from "../../components/track";
import { mockTracks } from "../../services/mocks/tracks";
import type { Track } from "../../types/track";
import {
  getMyProfile,
  getUserById,
  getFollowers,
  getFollowing,
  getFollowStatus,
  updateMyProfile,
  type OwnUser,
  type PublicUser,
  type UserSummary,
} from "@/services/mocks/User.service";

export default function UsernamePage() {
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileTracks, setProfileTracks] = useState<Track[]>([]);

  if (!currentUser) return null;

  const isOwner = !username || username === currentUser.username;

  useEffect(() => {
    // Load tracks for this profile (owner → all mock tracks, others → first 3)
    // TODO: replace with real API call — e.g. getTracks({ username })
    setProfileTracks(isOwner ? mockTracks : mockTracks.slice(0, 3));
  }, [isOwner]);

  useEffect(() => {
    if (isOwner) {
      // GET /users/me
      getMyProfile().then((profile) => {
        setProfileData(profile);
        setStats({
          followers: profile.followers_count,
          following: profile.following_count,
          tracks: mockTracks.length, // TODO: real count from API
        });
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

  // Once we have the visited profile's UUID, fetch their social lists + follow status
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

      // GET /users/{user_id}/follow-status
      getFollowStatus(profileData.id)
        .then((status) => setIsFollowing(status.is_following))
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

  // Track the initial follow state so we can compute a follower delta for the
  // stats display without waiting for a full refetch
  const initiallyFollowing = useRef(isFollowing);
  const followerDelta =
    isFollowing === initiallyFollowing.current ? 0 : isFollowing ? 1 : -1;

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

  const displayedStats = isOwner
    ? stats
    : {
        ...stats,
        followers: stats.followers + followerDelta,
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
        username={user.username}
        displayName={user.displayName}
        tracks={displayedStats.tracks ?? 0}
      />

      <div className="flex gap-6 py-6 items-start">
        <div className="flex-1 min-w-0">
          {profileTracks.length > 0 ? (
            <>
              <h2
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                Recent
              </h2>
              {profileTracks.map((t) => (
                <TrackCard
                  key={t.id}
                  track={t}
                  onCopyLink={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/${t.artistUsername}/${t.trackSlug ?? ""}`
                    );
                  }}
                  onEdit={() => navigate(`/${t.artistUsername}/${t.trackSlug ?? ""}`)}
                  onReplaceFile={() => console.log("[TrackCard] replace file:", t.id)}
                  onDelete={() => console.log("[TrackCard] delete:", t.id)}
                  onDistribute={() => console.log("[TrackCard] distribute:", t.id)}
                  onAddToPlaylist={() => {}}
                />
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <p
                data-test="empty-state-message"
                className="text-white font-bold text-17px"
              >
                Seems a little quiet over here
              </p>
              {isOwner &&
                selectedTab !== "Playlists" &&
                selectedTab !== "Reposts" && (
                  <button
                    data-test="upload-now-button"
                    onClick={() => navigate("/upload")}
                    className="cursor-pointer px-3.5 py-1.5 text-md bg-white text-black hover:text-[#737272] font-bold rounded"
                  >
                    Upload now
                  </button>
                )}
            </div>
          )}
        </div>
        <div>
          <ProfileSidebar
            user={user}
            isOwner={isOwner}
            likedTracks={likedTracks}
            followers={followersMapped}
            following={followingMapped}
            stats={displayedStats}
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