// ─────────────────────────────────────────────────────────────────────────────
// searchAPI.ts  –  Rythmify Search & Suggestions
// ─────────────────────────────────────────────────────────────────────────────
import axiosInstance from '../axiosInstance';

// ─── Literal union types ──────────────────────────────────────────────────────

export type SearchType = 'tracks' | 'playlists' | 'albums' | 'users';

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
  /** The search query string */
  q: string;
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

// ── Entity shapes ─────────────────────────────────────────────────────────────

export interface Track {
  id: string;
  title: string;
  duration: number; // seconds
  coverUrl: string | null;
  tags: string[];
  uploadedAt: string; // ISO-8601
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

// ── Filter shapes ─────────────────────────────────────────────────────────────

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

// ── Search response shapes ────────────────────────────────────────────────────

export interface EverythingSearchResponse {
  tracks: Track[];
  playlists: Playlist[];
  albums: Album[];
  users: User[];
  pagination: Pagination;
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

// ── Narrow return type based on SearchParams discriminant ─────────────────────

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

// ─── Helper: strip undefined values from params object ───────────────────────

function cleanParams(
  obj: Record<string, string | number | undefined>,
): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== ''),
  ) as Record<string, string | number>;
}

// ─── Core search function ─────────────────────────────────────────────────────

/**
 * Universal search function. Pass `type` to search a specific tab; omit it
 * for the "everything" overview page.
 *
 * Token attachment, refresh, and error handling are all managed by axiosInstance.
 *
 * @example — Tracks tab with filters
 * const data = await search({ q: 'night', type: 'tracks', tag: 'energetic', time_range: 'past_month' });
 *
 * @example — Users tab with location filter
 * const data = await search({ q: 'nour', type: 'users', location: 'Cairo' });
 *
 * @example — Overview / everything page
 * const data = await search({ q: 'jaz' });
 */
export async function search<T extends SearchParams>(
  params: T,
  signal?: AbortSignal,
): Promise<SearchResponse<T>> {
  const { data } = await axiosInstance.get<{ data: SearchResponse<T> }>('/search', {
    params: cleanParams({
      q:          params.q,
      type:       'type' in params ? params.type : undefined,
      tag:        'tag' in params ? params.tag : undefined,
      location:   'location' in params ? params.location : undefined,
      time_range: 'time_range' in params ? params.time_range : undefined,
      duration:   'duration' in params ? params.duration : undefined,
      limit:      params.limit,
      offset:     params.offset,
    }),
    signal,
  });

  // Backend wraps everything in { data: { ... } }
  return data.data;
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

/**
 * A user suggestion returned by the backend — a person the current user follows.
 */
export interface SuggestionUser {
  id: string;
  display_name: string;
  username: string;
  profile_picture: string | null;
  is_following: boolean;
}

/**
 * The full response from GET /suggestions?q=...
 *
 * Backend shape:
 * {
 *   data: {
 *     users: SuggestionUser[];       // people the authed user follows matching the query
 *     suggestions: string[];         // plain-text query suggestions
 *   }
 * }
 */
export interface SuggestionsResponse {
  users: SuggestionUser[];
  suggestions: string[];
}

/**
 * Typeahead suggestions — call on every keystroke after >= 1 character.
 * Requires the user to be authenticated (token handled by axiosInstance).
 *
 * Always pass an AbortSignal so stale in-flight requests are cancelled
 * when the user keeps typing.
 *
 * @example
 * const controller = new AbortController();
 * const { users, suggestions } = await getSuggestions('n', controller.signal);
 */
export async function getSuggestions(
  q: string,
  signal?: AbortSignal,
): Promise<SuggestionsResponse> {
  const { data } = await axiosInstance.get<{ data: SuggestionsResponse }>(
    '/suggestions',
    { params: { q }, signal },
  );
  // Unwrap the { data: { users, suggestions } } envelope
  return data.data;
}