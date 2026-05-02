import {
  formatDuration,
  type PlaylistDetails,
  type PlaylistTrackItem,
  type RadioTracksResponse,
} from "@/services/api/playlist/playlist.service";
import type { Track } from "@/types/track";

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RadioTrack = RadioTracksResponse["data"]["reference_track"] | RadioTracksResponse["data"]["tracks"][number];

export function parseDuration(duration?: string): number | null {
  if (!duration) return null;
  const parts = duration.split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

export function trackDurationSeconds(track: Track | null) {
  return parseDuration(track?.duration) ?? 0;
}

export function trackCountWithSeed(
  seedTrack: Track | null,
  relatedTracks: Track[],
) {
  if (!seedTrack) return relatedTracks.length;

  const uniqueTrackIds = new Set<string>(relatedTracks.map((track) => track.id));
  uniqueTrackIds.add(seedTrack.id);

  return uniqueTrackIds.size;
}

export function buildFeaturedArtistSources(
  seedTrack: Track | null,
  tracks: Track[],
) {
  return seedTrack ? [seedTrack, ...tracks] : tracks;
}

export function toPlaylistTrackItem(
  track: Track,
  position: number,
): PlaylistTrackItem {
  return {
    track_id: track.id,
    position,
    added_at: track.postedAt || new Date().toISOString(),
    title: track.title,
    duration: parseDuration(track.duration),
    cover_image: track.coverUrl || null,
    is_public: !track.isPrivate,
    deleted_at: null,
    artist_name: track.artistName || null,
    artist_id: track.artistId || track.artistUsername || undefined,
    artist_username: track.artistUsername || null,
    audio_url: track.audioUrl || null,
    play_count: track.playCount ?? 0,
  };
}

export function buildPlaylist(
  seedTrack: Track,
  relatedTracks: Track[],
): PlaylistDetails {
  return {
    playlist_id: seedTrack.id,
    owner_user_id:
      seedTrack.artistUsername || seedTrack.artistName || seedTrack.id,
    name: seedTrack.title
      ? `Related tracks: ${seedTrack.title}`
      : "Related tracks picked for you",
    description: "More of what you like",
    is_public: true,
    cover_image: seedTrack.coverUrl || null,
    created_at: seedTrack.postedAt || new Date().toISOString(),
    updated_at: null,
    track_count: trackCountWithSeed(seedTrack, relatedTracks),
    like_count: 0,
    repost_count: 0,
    tracks: relatedTracks.map((track, index) =>
      toPlaylistTrackItem(track, index + 1),
    ),
  };
}

export function mapRadioTrackToPlayerTrack(track: RadioTrack): Track {
  return {
    id: track.id,
    title: track.title,
    artistName: track.artist_name ?? "Unknown Artist",
    artistUsername: track.user_id,
    coverUrl: track.cover_image ?? "",
    genre: "genre_name" in track ? track.genre_name ?? "" : "",
    likeCount: track.like_count,
    repostCount: track.repost_count,
    playCount: track.play_count,
    commentCount: 0,
    duration:
      typeof track.duration === "number"
        ? formatDuration(track.duration)
        : "0:00",
    postedAt: track.created_at,
    waveformData: [],
    audioUrl: track.stream_url ?? "",
  };
}

export function radioTracksToPlaylistDetails(
  payload: RadioTracksResponse["data"],
): PlaylistDetails {
  return {
    playlist_id: payload.playlist_id,
    owner_user_id: payload.reference_track.user_id,
    name: payload.title,
    description: payload.description,
    is_public: true,
    cover_image: payload.cover_image,
    created_at: payload.tracks[0]?.created_at ?? new Date().toISOString(),
    updated_at: null,
    track_count: payload.tracks.length,
    like_count: 0,
    repost_count: 0,
    tracks: payload.tracks.map(
      (track, index) =>
        ({
          track_id: track.id,
          position: index + 1,
          added_at: track.created_at,
          title: track.title,
          duration: track.duration,
          cover_image: track.cover_image,
          artist_name: track.artist_name,
          artist_id: track.user_id,
          is_public: true,
          deleted_at: null,
          audio_url: track.stream_url,
          play_count: track.play_count,
        }) as PlaylistTrackItem & { audio_url?: string; play_count?: number },
    ),
  };
}

export function toPlayerTrack(
  track: PlaylistTrackItem,
  usernameFallback: string,
): Track {
  return {
    id: track.track_id,
    title: track.title ?? "Untitled track",
    artistName: track.artist_name ?? "Unknown Artist",
    artistUsername: track.artist_username ?? usernameFallback ?? "",
    coverUrl: track.cover_image ?? "",
    genre: "",
    likeCount: 0,
    repostCount: 0,
    playCount: track.play_count ?? 0,
    commentCount: 0,
    duration:
      typeof track.duration === "number"
        ? formatDuration(track.duration)
        : "0:00",
    postedAt: track.added_at ?? "",
    waveformData: [],
    audioUrl: track.audio_url ?? "",
    isPrivate: !track.is_public,
  };
}

export function withSeedTrack(
  seedTrack: Track | null,
  tracks: PlaylistTrackItem[],
) {
  if (!seedTrack) return tracks;

  const seedPlaylistTrack = toPlaylistTrackItem(seedTrack, 1);
  const hasSeed = tracks.some(
    (track) => track.track_id === seedPlaylistTrack.track_id,
  );

  return hasSeed ? tracks : [seedPlaylistTrack, ...tracks];
}
