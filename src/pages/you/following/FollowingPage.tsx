import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate, useParams } from "react-router-dom";
import FollowButton from "@/components/Profile/FollowButton/FollowButton";
import {
  getFollowing,
  getUserById,
  resolveUsername,
  type UserSummary,
} from "@/services/user.service";

const tabs = ["Likes", "Following", "Followers"];

interface EnrichedUser {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  isVerified: boolean;
  followers: number;
  profilePath: string;
}

async function enrich(u: UserSummary): Promise<EnrichedUser> {
  try {
    const profile = await getUserById(u.user_id);
    const username = profile.username ?? u.user_id;

    return {
      userId: u.user_id,
      username,
      displayName: profile.display_name || u.display_name,
      avatar: profile.profile_picture ?? "",
      isVerified: profile.is_verified ?? u.is_verified,
      followers: profile.followers_count ?? 0,
      profilePath: `/${username}`,
    };
  } catch {
    return {
      userId: u.user_id,
      username: u.user_id,
      displayName: u.display_name,
      avatar: u.profile_picture ?? "",
      isVerified: u.is_verified,
      followers: 0,
      profilePath: `/${u.user_id}`,
    };
  }
}

export default function FollowingPage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const isOwner = !username || username === currentUser?.username;
  const profileUsername = isOwner
    ? currentUser?.username ?? ""
    : username ?? "";
  const profileDisplayName = isOwner
    ? (currentUser?.displayName ?? profileUsername) || "Profile"
    : profileUsername || "Profile";
  const profilePath = isOwner
    ? currentUser?.username
      ? `/${currentUser.username}`
      : "/you"
    : username
      ? `/${username}`
      : "/you";
  const user = isOwner
    ? currentUser
    : { username: profileUsername, displayName: profileDisplayName, avatar: "" };

  const [rawFollowing, setRawFollowing] = useState<UserSummary[] | null>(null);
  const [following, setFollowing] = useState<EnrichedUser[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let userId: string | undefined;

        if (isOwner) {
          userId = currentUser?.id;
        } else if (username) {
          userId = await resolveUsername(username);
        }

        if (!userId) {
          return;
        }

        const res = await getFollowing(userId, { limit: 50, offset: 0 });

        if (!cancelled) {
          setRawFollowing(res.items);
        }
      } catch (err) {
        console.error("Failed to load following:", err);
        if (!cancelled) {
          setRawFollowing([]);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [username, isOwner, currentUser?.id]);

  useEffect(() => {
    if (!rawFollowing?.length) {
      setFollowing([]);
      return;
    }

    let cancelled = false;

    Promise.all(rawFollowing.map(enrich)).then((items) => {
      if (!cancelled) {
        setFollowing(items);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [rawFollowing]);

  if (!user) return null;

  const isFollowedByMe = (userId?: string, uname?: string) =>
    (!!userId && (currentUser?.following_ids?.includes(userId) ?? false)) ||
    (!!uname && (currentUser?.following_ids?.includes(uname) ?? false));

  const handleTabChange = (tab: string) => {
    const base = isOwner ? "/you" : `/${username}`;
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
          onClick={() => navigate(profilePath)}
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
          onClick={() => navigate(profilePath)}
        >
          {profileDisplayName} is following
        </h1>
        {profileUsername && (
          <p className="text-sm text-text-secondary">@{profileUsername}</p>
        )}
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
            key={u.userId}
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
                  isFollowingOverride={isFollowedByMe(u.userId, u.username)}
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
