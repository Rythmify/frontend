import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate, useParams } from "react-router-dom";
import FollowButton from "@/components/UI/FollowButton";
import {
  getFollowers,
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
  followers: number;
  isVerified: boolean;
  profilePath: string;
}

async function enrich(u: UserSummary): Promise<EnrichedUser> {
  if (!u.id) {
    console.warn("enrich: received item with no id", u);
    return {
      userId: "",
      username: "",
      displayName: u.display_name,
      avatar: u.profile_picture ?? "",
      followers: 0,
      isVerified: u.is_verified,
      profilePath: "/",
    };
  }

  try {
    const profile = await getUserById(u.id); // ← u.user_id → u.id
    const uname = profile.username ?? u.id;
    return {
      userId: u.id, // ← u.user_id → u.id
      username: uname,
      displayName: profile.display_name || u.display_name,
      avatar: profile.profile_picture ?? "",
      followers: profile.followers_count ?? 0,
      isVerified: profile.is_verified ?? u.is_verified,
      profilePath: `/${uname}`,
    };
  } catch {
    return {
      userId: u.id, // ← u.user_id → u.id
      username: u.id,
      displayName: u.display_name,
      avatar: u.profile_picture ?? "",
      followers: 0,
      isVerified: u.is_verified,
      profilePath: `/${u.id}`,
    };
  }
}

export default function FollowerPage() {
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

  const [rawFollowers, setRawFollowers] = useState<UserSummary[] | null>(null);
  const [enriched, setEnriched] = useState<EnrichedUser[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Step 1 — fetch raw followers
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setRawFollowers(null);
    setEnriched([]);

    async function load() {
      try {
        let userId: string | undefined;
        if (isOwner) {
          userId = currentUser?.id;
        } else if (username) {
          const profile = await getUserByUsername(username);
          userId = profile.id;
        }
        if (!userId) return;

        const res = await getFollowers(userId, { limit: 100, offset: 0 });
        if (!cancelled) setRawFollowers(res.items);
      } catch (err) {
        console.error("FollowerPage: failed to load", err);
        if (!cancelled) setRawFollowers([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username, isOwner, currentUser?.id]);

  // Step 2 — enrich
  useEffect(() => {
    if (rawFollowers === null) return;

    if (!rawFollowers.length) {
      setEnriched([]);
      setLoaded(true);
      return;
    }

    let cancelled = false;
    Promise.all(rawFollowers.map(enrich)).then((items) => {
      if (!cancelled) {
        setEnriched(items);
        setLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [rawFollowers]);

  if (!currentUser && isOwner) return null;

  const handleTabChange = (tab: string) => {
    const base = `/${profileUsername}`;
    if (tab === "Likes") navigate(`${base}/likes`);
    if (tab === "Following") navigate(`${base}/following`);
    if (tab === "Followers") navigate(`${base}/follower`);
  };

  const padCount = enriched.length % 6 === 0 ? 0 : 6 - (enriched.length % 6);

  return (
    <div className="py-8 container px-4 md:px-8 lg:px-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-3">
        <div
          data-test="follower-page-avatar"
          className="w-24 h-24 cursor-pointer rounded-full overflow-hidden bg-text-muted flex-shrink-0"
          onClick={() => navigate(profilePath)}
        >
          {profileAvatar ? (
            <img
              src={profileAvatar}
              alt={profileUsername}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-text-muted" />
          )}
        </div>
        <div>
          <h1
            data-test="follower-page-title"
            className="text-white cursor-pointer text-2xl font-bold"
            onClick={() => navigate(profilePath)}
          >
            Followers of {profileDisplayName}
          </h1>
          {profileUsername && (
            <p className="text-sm text-text-secondary">@{profileUsername}</p>
          )}
        </div>
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

      {/* Empty state */}
      {loaded && enriched.length === 0 && (
        <div className="flex items-center justify-center py-24">
          <p className="text-white text-lg font-bold">
            {isOwner
              ? "You don't have any followers yet."
              : `${profileDisplayName} doesn't have any followers yet.`}
          </p>
        </div>
      )}

      {/* Grid */}
      {enriched.length > 0 && (
        <div className="grid grid-cols-6 gap-6">
          {enriched.map((u) => (
            <div
              key={u.userId}
              className="flex flex-col items-center gap-2 group"
            >
              {/* Avatar */}
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

              {/* Name */}
              <span
                className="text-white cursor-pointer text-sm font-bold text-center truncate w-full px-1"
                onClick={() => navigate(u.profilePath)}
              >
                {u.displayName || u.username}{" "}
                {u.isVerified && (
                  <i className="fa-solid fa-circle-check text-[#2196F3] text-xs" />
                )}
              </span>

              {/* Follower count */}
              <span
                data-test={`follower-count-${u.username}`}
                className="text-text-secondary cursor-pointer text-xs flex items-center gap-1"
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

              {/* Follow button — reads from store, no override needed */}
              <div className="h-8 flex items-center justify-center">
                <div className="hidden group-hover:block">
                  <FollowButton username={u.username} userId={u.userId} />
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
