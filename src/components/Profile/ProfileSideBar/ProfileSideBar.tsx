import React, { useState } from "react";
import type { User } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import FollowButton from "@/components/UI/FollowButton";
import TrackItem from "@/components/UI/TrackItem";

interface FollowingUser {
  userId?: string;
  username: string;
  followers: number;
  tracks?: number;
  avatar?: string;
  isVerified?: boolean;
}

interface FollowerUser {
  username: string;
  avatar?: string;
}

interface LikedTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  plays?: number;
  likes?: number;
  reposts?: number;
  comments?: number;
}

interface ProfileSideBarProps {
  user: User;
  isOwner?: boolean;
  stats?: {
    followers: number;
    following: number;
    tracks?: number;
    albums?: number;
    playlists?: number;
  };
  likedTracks?: LikedTrack[];
  likedTracksCount?: number;
  following?: FollowingUser[];
  followers?: FollowerUser[];
  onTabChange?: (tab: string) => void;
  onUnlike?: (id: string) => void;
}

const formatCount = (n: number = 0) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

const BIO_CHAR_LIMIT = 140;

const ProfileSideBar: React.FC<ProfileSideBarProps> = ({
  user,
  isOwner = false,
  stats = { followers: 0, following: 0, tracks: 0 },
  likedTracks = [],
  likedTracksCount = 0,
  following = [],
  followers = [],
  onTabChange,
  onUnlike,
}) => {
  const navigate = useNavigate();
  const [bioExpanded, setBioExpanded] = useState(false);

  const bio = user.bio ?? "";
  const isBioLong = bio.length > BIO_CHAR_LIMIT;
  const displayedBio =
    isBioLong && !bioExpanded ? bio.slice(0, BIO_CHAR_LIMIT) + "…" : bio;

  return (
    <div className="w-full flex-shrink-0 flex flex-col gap-9 pt-1">
      {/* Stats */}
      <div className="flex gap-13">
        <button
          data-test="followers-stat"
          className="cursor-pointer flex flex-col items-start hover:opacity-70 transition-opacity"
          onClick={() => navigate(`/${user.username}/follower`)}
        >
          <span className="text-sm font-extrabold text-text-secondary">
            Followers
          </span>
          <span className="text-3xl font-bold py-1.5 text-white">
            {formatCount(stats.followers)}
          </span>
        </button>

        <button
          data-test="following-stat"
          className="cursor-pointer flex flex-col items-start hover:opacity-70 transition-opacity"
          onClick={() => navigate(`/${user.username}/following`)}
        >
          <span className="text-sm font-extrabold text-text-secondary">
            Following
          </span>
          <span className="text-3xl font-bold py-1.5 text-white">
            {formatCount(stats.following)}
          </span>
        </button>

        <button
          data-test="tracks-stat"
          className="cursor-pointer flex flex-col items-start hover:opacity-70 transition-opacity"
          onClick={() => onTabChange?.("Tracks")}
        >
          <span className="text-sm font-extrabold text-text-secondary">
            Tracks
          </span>
          <span className="text-3xl font-bold py-1.5 text-white">
            {formatCount(stats.tracks)}
          </span>
        </button>
      </div>

      {/* Bio */}
      {bio.length > 0 && (
        <div className="flex flex-col gap-1 w-[320px]">
          <p
            data-test="bio-text"
            className="text-sm text-left text-white leading-relaxed"
          >
            {displayedBio}
          </p>
          {isBioLong && (
            <button
              data-test="bio-toggle"
              onClick={() => setBioExpanded((prev) => !prev)}
              className="text-sm font-bold text-white text-left hover:opacity-70 transition-opacity"
            >
              {bioExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {/* Liked tracks — sourced from the profile being viewed, passed in as props */}
      {likedTracksCount > 0 && (
        <div>
          <div className="flex items-center justify-between w-full hover:opacity-70 transition-opacity">
            <button
              data-test="likes-button"
              onClick={() => navigate(`/${user.username}/likes`)}
              className="text-xs font-bold text-white cursor-pointer hover:text-text-secondary"
            >
              {likedTracksCount} LIKES
            </button>
            <button
              data-test="likes-view-all"
              onClick={() => navigate(`/${user.username}/likes`)}
              className="text-xs cursor-pointer hover:underline text-text-secondary hover:text-text"
            >
              View all
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {likedTracks.slice(0, 3).map((track) => (
          <TrackItem
            key={track.id}
            {...track}
            initialLiked={isOwner}
            onUnlike={isOwner ? onUnlike : undefined}
          />
        ))}
      </div>

      {/* ON TOUR */}
      {isOwner && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-ticket text-text-secondary" />
            <span className="text-xs font-bold text-white">ON TOUR</span>
            <i className="fa-solid fa-circle-info text-text-secondary text-xs" />
          </div>
          <p className="text-xs text-left text-white border-t pt-4 border-white w-[320px]">
            With an Artist Pro account, you can create ticketed live events on
            Rythmify, and list existing events.
          </p>
          <button
            data-test="upgrade-pro-button"
            onClick={() => navigate("/creator/checkout")}
            className="w-[320px] py-3 bg-white text-black font-semibold text-sm rounded-full hover:bg-gray-200 transition-colors"
          >
            Upgrade to Artist Pro
          </button>
        </div>
      )}

      {/* Followers */}
      {!isOwner && followers.length > 0 && (
        <div className="flex flex-col gap-3 w-[320px]">
          <div className="flex items-center justify-between">
            <button
              data-test="followers-label"
              onClick={() => navigate(`/${user.username}/follower`)}
              className="text-xs cursor-pointer font-bold text-white hover:opacity-70 transition-opacity"
            >
              {formatCount(stats.followers)} FOLLOWERS
            </button>
            <button
              data-test="followers-view-all"
              onClick={() => navigate(`/${user.username}/follower`)}
              className="text-xs cursor-pointer hover:underline text-text-secondary hover:text-text"
            >
              View all
            </button>
          </div>
          <div className="flex items-center">
            {followers.slice(0, 9).map((follower, index) => (
              <button
                key={follower.username}
                data-test="follower-avatar"
                onClick={() => navigate(`/${follower.username}`)}
                className="w-12 h-12 rounded-full overflow-hidden bg-border flex-shrink-0 border-2 border-[#111] hover:opacity-80 transition-opacity"
                style={{ marginLeft: index === 0 ? 0 : "-8px", zIndex: index }}
                title={follower.username}
              >
                {follower.avatar ? (
                  <img
                    src={follower.avatar}
                    alt={follower.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-border" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Following */}
      {following.length > 0 && (
        <div className="flex flex-col gap-4 w-[320px]">
          <div className="flex items-center justify-between hover:opacity-70 transition-opacity">
            <button
              data-test="following-label"
              onClick={() => navigate(`/${user.username}/following`)}
              className="text-xs cursor-pointer font-semibold text-white"
            >
              {formatCount(stats.following)} FOLLOWING
            </button>
            <button
              data-test="following-view-all"
              onClick={() => navigate(`/${user.username}/following`)}
              className="text-xs cursor-pointer hover:underline text-text-secondary hover:text-text"
            >
              View all
            </button>
          </div>

          {following.slice(0, 3).map((u) => (
            <div
              key={u.userId ?? u.username}
              data-test="following-item"
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  data-test="following-avatar"
                  onClick={() => navigate(`/${u.username}`)}
                  className="w-12 h-12 cursor-pointer rounded-full overflow-hidden bg-border flex-shrink-0"
                >
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={u.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-border" />
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <button
                      data-test="following-username"
                      onClick={() => navigate(`/${u.username}`)}
                      className="cursor-pointer text-sm font-bold text-white hover:opacity-70 transition-opacity"
                    >
                      {u.username}
                    </button>
                    {u.isVerified && (
                      <i className="fa-solid fa-circle-check text-[#2196F3] text-xs" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <button
                      data-test="following-followers-count"
                      onClick={() => navigate(`/${u.username}/follower`)}
                      className="flex cursor-pointer items-center gap-0.5 hover:opacity-70 transition-opacity"
                    >
                      <i className="fa-solid fa-user text-[10px]" />
                      {u.followers >= 1_000_000
                        ? `${(u.followers / 1_000_000).toFixed(1)}M`
                        : u.followers >= 1_000
                          ? `${(u.followers / 1_000).toFixed(1)}K`
                          : u.followers}
                    </button>
                    {u.tracks !== undefined && u.tracks > 0 && (
                      <button
                        data-test="following-tracks-count"
                        onClick={() => navigate(`/${u.username}/tracks`)}
                        className="cursor-pointer flex items-center gap-1 hover:opacity-70 transition-opacity"
                      >
                        <i className="fa-solid fa-bars text-[10px]" />
                        {u.tracks}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <FollowButton
                username={u.username}
                userId={u.userId}
                initialIsFollowing={true}
              />
            </div>
          ))}
        </div>
      )}

      {/* Go Mobile */}
      <div className="flex flex-col gap-3 w-[320px]">
        <span className="text-xs font-semibold text-left text-white">
          GO MOBILE
        </span>
        <div className="flex gap-3">
          <button
            data-test="app-store-button"
            className="flex items-center gap-2 px-1 py-1 border border-white rounded-lg hover:opacity-70"
          >
            <i className="fa-brands fa-apple text-white text-xl" />
            <div className="flex flex-col items-start">
              <span className="text-[8px] text-white">Download on the</span>
              <span className="text-xs font-bold text-white">App Store</span>
            </div>
          </button>
          <button
            data-test="google-play-button"
            className="flex items-center gap-2 px-1 py-1 border border-white rounded-lg hover:opacity-70"
          >
            <i className="fa-brands fa-google-play text-white text-xl" />
            <div className="flex flex-col items-start">
              <span className="text-[8px] text-white">GET IT ON</span>
              <span className="text-xs font-bold text-white">Google Play</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 w-[320px]">
        <div className="flex flex-wrap gap-x-1 gap-y-1 text-xs text-text-secondary">
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
                data-test={`footer-${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="cursor-pointer hover:underline hover:text-text"
              >
                {link}
              </button>
              {i < arr.length - 1 && <span>·</span>}
            </span>
          ))}
        </div>
        <div className="text-xs text-left text-text-secondary">
          Language:{" "}
          <button
            data-test="language-button"
            className="text-[#2196F3] hover:underline"
          >
            English (US)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSideBar;
