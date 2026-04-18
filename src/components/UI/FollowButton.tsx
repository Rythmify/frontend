import { useAuthStore } from "@/stores/auth.store";
import { followUser, unfollowUser } from "@/services/user.service";
import { useState } from "react";

interface FollowButtonProps {
  username: string;
  userId?: string;
  className?: string;
  initialIsFollowing?: boolean; // ← add this
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  username,
  userId,
  className,
  initialIsFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const { user, toggleFollow } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const isSelf = !!user && !!userId && user.id === userId;

  // If initialIsFollowing is explicitly provided, use it as the base,
  // but still let the store override if it has tracked a change this session
  const storeIsFollowing =
    !!userId && (user?.following_ids?.includes(userId) ?? false);
  const isFollowing =
    initialIsFollowing !== undefined
      ? storeIsFollowing || initialIsFollowing // store wins if it tracked a change
      : storeIsFollowing;

  // Track if user has explicitly toggled so we can flip initialIsFollowing logic
  const [hasToggled, setHasToggled] = useState(false);
  const resolvedIsFollowing = hasToggled ? storeIsFollowing : isFollowing;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!user || isLoading || isSelf || !userId) return;

    const next = !resolvedIsFollowing;
    setIsLoading(true);
    setHasToggled(true);

    toggleFollow(username, [userId]);
    onFollowChange?.(next);

    try {
      if (next) {
        await followUser(userId);
      } else {
        await unfollowUser(userId);
      }
    } catch (err) {
      toggleFollow(username, [userId]);
      onFollowChange?.(!next);
      setHasToggled(false);
      console.error("FollowButton: API error", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSelf) return null;

  return (
    <button
      data-test={`follow-button-${username}`}
      onClick={handleClick}
      disabled={isLoading || !userId}
      className={`cursor-pointer rounded px-4 py-1.5 text-xs font-bold transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50 ${
        resolvedIsFollowing
          ? "bg-input-bg text-bg-inverted"
          : "bg-white text-black"
      } ${className ?? ""}`}
    >
      {resolvedIsFollowing ? "Following" : "Follow"}
    </button>
  );
}
