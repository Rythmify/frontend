import { useState, useEffect } from "react";
import TrackCard from "@/components/UI/card/Card";
import UserCard from "@/components/UI/UserCard/UserCard";
import {
  getRecentlyPlayed,
  getTrackById,
} from "@/services/api/discover.service";
import { mapApiTrackToTrack } from "@/services/api/discover.mapper";
import { mockRecentlyPlayedTracks } from "@/services/mocks/discover";
import { getMyPlaylists, getMyFollowing } from "@/services/api/library.service";
import type { LibraryPlaylist, FollowingUser } from "@/services/api/library.service";
import type { Track } from "@/types/track";
import type { User } from "@/types/user";

// ─── Constants ────────────────────────────────────────────

const GRID_SIZE = 6;
const TITLE_CLASS = "text-white font-semibold text-[19px] text-left pb-4";
const CARD_WIDTH = "w-[140px] sm:w-[165px] md:w-[185px] lg:w-[200px]";

// ─── Helpers ──────────────────────────────────────────────

const EmptySlot = () => (
  <div className={`flex flex-col ${CARD_WIDTH}`}>
    <div className="w-full aspect-square rounded-md bg-input-bg" />
  </div>
);

function padToGrid(count: number) {
  return Math.max(0, GRID_SIZE - count);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className={TITLE_CLASS}>{title}</h2>
      <div className="flex gap-8">{children}</div>
    </div>
  );
}

// ─── Collection Card Component ────────────────────────────

type CollectionCard = {
  id: string;
  title: string;
  owner: string;
  coverUrl: string | null;
  isPrivate?: boolean;
  isLiked?: boolean;
};

function CollectionCardItem({ item }: { item: CollectionCard }) {
  const isEmpty = !item.coverUrl;

  return (
    <div className={`group flex flex-col gap-2 ${CARD_WIDTH}`}>
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        {!isEmpty && (
          <img
            src={item.coverUrl!}
            alt={item.title}
            className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-200 cursor-pointer"
          />
        )}
      </div>
      {!isEmpty && (
        <>
          <p className="text-white text-sm font-semibold truncate w-full flex items-center gap-1 cursor-pointer">
            {item.isPrivate && (
              <i className="fa-solid fa-lock text-[10px] text-gray-400 shrink-0" />
            )}
            {item.isLiked && (
              <i className="fa-solid fa-heart text-[10px] text-white shrink-0" />
            )}
            <span className="truncate">{item.title}</span>
          </p>
          <p className="text-gray-400 text-xs truncate w-full">{item.owner}</p>
        </>
      )}
    </div>
  );
}

// ─── Mappers ──────────────────────────────────────────────

function mapPlaylistToCard(p: LibraryPlaylist): CollectionCard {
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
  const [playlists, setPlaylists] = useState<CollectionCard[]>([]);
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

  const displayedRecent = recentlyPlayed.length
    ? recentlyPlayed
    : mockRecentlyPlayedTracks;

  const recentEmpties = padToGrid(Math.min(displayedRecent.length, GRID_SIZE));
  const likeEmpties = padToGrid(Math.min(mockRecentlyPlayedTracks.length, GRID_SIZE));
  const playlistEmpties = padToGrid(Math.min(playlists.length, GRID_SIZE));
  const followingEmpties = padToGrid(Math.min(followingUsers.length, GRID_SIZE));

  return (
    <div className="flex flex-col gap-12">
      {/* Recently Played */}
      <Section title="Recently played">
        {displayedRecent.slice(0, GRID_SIZE).map((track) => (
          <TrackCard key={track.id} track={track} widthClassName={CARD_WIDTH} />
        ))}
        {Array.from({ length: recentEmpties }).map((_, i) => (
          <EmptySlot key={`empty-r-${i}`} />
        ))}
      </Section>

      {/* Likes */}
      <Section title="Likes">
        {mockRecentlyPlayedTracks.slice(0, GRID_SIZE).map((track) => (
          <TrackCard key={track.id} track={track} widthClassName={CARD_WIDTH} />
        ))}
        {Array.from({ length: likeEmpties }).map((_, i) => (
          <EmptySlot key={`empty-l-${i}`} />
        ))}
      </Section>

      {/* Playlists */}
      <Section title="Playlists">
        {playlists.slice(0, GRID_SIZE).map((item) => (
          <CollectionCardItem key={item.id} item={item} />
        ))}
        {Array.from({ length: playlistEmpties }).map((_, i) => (
          <EmptySlot key={`empty-p-${i}`} />
        ))}
      </Section>

      {/* Albums — Mariam's section */}
      <Section title="Albums">
        {Array.from({ length: GRID_SIZE }).map((_, i) => (
          <EmptySlot key={`empty-a-${i}`} />
        ))}
      </Section>

      {/* Following */}
      <Section title="Following">
        {followingUsers.slice(0, GRID_SIZE).map((user) => (
          <UserCard key={user.id} user={user} widthClassName={CARD_WIDTH} />
        ))}
        {Array.from({ length: followingEmpties }).map((_, i) => (
          <EmptySlot key={`empty-f-${i}`} />
        ))}
      </Section>
    </div>
  );
}
