import React, { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";

const mockFollowing = [
  // { username: "Alyaa Mohamed", followers: 4, avatar: "", isVerified: false },
  {
    username: "The Weeknd",
    followers: 8490000,
    avatar: "https://i1.sndcdn.com/avatars-000049954431-e7s5e2-t500x500.jpg",
    isVerified: true,
  },
  {
    username: "Travis Scott",
    followers: 6150000,
    avatar: "https://i1.sndcdn.com/avatars-000049954431-e7s5e2-t500x500.jpg",
    isVerified: true,
  },
  { username: "NourAbosaif04", followers: 3, avatar: "", isVerified: false },
  { username: "Farah medhat", followers: 6, avatar: "", isVerified: false },
  { username: "Mariam Ramy", followers: 3, avatar: "", isVerified: false },
];

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
      <div className="flex items-center gap-4 mb-8">
        <div className="w-23 h-23 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-600" />
          )}
        </div>
        <h1 className="text-white text-2xl font-bold">
          {user.displayName || user.username} is following
        </h1>
      </div>
    </div>
  );
}
