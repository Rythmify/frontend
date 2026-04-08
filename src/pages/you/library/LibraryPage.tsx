import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import TrackCard from "@/components/UI/card/Card";
import UserCard from "@/components/UI/UserCard/UserCard";
import LikesContent from "@/components/UI/LikesContent/LikesContent";
import PlaylistCard from "@/components/UI/PlaylistCard/PlaylistCard";
import AlbumCard from "@/components/Playlist/PlaylistCard";
import StationCard from "@/components/UI/StationCard/StationCard";
import MadeForYouCard from "@/components/UI/MadeForYouCard/MadeForYouCard";
import type { MadeForYouItem } from "@/components/UI/MadeForYouCard/MadeForYouCard";
import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import type { PersonalMix } from "@/services/api/discover.service";
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
const CARD_WIDTH = "w-[180px] sm:w-[200px] md:w-[220px] lg:w-[230px]";

// ─── Helpers ──────────────────────────────────────────────

function Section({
  title,
  action,
  "data-test": dataTest,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  "data-test"?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3" data-test={dataTest}>
      <div className="flex items-center justify-between pb-4">
        <h2
          className={TITLE_CLASS}
          data-test={dataTest ? `${dataTest}-title` : undefined}
        >
          {title}
        </h2>
        {action}
      </div>
      <div
        className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide"
        data-test={dataTest ? `${dataTest}-cards` : undefined}
      >
        {children}
      </div>
    </div>
  );
}

type FilterOption = "All" | "Created" | "Liked";

function FilterDropdown({
  value,
  onChange,
}: {
  value: FilterOption;
  onChange: (v: FilterOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const options: FilterOption[] = ["All", "Created", "Liked"];

  return (
    <div className="relative">
      <button
        data-test="library-playlist-filter-toggle"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-2 min-w-[90px] border border-[#444] rounded-sm py-1.5 px-3 bg-transparent text-[13px] text-white font-bold hover:border-text-secondary transition-all cursor-pointer focus:outline-none"
      >
        <span>{value}</span>
        <svg
          viewBox="0 0 24 24"
          className={`w-3.5 h-3.5 fill-current transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M20.5303 9.53033L12 18.0607L3.46967 9.53033L4.53033 8.46967L12 15.9393L19.4697 8.46967L20.5303 9.53033Z" />
        </svg>
      </button>

      {open && (
        <ul className="absolute right-0 mt-1 w-full border border-text-secondary rounded-sm shadow-xl z-20 overflow-hidden bg-bg py-1">
          {options.map((opt) => (
            <li key={opt}>
              <button
                data-test={`library-playlist-filter-option-${opt.toLowerCase()}`}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors cursor-pointer ${
                  value === opt
                    ? "text-white font-bold"
                    : "text-text-secondary hover:text-white hover:bg-bg"
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

function mapPlaylistToCard(
  p: LibraryPlaylist,
  displayName: string,
): PlaylistCardData {
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

function mixToCard(mix: PersonalMix): MadeForYouItem {
  const words = mix.label.trim().split(/\s+/);
  return {
    id: mix.id,
    title: mix.label,
    subtitle:
      mix.flavor === "listening_history"
        ? "Based on listening history"
        : "Based on your taste",
    coverUrl: mix.cover_image ?? "https://picsum.photos/200/200?random=99",
    badgeWords: [
      (words[0] ?? "MIX").toUpperCase(),
      (words[1] ?? "1").toUpperCase(),
    ],
    badgeBg: mix.flavor === "listening_history" ? "#1a237e" : "#1b5e20",
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
  const { entries } = useHistoryStore();

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
      .then((items) =>
        setPlaylists(
          items.map((p) =>
            mapPlaylistToCard(
              p,
              user?.displayName ?? user?.username ?? p.owner_user_id,
            ),
          ),
        ),
      )
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

  // History entries (all types) take priority; fall back to API/mock tracks
  const recentEntries =
    entries.length > 0
      ? entries
      : (recentlyPlayedApi.length > 0
          ? recentlyPlayedApi
          : mockRecentlyPlayedTracks
        ).map((t) => ({ type: "track" as const, item: t, playedAt: "" }));

  const likesDisplay = likedTracks;
  const stationsDisplay = likedStations;

  const visiblePlaylists: PlaylistCardData[] = (() => {
    if (playlistFilter === "Created") return playlists;
    if (playlistFilter === "Liked") return likedPlaylists;
    const seen = new Set<string>();
    return [...playlists, ...likedPlaylists].filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  })();

  const displayedFollowing = useMemo(() => {
    const followingSet = new Set(user?.following_ids ?? []);
    const fromApi = followingUsers.filter((u) => followingSet.has(u.username));
    const apiUsernames = new Set(fromApi.map((u) => u.username));
    const extraUsers: User[] = (user?.following_ids ?? [])
      .filter((username) => !apiUsernames.has(username))
      .map((username, i) => ({
        id: -(i + 1),
        username,
        displayName: username,
        followers: 0,
      }));
    return [...fromApi, ...extraUsers];
  }, [followingUsers, user?.following_ids]);

  return (
    <div className="flex flex-col gap-12">
      {/* Recently Played */}
      <Section title="Recently played" data-test="library-recently-played">
        {recentEntries.map((entry, i) => {
          if (entry.type === "track")
            return (
              <TrackCard
                key={`track-${entry.item.id}`}
                track={entry.item}
                widthClassName={CARD_WIDTH}
              />
            );
          if (entry.type === "station")
            return (
              <StationCard
                key={`station-${entry.item.id}`}
                station={entry.item}
                widthClassName={CARD_WIDTH}
                colorIndex={i}
              />
            );
          if (entry.type === "mix")
            return (
              <MadeForYouCard
                key={`mix-${entry.item.id}`}
                item={mixToCard(entry.item)}
                widthClassName={CARD_WIDTH}
              />
            );
          return null;
        })}
      </Section>

      {/* Likes */}
      <Section
        title="Likes"
        data-test="library-likes"
        action={
          <Link
            to="/discover"
            data-test="library-likes-browse"
            className="text-text-secondary text-sm hover:text-white transition-colors"
          >
            Browse trending playlists
          </Link>
        }
      >
        <LikesContent tracks={likesDisplay} showControls={false} widthClassName={CARD_WIDTH} />
      </Section>

      {/* Playlists */}
      <Section
        title="Playlists"
        data-test="library-playlists"
        action={
          <FilterDropdown
            value={playlistFilter}
            onChange={setPlaylistFilter}
          />
        }
      >
        {visiblePlaylists.map((item) => (
          <PlaylistCard key={item.id} item={item} widthClassName={CARD_WIDTH} />
        ))}
      </Section>

      {/* Albums */}
      <Section title="Albums" data-test="library-albums">
        {(() => {
          const seen = new Set<string>();
          return [...albums, ...storeLikedAlbums]
            .filter((p) => {
              if (seen.has(p.playlist_id)) return false;
              seen.add(p.playlist_id);
              return true;
            })
            .map((p) => <AlbumCard key={p.playlist_id} playlist={p} widthClassName={CARD_WIDTH} />);
        })()}
      </Section>

      {/* Stations */}
      <Section
        title="Stations"
        data-test="library-stations"
        action={
          <Link
            to="/discover"
            data-test="library-stations-browse"
            className="text-text-secondary text-sm hover:text-white transition-colors"
          >
            Browse trending playlists
          </Link>
        }
      >
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
      <Section title="Following" data-test="library-following">
        {displayedFollowing.map((u) => (
          <UserCard key={u.id} user={u} widthClassName={CARD_WIDTH} />
        ))}
      </Section>
    </div>
  );
}
