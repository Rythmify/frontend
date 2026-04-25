import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track } from "@/types/track";
import type { Station } from "@/types/station";
import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import type { Playlist } from "@/services/api/playlist/playlist.service";
import type { PersonalMix } from "@/services/api/discover.service";
import {
  likeTrack,
  unlikeTrack,
  likePlaylist,
  unlikePlaylist,
  likeAlbum,
  unlikeAlbum,
  getMyLikedTracks,
  getMyLikedPlaylistsApi,
} from "@/services/engagement.service";
import { mapTrackSummaryToTrack } from "@/services/api/discover.mapper";

interface LikesStore {
  likedTracks: Track[];
  likedStations: Station[];
  likedPlaylists: PlaylistCardData[];
  likedAlbums: Playlist[];
  likedMixes: PersonalMix[];

  toggleTrack: (track: Track) => void;
  toggleStation: (station: Station) => void;
  togglePlaylist: (playlist: PlaylistCardData) => void;
  toggleAlbum: (album: Playlist) => void;
  toggleMix: (mix: PersonalMix) => void;

  isTrackLiked: (id: number | string) => boolean;
  isStationLiked: (id: string) => boolean;
  isPlaylistLiked: (id: string) => boolean;
  isAlbumLiked: (id: string) => boolean;
  isMixLiked: (id: string) => boolean;

  hydrateFromApi: () => Promise<void>;
}

export const useLikesStore = create<LikesStore>()(
  persist(
    (set, get) => ({
      likedTracks: [],
      likedStations: [],
      likedPlaylists: [],
      likedAlbums: [],
      likedMixes: [],

      toggleTrack: (track) => {
        const isLiked = get().likedTracks.some(
          (t) => String(t.id) === String(track.id),
        );
        set((s) => ({
          likedTracks: isLiked
            ? s.likedTracks.filter((t) => String(t.id) !== String(track.id))
            : [track, ...s.likedTracks],
        }));
        const call = isLiked ? unlikeTrack(track.id) : likeTrack(track.id);
        call.catch((err) => {
          const status = err?.response?.status;
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

      togglePlaylist: (playlist) => {
        const isLiked = get().likedPlaylists.some((p) => p.id === playlist.id);
        set((s) => ({
          likedPlaylists: isLiked
            ? s.likedPlaylists.filter((p) => p.id !== playlist.id)
            : [playlist, ...s.likedPlaylists],
        }));
        const call = isLiked
          ? unlikePlaylist(playlist.id)
          : likePlaylist(playlist.id);
        call.catch(() => {});
      },

      toggleMix: (mix) => {
        const mixId: string = (mix as any).mix_id ?? mix.id;
        set((s) => ({
          likedMixes: s.likedMixes.some(
            (m) => ((m as any).mix_id ?? m.id) === mixId,
          )
            ? s.likedMixes.filter(
                (m) => ((m as any).mix_id ?? m.id) !== mixId,
              )
            : [mix, ...s.likedMixes],
        }));
      },

      toggleAlbum: (album) => {
        const isLiked = get().likedAlbums.some(
          (a) => a.playlist_id === album.playlist_id,
        );
        set((s) => ({
          likedAlbums: isLiked
            ? s.likedAlbums.filter((a) => a.playlist_id !== album.playlist_id)
            : [album, ...s.likedAlbums],
        }));
        const call = isLiked
          ? unlikeAlbum(album.playlist_id)
          : likeAlbum(album.playlist_id);
        call.catch((err) => {
          const status = err?.response?.status;
          if (isLiked && status === 404) return;
          if (!isLiked && status === 409) return;
          set((s) => ({
            likedAlbums: isLiked
              ? [album, ...s.likedAlbums]
              : s.likedAlbums.filter(
                  (a) => a.playlist_id !== album.playlist_id,
                ),
          }));
        });
      },

      isTrackLiked: (id) =>
        get().likedTracks.some((t) => String(t.id) === String(id)),
      isStationLiked: (id) => get().likedStations.some((s) => s.id === id),
      isPlaylistLiked: (id) =>
        !!id && get().likedPlaylists.some((p) => p.id === id),
      isAlbumLiked: (id) =>
        get().likedAlbums.some((a) => a.playlist_id === id),
      isMixLiked: (id) =>
        !!id && get().likedMixes.some((m) => ((m as any).mix_id ?? m.id) === id),

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
