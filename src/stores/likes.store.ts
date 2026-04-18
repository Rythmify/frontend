import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track } from "@/types/track";
import type { Station } from "@/types/station";
import type { PersonalMix } from "@/services/api/discover.service";
import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import type { Playlist } from "@/services/api/playlist/playlist.service";
import {
  likeTrack,
  unlikeTrack,
  likePlaylist,
  unlikePlaylist,
  getMyLikedTracks,
  getMyLikedPlaylistsApi,
} from "@/services/engagement.service";
import { mapTrackSummaryToTrack } from "@/services/api/discover.mapper";

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

  hydrateFromApi: () => Promise<void>;
}

export const useLikesStore = create<LikesStore>()(
  persist(
    (set, get) => ({
      likedTracks: [],
      likedStations: [],
      likedMixes: [],
      likedPlaylists: [],
      likedAlbums: [],

      toggleTrack: (track) => {
        const isLiked = get().likedTracks.some(
          (t) => String(t.id) === String(track.id),
        );
        // Optimistic update
        set((s) => ({
          likedTracks: isLiked
            ? s.likedTracks.filter((t) => String(t.id) !== String(track.id))
            : [track, ...s.likedTracks],
        }));
        // API call with revert on failure
        const call = isLiked ? unlikeTrack(track.id) : likeTrack(track.id);
        call.catch((err) => {
          const status = err?.response?.status;
          // 404 on unlike = wasn't liked on server anyway — local removal is correct
          // 409 on like = already liked on server — local addition is correct
          if (isLiked && status === 404) return;
          if (!isLiked && status === 409) return;
          set((s) => ({
            likedTracks: isLiked
              ? [track, ...s.likedTracks]
              : s.likedTracks.filter((t) => String(t.id) !== String(track.id)),
          }));
        });
      },

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

      togglePlaylist: (playlist) => {
        const isLiked = get().likedPlaylists.some((p) => p.id === playlist.id);
        // Optimistic update
        set((s) => ({
          likedPlaylists: isLiked
            ? s.likedPlaylists.filter((p) => p.id !== playlist.id)
            : [playlist, ...s.likedPlaylists],
        }));
        // API call with revert on failure
        const call = isLiked
          ? unlikePlaylist(playlist.id)
          : likePlaylist(playlist.id);
        call.catch((err) => {
          const status = err?.response?.status;
          if (isLiked && status === 404) return;
          if (!isLiked && status === 409) return;
          set((s) => ({
            likedPlaylists: isLiked
              ? [playlist, ...s.likedPlaylists]
              : s.likedPlaylists.filter((p) => p.id !== playlist.id),
          }));
        });
      },

      toggleAlbum: (album) =>
        set((s) => ({
          likedAlbums: s.likedAlbums.some(
            (a) => a.playlist_id === album.playlist_id,
          )
            ? s.likedAlbums.filter((a) => a.playlist_id !== album.playlist_id)
            : [album, ...s.likedAlbums],
        })),

      isTrackLiked: (id) =>
        get().likedTracks.some((t) => String(t.id) === String(id)),
      isStationLiked: (id) => get().likedStations.some((s) => s.id === id),
      isMixLiked: (id) => get().likedMixes.some((m) => m.id === id),
      isPlaylistLiked: (id) => get().likedPlaylists.some((p) => p.id === id),
      isAlbumLiked: (id) =>
        get().likedAlbums.some((a) => a.playlist_id === id),

      hydrateFromApi: async () => {
        try {
          const [tracksRes, playlistsRes] = await Promise.allSettled([
            getMyLikedTracks({ limit: 50 }),
            getMyLikedPlaylistsApi({ limit: 50 }),
          ]);

          if (tracksRes.status === "fulfilled") {
            const tracks = tracksRes.value.data.map(mapTrackSummaryToTrack);
            set({ likedTracks: tracks });
          }

          if (playlistsRes.status === "fulfilled") {
            const playlists = playlistsRes.value.data.map((p) => ({
              id: p.playlist_id,
              title: p.name,
              owner: p.owner_user_id,
              coverUrl: p.cover_image ?? null,
              isPrivate: !p.is_public,
              isLiked: true,
            }));
            set({ likedPlaylists: playlists });
          }
        } catch {
          // silent — keep local state if API fails
        }
      },
    }),
    { name: "rythmify-likes" },
  ),
);
