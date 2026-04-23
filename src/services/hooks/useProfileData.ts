import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { getMyTracks, getUserTracks } from "@/services/track.service";
import {
  getMyProfile,
  getUserByUsername,
  getFollowers,
  getFollowing,
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

export interface ProfileDataResult {
  user: User;
  profileData: OwnUser | PublicUser | null;
  stats: ProfileStats;
  followers: UserSummary[];
  following: UserSummary[];
  isOwner: boolean;
  activeUser: User;
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

  const isOwner = !username || username === currentUser?.username;
  const activeUser = currentUser!;

  const [profileData, setProfileData] = useState<OwnUser | PublicUser | null>(
    null,
  );
  const [followers, setFollowers] = useState<UserSummary[]>([]);
  const [following, setFollowing] = useState<UserSummary[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    followers: 0,
    following: 0,
    tracks: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (isOwner) {
          // Fetch profile, tracks, followers, following all in parallel
          const [profile, ownedTracks, followersRes, followingRes] =
            await Promise.all([
              getMyProfile(),
              getMyTracks(1, 100),
              getFollowers(activeUser.id, { limit: 100 }),
              getFollowing(activeUser.id, { limit: 100 }),
            ]);

          if (cancelled) return;

          setProfileData(profile);
          setFollowers(followersRes.items);
          setFollowing(followingRes.items);
          setStats({
            followers: followersRes.meta.total,
            following: followingRes.meta.total,
            tracks: ownedTracks.total,
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
        } else {
          if (!username) return;

          // Resolve profile first, then fetch tracks + followers/following in parallel
          const profile = await getUserByUsername(username);
          if (cancelled) return;

          setProfileData(profile);

          const [userTracks, followersRes, followingRes] = await Promise.all([
            getUserTracks(profile.id, 1, 100),
            getFollowers(profile.id, { limit: 100 }),
            getFollowing(profile.id, { limit: 100 }),
          ]);

          if (cancelled) return;

          setFollowers(followersRes.items);
          setFollowing(followingRes.items);
          setStats({
            followers: followersRes.meta.total,
            following: followingRes.meta.total,
            tracks: userTracks.total,
          });
        }
      } catch (err) {
        console.error("[useProfileData] load error:", err);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [username, isOwner]);

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
    onDone();
  };

  // Build the display user object
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
    handleTabChange,
    handleSave,
  };
}
