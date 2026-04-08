import { useState, useEffect } from "react";
import TrackCard from "@/components/UI/card/Card";
import UserCard from "@/components/UI/UserCard/UserCard";
import LikesContent from "@/components/UI/LikesContent/LikesContent";
import PlaylistCard from "@/components/UI/PlaylistCard/PlaylistCard";
import AlbumCard from "@/components/playlist/PlaylistCard";
import StationCard from "@/components/UI/StationCard/StationCard";
import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import {
  getRecentlyPlayed,
  getTrackById,
} from "@/services/api/discover.service";
import { mapApiTrackToTrack } from "@/services/api/discover.mapper";
import { mockRecentlyPlayedTracks } from "@/services/mocks/discover";
import { getMyPlaylists, getMyFollowing } from "@/services/api/library.service";
import type { LibraryPlaylist, FollowingUser } from "@/services/api/library.service";
import {
  getMyPlaylists as getMyPlaylistsApi,
  getLikedPlaylists,
  type Playlist,
} from "@/services/api/playlist/playlist.service";
import type { Track } from "@/types/track";
import type { User } from "@/types/user";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";
import { useAuthStore } from "@/stores/auth.store";

// ─── Constants ────────────────────────────────────────────

const TITLE_CLASS = "text-white font-semibold text-[19px] text-left";
const CARD_WIDTH = "w-[140px] sm:w-[165px] md:w-[185px] lg:w-[200px]";

// ─── Helpers ──────────────────────────────────────────────

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between pb-4">
        <h2 className={TITLE_CLASS}>{title}</h2>
        {action}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">{children}</div>
    </div>
  );
}

type FilterOption = "All" | "Created" | "Liked";

function FilterDropdown({ value, onChange }: { value: FilterOption; onChange: (v: FilterOption) => void }) {
  const [open, setOpen] = useState(false);
  const options: FilterOption[] = ["All", "Created", "Liked"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-2 min-w-[90px] border border-[#444] rounded-sm py-1.5 px-3 bg-transparent text-[13px] text-white font-bold hover:border-text-secondary transition-all cursor-pointer focus:outline-none"
      >
        <span>{value}</span>
        <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 fill-current transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M20.5303 9.53033L12 18.0607L3.46967 9.53033L4.53033 8.46967L12 15.9393L19.4697 8.46967L20.5303 9.53033Z" />
        </svg>
      </button>

      {open && (
        <ul className="absolute right-0 mt-1 w-full border border-text-secondary rounded-sm shadow-xl z-20 overflow-hidden bg-bg py-1">
          {options.map((opt) => (
            <li key={opt}>
              <button
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors cursor-pointer ${
                  value === opt ? "text-white font-bold" : "text-text-secondary hover:text-white hover:bg-bg"
                }`}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Mappers ──────────────────────────────────────────────

function mapPlaylistToCard(p: LibraryPlaylist, displayName: string): PlaylistCardData {
  return {
    id: p.playlist_id,
    title: p.name,
    owner: displayName,
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
  const [albums, setAlbums] = useState<Playlist[]>([]);
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const [playlistFilter, setPlaylistFilter] = useState<FilterOption>("All");

  const { likedTracks, likedStations, likedPlaylists, likedAlbums: storeLikedAlbums } = useLikesStore();
  const { user } = useAuthStore();
  const { entries, getRecentTracks } = useHistoryStore();

  useEffect(() => {
    getRecentlyPlayed()
      .then((items) =>
        Promise.all(items.map((item) => getTrackById(item.track.id))),
      )
      .then((tracks) => setRecentlyPlayedApi(tracks.map(mapApiTrackToTrack)))
      .catch(() => setRecentlyPlayedApi(mockRecentlyPlayedTracks));
  }, []);

  useEffect(() => {
    getMyPlaylists()
      .then((items) => setPlaylists(items.map((p) => mapPlaylistToCard(p, user?.displayName ?? user?.username ?? p.owner_user_id))))
      .catch(() => setPlaylists([]));
  }, []);

  useEffect(() => {
    getMyFollowing()
      .then((items) => setFollowingUsers(items.map(mapFollowingToUser)))
      .catch(() => setFollowingUsers([]));
  }, []);

  useEffect(() => {
    Promise.all([
      getMyPlaylistsApi({ limit: 50 }),
      getLikedPlaylists({ limit: 50 }),
    ])
      .then(([created, liked]) => {
        const createdAlbums = created.data.items.filter((p) => p.is_album_view);
        const likedAlbums = liked.data.items.filter((p) => p.is_album_view);
        const merged = [...createdAlbums, ...likedAlbums];
        const seen = new Set<string>();
        const unique = merged.filter((p) => {
          if (seen.has(p.playlist_id)) return false;
          seen.add(p.playlist_id);
          return true;
        });
        setAlbums(unique);
      })
      .catch(() => setAlbums([]));
  }, []);

  // History store tracks take priority; fall back to API / mock
  const historyTracks = getRecentTracks();
  const recentTracks = historyTracks.length
    ? historyTracks
    : recentlyPlayedApi.length
      ? recentlyPlayedApi
      : mockRecentlyPlayedTracks;

  const likesDisplay = likedTracks;
  const stationsDisplay = likedStations;

  const visiblePlaylists: PlaylistCardData[] = (() => {
    if (playlistFilter === "Created") return playlists;
    if (playlistFilter === "Liked") return likedPlaylists;
    // All: merge created + liked, dedupe by id
    const seen = new Set<string>();
    return [...playlists, ...likedPlaylists].filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  })();

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
      <Section
        title="Playlists"
        action={<FilterDropdown value={playlistFilter} onChange={setPlaylistFilter} />}
      >
        {visiblePlaylists.map((item) => (
          <PlaylistCard key={item.id} item={item} widthClassName={CARD_WIDTH} />
        ))}
      </Section>

      {/* Albums */}
      <Section title="Albums">
        {(() => {
          const seen = new Set<string>();
          return [...albums, ...storeLikedAlbums].filter((p) => {
            if (seen.has(p.playlist_id)) return false;
            seen.add(p.playlist_id);
            return true;
          }).map((p) => (
            <AlbumCard key={p.playlist_id} playlist={p} />
          ));
        })()}
      </Section>

      {/* Stations */}
      <Section title="Stations">
        {stationsDisplay.map((station, i) => (
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
