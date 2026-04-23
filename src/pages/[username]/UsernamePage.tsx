import { useState, useEffect, useRef } from "react";
import ProfileHeader from "../../components/Profile/ProfileHeader/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs/ProfileTabs";
import ProfileSidebar from "../../components/Profile/ProfileSideBar/ProfileSideBar";
import { useAuthStore } from "@/stores/auth.store";
import ShareModal from "../../components/Profile/ShareModal/ShareModal";
import EditProfileModal from "../../components/Profile/EditProfileModal/EditProfileModal";
import { Modal } from "@/components/UI/Modal";
import { BlockUserModal } from "@/components/UI/BlockModal";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { TrackCard } from "../../components/track";
import { useProfileSidebarLikes } from "./useProfileSidebarLikes";
import type { Track } from "../../types/track";
import {
  getMyProfile,
  getUserById,
  getFollowers,
  getFollowing,
  getFollowStatus,
  resolveUsername,
  updateMyProfile,
  getMyLikedTracks,
  getUserLikedTracks,
  type OwnUser,
  type PublicUser,
  type UserSummary,
  type TrackSummary,
} from "@/services/user.service";
import { getMyTracks, getUserTracks } from "@/services/track.service";

type EnrichedUserSummary = UserSummary & { followers_count: number };

export default function UsernamePage() {
  const { username } = useParams();
  const { user: currentUser, setUser } = useAuthStore();
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [profileData, setProfileData] = useState<OwnUser | PublicUser | null>(
    null,
  );
  const [followers, setFollowers] = useState<UserSummary[]>([]);
  const [following, setFollowing] = useState<EnrichedUserSummary[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, tracks: 0 });
  const [profileTracks, setProfileTracks] = useState<Track[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const initiallyFollowing = useRef<boolean | null>(null);
  const currentUserId = currentUser?.id;
  const currentUsername = currentUser?.username;
  const isOwner =
    !!currentUser && (!username || username === currentUser.username);
  const { likedTracks, likedTracksCount } = useProfileSidebarLikes(username, isOwner);

  const loadFollowingWithCounts = async (userId: string): Promise<void> => {
    const res = await getFollowing(userId, { limit: 100 });
    setStats((s) => ({ ...s, following: res.meta.total }));
    const profileResults = await Promise.allSettled(
      res.items.map((u) => getUserById(u.id)),
    );
    const enriched: EnrichedUserSummary[] = res.items.map((u, i) => {
      const result = profileResults[i];
      const followers_count =
        result.status === "fulfilled" ? result.value.followers_count : 0;
      return { ...u, followers_count };
    });
    setFollowing(enriched);
  };

  useEffect(() => {
    let cancelled = false;
    const loadTracks = async () => {
      try {
        if (isOwner) {
          const ownedTracks = await getMyTracks(1, 100);
          if (cancelled) return;
          setProfileTracks(ownedTracks);
          setStats((prev) => ({ ...prev, tracks: ownedTracks.length }));
          return;
        }
        if (!username) return;
        const userId = await resolveUsername(username);
        const publicTracks = await getUserTracks(userId, 1, 3);
        if (cancelled) return;
        setProfileTracks(publicTracks);
        setStats((prev) => ({ ...prev, tracks: publicTracks.length }));
      } catch (error) {
        console.error(error);
        if (!cancelled) setProfileTracks([]);
      }
    };
    loadTracks();
    return () => {
      cancelled = true;
    };
  }, [isOwner, username]);

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

      if (currentUserId) {
        getFollowers(currentUserId, { limit: 100 })
          .then((res) => {
            setFollowers(res.items);
            setStats((s) => ({ ...s, followers: res.meta.total }));
          })
          .catch(console.error);

        loadFollowingWithCounts(currentUserId)
          .then(() => {
            const { user: storeUser, setUser: storeSetUser } =
              useAuthStore.getState();
            if (storeUser) {
              getFollowing(currentUserId, { limit: 100 })
                .then((res) => {
                  const existingIds = new Set(storeUser.following_ids);
                  const newIds = res.items
                    .map((u) => u.id)
                    .filter((id) => !existingIds.has(id));
                  if (newIds.length > 0) {
                    storeSetUser({
                      ...storeUser,
                      following_ids: [...storeUser.following_ids, ...newIds],
                    });
                  }
                })
                .catch(console.error);
            }
          })
          .catch(console.error);
      }
    } else {
      if (!username) return;
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
    if (!isOwner && profileData) {
      getFollowers(profileData.id, { limit: 100 })
        .then((res) => setFollowers(res.items))
        .catch(console.error);

      loadFollowingWithCounts(profileData.id).catch(console.error);

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
        currentUser?.following_ids?.includes(profileData.id) ?? false;
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

  const followingMapped = following.map((u) => ({
    userId: u.id,
    username: u.username ?? u.id,
    displayName: u.display_name,
    avatar: u.profile_picture ?? "",
    followers: u.followers_count,
    tracks: 0,
    isVerified: u.is_verified,
  }));

  const followersMapped = followers.map((u) => ({
    userId: u.id,
    username: u.username ?? u.id,
    avatar: u.profile_picture ?? "",
    displayName: u.display_name,
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
        tracks={stats.tracks ?? 0}
        onBlock={!isOwner && profileData ? () => setShowBlock(true) : undefined}
        blockDisabled={!profileData}
        userId={isOwner ? currentUser.id : (profileData?.id ?? "")}
        profilePicture={
          isOwner
            ? (currentUser.avatar ?? null)
            : (profileData?.profile_picture ?? null)
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
        <div className="sticky top-24 self-start">
          <ProfileSidebar
            user={user}
            isOwner={isOwner}
            likedTracks={likedTracks}
            likedTracksCount={likedTracksCount}
            followers={followersMapped}
            following={followingMapped}
            stats={stats}
            onTabChange={handleTabChange}
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
      {showBlock && profileData && (
        <Modal isOpen={showBlock} onClose={() => setShowBlock(false)}>
          <BlockUserModal
            username={
              profileData.display_name ??
              profileData.username ??
              user.displayName
            }
            userId={profileData.id}
            onClose={() => setShowBlock(false)}
            onBlocked={() => {
              setIsBlocked(true);
              setShowBlock(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
