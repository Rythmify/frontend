import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { getMyTracks, getUserTracks } from "@/services/track.service";
import {
  getMyProfile,
  getUserById,
  getUserByUsername,
  getFollowers,
  getFollowing,
  getFollowStatus,
  updateMyProfile,
  type OwnUser,
  type PublicUser,
  type UserSummary,
} from "@/services/user.service";
import type { User } from "@/stores/auth.store";

export interface ProfileStats {
  followers: number;
  following: number;
  tracks: number;
}

// UserSummary enriched with a follower count (used by the "All" tab sidebar)
export type EnrichedUserSummary = UserSummary & { followers_count: number };

export interface ProfileDataResult {
  // ── Display data ─────────────────────────────────────────
  user: User;
  profileData: OwnUser | PublicUser | null;
  stats: ProfileStats;
  followers: UserSummary[];
  following: EnrichedUserSummary[];
  isOwner: boolean;
  activeUser: User | null;
  // ── Social state (non-owner only) ────────────────────────
  isFollowing: boolean;
  isBlocked: boolean;
  // ── Loading ──────────────────────────────────────────────
  isLoadingProfile: boolean;
  // ── Actions ──────────────────────────────────────────────
  handleTabChange: (tab: string, navigate: (path: string) => void) => void;
  handleSave: (
    data: {
      displayName: string;
      firstName: string;
      lastName: string;
      bio: string;
      city: string;
      country: string;
      location: string;
      avatarFile?: File | null;
    },
    onDone: () => void,
  ) => void;
}

