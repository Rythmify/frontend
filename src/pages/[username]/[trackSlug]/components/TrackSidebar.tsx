import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { Track } from "../../../../types/track";
import type { MockUser } from "../../../../services/mocks/users";
import FollowButton from "@/components/UI/FollowButton";
import CoverImage from "@/components/UI/CoverImage";

interface TrackSidebarProps {
  track: Track;
  featuredArtists: MockUser[];
  relatedTracks?: Track[];
}

export default function TrackSidebar({ track, featuredArtists, relatedTracks = [] }: TrackSidebarProps) {
  const { username: urlUsername } = useParams<{ username: string }>();
  const artistUsername = track.artistUsername || urlUsername || "unknown";

  return (
    <Tooltip.Provider delayDuration={400} skipDelayDuration={100}>
      <aside data-test="track-sidebar" className="flex flex-col w-full">

        {/* Based on */}
        <div data-test="sidebar-based-on" className="mb-4">
          <p className="text-[var(--color-text-muted)] text-[11px] font-semibold uppercase tracking-widest mb-1">
            Based on
          </p>
          <p className="text-[var(--color-text-hover)] text-sm font-bold leading-snug">
            {track.title}
          </p>
        </div>

        {/* Made for */}
        {track.madeFor && (
          <div data-test="sidebar-made-for" className="flex items-center gap-3 mb-4">
            <img
              src={`https://picsum.photos/seed/${track.madeFor}/80/80`}
              alt={track.madeFor}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[var(--color-text-muted)] text-[11px] font-semibold uppercase tracking-widest">
                Made for
              </p>
              <p className="text-[var(--color-text-hover)] text-sm font-bold truncate">
                {track.madeFor}
              </p>
            </div>
          </div>
        )}

        <hr className="border-[var(--color-border)] mb-5" />

        {/* Artists Featured */}
        <div data-test="sidebar-artists-featured" className="mb-8">
          <p className="text-[var(--color-text-hover)] text-[11px] font-bold uppercase tracking-widest mb-4">
            Artists Featured
          </p>
          <div className="flex flex-col gap-4">
            {(Array.isArray(featuredArtists) ? featuredArtists : []).map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </div>

        <hr className="border-[var(--color-border)] mb-5" />

        {/* Related Tracks */}
        <div data-test="sidebar-related-tracks">
          <p className="text-[var(--color-text-muted)] text-[11px] font-bold uppercase tracking-widest mb-4 flex justify-between items-center">
            Related Tracks
            <Link 
              to={`/${artistUsername}/${track.trackSlug || track.id}/related`}
              className="text-[10px] lowercase font-normal hover:text-[var(--color-text-hover)] cursor-pointer"
            >
              View all
            </Link>
          </p>
          <div className="flex flex-col gap-4">
            {relatedTracks.slice(0, 3).map((t) => (
              <Link 
                key={t.id} 
                to={`/${t.artistUsername || artistUsername}/${t.trackSlug || t.id}`}
                className="flex gap-3 group cursor-pointer"
              >
                <div className="relative w-12 h-12 shrink-0">
                  <CoverImage
                    src={t.coverUrl}
                    alt={t.title}
                    className="w-full h-full object-cover rounded shadow-sm group-hover:opacity-80 transition-opacity"
                  />
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <p className="text-[var(--color-text-hover)] text-[13px] font-medium leading-tight truncate group-hover:text-[var(--color-text)]">
                    {t.title}
                  </p>
                  <p className="text-[var(--color-text-muted)] text-[11px] truncate">
                    {t.artistName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 opacity-60">
                     <span className="text-[10px] flex items-center gap-1">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        {t.likeCount || 0}
                     </span>
                     <span className="text-[10px] flex items-center gap-1">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        {t.playCount || 0}
                     </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </Tooltip.Provider>
  );
}

// Artist Card 
function ArtistCard({ artist }: { artist: MockUser }) {
  const [followerCount, setFollowerCount] = useState(artist.followerCount);

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  const formatExact = (n: number) => n.toLocaleString();

  const handleFollowChange = (next: boolean) => {
    setFollowerCount((c) => Math.max(0, c + (next ? 1 : -1)));
  };

  return (
    <div data-test={`artist-card-${artist.username}`} className="flex items-center gap-3">

      {/* Avatar */}
      <Link to={`/${artist.username}`} className="shrink-0">
        <img
          src={artist.avatarUrl}
          alt={artist.displayName}
          className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity"
        />
      </Link>

      {/* Name + stats */}
      <div className="flex-1 min-w-0">

        {/* Name */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Link
              to={`/${artist.username}`}
              data-test={`artist-link-${artist.username}`}
              className="text-[var(--color-text-hover)] text-sm font-semibold hover:text-[var(--color-text)] transition-colors truncate block w-fit"
            >
              {artist.displayName}
            </Link>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="bottom" sideOffset={4} className="
              bg-[var(--color-input-bg)] border border-[var(--color-border)]
              text-[var(--color-text-hover)] text-[11px] font-medium
              px-2.5 py-1.5 rounded-[var(--radius-xs)] shadow-[var(--shadow-md)] z-[100]
              data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95
              data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
            ">
              Visit {artist.displayName}'s profile
              <Tooltip.Arrow className="fill-[var(--color-border)]" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Stats */}
        <div className="flex items-center gap-2 mt-0.5">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span
                data-test={`stat-followers-${artist.username}`}
                className="flex items-center gap-1 text-[var(--color-text-muted)] text-xs cursor-default hover:text-[var(--color-text-hover)] transition-colors"
              >
                <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z"/>
                </svg>
                {formatCount(followerCount)}
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="top" sideOffset={4} className="
                bg-[var(--color-input-bg)] border border-[var(--color-border)]
                text-[var(--color-text-hover)] text-[11px] font-medium
                px-2 py-1 rounded-[var(--radius-xs)] shadow-[var(--shadow-md)] z-[100]
                data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95
                data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
              ">
                {formatExact(followerCount)} followers
                <Tooltip.Arrow className="fill-[var(--color-border)]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <span className="text-[var(--color-text-muted)] text-[10px]">·</span>

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span
                data-test={`stat-tracks-${artist.username}`}
                className="flex items-center gap-1 text-[var(--color-text-muted)] text-xs cursor-default hover:text-[var(--color-text-hover)] transition-colors"
              >
                <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 16 16">
                  <path d="M9 3v7.524A3 3 0 1 1 7 8V5.5l-2 .5V3.5L9 2.5V3z"/>
                </svg>
                {artist.trackCount}
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="top" sideOffset={4} className="
                bg-[var(--color-input-bg)] border border-[var(--color-border)]
                text-[var(--color-text-hover)] text-[11px] font-medium
                px-2 py-1 rounded-[var(--radius-xs)] shadow-[var(--shadow-md)] z-[100]
                data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95
                data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
              ">
                {artist.trackCount} tracks
                <Tooltip.Arrow className="fill-[var(--color-border)]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </div>

      {/* Follow / Following button */}
      <FollowButton 
        username={artist.username} 
        userId={String(artist.id)} 
        initialIsFollowing={artist.isFollowing}
        onFollowChange={handleFollowChange}
        className="shrink-0 min-w-[80px]"
      />
    </div>
  );
}