import { useAuthStore } from "@/stores/auth.store";
import {
  followUser,
  unfollowUser,
} from "@/services/user.service";
import { useEffect, useState } from "react";

interface FollowButtonProps {
  username: string;
  userId?: string;
  className?: string;
  isFollowingOverride?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  username,
  userId,
  className,
  isFollowingOverride,
  onFollowChange,
}: FollowButtonProps) {
  const { user, toggleFollow } = useAuthStore();
  const storeFollowing =
    (userId ? user?.following_ids?.includes(userId) : false) ||
    (user?.following_ids?.includes(username) ?? false);
  const resolvedFollowing = isFollowingOverride ?? storeFollowing;
  const [isLoading, setIsLoading] = useState(false);
  const [localFollowing, setLocalFollowing] = useState(resolvedFollowing);

  useEffect(() => {
    setLocalFollowing(resolvedFollowing);
  }, [resolvedFollowing]);

  const updateLocalState = (nextFollowing: boolean) => {
    setLocalFollowing(nextFollowing);
    toggleFollow(username, userId ? [userId] : []);
    onFollowChange?.(nextFollowing);
  };

  const rollbackLocalState = (previousFollowing: boolean) => {
    setLocalFollowing(previousFollowing);
    toggleFollow(username, userId ? [userId] : []);
    onFollowChange?.(previousFollowing);
  };

  const submitFollowChange = async (nextFollowing: boolean) => {
    const candidates = [userId, username].filter(
      (value, index, array): value is string =>
        !!value && array.indexOf(value) === index,
    );

    let lastError: unknown;

    for (const candidate of candidates) {
      try {
        if (nextFollowing) {
          await followUser(candidate);
        } else {
          await unfollowUser(candidate);
        }
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  };

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!user || isLoading) {
      return;
    }

    setIsLoading(true);
    const previousFollowing = localFollowing;
    const nextFollowing = !previousFollowing;
    updateLocalState(nextFollowing);
    try {
      await submitFollowChange(nextFollowing);
    } catch (error) {
      rollbackLocalState(previousFollowing);
      console.error("Failed to update follow status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      data-test={`follow-button-${username}`}
      onClick={handleClick}
      disabled={isLoading}
      className={`cursor-pointer rounded px-4 py-1.5 text-xs font-bold transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50 ${
        localFollowing ? "bg-input-bg text-bg-inverted" : "bg-white text-black"
      } ${className ?? ""}`}
    >
      {localFollowing ? "Following" : "Follow"}
    </button>
  );
}