export function useProfileData(
  username: string | undefined,
): ProfileDataResult {
  const { user: currentUser, setUser } = useAuthStore();

  const isOwner = !!currentUser && (!username || username === currentUser.username);
  const activeUser = currentUser;

  const [profileData, setProfileData] = useState<OwnUser | PublicUser | null>(
    null,
  );
  const [followers, setFollowers] = useState<UserSummary[]>([]);
  const [following, setFollowing] = useState<EnrichedUserSummary[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    followers: 0,
    following: 0,
    tracks: 0,
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const initiallyFollowing = useRef<boolean | null>(null);

  // ── Helper: fetch following list and enrich each entry with follower count ──
  // Returns the counts from the API so the caller can set stats atomically.
  const loadFollowingWithCounts = async (
    userId: string,
  ): Promise<{ items: EnrichedUserSummary[]; total: number }> => {
    const res = await getFollowing(userId, { limit: 100 });
    const profileResults = await Promise.allSettled(
      res.items.map((u) => getUserById(u.id)),
    );
    const enriched: EnrichedUserSummary[] = res.items.map((u, i) => {
      const result = profileResults[i];
      const followers_count =
        result.status === "fulfilled" ? result.value.followers_count : 0;
      return { ...u, followers_count };
    });
    return { items: enriched, total: res.meta.total };
  };

  // ── Owner load ────────────────────────────────────────────
  useEffect(() => {
    if (!isOwner || !currentUser) return;
    let cancelled = false;

    const load = async () => {
      try {
        // Fire everything in parallel — profile, tracks, followers, following+counts
        const [profile, ownedTracks, followersRes, followingResult] =
          await Promise.all([
            getMyProfile(),
            getMyTracks(1, 100),
            getFollowers(currentUser.id, { limit: 100 }),
            loadFollowingWithCounts(currentUser.id),
          ]);

        if (cancelled) return;

        setProfileData(profile);
        setFollowers(followersRes.items);
        setFollowing(followingResult.items);

        // Set stats once from a single source of truth — no second setState race
        setStats({
          followers: followersRes.meta.total,
          following: followingResult.total,
          tracks: ownedTracks.total,
        });

        // Sync auth store
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

        // Sync following_ids into the auth store without duplicates
        const storeState = useAuthStore.getState();
        if (storeState.user) {
          const existingIds = new Set(storeState.user.following_ids);
          const newIds = followingResult.items
            .map((u) => u.id)
            .filter((id) => !existingIds.has(id));
          if (newIds.length > 0) {
            storeState.setUser({
              ...storeState.user,
              following_ids: [...storeState.user.following_ids, ...newIds],
            });
          }
        }
      } catch (err) {
        console.error("[useProfileData] owner load error:", err);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOwner, currentUser?.id, currentUser?.username]);

  // ── Non-owner load ────────────────────────────────────────
  useEffect(() => {
    if (isOwner || !username) return;
    let cancelled = false;
    setIsLoadingProfile(true);

    const load = async () => {
      try {
        // 1. Resolve username → full PublicUser
        const profile = await getUserByUsername(username);
        if (cancelled) return;

        setProfileData(profile);
        const userId = profile.id;

        // 2. Fetch tracks, followers, follow-status in parallel.
        //    followingWithCounts is slow (N+1 calls) so we fire it separately.
        const [userTracks, followersRes, followStatus] =
          await Promise.allSettled([
            getUserTracks(userId, 1, 100),
            getFollowers(userId, { limit: 100 }),
            getFollowStatus(userId),
          ]);
        if (cancelled) return;

        // Set stats from the profile object first (always available),
        // then overwrite followers count from the actual list (more accurate).
        const followersTotal =
          followersRes.status === "fulfilled"
            ? followersRes.value.meta.total
            : profile.followers_count;

        const tracksTotal =
          userTracks.status === "fulfilled" ? userTracks.value.total : 0;

        setStats({
          followers: followersTotal,
          following: profile.following_count,
          tracks: tracksTotal,
        });

        if (followersRes.status === "fulfilled") {
          setFollowers(followersRes.value.items);
        }

        if (followStatus.status === "fulfilled") {
          setIsFollowing(followStatus.value.is_following);
          setIsBlocked(followStatus.value.is_blocking ?? false);
          initiallyFollowing.current = followStatus.value.is_following;
        }

        // 3. Enrich following with follower counts (slow — fire and forget).
        //    Update following count in stats once we get the real total.
        loadFollowingWithCounts(userId)
          .then(({ items, total }) => {
            if (!cancelled) {
              setFollowing(items);
              setStats((s) => ({ ...s, following: total }));
            }
          })
          .catch(console.error);
      } catch (err) {
        console.error("[useProfileData] non-owner load error:", err);
      } finally {
        if (!cancelled) setIsLoadingProfile(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOwner, username]);

  // ── Keep isFollowing in sync with auth store's following_ids ──
  useEffect(() => {
    if (!isOwner && profileData) {
      const nowFollowing =
        currentUser?.following_ids?.includes(profileData.id) ?? false;
      setIsFollowing(nowFollowing);
    }
  }, [currentUser?.following_ids, profileData?.id, isOwner]);

  // ── Tab routing ───────────────────────────────────────────
  const handleTabChange = (tab: string, navigate: (path: string) => void) => {
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

  // ── Edit profile save ─────────────────────────────────────
  const handleSave = (
    data: {
      displayName: string;
      firstName: string;
      lastName: string;
      bio: string;
      city: string;
      country: string;
      location: string;
      avatarFile?: File | null;
    },
    onDone: () => void,
  ) => {
    updateMyProfile({
      display_name: data.displayName,
      first_name: data.firstName,
      last_name: data.lastName,
      bio: data.bio,
      city: data.city,
      country: data.country,
    }).catch(console.error);

    const latestUser = useAuthStore.getState().user;
    if (!latestUser) return;

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
    onDone();
  };

  // ── Build display user object ─────────────────────────────
  const user: User = isOwner
    ? currentUser!
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
        following_ids: currentUser?.following_ids ?? [],
        followers_ids: [],
      };

  return {
    user,
    profileData,
    stats,
    followers,
    following,
    isOwner,
    activeUser,
    isFollowing,
    isBlocked,
    isLoadingProfile,
    handleTabChange,
    handleSave,
  };
}
