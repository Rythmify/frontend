import { useState, useEffect, useRef } from "react";
import ProfileHeader from "../../components/Profile/ProfileHeader/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs/ProfileTabs";
import ProfileSidebar from "../../components/Profile/ProfileSideBar/ProfileSideBar";
import { useAuthStore } from "@/stores/auth.store";
import ShareModal from "../../components/Profile/ShareModal/ShareModal";
import EditProfileModal from "../../components/Profile/EditProfileModal/EditProfileModal";
import { useNavigate, useLocation } from "react-router-dom";
import {
  mockLikedTracks,
  mockUserFollowing,
  mockUserFollowers,
  mockFollowing,
  mockFollowers,
  mockUserProfiles,
} from "@/components/Profile/MockData/mock";
import { useParams } from "react-router-dom";

export default function UsernamePage() {
  const { username } = useParams();
  const { user: currentUser, setUser } = useAuthStore();
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser) return null;

  const isOwner = !username || username === currentUser.username;

  useEffect(() => {
    if (
      currentUser &&
      (!currentUser.following_ids || currentUser.following_ids.length === 0)
    ) {
      setUser({
        ...currentUser,
        following_ids: mockFollowing.map((u) => u.username),
      });
    }
  }, []);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith("/tracks")) return "Tracks";
    if (path.endsWith("/popular-tracks")) return "Popular tracks";
    if (path.endsWith("/albums")) return "Albums";
    if (path.endsWith("/sets")) return "Playlists";
    if (path.endsWith("/reposts")) return "Reposts";
    return "All";
  };

  const selectedTab = getActiveTab();
  const profile = isOwner ? null : mockUserProfiles[username || ""];
  const storageKey = `likedTracks_${isOwner ? currentUser.username : username}`;

  const initiallyFollowing = useRef(
    currentUser?.following_ids?.includes(username || "") ?? false,
  );
  const isFollowing =
    currentUser?.following_ids?.includes(username || "") ?? false;
  const followerDelta =
    isFollowing === initiallyFollowing.current ? 0 : isFollowing ? 1 : -1;

  const [likedTracks, setLikedTracks] = useState<typeof mockLikedTracks>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored
      ? JSON.parse(stored)
      : isOwner
        ? mockLikedTracks
        : (profile?.likedTracks ?? []);
  });

  const handleUnlike = (id: string) => {
    setLikedTracks((prev: typeof mockLikedTracks) => {
      const updated = prev.filter(
        (t: (typeof mockLikedTracks)[0]) => t.id !== id,
      );
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const handleTabChange = (tab: string) => {
    const targetUsername = isOwner ? currentUser.username : username || "";
    const tabRoutes: Record<string, string> = {
      All: `/${targetUsername}`,
      "Popular tracks": `/${targetUsername}/popular-tracks`,
      Tracks: `/${targetUsername}/tracks`,
      Albums: `/${targetUsername}/albums`,
      Playlists: `/${targetUsername}/sets`,
      Reposts: `/${targetUsername}/reposts`,
    };
    const route = tabRoutes[tab];
    if (route) navigate(route);
  };

  const stats = isOwner
    ? {
        followers: mockFollowers.length,
        following: currentUser?.following_ids?.length ?? 0,
        tracks: 0,
      }
    : {
        followers: (profile?.followers ?? 0) + followerDelta,
        following: profile?.following ?? 0,
        tracks: profile?.tracks ?? 0,
      };

  const user = isOwner
    ? currentUser
    : {
        ...currentUser,
        username: username || currentUser.username,
        displayName: profile?.displayName || username || currentUser.username,
        bio: profile?.bio || "",
        avatar: profile?.avatar || "",
        coverUrl: profile?.coverUrl || "",
        location: profile?.location || "",
      };

  const allMockUsers = Array.from(
    new Map(
      [
        ...mockFollowing,
        ...mockFollowers.map((u) => ({ ...u, tracks: 0 })),
      ].map((u) => [u.username, u]),
    ).values(),
  );

  const following = isOwner
    ? allMockUsers.filter((u) =>
        currentUser?.following_ids?.includes(u.username),
      )
    : (mockUserFollowing[username || ""] ?? []);

  const followers = isOwner
    ? allMockUsers.filter((u) =>
        currentUser?.followers_ids?.includes(u.username),
      )
    : (mockUserFollowers[username || ""] ?? []);

  return (
    <div className="container px-4 md:px-8 lg:px-20">
      <ProfileHeader user={user} isOwner={isOwner} />

      <ProfileTabs
        isOwner={isOwner}
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        onShare={() => setShowShare(true)}
        onEdit={() => setShowEdit(true)}
        username={user.username}
        displayName={user.displayName}
        tracks={stats.tracks ?? 0}
      />

      <div className="flex gap-6 py-6 items-start">
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
          <p
            data-test="empty-state-message"
            className="text-white font-bold text-17px"
          >
            Seems a little quiet over here
          </p>
          {isOwner &&
            selectedTab !== "Playlists" &&
            selectedTab !== "Reposts" && (
              <button
                data-test="upload-now-button"
                onClick={() => navigate("/upload")}
                className="cursor-pointer px-3.5 py-1.5 text-md bg-white text-black hover:text-[#737272] font-bold rounded"
              >
                Upload now
              </button>
            )}
        </div>
        <div>
          <ProfileSidebar
            user={user}
            isOwner={isOwner}
            likedTracks={likedTracks}
            followers={followers}
            following={following}
            stats={stats}
            onTabChange={handleTabChange}
            onUnlike={handleUnlike}
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
            setUser({
              ...currentUser,
              displayName: data.displayName,
              firstName: data.firstName,
              lastName: data.lastName,
              bio: data.bio,
              city: data.city,
              country: data.country,
              location: data.location,
              avatar: data.avatarFile
                ? URL.createObjectURL(data.avatarFile)
                : currentUser.avatar,
            });
            setShowEdit(false);
          }}
        />
      )}
    </div>
  );
}
