import { useState, useEffect } from "react";
import TrackCard from "@/components/UI/card/Card";
import UserCard from "@/components/UI/UserCard/UserCard";
import LikesContent from "@/components/UI/LikesContent/LikesContent";
import PlaylistCard from "@/components/UI/PlaylistCard/PlaylistCard";
import StationCard from "@/components/UI/StationCard/StationCard";
import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import {
  getRecentlyPlayed,
  getTrackById,
} from "@/services/api/discover.service";
import { mapApiTrackToTrack } from "@/services/api/discover.mapper";
import { mockRecentlyPlayedTracks, mockRecentlyPlayedStations } from "@/services/mocks/discover";
import { getMyPlaylists, getMyFollowing } from "@/services/api/library.service";
import type { LibraryPlaylist, FollowingUser } from "@/services/api/library.service";
import type { Track } from "@/types/track";
import type { User } from "@/types/user";

// ─── Constants ────────────────────────────────────────────

const TITLE_CLASS = "text-white font-semibold text-[19px] text-left pb-4";
const CARD_WIDTH = "w-[140px] sm:w-[165px] md:w-[185px] lg:w-[200px]";

// ─── Helpers ──────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className={TITLE_CLASS}>{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">{children}</div>
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
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistCardData[]>([]);
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);

  useEffect(() => {
    getRecentlyPlayed()
      .then((items) =>
        Promise.all(items.map((item) => getTrackById(item.track.id))),
      )
      .then((tracks) => setRecentlyPlayed(tracks.map(mapApiTrackToTrack)))
      .catch(() => setRecentlyPlayed(mockRecentlyPlayedTracks));
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

  const displayedRecent = recentlyPlayed.length ? recentlyPlayed : mockRecentlyPlayedTracks;

  return (
    <div className="flex flex-col gap-12">
      {/* Recently Played */}
      <Section title="Recently played">
        {displayedRecent.map((track) => (
          <TrackCard key={track.id} track={track} widthClassName={CARD_WIDTH} />
        ))}
      </Section>

      {/* Likes */}
      <Section title="Likes">
        <LikesContent
          tracks={mockRecentlyPlayedTracks}
          showControls={false}
        />
      </Section>

      {/* Playlists */}
      <Section title="Playlists">
        {playlists.map((item) => (
          <PlaylistCard key={item.id} item={item} widthClassName={CARD_WIDTH} />
        ))}
      </Section>

      {/* Albums — Mariam's section */}
      <Section title="Albums">
        <span />
      </Section>

      {/* Stations */}
      <Section title="Stations">
        {mockRecentlyPlayedStations.map((station, i) => (
          <StationCard key={station.id} station={station} widthClassName={CARD_WIDTH} colorIndex={i} />
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
