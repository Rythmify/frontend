import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TrackCard from "@/components/UI/card/Card";
import UserCard from "@/components/UI/UserCard/UserCard";
import LikesContent from "@/components/UI/LikesContent/LikesContent";
import PlaylistCard from "@/components/UI/PlaylistCard/PlaylistCard";
import StationCard from "@/components/UI/StationCard/StationCard";
import MadeForYouCard from "@/components/UI/MadeForYouCard/MadeForYouCard";
import type { MadeForYouItem } from "@/components/UI/MadeForYouCard/MadeForYouCard";
import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import type { PersonalMix } from "@/services/api/discover.service";
import { getRecentlyPlayed } from "@/services/api/discover.service";
import { mapRecentlyPlayedEntry } from "@/services/api/discover.mapper";
import { getMyPlaylists, getMyFollowing } from "@/services/api/library.service";
import type {
  LibraryPlaylist,
  FollowingUser,
} from "@/services/api/library.service";
import { getUserById } from "@/services/user.service";
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
import MixedForYou from "@/components/discover/MixedForYou";
import MixCard from "@/components/UI/MixCard/MixCard";
import GenreCard from "@/components/UI/GenreCard/GenreCard";

// ─── Constants ────────────────────────────────────────────

const TITLE_CLASS = "text-white font-semibold text-base sm:text-[19px] text-left";
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
      <div className="flex items-center justify-between pb-2 sm:pb-4">
        <h2
          className={TITLE_CLASS}
          data-test={dataTest ? `${dataTest}-title` : undefined}
        >
          {title}
        </h2>
        {action}
      </div>
      <div
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-1 scrollbar-hide"
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
    ownerUsername: displayName,
    coverUrl: p.cover_image,
    isPrivate: !p.is_public,
    isLiked: p.like_count > 0,
  };
}

function mapAlbumToCard(
  p: Playlist,
  displayName: string,
): PlaylistCardData {
  return {
    id: p.playlist_id,
    title: p.name,
    owner: displayName,
    ownerUsername: p.owner_user_id,
    coverUrl: p.cover_image ?? null,
    isPrivate: !p.is_public,
    isLiked: p.like_count > 0,
    isAlbumView: true,
  };
}

function mapFollowingToUser(f: FollowingUser): User {
  return {
    id: f.id,
    username: f.username,
    displayName: f.display_name,
    avatar: f.profile_picture ?? undefined,
    followers: f.followers_count ?? 0,
    isVerified: f.is_verified,
  };
}

