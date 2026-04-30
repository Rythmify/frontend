import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { FaMusic, FaUserFriends } from "react-icons/fa";
import type { PlaylistDetails } from "../../../services/api/playlist/playlist.service";
import type { MockUser } from "../../../services/mocks/users";
import { getUserById, type PublicUser } from "@/services/user.service";
import GoMobileSection from "@/components/UI/GoMobile";
import FollowButton from "@/components/UI/FollowButton";
import UserAvatar from "@/components/UI/UserAvatar";
import EngagementPlaylistSidebar from "../EngagementPlaylistSidebar";

interface PlaylistSidebarProps {
  playlist: PlaylistDetails;
  featuredArtists?: MockUser[];
  showSocialProof?: boolean;
  showLikes?: boolean;
  showReposts?: boolean;
}

type ArtistCardData = {
  id: string | number;
  username: string;
  displayName: string;
  avatarUrl: string;
  followerCount: number;
  trackCount: number;
  isFollowing: boolean;
};

function buildArtistsFromTracks(playlist: PlaylistDetails): ArtistCardData[] {
  const artists = new Map<string, ArtistCardData>();

  for (const track of playlist.tracks ?? []) {
    const rawKey =
      track.artist_id?.trim() ||
      track.artist_username?.trim() ||
      track.artist_name?.trim();
    if (!rawKey) continue;

    const key = rawKey.toLowerCase();
    const displayName =
      track.artist_name?.trim() ||
      track.artist_username?.trim() ||
      "Unknown Artist";
    const username =
      track.artist_username?.trim() ||
      (track.artist_name?.trim() || "").toLowerCase().replace(/\s+/g, "-") ||
      rawKey;

    const existing = artists.get(key);
    if (existing) {
      existing.trackCount += 1;
      continue;
    }

    artists.set(key, {
      id: track.artist_id ?? track.artist_username ?? rawKey,
      username,
      displayName,
      avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(key)}/100/100`,
      followerCount: 0,
      trackCount: 1,
      isFollowing: false,
    });
  }

  return Array.from(artists.values()).slice(0, 3);
}

export default function PlaylistSidebar({
  playlist,
  featuredArtists,
  showSocialProof = true,
  showLikes = false,
  showReposts = false,
}: PlaylistSidebarProps) {
  const [artistsToShow, setArtistsToShow] = useState<ArtistCardData[]>(() =>
    Array.isArray(featuredArtists) && featuredArtists.length > 0
      ? featuredArtists.slice(0, 3)
      : buildArtistsFromTracks(playlist),
  );

  useEffect(() => {
    let cancelled = false;

    if (Array.isArray(featuredArtists) && featuredArtists.length > 0) {
      setArtistsToShow(featuredArtists.slice(0, 3));
      return () => {
        cancelled = true;
      };
    }

    const baseArtists = buildArtistsFromTracks(playlist);
    setArtistsToShow(baseArtists);

    const idsToResolve: string[] = [];
    for (const track of playlist.tracks ?? []) {
      const artistId = track.artist_id?.trim();
      if (!artistId || track.artist_username?.trim()) continue;
      if (!idsToResolve.includes(artistId)) {
        idsToResolve.push(artistId);
      }
    }

    if (!idsToResolve.length) {
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      const resolved = await Promise.all(
        idsToResolve.map((id) => getUserById(id).catch(() => null)),
      );

      if (cancelled) return;

      const profiles = new Map(
        resolved.filter((user): user is PublicUser => Boolean(user)).map((user) => [user.id, user]),
      );

      setArtistsToShow((current) =>
        current.map((artist) => {
          const profile = profiles.get(String(artist.id));
          if (!profile) return artist;

          return {
            ...artist,
            username: profile.username ?? artist.username,
            displayName: profile.display_name ?? artist.displayName,
            avatarUrl: profile.profile_picture ?? artist.avatarUrl,
          };
        }),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [featuredArtists, playlist]);

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
          <div data-test="playlist-sidebar-featured-list" className="flex flex-col gap-4">
            {artistsToShow.map(
              (artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ),
            )}
          </div>
        </div>

        {showSocialProof && (showLikes || showReposts) && (
          <EngagementPlaylistSidebar playlist={playlist} />
        )}

        <div data-test="go-mobile-section-playlist-mix" className="mt-6">
          <GoMobileSection showFooter={false} />
        </div>
      </aside>
    </Tooltip.Provider>
  );
}


function ArtistCard({
  artist,
}: {
  artist: {
    id: string | number;
    username: string;
    displayName: string;
    avatarUrl: string;
    followerCount: number;
    trackCount: number;
    isFollowing?: boolean;
  };
}) {
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
        initialIsFollowing={artist.isFollowing}
        className="shrink-0 min-w-[70px] px-3 py-1 rounded-[var(--radius-sm)] text-sm font-bold"
      />
    </div>
  );
}
