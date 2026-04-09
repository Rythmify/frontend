import { useState } from "react";
import { Link } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { FaHeart, FaUserFriends, FaMusic } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import type { PlaylistDetails } from "../../../services/api/playlist/playlist.service";
import type { MockUser } from "../../../services/mocks/users";
import { followUser, unfollowUser } from "../../../services/mocks/User.service";
import { useAuthStore } from "../../../stores/auth.store";

interface PlaylistSidebarProps {
  playlist: PlaylistDetails;
  featuredArtists: MockUser[];
}

export default function PlaylistSidebar({
  playlist,
  featuredArtists,
}: PlaylistSidebarProps) {
  const formatCount = (n: number | undefined) =>
    !n ? "0" : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  const { user } = useAuthStore();
  return (
    <Tooltip.Provider delayDuration={400} skipDelayDuration={100}>
      <aside data-test="playlist-sidebar" className="flex flex-col w-full">
        {/* Made for / Creator Section */}
        <div
          data-test="sidebar-made-for-playlist"
          className="flex items-center gap-3 mb-5 px-4 py-2"
        >
          <img
            src={user?.avatar}
            alt={playlist.owner_user_id}
            className="w-10 h-10 rounded-full object-cover shrink-0 bg-[#333]"
          />
          <div className="min-w-0">
            <Link
              to={`/${playlist.owner_user_id}`}
              className="text-text-upload text-sm font-bold truncate hover:text-[#717171] transition-colors block"
            >
              Made for {user?.displayName}
            </Link>
          </div>
        </div>

        {/* Artists Featured Section */}
        <div data-test="sidebar-artists-featured">
          <p className="text-[var(--color-text-hover)] text-[12px] font-bold uppercase px-4 py-2 tracking-widest mb-4 flex items-center gap-2">
            Artists Featured
          </p>
          <div className="flex flex-col gap-4">
            {(Array.isArray(featuredArtists) ? featuredArtists : []).map(
              (artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ),
            )}
          </div>
        </div>
      </aside>
    </Tooltip.Provider>
  );
}

// Stats Helper Component
function StatItem({
  icon,
  count,
  label,
}: {
  icon: React.ReactNode;
  count: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-white transition-colors cursor-default">
        {icon}
        <span className="text-xs font-bold">{count}</span>
      </div>
      <span className="text-[10px] text-gray-500 uppercase font-medium">
        {label}
      </span>
    </div>
  );
}

// Artist Card
function ArtistCard({ artist }: { artist: MockUser }) {
  const [following, setFollowing] = useState(artist.isFollowing);
  const [followerCount, setFollowerCount] = useState(artist.followerCount);

  const handleFollow = async () => {
    try {
      if (following) {
        await unfollowUser(artist.username);
        setFollowing(false);
        setFollowerCount((c: number) => Math.max(0, c - 1));
      } else {
        await followUser(artist.username);
        setFollowing(true);
        setFollowerCount((c: number) => c + 1);
      }
    } catch {
      setFollowing((p: boolean) => !p);
    }
  };

  return (
    <div
      data-test={`artist-card-${artist.username}`}
      className="flex items-center gap-3 px-4"
    >
      <Link to={`/${artist.username}`} className="shrink-0">
        <img
          src={artist.avatarUrl}
          alt={artist.displayName}
          className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          to={`/${artist.username}`}
          className="text-[var(--color-text-hover)] text-sm font-semibold hover:text-[#717171] transition-colors truncate block"
        >
          {artist.displayName}
        </Link>

        <div className="flex items-center gap-2 mt-0.5 text-[var(--color-text-muted)] text-[11px]">
          <span className="flex items-center gap-1">
            <FaUserFriends className="w-2.5 h-2.5" />
            {followerCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <FaMusic className="w-2.5 h-2.5" />
            {artist.trackCount}
          </span>
        </div>
      </div>

      <button
        onClick={handleFollow}
        className={`
          shrink-0 min-w-[70px] px-3 py-1
          rounded-[var(--radius-sm)] text-sm font-bold
         transition-colors duration-150 cursor-pointer
          ${
            following
              ? "bg-[#303030] text-white "
              : "bg-white text-bg hover:text-[#a0a0a0]"
          }
        `}
      >
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
}
