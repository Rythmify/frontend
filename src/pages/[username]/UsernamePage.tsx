import React, { useState } from "react";
import ProfileHeader from "../../components/ProfileHeader/ProfileHeader";
import ProfileTabs from "../../components/ProfileTabs/ProfileTabs";
import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";
import { useAuthStore } from "@/stores/auth.store";

function getEmptyState(tab: string, isOwner: boolean) {
  switch (tab) {
    case "All":
      return {
        message: "Seems a little quiet over here",
        showUpload: isOwner,
      };
    case "Popular tracks":
      return { message: "Seems a little quiet over here", showUpload: isOwner };
    case "Tracks":
      return {
        message: "Seems a little quiet over here",
        showUpload: isOwner,
      };
    case "Albums":
      return {
        message: "Seems a little quiet over here",
        showUpload: isOwner,
      };
    case "Playlists":
      return {
        message: "You haven't created any playlists.",
        showUpload: false,
      };
    case "Reposts":
      return { message: "You haven't reposted any sounds.", showUpload: false };
    default:
      return { message: "No content yet.", showUpload: false };
  }
}

const mockLikedTracks = [
  {
    id: "1",
    title: "Green & Purple f/Playboi Carti",
    artist: "Travis Scott",
    coverUrl: "https://i1.sndcdn.com/artworks-000225111730-qbt7bb-t500x500.jpg",
    plays: 66900000,
    likes: 1040000,
    reposts: 69500,
    comments: 9166,
  },
  {
    id: "2",
    title: "SICKO MODE",
    artist: "Travis Scott",
    coverUrl: "https://i1.sndcdn.com/artworks-000225111730-qbt7bb-t500x500.jpg",
    plays: 120000000,
    likes: 2500000,
    reposts: 150000,
    comments: 15000,
  },
];

export default function UsernamePage() {
  const { user: currentUser } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState("All");

  const user = currentUser;
  if (!user || !currentUser) return null;

  const isOwner = user.id === currentUser.id;
  const { message, showUpload } = getEmptyState(selectedTab, isOwner);

  return (
    <div className="w-full">
      <ProfileHeader user={user} isOwner={isOwner} />
      <div className=" max-w-[100%] mx-auto ">
        <ProfileTabs
          isOwner={isOwner}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />
      </div>

      <div className="flex gap-6 px-6 py-6 items-start">
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
          <p className="text-white font-extrabold text-17px">{message}</p>
          {showUpload && (
            <button className=" cursor-pointer px-3.5 py-1.5 text-md bg-white text-black hover:text-[#737272] font-extrabold rounded">
              Upload now
            </button>
          )}
        </div>
        <div className="w-[370px] flex-shrink-0">
          <ProfileSidebar
            user={user}
            isOwner={isOwner}
            likedTracks={mockLikedTracks}
          />
        </div>
      </div>
    </div>
  );
}
