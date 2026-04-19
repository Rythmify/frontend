import type { ReactNode } from "react";
import ProfileHeader from "@/components/Profile/ProfileHeader/ProfileHeader";
import ProfileTabs from "@/components/Profile/ProfileTabs/ProfileTabs";
import ProfileSidebar from "@/components/Profile/ProfileSideBar/ProfileSideBar";
import type { User } from "@/stores/auth.store";

interface ShareLayoutProps {
  user: User;
  isOwner: boolean;
  selectedTab: string;
  onTabChange: (tab: string) => void;
  onShare?: () => void;
  onEdit?: () => void;
  likedTracks?: Array<{
    id: string;
    title: string;
    artist: string;
    coverUrl?: string;
    plays?: number;
    likes?: number;
    reposts?: number;
    comments?: number;
  }>;
  followers?: Array<{
    username: string;
    avatar?: string;
  }>;
  following?: Array<{
    userId?: string;
    username: string;
    followers: number;
    tracks?: number;
    avatar?: string;
    isVerified?: boolean;
  }>;
  stats?: {
    followers: number;
    following: number;
    tracks?: number;
    albums?: number;
    playlists?: number;
  };
  onUnlike?: (id: string) => void;
  children: ReactNode;
}

export default function ShareLayout({
  user,
  isOwner,
  selectedTab,
  onTabChange,
  onShare,
  onEdit,
  likedTracks = [],
  followers = [],
  following = [],
  stats = { followers: 0, following: 0, tracks: 0 },
  onUnlike,
  children,
}: ShareLayoutProps) {
  return (
    <div className="container px-4 md:px-8 lg:px-20">
      <ProfileHeader user={user} isOwner={isOwner} />

      <ProfileTabs
        isOwner={isOwner}
        selectedTab={selectedTab}
        onTabChange={onTabChange}
        onShare={onShare}
        onEdit={onEdit}
      />

      <div className="flex gap-10 py-6 items-start">
        <div className="flex-1 min-w-0">{children}</div>
        <div className="sticky top-24 self-start w-[320px] shrink-0">
          <ProfileSidebar
            user={user}
            isOwner={isOwner}
            likedTracks={likedTracks}
            followers={followers}
            following={following}
            stats={stats}
            onTabChange={onTabChange}
            onUnlike={onUnlike}
          />
        </div>
      </div>
    </div>
  );
}
