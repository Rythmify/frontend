import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Track } from "@/types/track";
import type { Station } from "@/types/station";
import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import type { Playlist } from "@/services/api/playlist/playlist.service";
import type { HomeData, DiscoveryAlbum } from "@/services/api/discover.service";
import { useAuthStore } from "@/stores/auth.store";
import {
  createUserScopedStorage,
  setUserScopedStorageOverride,
} from "@/stores/userScopedStorage";
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
  getMyLikedMixes as getMyLikedMixesApi,
  getMyLikedGenres as getMyLikedGenresApi,
} from "@/services/engagement.service";
import { mapTrackSummaryToTrack } from "@/services/api/discover.mapper";

export interface LikedMix {
  id: string;
  mix_id?: string;
  title?: string;
  cover_image?: string | null;
  link_to?: string;
  kind?: "personal" | "daily" | "weekly";
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

const createEmptyLikesState = () => ({
  likedTracks: [] as Track[],
  likedStations: [] as Station[],
  likedPlaylists: [] as PlaylistCardData[],
  likedAlbums: [] as Playlist[],
  likedMixes: [] as LikedMix[],
  likedGenres: [] as LikedGenre[],
  repostedTrackIds: [] as string[],
  repostedPlaylistIds: [] as string[],
  itemStats: {} as Record<
    string,
    { playCount?: number; likeCount?: number; repostCount?: number; isReposted?: boolean }
  >,
});

export const useLikesStore = create<LikesStore>()(
  persist(
    (set, get) => ({
      ...createEmptyLikesState(),

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
          // ── Build a fresh metadata map from home data ──────────────────────
          const freshMeta = new Map<string, Omit<LikedMix, "id" | "mix_id">>();
          for (const m of data.mixed_for_you ?? []) {
            const key = m.mix_id ?? m.id;
            freshMeta.set(key, {
              title: m.label ?? "",
              cover_image: m.cover_image ?? m.preview_track?.cover_image ?? null,
              link_to: `/discover/sets/${key}`,
              kind: "personal",
            });
          }
          for (const [kind, m] of [
            ["daily", data.made_for_you?.daily_mix],
            ["weekly", data.made_for_you?.weekly_mix],
          ] as const) {
            if (!m) continue;
            freshMeta.set(m.id, {
              title: m.label ?? "",
              cover_image: m.cover_url ?? null,
              link_to: `/discover/sets/new-for-you/${kind}/${m.id}`,
              kind,
            });
          }

          // ── Mixes (mixed_for_you + made_for_you daily/weekly) ──────────────
          // Update existing mixes with enriched metadata
          const updatedMixes = s.likedMixes.map((m) => {
            const meta = freshMeta.get(m.mix_id ?? m.id);
            return meta ? { ...m, ...meta } : m;
          });
          const existingMixIds = new Set(updatedMixes.map((m) => m.mix_id ?? m.id));

          // Add newly liked mixes not yet in the store
          const newMixes: LikedMix[] = [];
          for (const m of data.mixed_for_you ?? []) {
            const key = m.mix_id ?? m.id;
            if (m.is_liked_by_me && !existingMixIds.has(key)) {
              newMixes.push({ id: m.id, mix_id: m.mix_id, ...freshMeta.get(key) });
            }
          }
          for (const [, m] of [
            ["daily", data.made_for_you?.daily_mix],
            ["weekly", data.made_for_you?.weekly_mix],
          ] as const) {
            if (!m || !m.is_liked_by_me || existingMixIds.has(m.id)) continue;
            newMixes.push({ id: m.id, ...freshMeta.get(m.id) });
          }

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
            likedMixes: [...updatedMixes, ...newMixes],
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
          const [tracksRes, playlistsRes, mixesRes, genresRes] = await Promise.allSettled([
            getMyLikedTracks({ limit: 50 }),
            getMyLikedPlaylistsApi({ limit: 50 }),
            getMyLikedMixesApi({ limit: 50 }),
            getMyLikedGenresApi({ limit: 50 }),
          ]);

          if (tracksRes.status === "fulfilled") {
            const fetchedTracks = tracksRes.value.data.map(mapTrackSummaryToTrack);
            set((s) => {
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

          if (mixesRes.status === "fulfilled") {
            const typeToKind = (t: string): LikedMix["kind"] =>
              t === "curated_daily" ? "daily" : t === "curated_weekly" ? "weekly" : "personal";
            const typeToLink = (t: string, id: string) =>
              t === "curated_daily" ? `/discover/sets/new-for-you/daily/${id}`
              : t === "curated_weekly" ? `/discover/sets/new-for-you/weekly/${id}`
              : `/discover/sets/${id}`;
            const fetchedMixes: LikedMix[] = mixesRes.value.items.map((m) => ({
              id: m.playlist_id,
              mix_id: m.playlist_id,
              title: m.title,
              cover_image: m.cover_image,
              kind: typeToKind(m.type),
              link_to: typeToLink(m.type, m.playlist_id),
            }));
            set((s) => {
              const fetchedIds = new Set(fetchedMixes.map(m => m.mix_id ?? m.id));
              const localOnly = s.likedMixes.filter(m => !fetchedIds.has(m.mix_id ?? m.id));
              return { likedMixes: [...localOnly, ...fetchedMixes] };
            });
          }

          if (genresRes.status === "fulfilled") {
            const fetchedGenres: LikedGenre[] = genresRes.value.items.map((g) => ({
              id: g.genre_id,
              genre: g.genre_name,
              cover_image: g.cover_image,
            }));
            set((s) => {
              const fetchedIds = new Set(fetchedGenres.map(g => g.id));
              const localOnly = s.likedGenres.filter(g => !fetchedIds.has(g.id));
              return { likedGenres: [...localOnly, ...fetchedGenres] };
            });
          }
        } catch {
          // silent — keep local state if API fails
        }
      },
    }),
    {
      name: "rythmify-likes",
      storage: createJSONStorage(() => createUserScopedStorage("rythmify-likes")),
      partialize: (state) => ({
        likedTracks: state.likedTracks,
        likedStations: state.likedStations,
        likedPlaylists: state.likedPlaylists,
        likedAlbums: state.likedAlbums,
        likedMixes: state.likedMixes,
        likedGenres: state.likedGenres,
        repostedTrackIds: state.repostedTrackIds,
        repostedPlaylistIds: state.repostedPlaylistIds,
        itemStats: state.itemStats,
      }),
    },
  ),
);

let likesAuthSyncInitialized = false;

function initLikesAuthSync() {
  if (likesAuthSyncInitialized) return;
  likesAuthSyncInitialized = true;

  useAuthStore.subscribe((state, prev) => {
    const nextScope = state.user?.id || state.user?.username || "guest";
    const prevScope = prev.user?.id || prev.user?.username || "guest";

    if (nextScope === prevScope) return;

    setUserScopedStorageOverride(`transient:${nextScope}`);
    useLikesStore.setState(createEmptyLikesState());
    setUserScopedStorageOverride(nextScope);
    void useLikesStore.persist.rehydrate();
  });
}

initLikesAuthSync();
