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
  likedMixes: LikedMix[];
  likedGenres: LikedGenre[];
  repostedTrackIds: string[];
  repostedPlaylistIds: string[];
  itemStats: Record<string, { playCount?: number; likeCount?: number; repostCount?: number; isReposted?: boolean }>;

  toggleTrack: (track: Track) => Promise<void>;
  toggleRepost: (track: Track) => Promise<void>;
  togglePlaylistRepost: (playlistId: string, initialStats?: Partial<{ likeCount: number; repostCount: number }>) => Promise<void>;
  incrementPlayCount: (trackId: string) => void;
  updateItemStats: (id: string, stats: Partial<{ playCount: number; likeCount: number; repostCount: number; isReposted: boolean }>) => void;
  
  toggleStation: (station: Station) => Promise<void>;
  togglePlaylist: (playlist: PlaylistCardData) => Promise<void>;
  toggleAlbum: (album: Playlist) => Promise<void>;
  toggleMix: (mix: LikedMix) => Promise<void>;
  toggleGenre: (genre: LikedGenre) => Promise<void>;

  isTrackLiked: (id: number | string) => boolean;
  isTrackReposted: (id: number | string) => boolean;
  isPlaylistReposted: (id: string) => boolean;
  getItemStats: (id: number | string) => { playCount?: number; likeCount?: number; repostCount?: number; isReposted?: boolean };
  
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
      repostedTrackIds: [],
      repostedPlaylistIds: [],
      itemStats: {},

      toggleTrack: (track) => {
        const isLiked = get().likedTracks.some(
          (t) => String(t.id) === String(track.id),
        );
        const trackId = String(track.id);
        
        set((s) => {
          const nextLiked = isLiked
            ? s.likedTracks.filter((t) => String(t.id) !== trackId)
            : [track, ...s.likedTracks];
          
          const currentStats = s.itemStats[trackId] || {};
          const nextLikeCount = (currentStats.likeCount ?? track.likeCount ?? 0) + (isLiked ? -1 : 1);
          
          return {
            likedTracks: nextLiked,
            itemStats: {
              ...s.itemStats,
              [trackId]: { ...currentStats, likeCount: Math.max(0, nextLikeCount) }
            }
          };
        });

        const call = isLiked ? unlikeTrack(track.id) : likeTrack(track.id);
        return call.catch((err) => {
          const status = err?.response?.status;
          if (isLiked && status === 404) return;
          if (!isLiked && status === 409) return;
          // Rollback
          set((s) => ({
            likedTracks: isLiked
              ? [track, ...s.likedTracks]
              : s.likedTracks.filter((t) => String(t.id) !== trackId),
          }));
          throw err;
        });
      },

      toggleRepost: async (track) => {
        const trackId = String(track.id);
        const isReposted = get().repostedTrackIds.includes(trackId);
        
        set((s) => {
          const nextIds = isReposted 
            ? s.repostedTrackIds.filter(id => id !== trackId)
            : [...s.repostedTrackIds, trackId];
          
          const currentStats = s.itemStats[trackId] || {};
          const nextRepostCount = (currentStats.repostCount ?? track.repostCount ?? 0) + (isReposted ? -1 : 1);

          return {
            repostedTrackIds: nextIds,
            itemStats: {
              ...s.itemStats,
              [trackId]: { 
                ...currentStats, 
                repostCount: Math.max(0, nextRepostCount),
                isReposted: !isReposted 
              }
            }
          };
        });

        try {
          const { repostTrack, removeRepost } = await import("@/services/engagement.service");
          if (isReposted) await removeRepost(track.id);
          else await repostTrack(track.id);
        } catch (err) {
          // Rollback
          set((s) => ({
            repostedTrackIds: isReposted 
              ? [...s.repostedTrackIds, trackId]
              : s.repostedTrackIds.filter(id => id !== trackId)
          }));
          throw err;
        }
      },

      togglePlaylistRepost: async (playlistId, initialStats) => {
        const id = String(playlistId);
        const isReposted = get().repostedPlaylistIds.includes(id);

        set((s) => {
          const nextIds = isReposted
            ? s.repostedPlaylistIds.filter((rid) => rid !== id)
            : [...s.repostedPlaylistIds, id];
          
          const currentStats = s.itemStats[id] || {};
          const nextRepostCount = (currentStats.repostCount ?? initialStats?.repostCount ?? 0) + (isReposted ? -1 : 1);

          return { 
            repostedPlaylistIds: nextIds,
            itemStats: {
              ...s.itemStats,
              [id]: {
                ...currentStats,
                repostCount: Math.max(0, nextRepostCount),
                isReposted: !isReposted
              }
            }
          };
        });

        try {
          const { repostPlaylist, removePlaylistRepost } = await import("@/services/engagement.service");
          if (isReposted) await removePlaylistRepost(playlistId);
          else await repostPlaylist(playlistId);
        } catch (err) {
          // Rollback
          set((s) => ({
            repostedPlaylistIds: isReposted
              ? [...s.repostedPlaylistIds, id]
              : s.repostedPlaylistIds.filter((rid) => rid !== id),
          }));
          throw err;
        }
      },

      incrementPlayCount: (trackId) => {
        const id = String(trackId);
        set((s) => {
          const currentStats = s.itemStats[id] || {};
          return {
            itemStats: {
              ...s.itemStats,
              [id]: { 
                ...currentStats, 
                playCount: (currentStats.playCount ?? 0) + 1 
              }
            }
          };
        });
      },

      updateItemStats: (id, stats) => {
        const sid = String(id);
        set((s) => ({
          itemStats: {
            ...s.itemStats,
            [sid]: { ...(s.itemStats[sid] || {}), ...stats }
          }
        }));
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
        return call.catch((err) => {
          set((s) => ({
            likedStations: isLiked
              ? [station, ...s.likedStations]
              : s.likedStations.filter((st) => st.id !== station.id),
          }));
          throw err;
        });
      },

      togglePlaylist: (playlist) => {
        const isLiked = get().likedPlaylists.some((p) => p.id === playlist.id);
        const id = String(playlist.id);

        set((s) => {
          const nextLiked = isLiked
            ? s.likedPlaylists.filter((p) => p.id !== playlist.id)
            : [playlist, ...s.likedPlaylists];
          
          const currentStats = s.itemStats[id] || {};
          const nextLikeCount = (currentStats.likeCount ?? 0) + (isLiked ? -1 : 1);

          return {
            likedPlaylists: nextLiked,
            itemStats: {
              ...s.itemStats,
              [id]: { ...currentStats, likeCount: Math.max(0, nextLikeCount) }
            }
          };
        });

        const call = isLiked
          ? unlikePlaylist(playlist.id)
          : likePlaylist(playlist.id);
        return call.catch((err) => {
          set((s) => ({
            likedPlaylists: isLiked
              ? [playlist, ...s.likedPlaylists]
              : s.likedPlaylists.filter((p) => p.id !== playlist.id),
          }));
          throw err;
        });
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
        return call.catch((err) => {
          set((s) => ({
            likedMixes: isLiked
              ? [mix, ...s.likedMixes]
              : s.likedMixes.filter((m) => (m.mix_id ?? m.id) !== mixId),
          }));
          throw err;
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
        return call.catch((err) => {
          set((s) => ({
            likedGenres: isLiked
              ? [genre, ...s.likedGenres]
              : s.likedGenres.filter((g) => g.id !== genre.id),
          }));
          throw err;
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
        return call.catch((err) => {
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
          throw err;
        });
      },

      isTrackLiked: (id) =>
        get().likedTracks.some((t) => String(t.id) === String(id)),
      isTrackReposted: (id) =>
        get().repostedTrackIds.includes(String(id)) || !!get().itemStats[String(id)]?.isReposted,
      isPlaylistReposted: (id) =>
        get().repostedPlaylistIds.includes(String(id)) || !!get().itemStats[String(id)]?.isReposted,
      getItemStats: (id) =>
        get().itemStats[String(id)] || {},

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
            const fetchedTracks = tracksRes.value.data.map(mapTrackSummaryToTrack);
            set((s) => {
              // Merge local tracks that aren't in the API response yet
              const fetchedIds = new Set(fetchedTracks.map(t => String(t.id)));
              const localOnly = s.likedTracks.filter(t => !fetchedIds.has(String(t.id)));
              return { likedTracks: [...localOnly, ...fetchedTracks] };
            });
          }

          if (playlistsRes.status === "fulfilled") {
            const fetchedPlaylists = playlistsRes.value.data.map((p) => ({
              id: p.playlist_id,
              title: p.name,
              owner: p.owner_user_id,
              coverUrl: p.cover_image ?? null,
              isPrivate: !p.is_public,
              isLiked: true,
            }));
            set((s) => {
              const fetchedIds = new Set(fetchedPlaylists.map(p => String(p.id)));
              const localOnly = s.likedPlaylists.filter(p => !fetchedIds.has(String(p.id)));
              return { likedPlaylists: [...localOnly, ...fetchedPlaylists] };
            });
          }
        } catch {
          // silent — keep local state if API fails
        }
      },
    }),
    { name: "rythmify-likes" },
  ),
);
