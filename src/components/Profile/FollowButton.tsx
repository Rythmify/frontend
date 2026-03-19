import { useAuthStore } from "@/stores/auth.store";

interface FollowButtonProps {
  username: string;
  className?: string;
}

export default function FollowButton({
  username,
  className,
}: FollowButtonProps) {
  const { user, toggleFollow } = useAuthStore();
  const isFollowing = user?.following_ids?.includes(username) ?? false;

  return (
    <button
      data-test="follow-button"
      onClick={(e) => {
        e.stopPropagation();
        toggleFollow(username);
      }}
      className={`cursor-pointer px-4 py-1.5 text-xs font-bold rounded hover:opacity-70 transition-opacity ${
        isFollowing ? "bg-input-bg text-bg-inverted" : "bg-white text-black"
      } ${className ?? ""}`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
