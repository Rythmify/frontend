import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate, useParams } from "react-router-dom";
import FollowButton from "@/components/UI/FollowButton";
import UserAvatar from "@/components/UI/UserAvatar";
import {
  getFollowers,
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
  followers: number;
  isVerified: boolean;
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
    const uname = profile.username ?? resolvedId;

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
      <div className="flex items-center gap-4 mb-3">
        <UserAvatar
          dataTest="follower-page-avatar"
          src={profileAvatar}
          name={profileDisplayName || profileUsername}
          alt={profileDisplayName || profileUsername}
          wrapperClassName="w-24 h-24 cursor-pointer rounded-full overflow-hidden flex-shrink-0"
          initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-white text-4xl font-bold"
          onClick={() => navigate(profilePath)}
        />
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

      {loaded && enriched.length === 0 && (
        <div className="flex items-center justify-center py-24">
          <p className="text-white text-lg font-bold">
            {isOwner
              ? "You don't have any followers yet."
              : `${profileDisplayName} doesn't have any followers yet.`}
          </p>
        </div>
      )}

      {enriched.length > 0 && (
        <div className="grid grid-cols-6 gap-6">
          {enriched.map((u) => (
            <div
              key={u.userId}
              className="flex flex-col items-center gap-2 group"
            >
              <UserAvatar
                dataTest={`follower-avatar-${u.username}`}
                src={u.avatar}
                name={u.displayName || u.username}
                alt={u.displayName || u.username}
                wrapperClassName="w-full cursor-pointer aspect-square rounded-full overflow-hidden"
                initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-white text-4xl font-bold"
                onClick={() => navigate(u.profilePath)}
              />

              <span
                className="text-white cursor-pointer text-sm font-bold text-center truncate w-full px-1"
                onClick={() => navigate(u.profilePath)}
              >
                {u.displayName || u.username}
              </span>

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

              <div className="h-8 flex items-center justify-center">
                <div className="hidden group-hover:block">
                  <FollowButton
                    username={u.username}
                    userId={u.userId}
                    initialIsFollowing={u.isFollowing}
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
      )}

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
