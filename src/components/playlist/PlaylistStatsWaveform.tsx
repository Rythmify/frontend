import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import {
  formatDuration,
  type PlaylistDetails,
} from "@/services/api/playlist/playlist.service";
import { getTrackComments } from "@/services/mocks/Track.service";
import { audio, seekAudio, setGlobalWaveSurfer, setTrackLoadedLocally } from "@/services/audioService";
import { getTrackWaveform } from "@/services/track.service";
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
  extraDurationSeconds?: number;
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec) % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function StaticWaveform({ track, isActive }: { track: Track; isActive: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const timeRef = useRef<HTMLDivElement | null>(null);
  const durRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!containerRef.current) return;
      if (wsRef.current) { try { wsRef.current.destroy(); } catch {} wsRef.current = null; }
      containerRef.current.innerHTML = "";

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const g = ctx.createLinearGradient(0, 0, 0, 100);
      g.addColorStop(0, "#656666"); g.addColorStop(0.7, "#656666");
      g.addColorStop(0.71, "#ffffff"); g.addColorStop(0.72, "#ffffff");
      g.addColorStop(0.73, "#B1B1B1"); g.addColorStop(1, "#B1B1B1");

      const pg = ctx.createLinearGradient(0, 0, 0, 100);
      pg.addColorStop(0, "#F6B094"); pg.addColorStop(0.7, "#F6B094");
      pg.addColorStop(0.71, "#ffffff"); pg.addColorStop(0.72, "#ffffff");
      pg.addColorStop(0.73, "#EB4926"); pg.addColorStop(1, "#EE772F");

      const peaks = track.waveformData?.length > 0
        ? track.waveformData
        : await getTrackWaveform(track.id);
      if (!isMounted || !containerRef.current) return;

      let parsedDur = 0;
      const parts = track.duration?.split(":");
      if (parts?.length === 2) parsedDur = parseInt(parts[0]) * 60 + parseInt(parts[1]);

      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: g,
        progressColor: pg,
        barWidth: 2, barGap: 1, barRadius: 2,
        height: 80,
        ...(isActive ? { backend: "MediaElement" as const, media: audio } : {}),
        peaks: peaks.length > 0 ? [peaks] : undefined,
        duration: parsedDur > 0 ? parsedDur : undefined,
      });

      wsRef.current = ws;

      if (isActive) {
        setTrackLoadedLocally(null);
        setGlobalWaveSurfer(ws, track.id);
        ws.on("interaction", (t: number) => seekAudio(t));
        ws.on("timeupdate", (t: number) => {
          if (timeRef.current) timeRef.current.textContent = fmt(t);
        });
      }

      ws.on("decode", (d: number) => {
        if (durRef.current) durRef.current.textContent = fmt(d);
      });
      ws.on("error", () => {});
    };

    init();
    return () => {
      isMounted = false;
      if (wsRef.current) { try { wsRef.current.destroy(); } catch {} wsRef.current = null; }
    };
  }, [track.id, track.audioUrl, isActive]);

  return (
    <div style={{ position: "relative", width: "100%", height: 80 }}>
      <div ref={containerRef} style={{ transform: "scaleY(-1)", height: 80 }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.08)", pointerEvents: "none", opacity: 0.5, borderRadius: 2 }} />
      <div ref={timeRef} style={{ position: "absolute", left: 0, top: "55%", transform: "translateY(-50%)", fontSize: 11, background: "rgba(0,0,0,0.75)", color: "#fff", padding: "2px", zIndex: 10 }}>0:00</div>
      <div ref={durRef} style={{ position: "absolute", right: 0, top: "55%", transform: "translateY(-50%)", fontSize: 11, background: "rgba(0,0,0,0.75)", color: "#fff", padding: "2px", zIndex: 10 }}>0:00</div>
    </div>
  );
}

export default function PlaylistStatsWaveform({
  playlist,
  isPlaying = false,
  activeTrackId,
  comments: commentsProp,
  extraDurationSeconds = 0,
}: PlaylistStatsCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(commentsProp ?? []);

  const activePlaylistTrack =
    playlist.tracks.find((track) => track.track_id === activeTrackId) ?? null;
  const hasActiveTrackInPlaylist = Boolean(activePlaylistTrack);

  const totalDurationSeconds =
    playlist.tracks.reduce((sum, track) => sum + (track.duration ?? 0), 0) +
    Math.max(0, Math.floor(extraDurationSeconds));

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
        duration: formatDuration(activePlaylistTrack.duration ?? 0),
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
    return () => { cancelled = true; };
  }, [activeTrackId, commentsProp, showComments]);

  return (
    <div data-test="playlist-stats-waveform" className="flex flex-col items-start gap-2 w-full min-w-0">
      {waveformTrack ? (
        <div className="w-full min-w-0 overflow-hidden">
          <div
            data-test="playlist-waveform-container"
            className="transition-opacity duration-150 w-full min-w-0"
            style={{ minHeight: "80px" }}
          >
            <StaticWaveform
              key={`${playlist.playlist_id}-${waveformTrack.id}`}
              track={waveformTrack}
              isActive={isPlaying && hasActiveTrackInPlaylist}
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
            {formatDuration(totalDurationSeconds)}
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