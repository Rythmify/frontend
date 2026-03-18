import React, { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import { mockFollowing } from "@/components/Profile/MockData/mock";

// const mockFollowing = [
//   { username: "Alyaa Mohamed", followers: 4, avatar: "", isVerified: false },
//   { username: "Alyaa Mohamed", followers: 4, avatar: "", isVerified: false },
//   {
//     username: "The Weeknd",
//     followers: 8490000,
//     avatar: "https://i1.sndcdn.com/avatars-000049954431-e7s5e2-t500x500.jpg",
//     isVerified: true,
//   },
//   {
//     username: "Travis Scott",
//     followers: 6150000,
//     avatar: "https://i1.sndcdn.com/avatars-000049954431-e7s5e2-t500x500.jpg",
//     isVerified: true,
//   },
//   { username: "NourAbosaif04", followers: 3, avatar: "", isVerified: false },
//   { username: "Farah medhat", followers: 6, avatar: "", isVerified: false },
//   { username: "Mariam Ramy", followers: 3, avatar: "", isVerified: false },
// ];

const tabs = ["Likes", "Following", "Followers"];

export default function FollowingPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const handleTabChange = (tab: string) => {
    if (tab === "Likes") navigate("/you/likes");
    if (tab === "Following") navigate("/you/following");
    if (tab === "Followers") navigate("/you/follower");
  };

  return (
    <div className=" py-8 container px-4 md:px-8 lg:px-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-3">
        <div
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
          className="text-white cursor-pointer text-2xl font-bold"
          onClick={() => navigate(`/${user.username}`)}
        >
          {user.displayName || user.username} is following
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-6  mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`pb-2 pt-3 px-1 text-sm font-bold cursor-pointer  border-b-[2px] ${
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
        {mockFollowing.map((u) => (
          <div
            key={u.username}
            className="flex flex-col  items-center gap-2 group"
          >
            <div
              className="w-full aspect-square rounded-full overflow-hidden bg-text-muted"
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
            <span className="text-white text-sm font-bold text-center">
              {u.username + " "}
              {u.isVerified && (
                <i className="fa-solid fa-circle-check text-[#2196F3] text-xs" />
              )}
            </span>

            <span className="text-text-secondary text-xs flex items-center gap-1">
              <i className="fa-solid fa-user text-[10px]" />
              {u.followers >= 1e6
                ? `${(u.followers / 1e6).toFixed(2)}M`
                : u.followers}{" "}
              followers
            </span>

            <div className="h-8 flex items-center justify-center">
              <button className=" cursor-pointer hidden group-hover:block px-4 py-1.5 bg-input-bg text-bg-inverted text-xs font-bold rounded hover:opacity-70">
                Following
              </button>
            </div>
          </div>
        ))}
        {Array.from({
          length:
            mockFollowing.length % 6 === 0 ? 0 : 6 - (mockFollowing.length % 6),
        }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-full aspect-square rounded-sm bg-input-bg"
          />
        ))}
      </div>
      {/* Footer */}
      <div className="mt-16 flex flex-col gap-8">
        <div className="   flex flex-wrap gap-x-1 text-xs text-text-secondary">
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
        <div className="text-xs text-left text-bg-inverted">
          Language:{" "}
          <button className="text-[#2196F3] cursor-pointer hover:underline">
            English (US)
          </button>
        </div>
      </div>
    </div>
  );
}
