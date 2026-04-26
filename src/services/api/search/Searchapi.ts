// ─────────────────────────────────────────────────────────────────────────────
// searchAPI.ts  –  Rythmify Search & Suggestions
// ─────────────────────────────────────────────────────────────────────────────
import axiosInstance from '../axiosInstance';

// ─── Literal union types ──────────────────────────────────────────────────────

export type SearchType = 'tracks' | 'playlists' | 'albums' | 'users';

export type SortOrder = 'relevance' | 'newest' | 'plays';

export type TimeRange =
  | 'past_hour'
  | 'past_day'
  | 'past_week'
  | 'past_month'
  | 'past_year';

/**
 * short  → < 2 min
 * medium → 2 – 10 min
 * long   → 10 – 30 min
 * extra  → > 30 min
 */
export type Duration = 'short' | 'medium' | 'long' | 'extra';

// ─── Request param types ──────────────────────────────────────────────────────

interface BaseSearchParams {
  q: string;
  sort?: SortOrder;
  limit?: number;
  offset?: number;
}

interface TracksSearchParams extends BaseSearchParams {
  type: 'tracks';
  tag?: string;
  time_range?: TimeRange;
  duration?: Duration;
}

interface PlaylistsSearchParams extends BaseSearchParams {
  type: 'playlists';
  tag?: string;
}

interface AlbumsSearchParams extends BaseSearchParams {
  type: 'albums';
  tag?: string;
}

interface UsersSearchParams extends BaseSearchParams {
  type: 'users';
  location?: string;
}

interface EverythingSearchParams extends BaseSearchParams {
  type?: never;
  sort?: 'relevance' | 'newest';
}

export type SearchParams =
  | EverythingSearchParams
  | TracksSearchParams
  | PlaylistsSearchParams
  | AlbumsSearchParams
  | UsersSearchParams;

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface Pagination {
  limit: number;
  offset: number;
  total: number;
}

export interface Track {
  id: string;
  title: string;
  duration: number;
  coverUrl: string | null;
  tags: string[];
  uploadedAt: string;
  artist: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  album: {
    id: string;
    title: string;
  } | null;
}

export interface Playlist {
  id: string;
  title: string;
  coverUrl: string | null;
  tags: string[];
  owner: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface Album {
  id: string;
  title: string;
  coverUrl: string | null;
  tags: string[];
  artist: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  location: string | null;
  followersCount: number;
}

export interface TrackFilters {
  available: {
    tags: string[];
    time_ranges: TimeRange[];
    durations: Duration[];
  };
  active: {
    tag: string | null;
    time_range: TimeRange | null;
    duration: Duration | null;
  };
}

export interface TagFilters {
  available: {
    tags: string[];
  };
  active: {
    tag: string | null;
  };
}

export interface UserFilters {
  available: {
    locations: string[];
  };
  active: {
    location: string | null;
  };
}

export interface EverythingSearchResponse {
  tracks: Track[];
  playlists: Playlist[];
  albums: Album[];
  users: User[];
  pagination: Pagination;
  filters: null;
}

export interface TracksSearchResponse {
  tracks: Track[];
  pagination: Pagination;
  filters: TrackFilters;
}

export interface PlaylistsSearchResponse {
  playlists: Playlist[];
  pagination: Pagination;
  filters: TagFilters;
}

export interface AlbumsSearchResponse {
  albums: Album[];
  pagination: Pagination;
  filters: TagFilters;
}

export interface UsersSearchResponse {
  users: User[];
  pagination: Pagination;
  filters: UserFilters;
}

export type SearchResponse<T extends SearchParams> =
  T extends EverythingSearchParams
    ? EverythingSearchResponse
    : T extends TracksSearchParams
    ? TracksSearchResponse
    : T extends PlaylistsSearchParams
    ? PlaylistsSearchResponse
    : T extends AlbumsSearchParams
    ? AlbumsSearchResponse
    : T extends UsersSearchParams
    ? UsersSearchResponse
    : never;

// ─── Helper ───────────────────────────────────────────────────────────────────

function cleanParams(
  obj: Record<string, string | number | undefined>,
): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== ''),
  ) as Record<string, string | number>;
}

// ─── Core search function ─────────────────────────────────────────────────────
//
// Backend response envelope:
// {
//   data:       { tracks, users, playlists, albums },  ← resource arrays
//   pagination: { limit, offset, total },              ← TOP LEVEL
//   filters:    { available, active } | null,          ← TOP LEVEL
// }
//
// We merge data.data (the arrays) with the top-level pagination + filters
// so every SearchResponse has a flat { tracks/playlists/..., pagination, filters }.

export async function search<T extends SearchParams>(
  params: T,
  signal?: AbortSignal,
): Promise<SearchResponse<T>> {
  const { data } = await axiosInstance.get<{
    data: Record<string, any>;
    pagination: Pagination;
    filters: any;
  }>('/search', {
    params: cleanParams({
      q:          params.q,
      type:       'type' in params ? params.type : undefined,
      sort:       params.sort,
      tag:        'tag' in params ? params.tag : undefined,
      location:   'location' in params ? params.location : undefined,
      time_range: 'time_range' in params ? params.time_range : undefined,
      duration:   'duration' in params ? params.duration : undefined,
      limit:      params.limit,
      offset:     params.offset,
    }),
    signal,
  });

  // Flatten: spread the resource arrays + attach top-level pagination & filters
  return {
    ...data.data,
    pagination: data.pagination,
    filters: data.filters,
  } as SearchResponse<T>;
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

export const searchEverything = (
  params: EverythingSearchParams,
  signal?: AbortSignal,
) => search(params, signal);

export const searchTracks = (
  params: Omit<TracksSearchParams, 'type'>,
  signal?: AbortSignal,
) => search({ ...params, type: 'tracks' }, signal);

export const searchPlaylists = (
  params: Omit<PlaylistsSearchParams, 'type'>,
  signal?: AbortSignal,
) => search({ ...params, type: 'playlists' }, signal);

export const searchAlbums = (
  params: Omit<AlbumsSearchParams, 'type'>,
  signal?: AbortSignal,
) => search({ ...params, type: 'albums' }, signal);

export const searchUsers = (
  params: Omit<UsersSearchParams, 'type'>,
  signal?: AbortSignal,
) => search({ ...params, type: 'users' }, signal);

// ─── Suggestions ──────────────────────────────────────────────────────────────

export interface SuggestionUser {
  id: string;
  display_name: string;
  username: string;
  profile_picture: string | null;
  is_following: boolean;
}

export interface SuggestionsResponse {
  users: SuggestionUser[];
  suggestions: string[];
}

export async function getSuggestions(
  q: string,
  signal?: AbortSignal,
): Promise<SuggestionsResponse> {
  const { data } = await axiosInstance.get<{ data: SuggestionsResponse }>(
    '/suggestions',
    { params: { q }, signal },
  );
  return data.data;
}