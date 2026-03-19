import React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate, useParams } from "react-router-dom";
import {
  mockFollowers,
  mockFollowing,
  mockUserFollowing,
} from "@/components/Profile/MockData/mock";
import FollowButton from "@/components/Profile/FollowButton";

const tabs = ["Likes", "Following", "Followers"];

export default function FollowingPage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const isOwner = !username || username === currentUser?.username;
  const user = isOwner
    ? currentUser
    : { username, displayName: username, avatar: "" };

  const allMockUsers = Array.from(
    new Map(
      [...mockFollowing, ...mockFollowers].map((u) => [u.username, u]),
    ).values(),
  );

  const following = isOwner
    ? allMockUsers.filter((u) =>
        currentUser?.following_ids?.includes(u.username),
      )
    : (mockUserFollowing[username || ""] ?? []);

  if (!user) return null;

  const handleTabChange = (tab: string) => {
    const base = isOwner ? "/you" : `/${username}`;
    if (tab === "Likes") navigate(`${base}/likes`);
    if (tab === "Following") navigate(`${base}/following`);
    if (tab === "Followers") navigate(`${base}/follower`);
  };

  return (
    <div className="py-8 container px-4 md:px-8 lg:px-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-3">
        <div
          data-test="following-page-avatar"
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
          data-test="following-page-title"
          className="text-white cursor-pointer text-2xl font-bold"
          onClick={() => navigate(`/${user.username}`)}
        >
          {user.displayName || user.username} is following
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            data-test={`following-tab-${tab.toLowerCase()}`}
            onClick={() => handleTabChange(tab)}
            className={`pb-2 pt-3 px-1 text-sm font-bold cursor-pointer border-b-[2px] ${
              tab === "Following"
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
        {following.map((u) => (
          <div
            key={u.username}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              data-test={`following-avatar-${u.username}`}
              className="w-full cursor-pointer aspect-square rounded-full overflow-hidden bg-text-muted"
              onClick={() =>
                navigate(`/${u.username.toLowerCase().replace(/\s+/g, "-")}`)
              }
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
              data-test={`following-count-${u.username}`}
              className="text-text-secondary cursor-pointer text-xs flex items-center gap-1"
              onClick={() =>
                navigate(
                  `/${u.username.toLowerCase().replace(/\s+/g, "-")}/follower`,
                )
              }
            >
              <i className="fa-solid fa-user text-[10px]" />
              {u.followers >= 1e6
                ? `${(u.followers / 1e6).toFixed(2)}M`
                : u.followers}{" "}
              followers
            </span>
            <div className="h-8 flex items-center justify-center">
              <div className="hidden group-hover:block">
                <FollowButton username={u.username} />
              </div>
            </div>
          </div>
        ))}
        {Array.from({
          length: following.length % 6 === 0 ? 0 : 6 - (following.length % 6),
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
                data-test={`following-footer-${link.toLowerCase().replace(/\s+/g, "-")}`}
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
            data-test="following-language-button"
            className="text-[#2196F3] cursor-pointer hover:underline"
          >
            English (US)
          </button>
        </div>
      </div>
    </div>
  );
}
