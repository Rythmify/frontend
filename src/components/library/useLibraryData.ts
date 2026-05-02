import { useState, useEffect } from "react";
import { getRecentlyPlayed } from "@/services/api/discover.service";
import { mapRecentlyPlayedEntry } from "@/services/api/discover.mapper";
import { getMyFollowing } from "@/services/api/library.service";
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
import type { FilterOption } from "./PlaylistFilterDropdown";

const isAlbum = (p: Playlist) => p.is_album_view || p.subtype === "album";

export function useLibraryData() {
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
    const displayName = user?.displayName ?? user?.username ?? "";

    Promise.all([
      getMyPlaylistsApi({ limit: 50 }),
      getLikedPlaylists({ limit: 50 }),
    ])
      .then(([created, liked]) => {
        setPlaylists(
          created.data.items
            .filter((p) => !isAlbum(p))
            .map((p) => mapPlaylistToCard(p, displayName || p.owner_user_id)),
        );

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
      .catch(() => {
        setPlaylists([]);
        setAlbums([]);
      });
  }, []);

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

  const recentTracks = recentEntries
    .filter((e) => e.type === "track")
    .map((e) => e.item as Track);

  const visiblePlaylists: PlaylistCardData[] = (() => {
    const nonAlbumLiked = likedPlaylists.filter((p) => !p.isAlbumView);
    if (playlistFilter === "Created") return playlists;
    if (playlistFilter === "Liked") return nonAlbumLiked;
    const seen = new Set<string>();
    return [...playlists, ...nonAlbumLiked].filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
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
      .map((p) => mapAlbumToCard(p, displayName || p.owner_user_id));
  })();

  const displayedFollowing = (() => {
    const seenUsernames = new Set(followingUsers.map((u) => u.username));
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
