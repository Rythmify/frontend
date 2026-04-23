import { Link } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { FaMusic, FaUserFriends } from "react-icons/fa";
import type { PlaylistDetails } from "../../../services/api/playlist/playlist.service";
import type { MockUser } from "../../../services/mocks/users";
import GoMobileSection from "@/components/UI/GoMobile";
import FollowButton from "@/components/UI/FollowButton";

interface PlaylistSidebarProps {
  playlist: PlaylistDetails;
  featuredArtists: MockUser[];
  showLikes?: boolean;
  showReposts?: boolean;
}

export default function PlaylistSidebar({
  playlist,
  featuredArtists,
  showLikes = false,
  showReposts = false,
}: PlaylistSidebarProps) {
  const formatCount = (n: number | undefined) =>
    !n ? "0" : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  return (
    <Tooltip.Provider delayDuration={400} skipDelayDuration={100}>
      <aside data-test="playlist-sidebar" className="flex flex-col w-full">
        {/* Artists Featured Section */}
        <div data-test="sidebar-artists-featured">
          <p className="text-[var(--color-text-hover)] text-[12px] font-bold uppercase py-2 tracking-widest mb-4 flex items-center gap-2">
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

        {(showLikes || showReposts) && (
          <div className="mt-6 flex flex-col gap-4">
            {showLikes && (
              <div data-test="sidebar-playlist-likes">
                <p className="text-white text-[12px] font-bold uppercase tracking-widest">
                  {formatCount(playlist.like_count)} Likes
                </p>
              </div>
            )}

            {showReposts && (
              <div data-test="sidebar-playlist-reposts">
                <p className="text-white text-[12px] font-bold uppercase tracking-widest">
                  {formatCount(playlist.repost_count)} Reposts
                </p>
              </div>
            )}
          </div>
        )}

        <div data-test="go-mobile-section-playlist-mix" className="mt-6">
          <GoMobileSection showFooter={false} />
        </div>
      </aside>
    </Tooltip.Provider>
  );
}

function ArtistCard({ artist }: { artist: MockUser }) {
  return (
    <div
      data-test={`artist-card-${artist.username}`}
      className="flex items-center gap-3 "
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
            {artist.followerCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <FaMusic className="w-2.5 h-2.5" />
            {artist.trackCount}
          </span>
        </div>
      </div>

      <FollowButton
        username={artist.username}
        userId={String(artist.id)}
        isFollowingOverride={artist.isFollowing}
        className="shrink-0 min-w-[70px] px-3 py-1 rounded-[var(--radius-sm)] text-sm font-bold"
      />
    </div>
  );
}
