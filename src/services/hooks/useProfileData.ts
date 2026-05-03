import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { getMyTracks, getUserTracks } from "@/services/track.service";
import {
  getMyProfile,
  getMyWebProfiles,
  getUserById,
  getUserByUsername,
  getUserWebProfiles,
  getFollowers,
  getFollowing,
  getFollowStatus,
  getBlockedUsers,
  addWebProfile,
  deleteWebProfile,
  updateMyProfile,
  type OwnUser,
  type PublicUser,
  type WebProfile,
  type WebProfilePlatform,
  type UserSummary,
} from "@/services/user.service";
import type { User } from "@/stores/auth.store";
import type { ProfileLink } from "@/stores/auth.store";

export interface ProfileStats {
  followers: number;
  following: number;
  tracks: number;
}

const normalizeLinkHref = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    return new URL(trimmed).toString();
  } catch {
    return `https://${trimmed.replace(/^\/+/, "")}`;
  }
};

const platformLabel: Record<WebProfilePlatform, string> = {
  instagram: "Instagram",
  twitter: "Twitter",
  youtube: "YouTube",
  tiktok: "TikTok",
  soundcloud: "SoundCloud",
  website: "Website",
  other: "Support",
};

const inferPlatformFromUrl = (url: string, isSupport?: boolean): WebProfilePlatform => {
  if (isSupport) return "other";

  const href = normalizeLinkHref(url);
  try {
    const host = new URL(href).hostname.toLowerCase();
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("twitter.com") || host.includes("x.com")) return "twitter";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("soundcloud.com")) return "soundcloud";
  } catch {
    // fall through to website
  }

  return "website";
};

const readPublicProfilePremiumFlag = (profile: PublicUser | null): boolean => {
  if (!profile) return false;

  const rawProfile = profile as PublicUser & {
    is_premium?: boolean;
    is_pro?: boolean;
    isPremium?: boolean;
    isPro?: boolean;
    premium?: boolean;
    subscription_plan?: { name?: string | null };
    subscription?: { plan?: { name?: string | null } };
  };

  if (typeof rawProfile.is_user_premium === "boolean") return rawProfile.is_user_premium;
  if (typeof rawProfile.is_premium === "boolean") return rawProfile.is_premium;
  if (typeof rawProfile.is_pro === "boolean") return rawProfile.is_pro;
  if (typeof rawProfile.isPremium === "boolean") return rawProfile.isPremium;
  if (typeof rawProfile.isPro === "boolean") return rawProfile.isPro;
  if (typeof rawProfile.premium === "boolean") return rawProfile.premium;

  const planName =
    rawProfile.subscription_plan?.name ?? rawProfile.subscription?.plan?.name;
  if (typeof planName === "string") {
    return planName.toLowerCase() === "premium";
  }

  return rawProfile.role === "artist";
};

const getPublicProfileLocation = (profile: PublicUser | null): string => {
  if (!profile) return "";

  const explicitLocation = profile.location?.trim();
  if (explicitLocation) return explicitLocation;

  return [profile.city?.trim(), profile.country?.trim()].filter(Boolean).join(", ");
};

const mapBackendWebProfilesToLinks = (
  profiles: WebProfile[],
  fallbackLinks: ProfileLink[] = [],
): ProfileLink[] => {
  return profiles.map((profile) => {
    const fallback = fallbackLinks.find(
      (link) =>
        link.id === profile.id ||
        normalizeLinkHref(link.url) === normalizeLinkHref(profile.url),
    );

    return {
      id: profile.id,
      url: profile.url,
      title: fallback?.title?.trim() || platformLabel[profile.platform],
      isSupport: fallback?.isSupport ?? profile.platform === "other",
    };
  });
};

