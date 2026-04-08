import type {
  PersonalMix,
  FeedTrack,
  HomeStation,
  SuggestedUser,
  RecentlyPlayedEntry,
  ApiTrack,
} from "./discover.service";
import type { PublicUser } from "@/services/mocks/User.service";
import type { Mix } from "@/types/mix";
import type { Track } from "@/types/track";
import type { Station } from "@/types/station";
import type { User } from "@/types/user";

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Converts a duration in seconds to a "m:ss" string.
 */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

export function mapPersonalMix(api: PersonalMix): Mix {
  return {
    id: api.id,
    label: api.label,
    flavor: api.flavor,
    coverUrl: api.cover_image, // OpenAPI uses cover_image
    trackCount: api.track_count,
    generatedAt: api.generated_at,
  };
}

export function mapFeedTrack(api: FeedTrack): Track {
  return {
    id: api.id as unknown as number, // Track.id is legacy number; API returns UUID string
    title: api.title,
    artistName: api.artist.display_name,
    artistUsername: api.artist.username ?? "", // gap — ask backend to add username to FeedTrack artist
    coverUrl: api.cover_url ?? "",
    genre: api.genre ?? "",
    likeCount: api.like_count,
    repostCount: 0, // not in FeedTrack spec
    playCount: api.play_count,
    commentCount: 0, // not in FeedTrack spec
    duration: formatDuration(api.duration),
    postedAt: api.created_at,
    audioUrl: api.stream_url,
    waveformData: [],
  };
}

export function mapHomeStation(api: HomeStation): Station {
  return {
    id: api.id,
    name: api.name,
    seedArtist: {
      id: api.seed_artist.user_id, // OpenAPI UserSummary uses user_id, not id
      displayName: api.seed_artist.display_name,
      // username and avatarUrl not available in UserSummary per OpenAPI spec
    },
    coverUrl: api.cover_image, // OpenAPI uses cover_image
    trackCount: api.track_count,
  };
}

/**
 * Maps a full track response (GET /tracks/{id}) to the frontend Track type.
 * artistName and artistUsername are empty — ApiTrack only has user_id.
 */
export function mapApiTrackToTrack(api: ApiTrack): Track {
  return {
    id: api.id as unknown as number,
    title: api.title,
    artistName: "", // ApiTrack has user_id only — gap until backend enriches endpoint
    artistUsername: "",
    coverUrl: api.cover_url ?? "",
    genre: api.genre ?? "",
    likeCount: api.like_count,
    repostCount: api.repost_count,
    playCount: api.play_count,
    commentCount: api.comment_count,
    duration: api.duration ? formatDuration(api.duration) : "0:00",
    postedAt: api.created_at,
    audioUrl: api.stream_url ?? "",
    waveformData: [],
  };
}

/**
 * Maps a full user profile (GET /users/{user_id}) to the shape ArtistListSection expects.
 * Uses PublicUser from User.service which has profile_picture, followers_count, username.
 */
export function mapApiUserToArtist(api: PublicUser) {
  return {
    username: api.username ?? api.display_name, // username is nullable in spec
    avatar: api.profile_picture ?? undefined,
    followers: api.followers_count,
    tracks: 0, // not returned by GET /users/{id} — ArtistListSection hides stat when 0
    isVerified: api.is_verified,
  };
}

export function mapSuggestedToArtist(user: SuggestedUser) {
  return {
    username: user.display_name,
    avatar: undefined as string | undefined,
    followers: 0, // not in SuggestedUser — use two-step fetch with getUserById for real data
    isVerified: user.is_verified,
  };
}

export function mapSuggestedToUser(user: SuggestedUser): User {
  return {
    id: user.user_id as unknown as number, // User.id is legacy number; API returns UUID string
    username: user.display_name, // SuggestedUser has no separate username field
    displayName: user.display_name,
    avatar: undefined,
    followers: 0, // not in SuggestedUser
    isVerified: user.is_verified,
  };
}

// missing artist_name, cover_url, and audio_url.
export function mapRecentlyPlayedEntry(api: RecentlyPlayedEntry) {
  return {
    id: api.track.id,
    title: api.track.title,
    artist: "", // TrackSummary doesn't include artist name
    coverUrl: undefined as string | undefined,
    lastPlayedAt: api.last_played_at,
  };
}