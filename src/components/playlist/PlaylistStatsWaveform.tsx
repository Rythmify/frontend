import { useEffect, useState } from "react";
import {
  getPlaylistTotalDuration,
  type PlaylistDetails,
} from "@/services/api/playlist/playlist.service";
import { getTrackComments } from "@/services/mocks/Track.service";
import TrackWaveform from "@/pages/[username]/[trackSlug]/components/TrackWaveform";
import type { Track } from "@/types/track";

interface Comment {
  id: number;
  avatarUrl: string;
  timestamp: number;
}

interface PlaylistStatsCommentsProps {
  playlist: PlaylistDetails;
  isPlaying?: boolean;
  activeTrackId?: string;
  comments?: Comment[];
}

export default function PlaylistStatsWaveform({
  playlist,
  isPlaying = false,
  activeTrackId,
  comments: commentsProp,
}: PlaylistStatsCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(commentsProp ?? []);

  const activePlaylistTrack =
    playlist.tracks.find((track) => track.track_id === activeTrackId) ?? null;
  const hasActiveTrackInPlaylist = Boolean(activePlaylistTrack);

  const formatDuration = (seconds?: number | null) => {
    if (typeof seconds !== "number" || Number.isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.max(0, Math.floor(seconds % 60));
    return `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  const waveformTrack: Track | null = activePlaylistTrack
    ? {
        id: activePlaylistTrack.track_id,
        title: activePlaylistTrack.title ?? "Untitled track",
        artistName: activePlaylistTrack.artist_name ?? "Unknown Artist",
        artistUsername: activePlaylistTrack.artist_username ?? "",
        coverUrl: activePlaylistTrack.cover_image ?? "",
        genre: "",
        likeCount: 0,
        repostCount: 0,
        playCount: activePlaylistTrack.play_count ?? 0,
        commentCount: 0,
        duration: formatDuration(activePlaylistTrack.duration),
        postedAt: activePlaylistTrack.added_at ?? "",
        waveformData: [],
        audioUrl: activePlaylistTrack.audio_url ?? "",
        isPrivate: !activePlaylistTrack.is_public,
      }
    : null;

  const showComments = isPlaying && hasActiveTrackInPlaylist;

  useEffect(() => {
    if (commentsProp) {
      setComments(commentsProp);
      return;
    }

    let cancelled = false;

    async function loadComments() {
      if (!showComments || !activeTrackId) {
        setComments([]);
        return;
      }

      try {
        const res = await getTrackComments(activeTrackId);
        const raw = Array.isArray(res) ? res : ((res as any)?.data ?? []);
        const mapped = raw
          .map((item: any, index: number) => ({
            id: Number(item?.id ?? index),
            avatarUrl:
              item?.avatarUrl ??
              item?.avatar_url ??
              `https://picsum.photos/seed/comment-${activeTrackId}-${index}/40/40`,
            timestamp: Number(item?.timestamp ?? item?.timestampSec ?? 0),
          }))
          .slice(0, 5);

        if (!cancelled) setComments(mapped);
      } catch {
        if (!cancelled) setComments([]);
      }
    }

    loadComments();
    return () => {
      cancelled = true;
    };
  }, [activeTrackId, commentsProp, showComments]);

  return (
    <div className="flex flex-col items-start gap-2 w-full min-w-0">
      {waveformTrack ? (
        <div className="w-full min-w-0 overflow-hidden">
          <div
            data-test="playlist-waveform-container"
            className="transition-opacity duration-150 w-full min-w-0"
            style={{ minHeight: "120px" }}
          >
            <TrackWaveform
              key={`${playlist.playlist_id}-${waveformTrack.id}`}
              track={waveformTrack}
            />
          </div>
        </div>
      ) : (
        <div
          data-test="playlist-stats-badge"
          className="w-24 h-24 rounded-full bg-[#121212] flex flex-col items-center justify-center"
        >
          <span className="text-[28px] font-bold leading-none text-white">
            {playlist.track_count}
          </span>
          <span className="text-[14px] uppercase font-bold text-white mt-1">
            Tracks
          </span>
          <span className="text-[14px] text-text-secondary mt-1">
            {getPlaylistTotalDuration(playlist.tracks)}
          </span>
        </div>
      )}

      {showComments && comments.length > 0 && (
        <div
          data-test="playlist-comment-avatars"
          className="flex items-center gap-2 pl-1"
        >
          {comments.map((comment) => (
            <img
              key={comment.id}
              src={comment.avatarUrl}
              alt="commenter"
              title={`${Math.floor(comment.timestamp / 60)}:${String(
                comment.timestamp % 60,
              ).padStart(2, "0")}`}
              className="w-7 h-7 rounded-full border border-white/40 object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}
