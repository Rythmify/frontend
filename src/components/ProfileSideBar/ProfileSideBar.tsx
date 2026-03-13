import React from "react";
import type { User } from "@/stores/auth.store";

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
}

const ProfileSideBar: React.FC<ProfileSideBarProps> = ({
  user,
  isOwner = false,
  stats = { followers: 0, following: 0, tracks: 0 },
  likedTracks = [],
  following = [],
}) => {
  return (
    <div className="w-[380px] flex-shrink-0 flex flex-col gap-9 pt-2">
      <div className="flex gap-8">
        <div className="flex gap-9">
          {[
            { label: "Followers", value: stats.followers },
            { label: "Following", value: stats.following },
            { label: "Tracks", value: stats.tracks },
          ].map(({ label, value }) => (
            <button
              key={label}
              className="flex flex-col items-start hover:opacity-70 transition-opacity"
            >
              <span className="text-sm font-extrabold text-text-secondary">
                {label}
              </span>
              <span className="text-3xl font-bold py-1.5 text-white">
                {value}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSideBar;
