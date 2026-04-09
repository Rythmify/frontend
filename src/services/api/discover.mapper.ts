import type {
  DiscoveryTrack,
  PersonalMix,
  DiscoveryStation,
  EmergingArtist,
  CuratedMixSummary,
  HomeData,
  TrackSummary,
  SuggestedUser,
  SuggestedArtist,
  DiscoveryAlbum,
  RecentlyPlayedEntry,
  ListeningHistoryEntry,
} from "./discover.service";
import type { PublicUser } from "@/services/mocks/User.service";
import type { Playlist } from "@/services/api/playlist/playlist.service";
import type { Mix } from "@/types/mix";
import type { Track } from "@/types/track";
import type { Station } from "@/types/station";
import type { User } from "@/types/user";

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Tracks ───────────────────────────────────────────────────────────────────

/**
 * DiscoveryTrack → Track
 * Used for all home page sections (more_of_what_you_like, mixed_for_you tracks, etc.)
 * artist_name is denormalised on DiscoveryTrack — no extra fetch needed.
 */
export function mapDiscoveryTrack(api: DiscoveryTrack): Track {
  return {
    id: api.id as unknown as string,
    title: api.title,
    artistName: api.artist_name ?? "",
    artistUsername: "", // DiscoveryTrack has no username — navigate by user_id if needed
    coverUrl: api.cover_image ?? "",
    genre: api.genre_name ?? "",
    likeCount: api.like_count,
    repostCount: api.repost_count ?? 0,
    playCount: api.play_count,
    commentCount: 0, // not in DiscoveryTrack
    duration: api.duration ? formatDuration(api.duration) : "0:00",
    postedAt: api.created_at,
    audioUrl: api.stream_url ?? "",
    waveformData: [],
  };
}

/**
 * TrackSummary → Track
 * Used for listening history and recently played entries.
 * TrackSummary has cover_image and stream_url but no artist_name — resolve via getUserById if needed.
 */
export function mapTrackSummaryToTrack(api: TrackSummary): Track {
  return {
    id: api.id as unknown as string,
    title: api.title,
    artistName: "", // user_id only — call getUserById(api.user_id) to get display_name
    artistUsername: "",
    coverUrl: api.cover_image ?? "",
    genre: api.genre ?? "",
    likeCount: api.like_count,
    repostCount: 0,
    playCount: api.play_count,
    commentCount: 0,
    duration: api.duration ? formatDuration(api.duration) : "0:00",
    postedAt: "", // TrackSummary has no created_at
    audioUrl: api.stream_url ?? "",
    waveformData: [],
  };
}

/**
 * RecentlyPlayedEntry → Track
 * Extracts the nested TrackSummary. Use getUserById(api.track.user_id) for artist name.
 */
export function mapRecentlyPlayedEntry(api: RecentlyPlayedEntry): Track {
  return mapTrackSummaryToTrack(api.track);
}

/**
 * ListeningHistoryEntry → Track + playedAt
 */
export function mapListeningHistoryEntry(
  api: ListeningHistoryEntry,
): Track & { playedAt: string } {
  return {
    ...mapTrackSummaryToTrack(api.track),
    playedAt: api.played_at,
  };
}

// ─── Mixes ────────────────────────────────────────────────────────────────────

/** DiscoveryMix → Mix */
export function mapPersonalMix(api: PersonalMix): Mix {
  return {
    id: api.id,
    label: api.label,
    flavor: api.flavor,
    coverUrl: api.cover_image,
    trackCount: api.track_count,
    generatedAt: api.generated_at,
  };
}

// ─── Stations ─────────────────────────────────────────────────────────────────

/**
 * DiscoveryStation → Station
 * Old HomeStation had a nested seed_artist object — new spec has flat artist_id / artist_name.
 */
export function mapDiscoveryStation(api: DiscoveryStation): Station {
  return {
    id: api.id,
    name: api.name,
    seedArtist: {
      id: api.artist_id,
      displayName: api.artist_name,
    },
    coverUrl: api.cover_image,
    trackCount: api.track_count,
  };
}