const syncWebProfiles = async (
  desiredLinks: ProfileLink[],
  fallbackLinks: ProfileLink[] = [],
): Promise<ProfileLink[]> => {
  const cleaned = desiredLinks
    .map((link) => ({
      ...link,
      url: normalizeLinkHref(link.url),
      title: link.title.trim(),
    }))
    .filter((link) => link.url);

  const existingProfiles = await getMyWebProfiles({ limit: 100, offset: 0 }).catch(
    () => [],
  );

  await Promise.all(existingProfiles.map((profile) => deleteWebProfile(profile.id)));

  if (cleaned.length === 0) return [];

  const createdProfiles = await Promise.all(
    cleaned.map((link) =>
      addWebProfile({
        platform: inferPlatformFromUrl(link.url, link.isSupport),
        url: link.url,
      }),
    ),
  );

  return createdProfiles.map((profile, index) => ({
    id: profile.id,
    url: profile.url,
    title:
      cleaned[index].title ||
      fallbackLinks.find(
        (link) =>
          normalizeLinkHref(link.url) === normalizeLinkHref(profile.url) ||
          link.id === profile.id,
      )?.title ||
      platformLabel[profile.platform],
    isSupport:
      cleaned[index].isSupport ??
      fallbackLinks.find(
        (link) =>
          normalizeLinkHref(link.url) === normalizeLinkHref(profile.url) ||
          link.id === profile.id,
      )?.isSupport ??
      profile.platform === "other",
  }));
};

