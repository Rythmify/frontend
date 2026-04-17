import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate, useParams } from "react-router-dom";
import FollowButton from "@/components/Profile/FollowButton/FollowButton";
import {
  getFollowers,
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
  followers: number;
  isVerified: boolean;
  profilePath: string;
}

async function enrich(u: UserSummary): Promise<EnrichedUser> {
  try {
    const profile = await getUserById(u.user_id);
    const uname = profile.username ?? u.user_id;
    return {
      userId: u.user_id,
      username: uname,
      displayName: profile.display_name || u.display_name,
      avatar: profile.profile_picture ?? "",
      followers: profile.followers_count ?? 0,
      isVerified: profile.is_verified ?? u.is_verified,
      profilePath: `/${uname}`,
    };
  } catch {
    return {
      userId: u.user_id,
      username: u.user_id,
      displayName: u.display_name,
      avatar: u.profile_picture ?? "",
      followers: 0,
      isVerified: u.is_verified,
      profilePath: `/${u.user_id}`,
    };
  }
}

export default function FollowerPage() {
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

  const displayUser = isOwner
    ? currentUser
    : { username: profileUsername, displayName: profileDisplayName, avatar: "", id: "" };

  const [rawFollowers, setRawFollowers] = useState<UserSummary[] | null>(null);
  const [enriched, setEnriched] = useState<EnrichedUser[]>([]);

  // Step 1 — fetch raw followers (resolve username → UUID for non-owner)
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

        if (!userId) return;
        const res = await getFollowers(userId, { limit: 100, offset: 0 });
        if (!cancelled) setRawFollowers(res.items);
      } catch (err) {
        console.error("Failed to load followers:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username, isOwner, currentUser?.id]);

  // Step 2 — enrich
  useEffect(() => {
    if (!rawFollowers?.length) {
      setEnriched([]);
      return;
    }
    let cancelled = false;

    Promise.all(rawFollowers.map(enrich)).then((items) => {
      if (!cancelled) setEnriched(items);
    });

    return () => {
      cancelled = true;
    };
  }, [rawFollowers]);

  const isFollowedByMe = (userId?: string, uname?: string) =>
    (!!userId && (currentUser?.following_ids?.includes(userId) ?? false)) ||
    (!!uname && (currentUser?.following_ids?.includes(uname) ?? false));

  const handleTabChange = (tab: string) => {
    const base = `/${username ?? currentUser?.username}`;
    if (tab === "Likes") navigate(`${base}/likes`);
    if (tab === "Following") navigate(`${base}/following`);
    if (tab === "Followers") navigate(`${base}/follower`);
  };

  if (!displayUser) return null;

  const COLS = 6;
  const padCount =
    enriched.length % COLS === 0 ? 0 : COLS - (enriched.length % COLS);

  return (
    <div className="py-8 container px-4 md:px-8 lg:px-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-3">
        <div
          data-test="follower-page-avatar"
          className="w-24 h-24 cursor-pointer rounded-full overflow-hidden bg-text-muted flex-shrink-0"
          onClick={() => navigate(profilePath)}
        >
          {displayUser.avatar ? (
            <img
              src={displayUser.avatar}
              alt={displayUser.username ?? ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-text-muted" />
          )}
        </div>
        <h1
          data-test="follower-page-title"
          className="text-white cursor-pointer text-2xl font-bold"
          onClick={() => navigate(profilePath)}
        >
          Followers of {displayUser.displayName || displayUser.username}
        </h1>
        {profileUsername && (
          <p className="text-sm text-text-secondary">@{profileUsername}</p>
        )}
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
        {enriched.map((u) => (
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
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-text-muted" />
              )}
            </div>
            <span className="text-white cursor-pointer text-sm font-bold text-center truncate w-full">
              {u.username}{" "}
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
                  isFollowingOverride={isFollowedByMe(u.userId, u.username)}
                />
              </div>
            </div>
          </div>
        ))}

        {Array.from({ length: padCount }).map((_, i) => (
          <div
            key={`pad-${i}`}
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
