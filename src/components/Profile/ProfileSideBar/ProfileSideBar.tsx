import React from "react";
import type { User } from "@/stores/auth.store";
import TrackItem from "./TrackItem";
import { useNavigate } from "react-router-dom";

interface FollowingUser {
  username: string;
  followers: number;
  tracks?: number;
  avatar?: string;
  isVerified?: boolean;
}

interface LikedTracks {
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
  likedTracks?: LikedTracks[];
  following?: FollowingUser[];
  onTabChange?: (tab: string) => void;
}

const formatCount = (n: number = 0) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

const ProfileSideBar: React.FC<ProfileSideBarProps> = ({
  user,
  isOwner = false,
  stats = { followers: 0, following: 0, tracks: 0 },
  likedTracks = [],
  following = [],
  onTabChange,
}) => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex-shrink-0 flex flex-col gap-9 pt-1 ">
      <div className="flex gap-13">
        <button
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

      {likedTracks.length > 0 && (
        <>
          <div>
            <div className="flex items-center justify-between  w-full hover:opacity-70 transition-opacity ">
              <button
                data-test="likes-button"
                onClick={() => navigate(`/${user.username}/likes`)}
                className="text-xs font-bold text-white cursor-pointer hover:text-text-secondary"
              >
                {likedTracks.length} LIKES
              </button>
              <button
                data-test="view-all-button"
                onClick={() => navigate(`/${user.username}/likes`)}
                className="  text-xs cursor-pointer hover:underline text-text-secondary hover:text-text"
              >
                View all
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-4">
        {likedTracks.slice(0, 3).map((track) => (
          <TrackItem key={track.id} {...track} />
        ))}
      </div>

      {isOwner && (
        <div className="flex flex-col gap-2  ">
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
            onClick={() => navigate("/creator/checkout")}
            className="w-[320px] py-3 bg-white text-black font-semibold  text-sm rounded-full hover:bg-gray-200 transition-colors"
          >
            Upgrade to Artist Pro
          </button>
        </div>
      )}
      {/* Following section */}
      {following.length > 0 && (
        <div className="flex flex-col gap-4 w-[320px]">
          <div className="flex items-center justify-between hover:opacity-70 transition-opacity">
            <button
              onClick={() => navigate(`/${user.username}/following`)}
              className="text-xs cursor-pointer font-semibold text-white"
            >
              {following.length} FOLLOWING
            </button>
            <button
              onClick={() => navigate(`/${user.username}/following`)}
              className="text-xs cursor-pointer hover:underline text-text-secondary hover:text-text"
            >
              View all
            </button>
          </div>

          {following.slice(0, 3).map((user) => (
            <div
              key={user.username}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-border flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-border" />
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-white">
                      {user.username}
                    </span>
                    {user.isVerified && (
                      <i className="fa-solid fa-circle-check text-[#2196F3] text-xs" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-user text-[10px]" />
                      {user.followers >= 1e6
                        ? `${(user.followers / 1e6).toFixed(1)}M`
                        : `${(user.followers / 1000).toFixed(1)}K`}
                    </span>
                    {user.tracks !== undefined && user.tracks > 0 && (
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-bars text-[10px]" />
                        {user.tracks}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button className="px-3 py-1 bg-[#313030] text-white text-xs font-bold rounded hover:opacity-70">
                Following
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Go Mobile section */}
      <div className="flex flex-col gap-3 w-[320px]">
        <span className="text-xs font-semibold text-left text-white">
          GO MOBILE
        </span>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-1 py-1 border border-white rounded-lg hover:opacity-70">
            <i className="fa-brands fa-apple text-white text-xl" />
            <div className="flex flex-col items-start">
              <span className="text-[8px] text-white">Download on the</span>
              <span className="text-xs font-bold text-white">App Store</span>
            </div>
          </button>
          <button className="flex items-center gap-2 px-1 py-1 border border-white rounded-lg hover:opacity-70">
            <i className="fa-brands fa-google-play text-white text-xl" />
            <div className="flex flex-col items-start">
              <span className="text-[8px] text-white">GET IT ON</span>
              <span className="text-xs font-bold text-white">Google Play</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer links */}
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
              <button className="cursor-pointer hover:underline hover:text-text">
                {link}
              </button>
              {i < arr.length - 1 && <span>·</span>}
            </span>
          ))}
        </div>
        <div className="text-xs text-left text-text-secondary">
          Language:{" "}
          <button className="text-[#2196F3] hover:underline">
            English (US)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSideBar;
