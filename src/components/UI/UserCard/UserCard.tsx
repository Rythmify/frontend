// src/modules/feed/components/UserCard.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@/types/user";
import FollowButton from "@/components/UI/FollowButton";

// ─── Props ────────────────────────────────────────────────
interface UserCardProps {
  user: User;
  widthClassName?: string;
  initialIsFollowing?: boolean;
  onUnfollow?: () => void;
}

// ─── Styles ───────────────────────────────────────────────
const styles = {
  card: (widthClassName?: string) => `
    group flex flex-col items-center gap-2
    ${widthClassName ?? "w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]"}
    cursor-pointer shrink-0
  `,
  avatarWrapper: `
    relative w-full aspect-square
    rounded-full overflow-hidden
    bg-zinc-800
  `,
  avatar: `
    w-full h-full object-cover
    transition-all duration-200
  `,
  avatarPlaceholder: `
    w-full h-full
    bg-zinc-800
    flex items-center justify-center
    text-white text-4xl font-bold
  `,
  displayName: `
    text-text-hover text-sm font-semibold text-center
    truncate w-full
    flex items-center justify-center gap-1
    transition-colors duration-200 hover:text-text-muted
  `,
  verifiedIcon: `
    fa-solid fa-circle-check text-[#2196F3] text-xs
    flex-shrink-0
  `,
  followers: `
    text-text-secondary text-xs text-center
    w-full
    flex items-center justify-center gap-1
    transition-colors duration-200 hover:text-text-muted
  `,
  followerIcon: `
    fa-solid fa-user text-[10px]
  `,
};

// ─── Utility Functions ────────────────────────────────────
const formatFollowers = (count: number = 0): string => {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
};

const getInitial = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

// ─── Component ────────────────────────────────────────────
const UserCard = ({
  user,
  widthClassName,
  initialIsFollowing,
  onUnfollow,
}: UserCardProps) => {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState(user.followers ?? 0);

  const handleClick = () => {
    navigate(`/${user.username}`);
  };

  return (
    <div
      className={styles.card(widthClassName)}
      onClick={handleClick}
      data-test={`user-card-${user.username}`}
    >
      {/* Avatar */}
      <div
        className={styles.avatarWrapper}
        data-test={`user-card-avatar-${user.username}`}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.displayName}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {getInitial(user.displayName)}
          </div>
        )}
      </div>

      {/* Display Name */}
      <div
        className={styles.displayName}
        data-test={`user-card-name-${user.username}`}
      >
        <span className="truncate">{user.displayName}</span>
      </div>

      {/* Follower Count with Icon */}
      <p
        className={styles.followers}
        data-test={`user-card-followers-${user.username}`}
      >
        <i className={styles.followerIcon}></i>
        <span>{formatFollowers(followers)} followers</span>
      </p>

      {/* Follow Button — visible on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <FollowButton
          username={user.username}
          userId={user.id}
          initialIsFollowing={initialIsFollowing}
          onFollowChange={(next) => {
            setFollowers((f) => f + (next ? 1 : -1));
            if (!next) onUnfollow?.();
          }}
        />
      </div>
    </div>
  );
};

export default UserCard;