// ─── Albums ───────────────────────────────────────────────────────────────────

/**
 * DiscoveryAlbum → Playlist
 */
export function mapDiscoveryAlbum(api: DiscoveryAlbum): Playlist {
  return {
    playlist_id: api.id,
    owner_user_id: api.owner_id,
    name: api.name,
    description: null,
    is_public: true,
    cover_image: api.cover_image,
    subtype: "album",
    track_count: api.track_count,
    like_count: api.like_count,
    created_at: api.created_at ?? "",
  };
}

// ─── Users ────────────────────────────────────────────────────────────────────

/**
 * SuggestedArtist → User
 * For NewCrewForYou carousel. SuggestedArtist now has profile_picture and follower_count directly.
 * No extra getUserById fetch needed.
 */
export function mapSuggestedArtistToUser(api: SuggestedArtist): User {
  return {
    id: api.id as unknown as string,
    username: api.username ?? api.display_name,
    displayName: api.display_name,
    avatar: api.profile_picture ?? undefined,
    followers: api.follower_count,
    isVerified: api.is_verified,
  };
}

/**
 * SuggestedUser → User
 * For getSuggestedUsers() results ("new crew" section).
 */
export function mapSuggestedUserToUser(api: SuggestedUser): User {
  return {
    id: api.id as unknown as string,
    username: api.username ?? api.display_name,
    displayName: api.display_name,
    avatar: api.profile_picture ?? undefined,
    followers: api.follower_count,
    isVerified: api.is_verified,
  };
}

/**
 * SuggestedArtist → ArtistListSection shape
 * For the sidebar "Artists you should follow" when you have SuggestedArtist data directly
 * and don't need a full profile fetch.
 */
export function mapSuggestedArtistToArtistCard(api: SuggestedArtist) {
  return {
    username: api.username ?? api.display_name,
    avatar: api.profile_picture ?? undefined,
    followers: api.follower_count,
    isVerified: api.is_verified,
  };
}

/**
 * PublicUser → ArtistListSection shape
 * Used after a full getUserById() fetch when you need accurate follower counts and username.
 */
export function mapApiUserToArtist(api: PublicUser) {
  return {
    username: api.username ?? api.display_name,
    avatar: api.profile_picture ?? undefined,
    followers: api.followers_count,
    isVerified: api.is_verified,
  };
}

// ─── Home page master mapper ──────────────────────────────────────────────────

/** EmergingArtist → ArtistListSection shape */
export function mapEmergingArtist(api: EmergingArtist) {
  return {
    username: api.display_name,
    avatar: api.profile_picture ?? undefined,
    followers: 0, // not on EmergingArtist — use play_velocity as a proxy if needed
    tracks: api.track_count,
    isVerified: false,
  };
}

export interface MappedHomeData {
  moreOfWhatYouLike: {
    tracks: Track[];
    source: "personalized" | "trending_fallback";
  };
  mixedForYou: Mix[];
  madeForYou: {
    dailyMix: CuratedMixSummary;
    weeklyMix: CuratedMixSummary;
  } | null;
  discoverWithStations: Station[];
  artistsToWatch: ReturnType<typeof mapEmergingArtist>[];
}

/**
 * HomeData → MappedHomeData
 * Single call to map every home page section at once.
 * Pass the result to section components directly — no per-section mapping needed.
 */
export function mapHomeData(api: HomeData): MappedHomeData {
  return {
    moreOfWhatYouLike: {
      tracks: api.more_of_what_you_like.tracks.map(mapDiscoveryTrack),
      source: api.more_of_what_you_like.source,
    },
    mixedForYou: api.mixed_for_you.map(mapPersonalMix),
    madeForYou: api.made_for_you
      ? {
          dailyMix: api.made_for_you.daily_mix,
          weeklyMix: api.made_for_you.weekly_mix,
        }
      : null,
    discoverWithStations: api.discover_with_stations.map(mapDiscoveryStation),
    artistsToWatch: api.artists_to_watch.map(mapEmergingArtist),
  };
}
