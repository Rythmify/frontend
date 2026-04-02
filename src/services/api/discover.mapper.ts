import type {
  PersonalMix,
  FeedTrack,
  HomeStation,
  SuggestedUser,
  RecentlyPlayedEntry,
} from "./discover.service";
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
    coverUrl: api.cover_url,
    trackCount: api.track_count,
    generatedAt: api.generated_at,
  };
}

export function mapFeedTrack(api: FeedTrack): Track {
  return {
    id: api.track_id as unknown as number, // Track.id is legacy number; API returns UUID string
    title: api.title,
    artistName: api.artist_display_name,
    artistUsername: api.artist_username,
    coverUrl: api.cover_url,
    genre: api.genre,
    likeCount: api.like_count,
    repostCount: api.repost_count,
    playCount: api.play_count,
    commentCount: api.comment_count,
    duration: formatDuration(api.duration), // convert seconds → "m:ss"
    postedAt: api.uploaded_at,
    audioUrl: api.audio_url,
    waveformData: api.waveform_data ?? [],
  };
}

export function mapHomeStation(api: HomeStation): Station {
  return {
    id: api.id,
    name: api.name,
    seedArtist: {
      id: api.seed_artist.id,
      displayName: api.seed_artist.display_name,
      username: api.seed_artist.username,
      avatarUrl: api.seed_artist.avatar_url,
    },
    coverUrl: api.cover_url,
    trackCount: api.track_count,
  };
}

export function mapSuggestedToArtist(user: SuggestedUser) {
  return {
    username: user.display_name,
    avatar: undefined as string | undefined,
    followers: 0, // TODO: request followers count from backend
    isVerified: user.is_verified,
  };
}

export function mapSuggestedToUser(user: SuggestedUser): User {
  return {
    id: user.user_id as unknown as number, // User.id is legacy number; API returns UUID string
    username: user.display_name, // TODO: API should return a separate username field
    displayName: user.display_name,
    avatar: undefined,
    followers: 0, // TODO: request followers count from backend
    isVerified: user.is_verified,
  };
}

// missing artist_name, cover_url, and audio_url.
export function mapRecentlyPlayedEntry(api: RecentlyPlayedEntry) {
  return {
    id: api.track.id,
    title: api.track.title,
    artist: "", // TODO: TrackSummary doesn't include artist name — request from backend
    coverUrl: undefined as string | undefined,
    lastPlayedAt: api.last_played_at,
  };
}
