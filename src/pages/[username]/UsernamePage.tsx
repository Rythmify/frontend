import React, { useState } from "react";
import ProfileHeader from "../../components/ProfileHeader/ProfileHeader";
import ProfileTabs from "../../components/ProfileTabs/ProfileTabs";
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
      <div className=" max-w-[98%] mx-auto ">
        <ProfileTabs
          isOwner={isOwner}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />
      </div>

      <div className="flex gap-6 px-6 py-6">
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
          <p className="text-white font-extrabold text-17px">{message}</p>
          {showUpload && (
            <button className="px-3.5 py-1.5 text-md bg-white text-black hover:text-[#737272] font-extrabold rounded">
              Upload now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
