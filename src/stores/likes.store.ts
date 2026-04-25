import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track } from "@/types/track";
import type { Station } from "@/types/station";
import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import type { Playlist } from "@/services/api/playlist/playlist.service";
import type { HomeData, DiscoveryAlbum } from "@/services/api/discover.service";
import {
  likeTrack,
  unlikeTrack,
  likePlaylist,
  unlikePlaylist,
  likeAlbum,
  unlikeAlbum,
  likeMix,
  unlikeMix,
  likeGenreTrending,
  unlikeGenreTrending,
  likeStation as likeStationApi,
  unlikeStation as unlikeStationApi,
  getMyLikedTracks,
  getMyLikedPlaylistsApi,
} from "@/services/engagement.service";
import { mapTrackSummaryToTrack } from "@/services/api/discover.mapper";

export interface LikedMix {
  id: string;
  mix_id?: string;
}

export interface LikedGenre {
  id: string;
  genre: string;
  cover_image: string | null;
}

interface LikesStore {
  likedTracks: Track[];
  likedStations: Station[];
  likedPlaylists: PlaylistCardData[];
  likedAlbums: Playlist[];
  likedMixes: LikedMix[];
  likedGenres: LikedGenre[];

  toggleTrack: (track: Track) => void;
  toggleStation: (station: Station) => void;
  togglePlaylist: (playlist: PlaylistCardData) => void;
  toggleAlbum: (album: Playlist) => void;
  toggleMix: (mix: LikedMix) => void;
  toggleGenre: (genre: LikedGenre) => void;

  isTrackLiked: (id: number | string) => boolean;
  isStationLiked: (id: string) => boolean;
  isPlaylistLiked: (id: string) => boolean;
  isAlbumLiked: (id: string) => boolean;
  isMixLiked: (id: string) => boolean;
  isGenreLiked: (id: string) => boolean;

  seedFromHomeData: (data: HomeData) => void;
  seedAlbums: (albums: DiscoveryAlbum[]) => void;
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
      likedGenres: [],

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

      toggleStation: (station) => {
        const isLiked = get().likedStations.some((st) => st.id === station.id);
        set((s) => ({
          likedStations: isLiked
            ? s.likedStations.filter((st) => st.id !== station.id)
            : [station, ...s.likedStations],
        }));
        const artistId = station.seedArtist.id;
        const call = isLiked ? unlikeStationApi(artistId) : likeStationApi(artistId);
        call.catch(() => {
          set((s) => ({
            likedStations: isLiked
              ? [station, ...s.likedStations]
              : s.likedStations.filter((st) => st.id !== station.id),
          }));
        });
      },

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
        const mixId = mix.mix_id ?? mix.id;
        const isLiked = get().likedMixes.some((m) => (m.mix_id ?? m.id) === mixId);
        set((s) => ({
          likedMixes: isLiked
            ? s.likedMixes.filter((m) => (m.mix_id ?? m.id) !== mixId)
            : [mix, ...s.likedMixes],
        }));
        const call = isLiked ? unlikeMix(mixId) : likeMix(mixId);
        call.catch(() => {
          set((s) => ({
            likedMixes: isLiked
              ? [mix, ...s.likedMixes]
              : s.likedMixes.filter((m) => (m.mix_id ?? m.id) !== mixId),
          }));
        });
      },

      toggleGenre: (genre) => {
        const isLiked = get().likedGenres.some((g) => g.id === genre.id);
        set((s) => ({
          likedGenres: isLiked
            ? s.likedGenres.filter((g) => g.id !== genre.id)
            : [genre, ...s.likedGenres],
        }));
        const call = isLiked
          ? unlikeGenreTrending(genre.id)
          : likeGenreTrending(genre.id);
        call.catch(() => {
          set((s) => ({
            likedGenres: isLiked
              ? [genre, ...s.likedGenres]
              : s.likedGenres.filter((g) => g.id !== genre.id),
          }));
        });
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
        !!id && get().likedMixes.some((m) => (m.mix_id ?? m.id) === id),
      isGenreLiked: (id) =>
        !!id && get().likedGenres.some((g) => g.id === id),

      seedFromHomeData: (data) => {
        set((s) => {
          // ── Mixes (mixed_for_you + made_for_you daily/weekly) ──────────────
          const existingMixIds = new Set(s.likedMixes.map((m) => m.mix_id ?? m.id));
          const newMixes: LikedMix[] = [
            ...(data.mixed_for_you ?? [])
              .filter((m) => m.is_liked_by_me && !existingMixIds.has(m.mix_id ?? m.id))
              .map((m) => ({ id: m.id, mix_id: m.mix_id })),
            ...[data.made_for_you?.daily_mix, data.made_for_you?.weekly_mix]
              .filter((m): m is NonNullable<typeof m> =>
                !!m && !!m.is_liked_by_me && !existingMixIds.has(m.id),
              )
              .map((m) => ({ id: m.id })),
          ];

          // ── Genres ────────────────────────────────────────────────────────
          const existingGenreIds = new Set(s.likedGenres.map((g) => g.id));
          const newGenres: LikedGenre[] = (data.trending_by_genre?.genres ?? [])
            .filter((g) => g.is_liked && !existingGenreIds.has(g.genre_id))
            .map((g) => ({ id: g.genre_id, genre: g.genre_name, cover_image: null }));

          // ── Stations ──────────────────────────────────────────────────────
          const existingStationIds = new Set(s.likedStations.map((st) => st.id));
          const newStations: Station[] = (data.discover_with_stations ?? [])
            .filter((st) => st.is_saved && !existingStationIds.has(st.id))
            .map((st) => ({
              id: st.id,
              name: st.artist_name,
              seedArtist: { id: st.artist_id, displayName: st.artist_name },
              coverUrl: st.images.center ?? null,
              trackCount: st.track_count,
            }));

          return {
            likedMixes: [...s.likedMixes, ...newMixes],
            likedGenres: [...s.likedGenres, ...newGenres],
            likedStations: [...s.likedStations, ...newStations],
          };
        });
      },

      seedAlbums: (albums) => {
        set((s) => {
          const existingIds = new Set(s.likedAlbums.map((a) => a.playlist_id));
          const newAlbums: Playlist[] = albums
            .filter((a) => a.is_liked_by_me && !existingIds.has(a.id))
            .map((a) => ({
              playlist_id: a.id,
              owner_user_id: a.owner_id,
              name: a.name,
              description: null,
              is_public: true,
              cover_image: a.cover_image,
              subtype: "album" as const,
              track_count: a.track_count,
              like_count: a.like_count,
              created_at: a.created_at ?? "",
            }));
          return { likedAlbums: [...s.likedAlbums, ...newAlbums] };
        });
      },

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
