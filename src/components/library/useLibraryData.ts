import { useState, useEffect } from "react";
import { getRecentlyPlayed } from "@/services/api/discover.service";
import { mapRecentlyPlayedEntry } from "@/services/api/discover.mapper";
import { getMyPlaylists as getMyPlaylistsLib, getMyFollowing } from "@/services/api/library.service";
import { getUserById } from "@/services/user.service";
import {
  getMyPlaylists as getMyPlaylistsApi,
  getLikedPlaylists,
  type Playlist,
} from "@/services/api/playlist/playlist.service";
import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import type { Track } from "@/types/track";
import type { User } from "@/types/user";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";
import { useAuthStore } from "@/stores/auth.store";
import { mapPlaylistToCard, mapAlbumToCard, mapFollowingToUser } from "./library.mappers";
import { mockRecentlyPlayedTracks } from "@/services/mocks/discover";
import type { FilterOption } from "./PlaylistFilterDropdown";

const isAlbum = (p: Playlist) => p.is_album_view || p.subtype === "album";

export function useLibraryData() {
  const [recentlyPlayedApi, setRecentlyPlayedApi] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistCardData[]>([]);
  const [albums, setAlbums] = useState<Playlist[]>([]);
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const [playlistFilter, setPlaylistFilter] = useState<FilterOption>("All");

  const {
    likedTracks = [],
    likedStations = [],
    likedPlaylists = [],
    likedAlbums: storeLikedAlbums = [],
    likedRadioTracks = [],
    likedMixes = [],
    likedGenres = [],
  } = useLikesStore();
  const { user } = useAuthStore();
  const { entries } = useHistoryStore();

  useEffect(() => {
    getRecentlyPlayed()
      .then((items) => setRecentlyPlayedApi(items.map(mapRecentlyPlayedEntry)))
      .catch(() => setRecentlyPlayedApi([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    getMyFollowing()
      .then((items) =>
        Promise.all(
          items.map(async (f) => {
            try {
              const profile = await getUserById(f.id);
              return mapFollowingToUser({ ...f, ...profile, username: profile.username || f.username });
            } catch {
              return mapFollowingToUser(f);
            }
          })
        )
      )
      .then((users) => {
        if (!cancelled) setFollowingUsers(users);
      })
      .catch(() => {
        if (!cancelled) setFollowingUsers([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const displayName = user?.displayName ?? user?.username ?? "";
    getMyPlaylistsLib()
      .then((items) =>
        setPlaylists(
          items.map((p) => mapPlaylistToCard(p as unknown as Playlist, p.owner_user_id === user?.id ? displayName : p.owner_user_id)),
        ),
      )
      .catch(() => setPlaylists([]));
  }, []);

  useEffect(() => {
    Promise.all([
      getMyPlaylistsApi({ limit: 50 }),
      getLikedPlaylists({ limit: 50 }),
    ])
      .then(([created, liked]) => {
        const merged = [
          ...created.data.items.filter(isAlbum),
          ...liked.data.items.filter(isAlbum),
        ];
        const seen = new Set<string>();
        setAlbums(
          merged.filter((p) => {
            if (seen.has(p.playlist_id)) return false;
            seen.add(p.playlist_id);
            return true;
          }),
        );
      })
      .catch(() => setAlbums([]));
  }, []);

  const recentEntries = (() => {
    const list =
      entries.length > 0
        ? entries
        : recentlyPlayedApi.length > 0
          ? recentlyPlayedApi.map((t) => ({ type: "track" as const, item: t, playedAt: "" }))
          : mockRecentlyPlayedTracks.map((t) => ({ type: "track" as const, item: t, playedAt: "" }));

    const seen = new Set<string>();
    return list.filter((e) => {
      const key = `${e.type}-${e.item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  const recentTracks = recentEntries
    .filter((e) => e.type === "track")
    .map((e) => e.item as Track);

  const visiblePlaylists: PlaylistCardData[] = (() => {
    const mixIds = new Set(likedMixes.map((m) => m.mix_id ?? m.id));
    const isExcluded = (id: string) => mixIds.has(id);

    const radioMap = new Map(likedRadioTracks.map((r) => [r.playlistId, r]));

    const enhancePlaylistCard = (p: PlaylistCardData): PlaylistCardData => {
      const r = radioMap.get(p.id);
      if (r) {
        return {
          ...p,
          title: p.title.replace(/\s+Radio$/i, ""),
          hideOwner: true,
        };
      }
      return p;
    };

    const nonAlbumLiked = likedPlaylists.filter((p) => !p.isAlbumView && !isExcluded(p.id)).map(enhancePlaylistCard);
    const nonAlbumCreated = playlists.filter((p) => !p.isAlbumView && !isExcluded(p.id)).map(enhancePlaylistCard);

    const seen = new Set<string>();
    const basePlaylists = [...nonAlbumCreated, ...nonAlbumLiked].filter((p) => {
      if (!p.title || p.title.trim() === "") return false;
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    const radioPlaylists: PlaylistCardData[] = likedRadioTracks
      .map((r) => ({
        id: r.playlistId,
        title: r.title.replace(/\s+Radio$/i, ""),
        owner: user?.id ?? "",
        coverUrl: r.coverImage,
        isPrivate: false,
        isLiked: true,
        hideOwner: true,
      }))
      .filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

    if (playlistFilter === "Created") return nonAlbumCreated;
    if (playlistFilter === "Liked") {
      const likedWithTitles = nonAlbumLiked.filter((p) => p.title && p.title.trim() !== "");
      return [...likedWithTitles, ...radioPlaylists];
    }
    
    return [...basePlaylists, ...radioPlaylists];
  })();

  const displayedAlbums = (() => {
    const displayName = user?.displayName ?? user?.username ?? "";
    const seen = new Set<string>();
    return [...albums, ...storeLikedAlbums]
      .filter((p) => isAlbum(p))
      .filter((p) => {
        if (seen.has(p.playlist_id)) return false;
        seen.add(p.playlist_id);
        return true;
      })
      .map((p) => mapAlbumToCard(p, p.owner_user_id === user?.id ? displayName : p.owner_user_id));
  })();

  const displayedFollowing = followingUsers;

  return {
    recentEntries,
    recentTracks,
    likedTracks,
    likedStations,
    likedRadioTracks,
    likedMixes,
    likedGenres,
    visiblePlaylists,
    displayedAlbums,
    displayedFollowing,
    setFollowingUsers,
    playlistFilter,
    setPlaylistFilter,
    showMixesAndGenres: playlistFilter !== "Created",
  };
}
