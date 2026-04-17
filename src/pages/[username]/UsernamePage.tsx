import { useState, useEffect, useRef } from "react";
import ProfileHeader from "../../components/Profile/ProfileHeader/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs/ProfileTabs";
import ProfileSidebar from "../../components/Profile/ProfileSideBar/ProfileSideBar";
import { useAuthStore } from "@/stores/auth.store";
import ShareModal from "../../components/Profile/ShareModal/ShareModal";
import EditProfileModal from "../../components/Profile/EditProfileModal/EditProfileModal";
import BlockButton from "@/components/settings/BlockButton";
import { useNavigate, useLocation } from "react-router-dom";
import { mockLikedTracks } from "@/components/Profile/MockData/mock";
import { useParams } from "react-router-dom";
import { TrackCard } from "../../components/track";
import { mockTracks } from "../../services/mocks/tracks";
import { getMyTracks } from "@/services/api/upload/track.service";
import type { Track } from "../../types/track";
import {
  getMyProfile,
  getUserById,
  getFollowers,
  getFollowing,
  getFollowStatus,
  resolveUsername,
  updateMyProfile,
  type OwnUser,
  type PublicUser,
  type UserSummary,
} from "@/services/user.service";

interface ProfileListUser {
  userId: string;
  username: string;
  displayName: string;
  profilePath: string;
  avatar: string;
  followers: number;
  tracks: number;
  isVerified: boolean;
}

async function enrichUserSummary(user: UserSummary): Promise<ProfileListUser> {
  try {
    const profile = await getUserById(user.user_id);
    return {
      userId: user.user_id,
      username: profile.username ?? user.user_id,
      displayName: profile.display_name || user.display_name,
      profilePath: `/${(profile.username ?? user.user_id).toLowerCase().replace(/\s+/g, "-")}`,
      avatar: profile.profile_picture ?? "",
      followers: profile.followers_count ?? 0,
      tracks: 0,
      isVerified: profile.is_verified ?? user.is_verified,
    };
  } catch {
    return {
      userId: user.user_id,
      username: user.user_id,
      displayName: user.display_name,
      profilePath: `/${user.user_id}`,
      avatar: "",
      followers: 0,
      tracks: 0,
      isVerified: user.is_verified,
    };
  }
}

