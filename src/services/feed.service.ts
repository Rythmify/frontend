import axiosInstance from "./api/axiosInstance";
import type { FeedItem } from "../types/feedItem";
import type { Track } from "../types/track";
import type { Playlist } from "../types/playlist";

function durationToString(d: unknown): string {
  if (typeof d === "number") {
    return `${Math.floor(d / 60)}:${String(Math.round(d % 60)).padStart(2, "0")}`;
  }
  if (typeof d === "string" && d) return d;
  return "0:00";
}

function mapTrack(t: any): Track {
  return {
    id: String(t.id ?? ""),
    title: t.title ?? "Untitled",
    artistName: t.user?.display_name ?? t.user?.displayName ?? t.user?.username ?? "Unknown",
    artistUsername: t.user?.username ?? "unknown",
    coverUrl: t.coverUrl ?? t.cover_image ?? "",
    audioUrl: t.audioUrl ?? t.stream_url ?? "",
    genre: t.genre ?? t.genre_name ?? "",
    likeCount: t.like_count ?? t.likeCount ?? 0,
    repostCount: t.repost_count ?? t.repostCount ?? 0,
    playCount: t.play_count ?? t.playCount ?? 0,
    commentCount: t.comment_count ?? t.commentCount ?? 0,
    duration: durationToString(t.duration),
    postedAt: t.postedAt ?? t.created_at ?? "",
    waveformData: [],
    isPrivate: t.isPrivate ?? false,
    trackSlug: t.slug ?? t.track_slug ?? t.trackSlug ?? String(t.id ?? ""),
  };
}

function mapPlaylist(pl: any): Playlist {
  return {
    id: pl.id,
    title: pl.title ?? "Untitled Playlist",
    creatorName: pl.creatorName ?? "",
    creatorUsername: pl.creatorUsername ?? "",
    coverUrl: pl.coverUrl ?? "",
    postedAt: pl.postedAt ?? "",
    trackCount: pl.trackCount ?? 0,
    likeCount: pl.likeCount ?? 0,
    repostCount: pl.repostCount ?? 0,
    playlistSlug: pl.playlistSlug ?? pl.id,
    isPrivate: pl.isPrivate ?? false,
    tracks: (pl.tracks ?? []).map(mapTrack),
  };
}

function mapUser(u: any) {
  return {
    id: String(u?.id ?? "unknown"),
    username: u?.username ?? "unknown",
    displayName: u?.displayName ?? "Unknown",
    avatar: u?.avatar ?? undefined,
    followers: u?.followers ?? 0,
    isVerified: u?.isVerified,
  };
}

export async function getActivityFeed(
  limit: number = 20,
  offset: number = 0,
): Promise<{ items: FeedItem[]; hasMore: boolean; total: number }> {
  const { data } = await axiosInstance.get<{
    data: any[];
    pagination?: { limit: number; offset: number; total: number };
    hasMore?: boolean;
  }>("/feed", { params: { limit, offset } });

  const rows: any[] = data.data ?? [];

  const items: FeedItem[] = rows.map((row): FeedItem => {
    const isRepost = row.type === "repost";

    if (row.content_type === "playlist" && row.playlist) {
      return {
        id: row.id ?? String(Math.random()),
        type: isRepost ? "repost" : "post",
        content_type: "playlist",
        created_at: row.created_at ?? new Date().toISOString(),
        user: mapUser(row.user),
        playlist: mapPlaylist(row.playlist),
      };
    }

    return {
      id: row.id ?? String(Math.random()),
      type: isRepost ? "repost" : "post",
      content_type: "track",
      created_at: row.created_at ?? new Date().toISOString(),
      user: mapUser(row.user),
      track: mapTrack(row.track ?? {}),
    };
  });

  const total = data.pagination?.total ?? items.length;
  const hasMore = data.pagination
    ? offset + limit < total
    : (data.hasMore ?? false);

  return { items, hasMore, total };
}

export async function getDiscoverFeed(limit: number = 20, offset: number = 0) {
  const { data } = await axiosInstance.get("/feed/discover", {
    params: { limit, offset },
  });
  return data;
}

export async function getHome() {
  const { data } = await axiosInstance.get("/home");
  return data.data;
}
