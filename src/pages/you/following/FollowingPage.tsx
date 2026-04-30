import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate, useParams } from "react-router-dom";
import FollowButton from "@/components/UI/FollowButton";
import UserAvatar from "@/components/UI/UserAvatar";
import {
  getFollowing,
  getFollowStatus,
  getUserById,
  getUserByUsername,
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
  isFollowing: boolean;
  profilePath: string;
}

async function enrich(u: UserSummary): Promise<EnrichedUser> {
  const resolvedId = u.id || (u as UserSummary & { user_id?: string }).user_id || "";
  if (!resolvedId) {
    console.warn("enrich: received item with no id", u);
    return {
      userId: "",
      username: "",
      displayName: u.display_name,
      avatar: u.profile_picture ?? "",
      followers: 0,
      isVerified: u.is_verified,
      isFollowing: false,
      profilePath: "/",
    };
  }

  try {
    const profile = await getUserById(resolvedId);
    const followStatus = await getFollowStatus(resolvedId);
    const uname = profile.username ?? u.id;
    return {
      userId: resolvedId,
      username: uname,
      displayName: profile.display_name || u.display_name,
      avatar: profile.profile_picture ?? "",
      followers: profile.followers_count ?? 0,
      isVerified: profile.is_verified ?? u.is_verified,
      isFollowing: followStatus.is_following,
      profilePath: `/${uname}`,
    };
  } catch {
    return {
      userId: resolvedId,
      username: resolvedId,
      displayName: u.display_name,
      avatar: u.profile_picture ?? "",
      followers: 0,
      isVerified: u.is_verified,
      isFollowing: false,
      profilePath: `/${resolvedId}`,
    };
  }
}

export default function FollowingPage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();

  const isOwner = !username || username === currentUser?.username;
  const profileUsername = isOwner
    ? (currentUser?.username ?? "")
    : (username ?? "");
  const profileDisplayName = isOwner
    ? (currentUser?.displayName ?? profileUsername) || "Profile"
    : profileUsername || "Profile";
  const profilePath = profileUsername ? `/${profileUsername}` : "/you";
  const profileAvatar = isOwner ? (currentUser?.avatar ?? "") : "";

  const [rawFollowing, setRawFollowing] = useState<UserSummary[] | null>(null);
  const [following, setFollowing] = useState<EnrichedUser[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Step 1 — resolve user ID then fetch raw following list
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setRawFollowing(null);
    setFollowing([]);

    async function load() {
      try {
        let userId: string | undefined;

        if (isOwner) {
          userId = currentUser?.id;
        } else if (username) {
          // getUserByUsername: GET /search?type=users&q=:username → GET /users/:id
          const profile = await getUserByUsername(username);
          userId = profile.id;
        }

        if (!userId) return;

        const res = await getFollowing(userId, { limit: 100, offset: 0 });
        if (!cancelled) setRawFollowing(res.items);
      } catch (err) {
        console.error("FollowingPage: failed to load", err);
        if (!cancelled) setRawFollowing([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username, isOwner, currentUser?.id]);

  // Step 2 — enrich with full profile data
  useEffect(() => {
    if (rawFollowing === null) return;

    if (!rawFollowing.length) {
      setFollowing([]);
      setLoaded(true);
      return;
    }

    let cancelled = false;
    Promise.all(rawFollowing.map(enrich)).then((items) => {
      if (!cancelled) {
        setFollowing(items);
        setLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [rawFollowing]);

  if (!currentUser && isOwner) return null;

  const handleTabChange = (tab: string) => {
    const base = `/${profileUsername}`;
    if (tab === "Likes") navigate(`${base}/likes`);
    if (tab === "Following") navigate(`${base}/following`);
    if (tab === "Followers") navigate(`${base}/follower`);
  };

  const padCount = following.length % 6 === 0 ? 0 : 6 - (following.length % 6);

  return (
    <div className="container px-4 py-8 md:px-8 lg:px-20">
      {/* Header */}
      <div className="mb-3 flex items-center gap-4">
        <UserAvatar
          dataTest="following-page-avatar"
          src={profileAvatar}
          name={profileDisplayName || profileUsername}
          alt={profileDisplayName || profileUsername}
          wrapperClassName="h-24 w-24 cursor-pointer flex-shrink-0 overflow-hidden rounded-full"
          initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-white text-4xl font-bold"
          onClick={() => navigate(profilePath)}
        />
        <div>
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
      </div>

      {/* Tabs */}
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

      {/* Empty state — only after load completes */}
      {loaded && following.length === 0 && (
        <div className="flex items-center justify-center py-24">
          <p className="text-lg font-bold text-white">
            {isOwner
              ? "You're not following anyone yet."
              : `${profileDisplayName} isn't following anyone.`}
          </p>
        </div>
      )}

      {/* Grid */}
      {following.length > 0 && (
        <div className="grid grid-cols-6 gap-6">
          {following.map((u) => (
            <div
              key={u.userId}
              className="group flex flex-col items-center gap-2"
            >
              <UserAvatar
                dataTest={`following-avatar-${u.username}`}
                src={u.avatar}
                name={u.displayName || u.username}
                alt={u.displayName || u.username}
                wrapperClassName="aspect-square w-full cursor-pointer overflow-hidden rounded-full"
                initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-white text-4xl font-bold"
                onClick={() => navigate(u.profilePath)}
              />

              <span
                className="w-full cursor-pointer truncate px-1 text-center text-sm font-bold text-white"
                onClick={() => navigate(u.profilePath)}
              >
                {u.displayName || u.username}
              </span>

              <span
                data-test={`following-count-${u.username}`}
                className="flex cursor-pointer items-center gap-1 text-xs text-text-secondary"
                onClick={() => navigate(`${u.profilePath}/follower`)}
              >
                <i className="fa-solid fa-user text-[10px]" />
                {u.followers >= 1e6
                  ? `${(u.followers / 1e6).toFixed(1)}M`
                  : u.followers >= 1e3
                    ? `${(u.followers / 1e3).toFixed(1)}K`
                    : u.followers}{" "}
                followers
              </span>

              <div className="flex h-8 items-center justify-center">
                <div className="hidden group-hover:block">
              <FollowButton
                username={u.username}
                userId={u.userId}
                initialIsFollowing={u.isFollowing}
                onFollowChange={(next) => {
                  if (isOwner && !next) {
                    setFollowing((prev) =>
                          prev.filter((f) => f.userId !== u.userId),
                        );
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {Array.from({ length: padCount }).map((_, i) => (
            <div
              key={`pad-${i}`}
              className="aspect-square w-full rounded-sm bg-input-bg"
            />
          ))}
        </div>
      )}

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
                data-test={`following-footer-${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="cursor-pointer hover:text-text hover:underline"
              >
                {link}
              </button>
              {i < arr.length - 1 && <span>·</span>}
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