function sameIds(a: string[] = [], b: string[] = []) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export default function UsernamePage() {
  const { username } = useParams();
  const { user: currentUser, setUser } = useAuthStore();
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [profileData, setProfileData] = useState<OwnUser | PublicUser | null>(
    null,
  );
  const [followers, setFollowers] = useState<UserSummary[]>([]);
  const [following, setFollowing] = useState<UserSummary[]>([]);
  const [followersDetails, setFollowersDetails] = useState<ProfileListUser[]>([]);
  const [followingDetails, setFollowingDetails] = useState<ProfileListUser[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, tracks: 0 });
  const [profileTracks, setProfileTracks] = useState<Track[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const initiallyFollowing = useRef<boolean | null>(null);
  const currentUserId = currentUser?.id;
  const currentUsername = currentUser?.username;
  const isOwner =
    !!currentUser && (!username || username === currentUser.username);

  useEffect(() => {
    setProfileTracks(isOwner ? mockTracks : mockTracks.slice(0, 3));
  }, [isOwner]);

  useEffect(() => {
    if (!currentUser) return;

    if (isOwner) {
      getMyProfile()
        .then((profile) => {
          setProfileData(profile);
          setStats((prev) => ({
            ...prev,
            followers: profile.followers_count,
            following: profile.following_count,
          }));
          const latestUser = useAuthStore.getState().user ?? currentUser;
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

      if (currentUserId) {
        getFollowers(currentUserId, { limit: 100 })
          .then((res) => {
            setFollowers(res.items);
            setStats((s) => ({ ...s, followers: res.meta.total }));
          })
          .catch(console.error);
        getFollowing(currentUserId, { limit: 100 })
          .then((res) => {
            setFollowing(res.items);
            setStats((s) => ({ ...s, following: res.meta.total }));
          })
          .catch(console.error);
      }
    } else {
      if (!username) {
        return;
      }

      resolveUsername(username)
        .then((userId) => getUserById(userId))
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
  }, [username, isOwner, currentUserId, currentUsername, setUser]);

  useEffect(() => {
    if (!followers.length) {
      setFollowersDetails([]);
      return;
    }

    Promise.all(followers.map(enrichUserSummary))
      .then((items) => setFollowersDetails(items))
      .catch(console.error);
  }, [followers]);

  useEffect(() => {
    if (!following.length) {
      setFollowingDetails([]);
      return;
    }

    Promise.all(following.map(enrichUserSummary))
      .then((items) => {
        setFollowingDetails(items);

        if (isOwner) {
          const latestUser = useAuthStore.getState().user ?? currentUser;
          if (!latestUser) {
            return;
          }

          const normalizedFollowingIds = items.flatMap((item) =>
            item.username && item.username !== item.userId
              ? [item.userId, item.username]
              : [item.userId],
          );

          if (!sameIds(latestUser.following_ids, normalizedFollowingIds)) {
            setUser({
              ...latestUser,
              following_ids: normalizedFollowingIds,
            });
          }
        }
      })
      .catch(console.error);
  }, [following, isOwner, currentUser, setUser]);

  useEffect(() => {
    if (!isOwner && profileData) {
      getFollowers(profileData.id, { limit: 100 })
        .then((res) => setFollowers(res.items))
        .catch(console.error);

      getFollowing(profileData.id, { limit: 100 })
        .then((res) => {
          setFollowing(res.items);
          setStats((s) => ({ ...s, following: res.meta.total }));
        })
        .catch(console.error);

      getFollowStatus(profileData.id)
        .then((status) => {
          setIsFollowing(status.is_following);
          setIsBlocked(status.is_blocking ?? false);
          initiallyFollowing.current = status.is_following;
        })
        .catch(console.error);
    }
  }, [profileData?.id, isOwner]);

  useEffect(() => {
    if (!isOwner && profileData) {
      const nowFollowing =
        (currentUser?.following_ids?.includes(profileData.id) ?? false) ||
        (!!profileData.username &&
          (currentUser?.following_ids?.includes(profileData.username) ?? false));
      setIsFollowing(nowFollowing);
    }
  }, [currentUser?.following_ids, profileData?.id, isOwner]);

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
  const storageKey = `likedTracks_${isOwner ? (currentUser?.username ?? "") : (username ?? "")}`;

  const [likedTracks, setLikedTracks] = useState<typeof mockLikedTracks>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored
      ? JSON.parse(stored)
      : currentUser && isOwner
        ? mockLikedTracks
        : [];
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
    const targetUsername = isOwner
      ? (currentUser?.username ?? "")
      : username || "";
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

  if (!currentUser) return null;

  const displayedStats = stats;

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
        userId={profileData?.id}
        displayName={user.displayName}
        tracks={displayedStats.tracks ?? 0}
        // Extra slot for Block button — rendered inside ProfileTabs "more actions"
        extraActions={
          !isOwner && profileData ? (
            <BlockButton
              userId={profileData.id}
              username={profileData.username ?? ""}
              displayName={profileData.display_name ?? user.displayName}
              isBlocked={isBlocked}
              onBlockChange={(blocked) => setIsBlocked(blocked)}
            />
          ) : undefined
        }
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
                      `${window.location.origin}/${t.artistUsername}/${t.trackSlug ?? ""}`,
                    );
                  }}
                  onEdit={() =>
                    navigate(`/${t.artistUsername}/${t.trackSlug ?? ""}`)
                  }
                  onReplaceFile={() =>
                    console.log("[TrackCard] replace file:", t.id)
                  }
                  onDelete={() => console.log("[TrackCard] delete:", t.id)}
                  onDistribute={() =>
                    console.log("[TrackCard] distribute:", t.id)
                  }
                  onAddToPlaylist={() => {}}
                />
              ))}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
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
            followers={followersDetails}
            following={followingDetails}
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
            updateMyProfile({
              display_name: data.displayName,
              first_name: data.firstName,
              last_name: data.lastName,
              bio: data.bio,
              city: data.city,
              country: data.country,
            }).catch(console.error);

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
