import { useState } from "react";
import { Link } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { FaHeart, FaUserFriends, FaMusic } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import type { PlaylistDetails } from "@/services/api/playlist/playlist.service";
import type { MockUser } from "../../services/mocks/users";
import { followUser, unfollowUser } from "../../services/mocks/User.service";
import type { useAuthStore } from "@/stores/auth.store";

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

  return (
    <Tooltip.Provider delayDuration={400} skipDelayDuration={100}>
      <aside data-test="playlist-sidebar" className="flex flex-col w-full">
        {/* Made for / Creator Section */}
        <div
          data-test="sidebar-made-for"
          className="flex items-center gap-3 mb-5"
        >
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${playlist.owner_user_id}`}
            alt={playlist.owner_user_id}
            className="w-10 h-10 rounded-full object-cover shrink-0 bg-[#333]"
          />
          <div className="min-w-0">
            <p className="text-[var(--color-text-muted)] text-[11px] font-semibold uppercase tracking-widest">
              Made for
            </p>
            <Link
              to={`/${playlist.owner_user_id}`}
              className="text-[var(--color-text-hover)] text-sm font-bold truncate hover:text-white transition-colors block"
            >
              {playlist.owner_user_id}
            </Link>
          </div>
        </div>

        <hr className="mb-5" />

        {/* Artists Featured Section */}
        <div data-test="sidebar-artists-featured">
          <p className="text-[var(--color-text-hover)] text-[11px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <FaUserFriends className="text-gray-500" />
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

// Artist Card (Maintained from your TrackSidebar)
function ArtistCard({ artist }: { artist: MockUser }) {
  const [following, setFollowing] = useState(artist.isFollowing);
  const [followerCount, setFollowerCount] = useState(artist.followerCount);

  const handleFollow = async () => {
    try {
      if (following) {
        await unfollowUser(artist.username);
        setFollowing(false);
        // Change (c) to (c: number)
        setFollowerCount((c: number) => Math.max(0, c - 1));
      } else {
        await followUser(artist.username);
        setFollowing(true);
        // Change (c) to (c: number)
        setFollowerCount((c: number) => c + 1);
      }
    } catch {
      // Change (p) to (p: boolean)
      setFollowing((p: boolean) => !p);
    }
  };

  return (
    <div
      data-test={`artist-card-${artist.username}`}
      className="flex items-center gap-3"
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
          className="text-[var(--color-text-hover)] text-sm font-semibold hover:text-white transition-colors truncate block"
        >
          {artist.displayName}
        </Link>

        <div className="flex items-center gap-2 mt-0.5 text-[var(--color-text-muted)] text-[11px]">
          <span className="flex items-center gap-1">
            <FaUserFriends className="w-2.5 h-2.5" />
            {followerCount.toLocaleString()}
          </span>
          <span>·</span>
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
          rounded-[var(--radius-sm)] text-[10px] font-bold
          border transition-colors duration-150 cursor-pointer
          ${
            following
              ? "bg-[var(--color-input-bg)] border-[var(--color-border-light)] text-[var(--color-text-hover)]"
              : "bg-white border-white text-black hover:bg-gray-200"
          }
        `}
      >
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
}
