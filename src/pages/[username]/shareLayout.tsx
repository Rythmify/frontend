import type { ReactNode } from "react";
import ProfileHeader from "@/components/Profile/ProfileHeader/ProfileHeader";
import ProfileTabs from "@/components/Profile/ProfileTabs/ProfileTabs";
import ProfileSidebar from "@/components/Profile/ProfileSideBar/ProfileSideBar";
import type { User } from "@/stores/auth.store";
import { useState, useEffect } from "react";
import {
  getMyLikedTracks,
  getUserLikedTracks,
} from "@/services/user.service";

interface ShareLayoutProps {
  user: User;
  isOwner: boolean;
  selectedTab: string;
  onTabChange: (tab: string) => void;
  onShare?: () => void;
  onEdit?: () => void;
  profileId?: string;
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
    isFollowing?: boolean;
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
  profileId,
  likedTracks = [],
  followers = [],
  following = [],
  stats = { followers: 0, following: 0, tracks: 0 },
  onUnlike,
  children,
}: ShareLayoutProps) {
  const [fetchedLikedTracks, setFetchedLikedTracks] = useState(likedTracks);
  const [likedTracksCount, setLikedTracksCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (isOwner) {
          const [countData, data] = await Promise.all([
            getMyLikedTracks({ limit: 100 }),
            getMyLikedTracks({ limit: 3 }),
          ]);
          if (cancelled) return;
          const items = Array.isArray(data?.items) ? data.items : [];
          setFetchedLikedTracks(
            items.map((t) => ({
              id: t.id,
              title: t.title,
              artist: t.artist_name,
              coverUrl: t.cover_image ?? undefined,
              plays: t.play_count,
              likes: t.like_count,
            })),
          );
          setLikedTracksCount(countData?.meta?.total ?? items.length);
        } else {
          const userId = profileId;
          if (!userId) return;
          if (cancelled) return;

          const [countData, data] = await Promise.all([
            getUserLikedTracks(userId, { limit: 1 }),
            getUserLikedTracks(userId, { limit: 3 }),
          ]);
          if (cancelled) return;

          const items = Array.isArray(data?.items) ? data.items : [];
          setFetchedLikedTracks(
            items.map((t) => ({
              id: t.id,
              title: t.title,
              artist: t.artist_name,
              coverUrl: t.cover_image ?? undefined,
              plays: t.play_count,
              likes: t.like_count,
            })),
          );
          setLikedTracksCount(countData?.meta?.total ?? items.length);
        }
      } catch {
        if (!cancelled) {
          setFetchedLikedTracks([]);
          setLikedTracksCount(0);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOwner, profileId, user.username]);

  return (
    <div className="container px-4 md:px-8 lg:px-20">
      <ProfileHeader user={user} isOwner={isOwner} />

      <ProfileTabs
        isOwner={isOwner}
        selectedTab={selectedTab}
        onTabChange={onTabChange}
        onShare={onShare}
        onEdit={onEdit}
        username={user.username}
        displayName={user.displayName}
        userId={profileId ?? user.id}
        profilePicture={user.avatar ?? null}
        tracks={stats.tracks ?? 0}
      />

      <div className="flex gap-10 py-6 items-start">
        <div className="flex-1 min-w-0">{children}</div>
        <div className="sticky top-24 self-start w-[320px] shrink-0">
          <ProfileSidebar
            user={user}
            isOwner={isOwner}
            followers={followers}
            following={following}
            stats={stats}
            onTabChange={onTabChange}
            onUnlike={onUnlike}
            likedTracks={fetchedLikedTracks}
            likedTracksCount={likedTracksCount}
          />
        </div>
      </div>
    </div>
  );
}