function mixToCard(mix: PersonalMix): MadeForYouItem {
  const words = (mix.label ?? "").trim().split(/\s+/);
  return {
    id: mix.id,
    title: mix.label ?? "",
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

  const {
    likedTracks,
    likedStations,
    likedPlaylists,
    likedAlbums: storeLikedAlbums,
    likedRadioTracks,
    likedMixes,
    likedGenres,
  } = useLikesStore();
  const { user } = useAuthStore();
  const { entries } = useHistoryStore();

  useEffect(() => {
    getRecentlyPlayed()
      .then((items) => setRecentlyPlayedApi(items.map(mapRecentlyPlayedEntry)))
      .catch(() => setRecentlyPlayedApi([]));
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
      .then((items) =>
        Promise.all(
          items.map((f) =>
            getUserById(f.id)
              .then((profile) => mapFollowingToUser({ ...f, followers_count: profile.followers_count }))
              .catch(() => mapFollowingToUser(f)),
          ),
        ),
      )
      .then(setFollowingUsers)
      .catch(() => setFollowingUsers([]));
  }, []);

  useEffect(() => {
    Promise.all([
      getMyPlaylistsApi({ limit: 50 }),
      getLikedPlaylists({ limit: 50 }),
    ])
      .then(([created, liked]) => {
        const createdAlbums = created.data.items.filter(
          (p) => p.is_album_view || p.subtype === "album",
        );
        const likedAlbums = liked.data.items.filter(
          (p) => p.is_album_view || p.subtype === "album",
        );
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

  // History entries (all types) take priority; fall back to API tracks only
  const recentEntries = (() => {
    const list =
      entries.length > 0
        ? entries
        : recentlyPlayedApi.map((t) => ({ type: "track" as const, item: t, playedAt: "" }));

    const seen = new Set<string>();
    return list.filter((e) => {
      const key = `${e.type}-${e.item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

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

  const showMixesAndGenres = playlistFilter !== "Created";

  const displayedFollowing = (() => {
    // API result is authoritative; show all of them
    const seenUsernames = new Set(followingUsers.map((u) => u.username));

    // Supplement with any following_ids entries not yet returned by the API (optimistic)
    const synthetic: User[] = (user?.following_ids ?? [])
      .filter((username) => !seenUsernames.has(username))
      .map((username, i) => ({
        id: String(-(i + 1)),
        username,
        displayName: username,
        followers: 0,
      }));

    return [...followingUsers, ...synthetic];
  })();

  const recentTracks = recentEntries
    .filter((e) => e.type === "track")
    .map((e) => e.item as Track);

  return (
    <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
      {/* Recently Played */}
      <Section title="Recently played" data-test="library-recently-played">
        {recentEntries.map((entry, i) => {
          if (entry.type === "track")
            return (
              <TrackCard
                key={`track-${entry.item.id}`}
                track={entry.item}
                widthClassName={CARD_WIDTH}
                contextQueue={recentTracks}
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
              <MixCard
                key={`mix-${entry.item.id}`}
                mix={entry.item}
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
        <LikesContent
          tracks={likesDisplay}
          showControls={false}
          widthClassName={CARD_WIDTH}
        />
      </Section>

      {likedRadioTracks.length > 0 && (
        <Section title="More of what you like" data-test="library-radio">
          {likedRadioTracks.map((item) => (
            <TrackCard
              key={item.playlistId}
              track={item.track}
              widthClassName={CARD_WIDTH}
              radioLikeMode
              radioPlaylistId={item.playlistId}
            />
          ))}
        </Section>
      )}

      {/* Playlists */}
      <Section
        title="Playlists"
        data-test="library-playlists"
        action={
          <FilterDropdown value={playlistFilter} onChange={setPlaylistFilter} />
        }
      >
        {visiblePlaylists.map((item) => (
          <PlaylistCard key={item.id} item={item} widthClassName={CARD_WIDTH} />
        ))}

        {showMixesAndGenres && likedMixes.map((mix, mixIndex) => {
          const mixId = mix.mix_id ?? mix.id;
          if (mix.kind === "daily" || mix.kind === "weekly") {
            return (
              <MadeForYouCard
                key={mixId}
                item={{
                  id: mix.id,
                  title: mix.title || (mix.kind === "daily" ? "Daily Drops" : "Weekly Wave"),
                  subtitle: mix.kind === "daily" ? "Daily mix" : "Weekly mix",
                  coverUrl: mix.cover_image ?? "",
                  madeKind: mix.kind,
                  badgeWords: mix.kind === "daily" ? ["DAILY", "DROPS"] : ["WEEKLY", "WAVE"],
                  badgeBg: mix.kind === "daily" ? "#1a237e" : "#1b5e20",
                }}
                widthClassName={CARD_WIDTH}
              />
            );
          }
          return (
            <MixCard
              key={mixId}
              mix={{
                id: mix.id,
                mix_id: mix.mix_id,
                label: mix.title || `Mix ${mixIndex + 1}`,
                flavor: "listening_history",
                genre_name: null,
                cover_image: mix.cover_image ?? null,
                track_count: 0,
                generated_at: "",
                preview_track: null as any,
                is_liked_by_me: true,
              }}
              widthClassName={CARD_WIDTH}
            />
          );
        })}

        {showMixesAndGenres && likedGenres.map((genre, i) => (
          <GenreCard
            key={genre.id}
            item={{
              id: genre.id,
              genre: genre.genre,
              cover_image: genre.cover_image,
              track_count: 0,
            }}
            index={i}
            widthClassName={CARD_WIDTH}
          />
        ))}
      </Section>

      {/* Albums */}
      <Section title="Albums" data-test="library-albums">
        {(() => {
          const seen = new Set<string>();
          return [...albums, ...storeLikedAlbums]
            .filter((p) => p.is_album_view || p.subtype === "album")
            .filter((p) => {
              if (seen.has(p.playlist_id)) return false;
              seen.add(p.playlist_id);
              return true;
            })
            .map((p) => (
              <PlaylistCard
                key={p.playlist_id}
                item={mapAlbumToCard(p, user?.displayName ?? user?.username ?? p.owner_user_id)}
                widthClassName={CARD_WIDTH}
              />
            ));
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
          <UserCard
            key={u.id}
            user={u}
            widthClassName={CARD_WIDTH}
            initialIsFollowing={true}
            onUnfollow={() => setFollowingUsers((prev) => prev.filter((f) => f.id !== u.id))}
          />
        ))}
      </Section>
    </div>
  );
}
