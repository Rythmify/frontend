import React, { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate, useParams } from "react-router-dom";
import { mockUserFollowing } from "@/components/Profile/MockData/mock";
import FollowButton from "@/components/Profile/FollowButton/FollowButton";
import {
  getFollowing,
  getUserById,
  resolveUsername,
  type UserSummary,
} from "@/services/user.service";

const tabs = ["Likes", "Following", "Followers"];

function sameIds(a: string[] = [], b: string[] = []) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

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

export default function FollowingPage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user: currentUser, setUser } = useAuthStore();
  const isOwner = !username || username === currentUser?.username;
  const user = isOwner
    ? currentUser
    : { username, displayName: username, avatar: "" };

  const [apiFollowing, setApiFollowing] = useState<UserSummary[] | null>(null);
  const [followingDetails, setFollowingDetails] = useState<
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
      if (!ownerId) {
        return;
      }

      getFollowing(ownerId, { limit: 50, offset: 0 })
        .then((res) => setApiFollowing(res.items))
        .catch((err) => console.error("Failed to load following:", err));
      return;
    }

    if (!username) {
      return;
    }

    resolveUsername(username)
      .then((userId) => getFollowing(userId, { limit: 50, offset: 0 }))
      .then((res) => setApiFollowing(res.items))
      .catch((err) => console.error("Failed to load following:", err));
  }, [username, isOwner, currentUser?.id]);

  useEffect(() => {
    if (!apiFollowing?.length) {
      if (
        isOwner &&
        apiFollowing?.length === 0 &&
        currentUser &&
        currentUser.following_ids.length > 0
      ) {
        setUser({
          ...currentUser,
          following_ids: [],
        });
      }
      return;
    }

    Promise.all(
      apiFollowing.map(async (u) => {
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
      const details = Object.fromEntries(entries);
      setFollowingDetails(details);

      if (isOwner && currentUser) {
        const normalizedFollowingIds = apiFollowing.flatMap((user) => {
          const resolvedUsername = details[user.user_id]?.username;
          return resolvedUsername && resolvedUsername !== user.user_id
            ? [user.user_id, resolvedUsername]
            : [user.user_id];
        });

        if (!sameIds(currentUser.following_ids, normalizedFollowingIds)) {
          setUser({
            ...currentUser,
            following_ids: normalizedFollowingIds,
          });
        }
      }
    });
  }, [apiFollowing, isOwner, currentUser, setUser]);

  const following = useMemo(() => {
    if (apiFollowing) {
      return apiFollowing.map((u) =>
        toProfileCard(u, followingDetails[u.user_id]),
      );
    }

    if (!isOwner) {
      return (mockUserFollowing[username || ""] ?? []).map((u) => ({
        ...u,
        userId: u.username,
        profilePath: `/${(u.username || u.displayName || "unknown-user").toLowerCase().replace(/\s+/g, "-")}`,
      }));
    }

    return [];
  }, [apiFollowing, followingDetails, isOwner, username]);

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
    <div className="container px-4 py-8 md:px-8 lg:px-20">
      <div className="mb-3 flex items-center gap-4">
        <div
          data-test="following-page-avatar"
          className="h-25 w-25 cursor-pointer flex-shrink-0 overflow-hidden rounded-full bg-text-muted"
          onClick={() => navigate(`/${user.username}`)}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-text-muted" />
          )}
        </div>
        <h1
          data-test="following-page-title"
          className="cursor-pointer text-2xl font-bold text-white"
          onClick={() => navigate(`/${user.username}`)}
        >
          {user.displayName || user.username} is following
        </h1>
      </div>

      <div className="mb-8 flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            data-test={`following-tab-${tab.toLowerCase()}`}
            onClick={() => handleTabChange(tab)}
            className={`cursor-pointer border-b-[2px] px-1 pb-2 pt-3 text-sm font-bold ${
              tab === "Following"
                ? "border-bg-inverted text-bg-inverted"
                : "border-transparent text-text-secondary hover:text-bg-inverted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-6 gap-6">
        {following.map((u) => (
          <div
            key={u.profilePath}
            className="group flex flex-col items-center gap-2"
          >
            <div
              data-test={`following-avatar-${u.username}`}
              className="aspect-square w-full cursor-pointer overflow-hidden rounded-full bg-text-muted"
              onClick={() => navigate(u.profilePath)}
            >
              {u.avatar ? (
                <img
                  src={u.avatar}
                  alt={u.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-text-muted" />
              )}
            </div>
            <span className="cursor-pointer text-center text-sm font-bold text-white">
              {u.username + " "}
              {u.isVerified && (
                <i className="fa-solid fa-circle-check text-xs text-[#2196F3]" />
              )}
            </span>
            <span
              data-test={`following-count-${u.username}`}
              className="flex cursor-pointer items-center gap-1 text-xs text-text-secondary"
              onClick={() => navigate(`${u.profilePath}/follower`)}
            >
              <i className="fa-solid fa-user text-[10px]" />
              {u.followers >= 1e6
                ? `${(u.followers / 1e6).toFixed(2)}M`
                : u.followers}{" "}
              followers
            </span>
            <div className="flex h-8 items-center justify-center">
              <div className="hidden group-hover:block">
                <FollowButton
                  username={u.username}
                  userId={u.userId}
                  isFollowingOverride={
                    isOwner
                      ? true
                      : isFollowedByCurrentUser(u.userId, u.username)
                  }
                  onFollowChange={(nextFollowing) => {
                    if (!isOwner || nextFollowing) {
                      return;
                    }

                    setApiFollowing((prev) =>
                      prev?.filter((item) => item.user_id !== u.userId) ?? prev,
                    );
                    setFollowingDetails((prev) => {
                      const next = { ...prev };
                      if (u.userId) {
                        delete next[u.userId];
                      }
                      return next;
                    });
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        {Array.from({
          length: following.length % 6 === 0 ? 0 : 6 - (following.length % 6),
        }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="aspect-square w-full rounded-sm bg-input-bg"
          />
        ))}
      </div>

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
                data-test={`following-footer-${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="cursor-pointer hover:text-text hover:underline"
              >
                {link}
              </button>
              {i < arr.length - 1 && <span>آ·</span>}
            </span>
          ))}
        </div>
        <div className="text-left text-xs text-bg-inverted">
          Language:{" "}
          <button
            data-test="following-language-button"
            className="cursor-pointer text-[#2196F3] hover:underline"
          >
            English (US)
          </button>
        </div>
      </div>
    </div>
  );
}
