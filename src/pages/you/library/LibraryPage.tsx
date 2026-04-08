import { useState, useEffect } from "react";
import TrackCard from "@/components/UI/card/Card";
import UserCard from "@/components/UI/UserCard/UserCard";
import LikesContent from "@/components/UI/LikesContent/LikesContent";
import PlaylistCard from "@/components/UI/PlaylistCard/PlaylistCard";
import StationCard from "@/components/UI/StationCard/StationCard";
import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import { getRecentlyPlayed } from "@/services/api/discover.service";
import { mapRecentlyPlayedEntry } from "@/services/api/discover.mapper";
import { mockRecentlyPlayedTracks } from "@/services/mocks/discover";
import { getMyPlaylists, getMyFollowing } from "@/services/api/library.service";
import type {
  LibraryPlaylist,
  FollowingUser,
} from "@/services/api/library.service";
import type { Track } from "@/types/track";
import type { User } from "@/types/user";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";

// ─── Constants ────────────────────────────────────────────

const TITLE_CLASS = "text-white font-semibold text-[19px] text-left pb-4";
const CARD_WIDTH = "w-[140px] sm:w-[165px] md:w-[185px] lg:w-[200px]";

// ─── Helpers ──────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className={TITLE_CLASS}>{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
        {children}
      </div>
    </div>
  );
}

// ─── Mappers ──────────────────────────────────────────────

function mapPlaylistToCard(p: LibraryPlaylist): PlaylistCardData {
  return {
    id: p.playlist_id,
    title: p.name,
    owner: p.owner_user_id,
    coverUrl: p.cover_image,
    isPrivate: !p.is_public,
    isLiked: p.like_count > 0,
  };
}

function mapFollowingToUser(f: FollowingUser, index: number): User {
  return {
    id: index + 1,
    username: f.username,
    displayName: f.display_name,
    avatar: f.profile_picture ?? undefined,
    followers: 0,
    isVerified: f.is_verified,
  };
}

// ─── Page ─────────────────────────────────────────────────

export default function LibraryPage() {
  const [recentlyPlayedApi, setRecentlyPlayedApi] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistCardData[]>([]);
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);

  const { likedTracks, likedStations, likedPlaylists } = useLikesStore();
  const { entries, getRecentTracks } = useHistoryStore();

  useEffect(() => {
    getRecentlyPlayed()
      .then((items) => setRecentlyPlayedApi(items.map(mapRecentlyPlayedEntry)))
      .catch(() => setRecentlyPlayedApi(mockRecentlyPlayedTracks));
  }, []);

  useEffect(() => {
    getMyPlaylists()
      .then((items) => setPlaylists(items.map(mapPlaylistToCard)))
      .catch(() => setPlaylists([]));
  }, []);

  useEffect(() => {
    getMyFollowing()
      .then((items) => setFollowingUsers(items.map(mapFollowingToUser)))
      .catch(() => setFollowingUsers([]));
  }, []);

  // History store tracks take priority; fall back to API / mock
  const historyTracks = getRecentTracks();
  const recentTracks = historyTracks.length
    ? historyTracks
    : recentlyPlayedApi.length
      ? recentlyPlayedApi
      : mockRecentlyPlayedTracks;

  const likesDisplay = likedTracks;

  // Liked stations (from store)
  const stationsDisplay = likedStations;

  // suppress unused warning — entries drives getRecentTracks reactivity
  void entries;

  return (
    <div className="flex flex-col gap-12">
      {/* Recently Played */}
      <Section title="Recently played">
        {recentTracks.map((track) => (
          <TrackCard key={track.id} track={track} widthClassName={CARD_WIDTH} />
        ))}
      </Section>

      {/* Likes */}
      <Section title="Likes">
        <LikesContent tracks={likesDisplay} showControls={false} />
      </Section>

      {/* Playlists */}
      <Section title="Playlists">
        {[
          ...playlists,
          ...likedPlaylists.filter(
            (lp) => !playlists.some((p) => p.id === lp.id),
          ),
        ].map((item) => (
          <PlaylistCard key={item.id} item={item} widthClassName={CARD_WIDTH} />
        ))}
      </Section>

      {/* Albums — Mariam's section */}
      <Section title="Albums">
        <span />
      </Section>

      {/* Stations */}
      <Section title="Stations">
        {stationsDisplay.map((station, i) => (
          <StationCard
            key={station.id}
            station={station}
            widthClassName={CARD_WIDTH}
            colorIndex={i}
          />
        ))}
      </Section>

      {/* Following */}
      <Section title="Following">
        {followingUsers.map((user) => (
          <UserCard key={user.id} user={user} widthClassName={CARD_WIDTH} />
        ))}
      </Section>
    </div>
  );
}
