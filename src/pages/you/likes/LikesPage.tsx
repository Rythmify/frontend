import React, { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  mockLikedTracks,
  mockUserProfiles,
} from "@/components/Profile/MockData/mock";
import ShareModal from "@/components/Profile/ShareModal/ShareModal";

const tabs = ["Likes", "Following", "Followers"];

export default function LikesPage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const location = useLocation();
  const { user: currentUser } = useAuthStore();

  const isYouRoute = location.pathname.startsWith("/you/");
  const isOwner = isYouRoute || !username || username === currentUser?.username;

  const user = isOwner
    ? currentUser
    : {
        username,
        displayName: mockUserProfiles[username || ""]?.displayName || username,
        avatar: mockUserProfiles[username || ""]?.avatar || "",
      };

  const likedTracks = isOwner
    ? mockLikedTracks
    : (mockUserProfiles[username || ""]?.likedTracks ?? []);

  if (!user) return null;

  const handleTabChange = (tab: string) => {
    const base = isOwner ? "/you" : `/${username}`;
    if (tab === "Likes") navigate(`${base}/likes`);
    if (tab === "Following") navigate(`${base}/following`);
    if (tab === "Followers") navigate(`${base}/follower`);
  };

  const [showShare, setShowShare] = useState(false);

  return (
    <div className="py-8 container px-4 md:px-8 lg:px-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-3">
        <div
          data-test="likes-user-avatar"
          className="w-25 h-25 rounded-full overflow-hidden bg-text-muted flex-shrink-0 cursor-pointer"
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
          data-test="likes-page-title"
          className="text-white text-2xl font-bold"
        >
          Likes by {user.displayName || user.username}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            data-test={`likes-tab-${tab.toLowerCase()}`}
            onClick={() => handleTabChange(tab)}
            className={`pb-2 pt-3 px-1 text-sm font-bold cursor-pointer border-b-2 ${
              tab === "Likes"
                ? "text-bg-inverted border-bg-inverted"
                : "text-text-secondary border-transparent hover:text-bg-inverted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Description + Share */}
      <div className="flex items-center justify-between mb-6">
        <p
          data-test="likes-description"
          className="text-text-secondary text-sm"
        >
          {isOwner
            ? "Hear the tracks you've liked"
            : `Hear the tracks ${user.displayName || user.username} has liked`}
        </p>
        <button
          data-test="likes-share-button"
          onClick={() => setShowShare(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-input-bg text-white text-sm font-bold rounded hover:opacity-70"
        >
          <i className="fa-solid fa-arrow-up-from-bracket text-xs" />
          Share
        </button>
      </div>

      {/* Empty state */}
      <div className="flex items-center justify-center py-24">
        <p
          data-test="likes-empty-state"
          className="text-white font-bold text-3xl"
        >
          {isOwner
            ? "You have no likes yet."
            : `${user.displayName || user.username} hasn't liked any tracks.`}
        </p>
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
                data-test={`footer-link-${link.toLowerCase().replace(/\s+/g, "-")}`}
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
            data-test="language-selector"
            className="text-[#2196F3] cursor-pointer hover:underline"
          >
            English (US)
          </button>
        </div>
      </div>

      {showShare && (
        <ShareModal
          url={`https://rythmify.com/${user.username}/likes`}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
