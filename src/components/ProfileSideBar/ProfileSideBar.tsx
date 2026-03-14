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
              className="cursor-pointer flex flex-col items-start hover:opacity-70 transition-opacity"
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

      {likedTracks.length > 0 && (
        <>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-text">
                {likedTracks.length} LIKES
              </span>
              <button className="  text-xs text-text-secondary hover:text-text">
                View all
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {likedTracks.map((track) => (
                <div key={track.id} className="flex gap-3">
                  <div className="w-14 h-14 flex-shrink-0 bg-border rounded overflow-hidden">
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-border" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <p className="text-xs text-text-secondary truncate">
                      {track.artist}
                    </p>
                    <p className="text-sm font-bold text-text truncate">
                      {track.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                      {track.plays !== undefined && (
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-play text-[10px]" />{" "}
                          {(track.plays / 1e6).toFixed(1)}M
                        </span>
                      )}
                      {track.likes !== undefined && (
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-heart text-[10px]" />{" "}
                          {(track.likes / 1e6).toFixed(2)}M
                        </span>
                      )}
                      {track.reposts !== undefined && (
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-retweet text-[10px]" />{" "}
                          {(track.reposts / 1000).toFixed(1)}K
                        </span>
                      )}
                      {track.comments !== undefined && (
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-comment text-[10px]" />{" "}
                          {track.comments.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileSideBar;
