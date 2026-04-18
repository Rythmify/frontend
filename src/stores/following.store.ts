import { create } from "zustand";
import type { User } from "@/types/user";
import { getMyFollowing } from "@/services/api/library.service";
import { getUserById } from "@/services/user.service";

interface FollowingStore {
  followingUsers: User[];
  addFollowing: (userId: string) => Promise<void>;
  removeFollowing: (userId: string) => void;
  hydrateFollowing: () => Promise<void>;
}

export const useFollowingStore = create<FollowingStore>((set, get) => ({
  followingUsers: [],

  addFollowing: async (userId) => {
    if (get().followingUsers.some((u) => u.id === userId)) return;
    try {
      const profile = await getUserById(userId);
      set((s) => ({
        followingUsers: [
          {
            id: userId,
            username: profile.username ?? userId,
            displayName: profile.display_name,
            avatar: profile.profile_picture ?? undefined,
            followers: profile.followers_count,
            isVerified: profile.is_verified,
          },
          ...s.followingUsers,
        ],
      }));
    } catch {
      // silent — user will see updated list on next hydration
    }
  },

  removeFollowing: (userId) =>
    set((s) => ({
      followingUsers: s.followingUsers.filter((u) => u.id !== userId),
    })),

  hydrateFollowing: async () => {
    try {
      const items = await getMyFollowing();
      const enriched = await Promise.all(
        items.map(async (f) => {
          try {
            const profile = await getUserById(f.id);
            return {
              id: f.id,
              username: f.username,
              displayName: profile.display_name,
              avatar: profile.profile_picture ?? undefined,
              followers: profile.followers_count,
              isVerified: profile.is_verified,
            } as User;
          } catch {
            return {
              id: f.id,
              username: f.username,
              displayName: f.display_name,
              avatar: f.profile_picture ?? undefined,
              followers: 0,
              isVerified: f.is_verified,
            } as User;
          }
        }),
      );
      set({ followingUsers: enriched });
    } catch {
      // keep existing state
    }
  },
}));
