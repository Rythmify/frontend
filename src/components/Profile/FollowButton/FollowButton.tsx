import { useAuthStore } from "@/stores/auth.store";
import { followUser, unfollowUser } from "@/services/api/notifications/notificationsAPI";
import { useState } from "react";

interface FollowButtonProps {
  username: string;
  userId?: string;
  className?: string;
}

export default function FollowButton({
  username,
  userId,
  className,
}: FollowButtonProps) {
  const { user, toggleFollow } = useAuthStore();
  const isFollowing = user?.following_ids?.includes(username) ?? false;
  const [isLoading, setIsLoading] = useState(false);

  return (
    <button
      data-test={`follow-button-${username}`}
      disabled={isLoading}
      onClick={async (e) => {
        e.stopPropagation();
        setIsLoading(true);
        try {
          const targetId = userId || username;
          if (isFollowing) {
            await unfollowUser(targetId);
          } else {
            await followUser(targetId);
          }
          toggleFollow(username);
        } catch (error) {
          console.error("Failed to update follow status:", error);
        } finally {
          setIsLoading(false);
        }
      }}
      className={`cursor-pointer px-4 py-1.5 text-xs font-bold rounded hover:opacity-70 transition-opacity disabled:opacity-50 ${
        isFollowing ? "bg-input-bg text-bg-inverted" : "bg-white text-black"
      } ${className ?? ""}`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