// UserSummary enriched with sidebar-specific metadata.
export type EnrichedUserSummary = UserSummary & {
  followers_count: number;
  isFollowing?: boolean;
};

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
  isBlockedBy: boolean;
  // ── Loading ──────────────────────────────────────────────
  isLoadingProfile: boolean;
  // ── Actions ──────────────────────────────────────────────
  refreshProfileData: () => void;
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
      links?: ProfileLink[];
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
  const [isBlockedBy, setIsBlockedBy] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
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
    const followStatusResults = await Promise.allSettled(
      res.items.map((u) => getFollowStatus(u.id)),
    );
    const enriched: EnrichedUserSummary[] = res.items.map((u, i) => {
      const result = profileResults[i];
      const followStatus = followStatusResults[i];
      const followers_count =
        result.status === "fulfilled" ? result.value.followers_count : 0;
      const isFollowing =
        followStatus.status === "fulfilled"
          ? followStatus.value.is_following
          : undefined;
      return { ...u, followers_count, isFollowing };
    });
    return { items: enriched, total: res.meta.total };
  };

  const refreshProfileData = () => {
    setRefreshVersion((version) => version + 1);
  };

  // ── Owner load ────────────────────────────────────────────
  useEffect(() => {
    if (!isOwner || !currentUser) return;
    let cancelled = false;

    const load = async () => {
      try {
        // Fire everything in parallel — profile, web links, tracks, followers, following+counts
        const [profile, webProfilesResult, ownedTracks, followersRes, followingResult, blockedRes] =
          await Promise.all([
            getMyProfile(),
            getMyWebProfiles({
              limit: 100,
              offset: 0,
            })
              .then((value) => ({ status: "fulfilled" as const, value }))
              .catch((reason) => ({ status: "rejected" as const, reason })),
            getMyTracks(1, 100),
            getFollowers(currentUser.id, { limit: 100 }),
            loadFollowingWithCounts(currentUser.id),
            getBlockedUsers({ limit: 100 }),
          ]);

        if (cancelled) return;

        const blockedIds = new Set(blockedRes.items.map((u) => u.id));
        const filteredFollowers = followersRes.items.filter(
          (u) => !blockedIds.has(u.id),
        );
        const filteredFollowing = followingResult.items.filter(
          (u) => !blockedIds.has(u.id),
        );
        const hiddenFollowersCount =
          followersRes.items.length - filteredFollowers.length;
        const hiddenFollowingCount =
          followingResult.items.length - filteredFollowing.length;
        const latestUser = useAuthStore.getState().user ?? currentUser;
        const mergedLinks =
          webProfilesResult.status === "fulfilled"
            ? mapBackendWebProfilesToLinks(
                webProfilesResult.value,
                latestUser.links ?? currentUser.links ?? [],
              )
            : latestUser.links ?? currentUser.links ?? [];
        setProfileData({ ...profile, links: mergedLinks });
        setFollowers(filteredFollowers);
        setFollowing(filteredFollowing);

        // Set stats once from a single source of truth — no second setState race
        setStats({
          followers: Math.max(0, followersRes.meta.total - hiddenFollowersCount),
          following: Math.max(0, followingResult.total - hiddenFollowingCount),
          tracks: ownedTracks.total,
        });

        // Sync auth store
        setUser({
          ...latestUser,
          displayName: profile.display_name || latestUser.displayName,
          firstName:
            (profile as OwnUser).first_name ?? latestUser.firstName ?? "",
          lastName:
            (profile as OwnUser).last_name ?? latestUser.lastName ?? "",
          bio: profile.bio || "",
          avatar: profile.profile_picture ?? latestUser.avatar,
          coverUrl: profile.cover_photo ?? latestUser.coverUrl,
          city: (profile as OwnUser).city ?? latestUser.city,
          country: (profile as OwnUser).country ?? latestUser.country,
          location:
            [(profile as OwnUser).city, (profile as OwnUser).country]
              .filter(Boolean)
              .join(", ") || latestUser.location,
          links: mergedLinks,
        });

        // Sync following_ids into the auth store without duplicates
        const storeState = useAuthStore.getState();
        if (storeState.user) {
          const existingIds = new Set(storeState.user.following_ids);
          const newIds = followingResult.items
            .map((u) => u.id)
            .filter((id) => !existingIds.has(id) && !blockedIds.has(id));
          const nextFollowingIds = Array.from(
            new Set(
              [
                ...storeState.user.following_ids.filter(
                  (id) => !blockedIds.has(id),
                ),
                ...newIds,
              ],
            ),
          );
          if (nextFollowingIds.length !== storeState.user.following_ids.length) {
            storeState.setUser({
              ...storeState.user,
              following_ids: nextFollowingIds,
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
  }, [isOwner, currentUser?.id, currentUser?.username, refreshVersion]);

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

        const userId = profile.id;

        // 2. Fetch web links, tracks, followers, follow-status in parallel.
        //    followingWithCounts is slow (N+1 calls) so we fire it separately.
        const [webProfilesResult, userTracks, followersRes, followStatus] =
          await Promise.allSettled([
            getUserWebProfiles(userId, { limit: 100, offset: 0 }),
            getUserTracks(userId, 1, 100),
            getFollowers(userId, { limit: 100 }),
            getFollowStatus(userId),
          ]);
        if (cancelled) return;

        const links =
          webProfilesResult.status === "fulfilled"
            ? mapBackendWebProfilesToLinks(webProfilesResult.value, profile.links ?? [])
            : profile.links ?? [];
        setProfileData({ ...profile, links });

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
          setIsBlockedBy(followStatus.value.is_blocked_by ?? false);
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
  }, [isOwner, username, refreshVersion]);

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
  const handleSave = async (
    data: {
      displayName: string;
      firstName: string;
      lastName: string;
      bio: string;
      city: string;
      country: string;
      location: string;
      avatarFile?: File | null;
      links?: ProfileLink[];
    },
    onDone: () => void,
  ) => {
    const updatedProfile = await updateMyProfile({
      display_name: data.displayName,
      first_name: data.firstName,
      last_name: data.lastName,
      bio: data.bio,
      city: data.city,
      country: data.country,
    }).catch((error) => {
      console.error(error);
      throw error;
    });

    const latestUser = useAuthStore.getState().user;
    if (!latestUser) return;

    const syncedLinks = await syncWebProfiles(
      data.links ?? [],
      latestUser.links ?? [],
    ).catch((error) => {
      console.error(error);
      throw error;
    });

    setUser({
      ...latestUser,
      displayName:
        updatedProfile.display_name ?? data.displayName ?? latestUser.displayName,
      firstName:
        updatedProfile.first_name ?? data.firstName ?? latestUser.firstName,
      lastName:
        updatedProfile.last_name ?? data.lastName ?? latestUser.lastName,
      bio: updatedProfile.bio ?? data.bio ?? latestUser.bio,
      city: updatedProfile.city ?? data.city ?? latestUser.city,
      country: updatedProfile.country ?? data.country ?? latestUser.country,
      location: data.location,
      links: syncedLinks,
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
        location: getPublicProfileLocation(profileData as PublicUser | null),
        role: profileData?.role ?? "listener",
        isPro: readPublicProfilePremiumFlag(profileData as PublicUser | null),
        links: (profileData as PublicUser & { links?: ProfileLink[] } | null)
          ?.links ?? [],
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
    isBlockedBy,
    isLoadingProfile,
    refreshProfileData,
    handleTabChange,
    handleSave,
  };
}
