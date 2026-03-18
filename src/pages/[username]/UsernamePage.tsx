import React, { useState, useEffect } from "react";
import ProfileHeader from "../../components/Profile/ProfileHeader/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs/ProfileTabs";
import ProfileSidebar from "../../components/Profile/ProfileSideBar/ProfileSideBar";
import { useAuthStore } from "@/stores/auth.store";
import ShareModal from "../../components/Profile/ShareModal/ShareModal";
import EditProfileModal from "../../components/Profile/EditProfileModal/EditProfileModal";
import { useNavigate } from "react-router-dom";
import { mockLikedTracks } from "@/components/Profile/MockData/mock";
import { mockFollowing } from "@/components/Profile/MockData/mock";
import { useParams } from "react-router-dom";
import { mockFollowers } from "@/components/Profile/MockData/mock";

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

// const mockLikedTracks = [
//   {
//     id: "1",
//     title: "Green & Purple f/Playboi Carti",
//     artist: "Travis Scott",
//     coverUrl: "https://i1.sndcdn.com/artworks-000225111730-qbt7bb-t500x500.jpg",
//     plays: 66900000,
//     likes: 1040000,
//     reposts: 69500,
//     comments: 9166,
//   },
//   {
//     id: "2",
//     title: "SICKO MODE",
//     artist: "Travis Scott",
//     coverUrl: "https://i1.sndcdn.com/artworks-000225111730-qbt7bb-t500x500.jpg",
//     plays: 120000000,
//     likes: 2500000,
//     reposts: 150000,
//     comments: 15000,
//   },
// ];

// const mockFollowing = [
//   {
//     username: "Travis Scott",
//     followers: 6150000,
//     tracks: 174,
//     avatar: "https://i1.sndcdn.com/avatars-000049954431-e7s5e2-t500x500.jpg",
//     isVerified: true,
//   },
//   {
//     username: "NourAbosaif04",
//     followers: 3000,
//     tracks: 0,
//     avatar: "",
//     isVerified: false,
//   },
//   {
//     username: "Farah medhat",
//     followers: 7000,
//     tracks: 0,
//     avatar: "",
//     isVerified: false,
//   },
//   {
//     username: "Farah medhat",
//     followers: 7000,
//     tracks: 0,
//     avatar: "",
//     isVerified: false,
//   },
// ];

export default function UsernamePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState("All");
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const navigate = useNavigate();

  if (!currentUser) return null;

  const isOwner = !username || username === currentUser.username;
  const user = isOwner
    ? currentUser
    : {
        ...currentUser,
        username: username || currentUser.username,
        displayName: username || currentUser.username,
        avatar: "",
        coverUrl: "",
      };
  const { message, showUpload } = getEmptyState(selectedTab, isOwner);
  const likedTracks = isOwner ? mockLikedTracks : [];
  const following = isOwner ? mockFollowing : [];
  const stats = isOwner
    ? { followers: 0, following: mockFollowing.length, tracks: 0 }
    : { followers: 0, following: 0, tracks: 0 };

  return (
    <div className="container px-4 md:px-8 lg:px-20">
      <ProfileHeader user={user} isOwner={isOwner} />

      <ProfileTabs
        isOwner={isOwner}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        onShare={() => setShowShare(true)}
        onEdit={() => setShowEdit(true)}
      />

      <div className=" flex gap-6  py-6 items-start">
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
          <p className="text-white font-bold text-17px">{message}</p>
          {showUpload && (
            <button
              onClick={() => navigate("/upload")}
              className=" cursor-pointer px-3.5 py-1.5 text-md bg-white text-black hover:text-[#737272] font-bold rounded"
            >
              Upload now
            </button>
          )}
        </div>
        <div>
          <ProfileSidebar
            user={user}
            isOwner={isOwner}
            likedTracks={mockLikedTracks}
            following={mockFollowing}
            stats={{
              followers: mockFollowers.length,
              following: mockFollowing.length,
              tracks: mockLikedTracks.length,
            }}
            onTabChange={setSelectedTab}
          />
        </div>
      </div>
      {showShare && (
        <ShareModal
          url={`https://rythmify.com/${user.username}`}
          onClose={() => setShowShare(false)}
        />
      )}
      {showEdit && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSave={(data) => {
            console.log(data);
            setShowEdit(false);
          }}
        />
      )}
    </div>
  );
}
