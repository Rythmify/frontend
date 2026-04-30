import { followUser, unfollowUser } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth.store";
import { useState } from "react";

interface FollowButtonProps {
  username: string;
  userId?: string;
  isFollowingOverride?: boolean;
  className?: string;
}

export default function FollowButton({
  username,
  userId,
  isFollowingOverride,
  className,
}: FollowButtonProps) {
  const { user, setUser, toggleFollow } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const isFollowing =
    isFollowingOverride ??
    ((!!userId && (user?.following_ids?.includes(userId) ?? false)) ||
      (user?.following_ids?.includes(username) ?? false));

  const syncFollowingIds = (nextIsFollowing: boolean) => {
    if (!user) {
      return;
    }

    if (!userId || userId === username) {
      toggleFollow(username);
      return;
    }

    const idsToSync = [username, userId];
    const followingSet = new Set(user.following_ids);

    idsToSync.forEach((id) => {
      if (nextIsFollowing) {
        followingSet.add(id);
      } else {
        followingSet.delete(id);
      }
    });

    setUser({
      ...user,
      following_ids: Array.from(followingSet),
    });
  };

  return (
    <button
      data-test={`follow-button-${username}`}
      onClick={async (e) => {
        e.stopPropagation();
        if (!userId) {
          toggleFollow(username);
          return;
        }

        setIsLoading(true);

        try {
          if (isFollowing) {
            await unfollowUser(userId);
            syncFollowingIds(false);
          } else {
            await followUser(userId);
            syncFollowingIds(true);
          }
        } catch (error) {
          console.error("Failed to update follow status:", error);
        } finally {
          setIsLoading(false);
        }
      }}
      disabled={isLoading}
      className={`cursor-pointer px-4 py-1.5 text-xs font-bold rounded hover:opacity-70 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
        isFollowing ? "bg-input-bg text-bg-inverted" : "bg-bg text-bg-inverted"
      } ${className ?? ""}`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
