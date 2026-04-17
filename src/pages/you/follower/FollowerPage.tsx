import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate, useParams } from "react-router-dom";
import { mockUserFollowers } from "@/components/Profile/MockData/mock";
import FollowButton from "@/components/Profile/FollowButton/FollowButton";
import {
  getFollowers,
  getUserById,
  resolveUsername,
  type UserSummary,
} from "@/services/user.service";

const tabs = ["Likes", "Following", "Followers"];

function toProfileCard(
  user: UserSummary,
  details?: {
    followers: number;
    avatar: string;
    username: string;
    displayName: string;
  },
) {
  const fallbackName = user.display_name?.trim() || user.user_id || "Unknown user";
  const username = details?.username?.trim() || fallbackName;

  return {
    username,
    userId: user.user_id,
    displayName: details?.displayName?.trim() || fallbackName,
    avatar: details?.avatar ?? "",
    isVerified: user.is_verified,
    followers: details?.followers ?? 0,
    profilePath: `/${username.toLowerCase().replace(/\s+/g, "-")}`,
  };
}

export default function FollowerPage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const isOwner = !username || username === currentUser?.username;
  const user = isOwner
    ? currentUser
    : { username, displayName: username, avatar: "" };

  // Real API data — replaces mockFollowers when loaded
  const [apiFollowers, setApiFollowers] = useState<UserSummary[] | null>(null);
  const [followerDetails, setFollowerDetails] = useState<
    Record<
      string,
      {
        followers: number;
        avatar: string;
        username: string;
        displayName: string;
      }
    >
  >({});

  useEffect(() => {
    const ownerId = currentUser?.id;

    if (isOwner) {
      if (!ownerId) return;

      getFollowers(ownerId, { limit: 50, offset: 0 })
        .then((res) => setApiFollowers(res.items))
        .catch((err) => console.error("Failed to load followers:", err));
      return;
    }

    if (!username) return;

    resolveUsername(username)
      .then((userId) => getFollowers(userId, { limit: 50, offset: 0 }))
      .then((res) => setApiFollowers(res.items))
      .catch((err) => console.error("Failed to load followers:", err));
  }, [username, isOwner, currentUser?.id]);

  useEffect(() => {
    if (!apiFollowers?.length) return;

    Promise.all(
      apiFollowers.map(async (u) => {
        try {
          const profile = await getUserById(u.user_id);
          return [
            u.user_id,
            {
              followers: profile.followers_count,
              avatar: profile.profile_picture ?? "",
              username: profile.username ?? u.user_id,
              displayName: profile.display_name,
            },
          ] as const;
        } catch {
          return [
            u.user_id,
            {
              followers: 0,
              avatar: "",
              username: u.user_id,
              displayName: u.display_name,
            },
          ] as const;
        }
      }),
    ).then((entries) => {
      setFollowerDetails(Object.fromEntries(entries));
    });
  }, [apiFollowers]);

  // Use real data when available, fall back to mock
  const followerList = apiFollowers
    ? apiFollowers.map((u) => toProfileCard(u, followerDetails[u.user_id]))
    : isOwner
      ? []
      : (mockUserFollowers[username || ""] ?? []).map((u) => ({
          ...u,
          userId: u.username,
          profilePath: `/${(u.username || u.displayName || "unknown-user").toLowerCase().replace(/\s+/g, "-")}`,
        }));

  if (!user) return null;

  const isFollowedByCurrentUser = (userId?: string, targetUsername?: string) =>
    (!!userId && (currentUser?.following_ids?.includes(userId) ?? false)) ||
    (!!targetUsername &&
      (currentUser?.following_ids?.includes(targetUsername) ?? false));

  const handleTabChange = (tab: string) => {
    const profileUsername = username ?? currentUser?.username;
    const base = profileUsername ? `/${profileUsername}` : "/you";
    if (tab === "Likes") navigate(`${base}/likes`);
    if (tab === "Following") navigate(`${base}/following`);
    if (tab === "Followers") navigate(`${base}/follower`);
  };

  return (
    <div className="py-8 container px-4 md:px-8 lg:px-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-3">
        <div
          data-test="follower-page-avatar"
          className="w-25 cursor-pointer h-25 rounded-full overflow-hidden bg-text-muted flex-shrink-0"
          onClick={() => navigate(`/${user.username}`)}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-text-muted" />
          )}
        </div>
        <h1
          data-test="follower-page-title"
          className="text-white cursor-pointer text-2xl font-bold"
          onClick={() => navigate(`/${user.username}`)}
        >
          Followers of {user.displayName || user.username}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            data-test={`follower-tab-${tab.toLowerCase()}`}
            onClick={() => handleTabChange(tab)}
            className={`pb-2 pt-3 px-1 text-sm font-bold cursor-pointer border-b-[2px] ${
              tab === "Followers"
                ? "text-bg-inverted border-bg-inverted"
                : "text-text-secondary border-transparent hover:text-bg-inverted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-6 gap-6">
        {followerList.map((u) => (
          <div
            key={u.profilePath}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              data-test={`follower-avatar-${u.username}`}
              className="w-full cursor-pointer aspect-square rounded-full overflow-hidden bg-text-muted"
              onClick={() => navigate(u.profilePath)}
            >
              {u.avatar ? (
                <img
                  src={u.avatar}
                  alt={u.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-text-muted" />
              )}
            </div>
            <span className="text-white cursor-pointer text-sm font-bold text-center">
              {u.username + " "}
              {u.isVerified && (
                <i className="fa-solid fa-circle-check text-[#2196F3] text-xs" />
              )}
            </span>
            <span
              data-test={`follower-count-${u.username}`}
              className="text-text-secondary cursor-pointer text-xs flex items-center gap-1"
              onClick={() => navigate(`${u.profilePath}/follower`)}
            >
              <i className="fa-solid fa-user text-[10px]" />
              {u.followers >= 1e6
                ? `${(u.followers / 1e6).toFixed(2)}M`
                : u.followers}{" "}
              followers
            </span>
            <div className="h-8 flex items-center justify-center">
              <div className="hidden group-hover:block">
                <FollowButton
                  username={u.username}
                  userId={u.userId}
                  isFollowingOverride={isFollowedByCurrentUser(
                    u.userId,
                    u.username,
                  )}
                />
              </div>
            </div>
          </div>
        ))}
        {Array.from({
          length:
            followerList.length % 6 === 0 ? 0 : 6 - (followerList.length % 6),
        }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-full aspect-square rounded-sm bg-input-bg"
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-16 flex flex-col gap-8">
        <div className="flex flex-wrap gap-x-1 text-xs text-text-secondary">
          {[
            "Legal",
            "Privacy",
            "Cookie Policy",
            "Cookie Manager",
            "Imprint",
            "Artist Resources",
            "Newsroom",
            "Charts",
            "Transparency Reports",
          ].map((link, i, arr) => (
            <span key={link} className="flex items-center gap-1">
              <button
                data-test={`follower-footer-${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="cursor-pointer hover:underline hover:text-text"
              >
                {link}
              </button>
              {i < arr.length - 1 && <span>·</span>}
            </span>
          ))}
        </div>
        <div className="text-xs text-left text-bg-inverted">
          Language:{" "}
          <button
            data-test="follower-language-button"
            className="text-[#2196F3] cursor-pointer hover:underline"
          >
            English (US)
          </button>
        </div>
      </div>
    </div>
  );
}
