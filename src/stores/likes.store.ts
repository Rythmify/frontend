import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track } from "@/types/track";
import type { Station } from "@/types/station";
import type { PersonalMix } from "@/services/api/discover.service";
import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import type { Playlist } from "@/services/api/playlist/playlist.service";

interface LikesStore {
  likedTracks: Track[];
  likedStations: Station[];
  likedMixes: PersonalMix[];
  likedPlaylists: PlaylistCardData[];
  likedAlbums: Playlist[];

  toggleTrack: (track: Track) => void;
  toggleStation: (station: Station) => void;
  toggleMix: (mix: PersonalMix) => void;
  togglePlaylist: (playlist: PlaylistCardData) => void;
  toggleAlbum: (album: Playlist) => void;

  isTrackLiked: (id: number | string) => boolean;
  isStationLiked: (id: string) => boolean;
  isMixLiked: (id: string) => boolean;
  isPlaylistLiked: (id: string) => boolean;
  isAlbumLiked: (id: string) => boolean;
}

export const useLikesStore = create<LikesStore>()(
  persist(
    (set, get) => ({
      likedTracks: [],
      likedStations: [],
      likedMixes: [],
      likedPlaylists: [],
      likedAlbums: [],

      toggleTrack: (track) =>
        set((s) => ({
          likedTracks: s.likedTracks.some((t) => t.id === track.id)
            ? s.likedTracks.filter((t) => t.id !== track.id)
            : [track, ...s.likedTracks],
        })),

      toggleStation: (station) =>
        set((s) => ({
          likedStations: s.likedStations.some((st) => st.id === station.id)
            ? s.likedStations.filter((st) => st.id !== station.id)
            : [station, ...s.likedStations],
        })),

      toggleMix: (mix) =>
        set((s) => ({
          likedMixes: s.likedMixes.some((m) => m.id === mix.id)
            ? s.likedMixes.filter((m) => m.id !== mix.id)
            : [mix, ...s.likedMixes],
        })),

      togglePlaylist: (playlist) =>
        set((s) => ({
          likedPlaylists: s.likedPlaylists.some((p) => p.id === playlist.id)
            ? s.likedPlaylists.filter((p) => p.id !== playlist.id)
            : [playlist, ...s.likedPlaylists],
        })),

      toggleAlbum: (album) =>
        set((s) => ({
          likedAlbums: s.likedAlbums.some((a) => a.playlist_id === album.playlist_id)
            ? s.likedAlbums.filter((a) => a.playlist_id !== album.playlist_id)
            : [album, ...s.likedAlbums],
        })),

      isTrackLiked: (id) => get().likedTracks.some((t) => t.id === id),
      isStationLiked: (id) => get().likedStations.some((s) => s.id === id),
      isMixLiked: (id) => get().likedMixes.some((m) => m.id === id),
      isPlaylistLiked: (id) => get().likedPlaylists.some((p) => p.id === id),
      isAlbumLiked: (id) => get().likedAlbums.some((a) => a.playlist_id === id),
    }),
    { name: "rythmify-likes" },
  ),
);
