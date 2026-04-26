import type { Track } from "@/types/track";
import type { Playlist } from "@/types/playlist";

function durationToString(duration: any): string {
  if (!duration) return "0:00";
  if (typeof duration === "string") return duration;
  if (typeof duration === "number") {
    const m = Math.floor(duration / 60);
    const s = Math.round(duration) % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  return "0:00";
}
 
export function mapTrack(t: any): Track {
  return {
    id: String(t.id ?? ""),
    title: t.title ?? "Untitled",
    artistName: t.artist_name ?? t.user?.display_name ?? t.user?.username ?? "Unknown",
    artistUsername: t.user?.username ?? "unknown",
    coverUrl: t.cover_image ?? t.coverUrl ?? "",
    audioUrl: t.stream_url ?? t.audioUrl ?? "",
    genre: t.genre_name ?? t.genre ?? "",
    likeCount: t.like_count ?? t.likeCount ?? 0,
    repostCount: t.repost_count ?? t.repostCount ?? 0,
    playCount: t.play_count ?? t.playCount ?? 0,
    commentCount: t.comment_count ?? t.commentCount ?? 0,
    duration: durationToString(t.duration),
    postedAt: t.created_at ?? t.postedAt ?? "",
    waveformData: [],
    isPrivate: t.isPrivate ?? false,
    trackSlug: t.slug ?? t.track_slug ?? t.trackSlug ?? String(t.id ?? ""),
  };
}
 
export function mapPlaylist(pl: any): Playlist {
  return {
    id: pl.id,
    title: pl.title ?? "Untitled Playlist",
    // Backend returns owner.display_name, not creatorName
    creatorName: pl.owner?.display_name ?? pl.creatorName ?? "",
    creatorUsername: pl.owner?.username ?? pl.creatorUsername ?? "",
    // Backend returns cover_image, not coverUrl
    coverUrl: pl.cover_image ?? pl.coverUrl ?? "",
    postedAt: pl.created_at ?? pl.postedAt ?? "",
    // Backend returns track_count, not trackCount
    trackCount: pl.track_count ?? pl.trackCount ?? 0,
    likeCount: pl.like_count ?? pl.likeCount ?? 0,
    repostCount: pl.repost_count ?? pl.repostCount ?? 0,
    playlistSlug: pl.playlist_slug ?? pl.playlistSlug ?? String(pl.id),
    isPrivate: pl.is_private ?? pl.isPrivate ?? false,
    // Backend returns preview_tracks (up to ~3), not full tracks array
    tracks: (pl.preview_tracks ?? pl.tracks ?? []).map(mapTrack),
  };
}