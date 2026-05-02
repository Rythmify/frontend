import type { Track } from "@/types/track";
import type { Playlist } from "@/types/playlist";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function durationToString(duration: any): string {
  if (!duration) return "0:00";
  if (typeof duration === "string") return duration;
  if (typeof duration === "number") {
    const m = Math.floor(duration / 60);
    const s = Math.round(duration) % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  return "0:00";
}

// ─── Track mapper ─────────────────────────────────────────────────────────────
// Handles two backend shapes:
//   Search results  → flat fields: artist_name, cover_image, stream_url, play_count …
//   Other contexts  → nested user object: user.display_name, user.username …

export function mapTrack(t: any): Track {
  if (typeof t === 'string') {
    return {
      id: t,
      title: "Untitled",
      artistName: "Unknown",
      artistUsername: "unknown",
      coverUrl: "",
      audioUrl: "",
      genre: "",
      likeCount: 0,
      repostCount: 0,
      playCount: 0,
      commentCount: 0,
      duration: "0:00",
      postedAt: "",
      waveformData: [],
      isPrivate: false,
      trackSlug: t,
    };
  }

  return {
    id: String(t.id ?? t.track_id ?? ""),
    title: t.title ?? "Untitled",
    // Search backend returns flat artist_name; other contexts return user object
    artistName:
      t.artist_name ??
      t.user?.display_name ??
      t.user?.displayName ??
      t.user?.username ??
      "Unknown",
    artistUsername: t.user?.username ?? t.artist_username ?? t.username ?? "unknown",
    // Search backend returns cover_image; other contexts return coverUrl
    coverUrl: t.cover_image ?? t.coverUrl ?? "",
    // Search backend returns stream_url; other contexts return audioUrl
    audioUrl: t.stream_url ?? t.audioUrl ?? "",
    genre: t.genre_name ?? t.genre ?? "",
    likeCount: t.like_count ?? t.likeCount ?? 0,
    repostCount: t.repost_count ?? t.repostCount ?? 0,
    playCount: t.play_count ?? t.playCount ?? 0,
    commentCount: t.comment_count ?? t.commentCount ?? 0,
    duration: durationToString(t.duration),
    postedAt: t.created_at ?? t.postedAt ?? "",
    waveformData: [],
    isPrivate: t.is_private ?? t.isPrivate ?? false,
    trackSlug: t.slug ?? t.track_slug ?? t.trackSlug ?? String(t.id ?? ""),
  };
}

// ─── Playlist mapper ──────────────────────────────────────────────────────────
// Backend shape (formatPlaylistResult):
// { id, title, cover_image, owner: { id, display_name }, track_count,
//   created_at, score, preview_tracks: Track[] }

export function mapPlaylist(pl: any): Playlist {
  const id = pl.id ?? pl.playlist_id ?? "";
  return {
    id,
    title: pl.title ?? pl.name ?? "Untitled Playlist",
    creatorName: pl.owner?.display_name ?? pl.creatorName ?? "",
    creatorUsername: pl.owner?.username ?? pl.owner_username ?? pl.creatorUsername ?? pl.username ?? "unknown",
    coverUrl: pl.cover_image ?? pl.coverUrl ?? "",
    postedAt: pl.created_at ?? pl.postedAt ?? "",
    trackCount: pl.track_count ?? pl.trackCount ?? 0,
    likeCount: pl.like_count ?? pl.likeCount ?? 0,
    repostCount: pl.repost_count ?? pl.repostCount ?? 0,
    playlistSlug: pl.playlist_slug ?? pl.slug ?? pl.playlistSlug ?? String(id),
    isPrivate: pl.is_private ?? pl.isPrivate ?? false,
    tracks: (pl.preview_tracks ?? pl.tracks ?? []).map(mapTrack),
  };
}