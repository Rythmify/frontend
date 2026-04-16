import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import {
  followUser,
  unfollowUser,
} from "@/services/mocks/User.service";

interface AlbumOwnerInfoProps {
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  followers?: number;
  trackNum?: number;
}

export default function AlbumOwnerInfo({
  username,
  displayName,
  avatarUrl,
  followers,
  trackNum,
}: AlbumOwnerInfoProps) {
  const name = displayName || username;
  const fallbackLetter = name?.trim().charAt(0).toUpperCase() || "U";
  const { user, toggleFollow } = useAuthStore();
  const isFollowing = user?.following_ids?.includes(username) ?? false;
  const isOwner = user?.username === username;
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowClick = async () => {
    if (!user || isOwner) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(username);
      } else {
        await followUser(username);
      }
      toggleFollow(username);
    } catch (error) {
      console.error("Failed to update follow status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      data-test="album-owner-info"
      className="flex flex-col items-center lg:items-start gap-3 px-2 py-2"
    >
      <Link to={`/${username}`} className="shrink-0">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
              data-test="album-owner-avatar"
            />
          ) : (
            <div
              data-test="album-owner-avatar-fallback"
              className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-[#3a3a3a] to-[#1f1f1f]"
            >
              {fallbackLetter}
            </div>
          )}
        </div>
      </Link>

      <div className="min-w-0 text-center lg:text-left flex flex-col gap-0.5 items-center lg:items-start">
        <Link
          to={`/${username}`}
          data-test="album-owner-name"
          className="text-white text-xl md:text-sm font-bold leading-tight hover:text-[#d0d0d0] transition-colors"
        >
          {name}
        </Link>

        <div className="flex items-center justify-center lg:justify-start gap-4 text-[12px] text-text-secondary">
          {typeof followers === "number" && (
            <p className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <g fill="currentColor">
                  <path d="M8 7.5a3 3 0 100-6 3 3 0 000 6zM2.001 14.248C2.036 10.005 2.984 8.5 8 8.5s5.965 1.487 5.999 5.748a.25.25 0 01-.249.252H2.25a.25.25 0 01-.249-.252z"></path>
                </g>
              </svg>
              {followers.toLocaleString()}
            </p>
          )}

          {typeof trackNum === "number" && (
            <p className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M5.75 2v12h1.5V2h-1.5zM13.25 10V6h-1.5v4h1.5zM4.25 5v6-1.5V5h1.5zM8.75 4v8h1.5V4h-1.5z"
                  fill="currentColor"
                ></path>
              </svg>
              {trackNum.toLocaleString()}
            </p>
          )}
        </div>

        {!isOwner && user && (
          <button
            type="button"
            data-test="album-owner-follow-button"
            onClick={handleFollowClick}
            disabled={isLoading}
            className={`mt-1 shrink-0 min-w-[96px] px-4 py-2 rounded-[var(--radius-sm)] text-sm font-bold transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
              isFollowing
                ? "bg-[#303030] text-white hover:bg-[#3a3a3a]"
                : "bg-white text-bg hover:text-[#a0a0a0]"
            }`}
          >
            {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>
    </div>
  );
}
