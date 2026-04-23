import { useState, useEffect, useRef } from "react";
import ProfileHeader from "../../components/Profile/ProfileHeader/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs/ProfileTabs";
import ProfileSidebar from "../../components/Profile/ProfileSideBar/ProfileSideBar";
import { useAuthStore } from "@/stores/auth.store";
import { useLikesStore } from "@/stores/likes.store";
import ShareModal from "../../components/Profile/ShareModal/ShareModal";
import EditProfileModal from "../../components/Profile/EditProfileModal/EditProfileModal";
import { Modal } from "@/components/UI/Modal";
import { BlockUserModal } from "@/components/UI/BlockModal";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { TrackCard } from "../../components/track";
import type { Track } from "../../types/track";
import {
  getMyProfile,
  getUserById,
  getUserByUsername,
  getFollowers,
  getFollowing,
  getFollowStatus,
  updateMyProfile,
  getMyLikedTracks,
  getUserLikedTracks,
  type OwnUser,
  type PublicUser,
  type UserSummary,
  type TrackSummary,
} from "@/services/user.service";
import { getMyTracks, getUserTracks } from "@/services/track.service";
import type { User } from "@/stores/auth.store";

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
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [followers, setFollowers] = useState<UserSummary[]>([]);
  const [following, setFollowing] = useState<EnrichedUserSummary[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, tracks: 0 });
  const [profileTracks, setProfileTracks] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<TrackSummary[]>([]);
  const [likedTracksCount, setLikedTracksCount] = useState(0);
  const likedTracksStoreCount = useLikesStore((s) => s.likedTracks.length);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const initiallyFollowing = useRef<boolean | null>(null);
  const currentUserId = currentUser?.id;
  const currentUsername = currentUser?.username;
  const isOwner =
    !!currentUser && (!username || username === currentUser.username);

  // ── Helper: enrich following list with per-user follower counts ──
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

  // ── Liked tracks ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadLikedTracks = async () => {
      try {
        if (isOwner) {
          const data = await getMyLikedTracks({ limit: 3 });
          const items = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
              ? data
              : [];
          const total =
            typeof data?.meta?.total === "number" && data.meta.total > 0
              ? data.meta.total
              : items.length;
          if (!cancelled) {
            setLikedTracks(items);
            setLikedTracksCount(total);
          }
        } else {
          if (!username) return;
          // profileData is guaranteed to be set before this runs (see non-owner
          // effect below), but we guard anyway.
          if (!profileData) return;
          const data = await getUserLikedTracks(profileData.id, { limit: 3 });
          const items = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
              ? data
              : [];
          const total =
            typeof data?.meta?.total === "number" && data.meta.total > 0
              ? data.meta.total
              : items.length;
          if (!cancelled) {
            setLikedTracks(items);
            setLikedTracksCount(total);
          }
        }
      } catch {
        if (!cancelled) {
          setLikedTracks([]);
          setLikedTracksCount(0);
        }
      }
    };

    loadLikedTracks();
    return () => {
      cancelled = true;
    };
  }, [isOwner, username, profileData?.id]);

  // ── Tracks ────────────────────────────────────────────────
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
        if (!profileData) return;
        const publicTracks = await getUserTracks(profileData.id, 1, 3);
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
  }, [isOwner, profileData?.id]);

  // ── Owner profile load ────────────────────────────────────
  useEffect(() => {
    if (!isOwner || !currentUser) return;

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
  }, [isOwner, currentUserId, currentUsername]);

  // ── Non-owner profile load ────────────────────────────────
  // Uses getUserByUsername (search → getUserById) — no /resolve needed.
  useEffect(() => {
    if (isOwner || !username) return;

    let cancelled = false;
    setIsLoadingProfile(true);

    const load = async () => {
      try {
        // 1. Resolve username → full PublicUser in one logical step.
        //    getUserByUsername does: GET /search?type=users&q=:username
        //    then GET /users/:id for the matched user.
        const profile = await getUserByUsername(username);
        if (cancelled) return;

        setProfileData(profile);
        setStats({
          followers: profile.followers_count,
          following: profile.following_count,
          tracks: 0,
        });

        const userId = profile.id;

        // 2. Fetch followers + follow-status in parallel (non-blocking for following).
        const [followersRes, followStatus] = await Promise.allSettled([
          getFollowers(userId, { limit: 100 }),
          getFollowStatus(userId),
        ]);
        if (cancelled) return;

        if (followersRes.status === "fulfilled") {
          setFollowers(followersRes.value.items);
        }

        if (followStatus.status === "fulfilled") {
          setIsFollowing(followStatus.value.is_following);
          setIsBlocked(followStatus.value.is_blocking ?? false);
          initiallyFollowing.current = followStatus.value.is_following;
        }

        // 3. Enrich following with follower counts (slow — fire and forget).
        loadFollowingWithCounts(userId).catch(console.error);
      } catch (err) {
        console.error("[UsernamePage] failed to load non-owner profile:", err);
      } finally {
        if (!cancelled) setIsLoadingProfile(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOwner, username]);

  // ── Keep local isFollowing in sync with the auth store ───
  useEffect(() => {
    if (!isOwner && profileData) {
      const nowFollowing =
        currentUser?.following_ids?.includes(profileData.id) ?? false;
      setIsFollowing(nowFollowing);
    }
  }, [currentUser?.following_ids, profileData?.id, isOwner]);

  // ── Tab routing ───────────────────────────────────────────
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

  // ── Guards ────────────────────────────────────────────────
  if (!currentUser) return null;

  // Show a loading state while the non-owner profile is being fetched so
  // child components never render with an empty user object.
  if (!isOwner && isLoadingProfile && !profileData) {
    return (
      <div className="container px-4 md:px-8 lg:px-20 flex items-center justify-center py-32">
        <p className="text-white text-sm">Loading profile…</p>
      </div>
    );
  }

  // ── Build display user object ─────────────────────────────
  // Owner  → use the auth-store user (kept in sync by the owner effect).
  // Others → build purely from profileData; never spread currentUser.
  const user: User = isOwner
    ? currentUser
    : {
        id: profileData?.id ?? "",
        username: profileData?.username ?? username ?? "",
        displayName:
          profileData?.display_name ?? profileData?.username ?? username ?? "",
        email: "",
        firstName: "",
        lastName: "",
        bio: profileData?.bio ?? "",
        avatar: profileData?.profile_picture ?? undefined,
        coverUrl: profileData?.cover_photo ?? undefined,
        location: (profileData as PublicUser | null)?.location ?? "",
        role: profileData?.role ?? "listener",
        isPro: false,
        following_ids: currentUser.following_ids,
        followers_ids: [],
      };

  const likedTracksMapped = (Array.isArray(likedTracks) ? likedTracks : []).map(
    (t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist_name,
      coverUrl: t.cover_image ?? undefined,
      plays: t.play_count,
      likes: t.like_count,
    }),
  );

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

        <div
          className="sticky top-24 self-start min-w-0 overflow-hidden"
          style={{ maxWidth: "min-content" }}
        >
          <ProfileSidebar
            user={user}
            isOwner={isOwner}
            likedTracks={likedTracksMapped}
            likedTracksCount={
              isOwner
                ? Math.max(likedTracksCount, likedTracksStoreCount)
                : likedTracksCount
            }
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
