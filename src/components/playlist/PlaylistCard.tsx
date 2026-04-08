/**
 * PlaylistCard - reusable component for Search (Playlists tab)
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import { FaPlay, FaPause, FaHeart, FaLock } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { LuCopy, LuPencil, LuTrash2 } from "react-icons/lu";
import { HiDotsHorizontal } from "react-icons/hi";
import { HiArrowUpOnSquare } from "react-icons/hi2";
import { TbRadio, TbChartBar } from "react-icons/tb";
import { MdQueueMusic, MdPlaylistAdd } from "react-icons/md";
import { FaPlay as FaPlayCount } from "react-icons/fa6";

import type { Playlist } from "../../types/playlist";
import SharePopup from "../../pages/[username]/[trackSlug]/components/SharePopup";
import type { Track } from "../../types/track";
import { usePlayerStore } from "../../stores/player.store";
import { useAuthStore } from "../../stores/auth.store";
import { audio, seekAudio, setGlobalWaveSurfer, setTrackLoadedLocally } from "../../services/audioService";

//  Helpers
function fmtN(n?: number) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec) % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function parseDur(s: string) {
  if (!s) return 0;
  const parts = s.split(":").map(Number);
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
  return 0;
}

function buildGradients(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, 100);
  g.addColorStop(0, "#656666"); g.addColorStop(0.7, "#656666");
  g.addColorStop(0.71, "#ffffff"); g.addColorStop(0.72, "#ffffff");
  g.addColorStop(0.73, "#B1B1B1"); g.addColorStop(1, "#B1B1B1");
  const pg = ctx.createLinearGradient(0, 0, 0, 100);
  pg.addColorStop(0, "#F6B094"); pg.addColorStop(0.7, "#F6B094");
  pg.addColorStop(0.71, "#ffffff"); pg.addColorStop(0.72, "#ffffff");
  pg.addColorStop(0.73, "#EB4926"); pg.addColorStop(1, "#EE772F");
  return { g, pg };
}

//  Shared button 
const SC_BTN: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  height: 32, padding: "0 12px",
  background: "#222",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4,
  cursor: "pointer", color: "#fff",
  fontSize: 13, fontWeight: 600,
  transition: "background 0.15s",
  minWidth: 32,
};

function ScBtn({ icon, label, tooltip, onClick, active = false, dataTest }: {
  icon: React.ReactNode; label?: string; tooltip?: string;
  onClick?: () => void; active?: boolean; dataTest?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button
        data-test={dataTest}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ ...SC_BTN, color: active ? "var(--color-accent,#eb4926)" : "#fff", background: hovered ? "#333" : "#222" }}
      >
        {icon}
        {label != null && <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>}
      </button>
      {tooltip && hovered && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
          background: "#222", color: "#fff", fontSize: 11, fontWeight: 600,
          padding: "4px 10px", borderRadius: 3, zIndex: 9999,
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)", whiteSpace: "nowrap", pointerEvents: "none",
        }}>
          {tooltip}
        </div>
      )}
    </div>
  );
}

//  Waveform for the currently playing track inside the playlist
interface PlaylistWaveformProps {
  track: Track;
  isActive: boolean;
}

function PlaylistWaveform({ track, isActive }: PlaylistWaveformProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const timeRef = useRef<HTMLDivElement | null>(null);
  const durRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (wsRef.current) { try { wsRef.current.destroy(); } catch { /* ok */ } wsRef.current = null; }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { g, pg } = buildGradients(ctx);

    let ws: WaveSurfer;

    if (isActive) {
      const currentSrc = decodeURI(audio.src);
      const targetSrc = decodeURI(track.audioUrl);

      ws = WaveSurfer.create({
        container: containerRef.current!,
        waveColor: g,
        progressColor: pg,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        backend: "MediaElement",
        media: audio,
        url: currentSrc.includes(targetSrc) || currentSrc === targetSrc
          ? audio.src
          : track.audioUrl,
      });

      setGlobalWaveSurfer(ws);
      setTrackLoadedLocally(track.id);

      ws.on("timeupdate", (currentTime: number) => {
        if (timeRef.current) timeRef.current.textContent = fmt(currentTime);
      });

      ws.on("interaction", (newTime: number) => {
        seekAudio(newTime);
      });

      ws.on("decode", (dur: number) => {
        if (durRef.current) durRef.current.textContent = fmt(dur);
      });
    } else {
      ws = WaveSurfer.create({
        container: containerRef.current!,
        waveColor: g,
        progressColor: pg,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        url: track.audioUrl,
        interact: false,
      });

      ws.on("decode", (dur: number) => {
        if (durRef.current) durRef.current.textContent = fmt(dur);
      });
    }

    wsRef.current = ws;

    return () => {
      try { ws.destroy(); } catch { /* ok */ }
      wsRef.current = null;
    };
  }, [isActive, track.id, track.audioUrl]);

  return (
    <div data-test="playlist-card-waveform" style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative", cursor: isActive ? "pointer" : "default" }}>
        <div ref={containerRef} style={{ transform: "scaleY(-1)" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.08)", pointerEvents: "none", opacity: 0.5, borderRadius: 2 }} />
        <div ref={timeRef} style={{ position: "absolute", left: 0, top: "55%", transform: "translateY(-50%)", fontSize: 11, background: "rgba(0,0,0,0.75)", color: "#fff", padding: "2px", zIndex: 10 }}>0:00</div>
        <div ref={durRef} style={{ position: "absolute", right: 0, top: "55%", transform: "translateY(-50%)", fontSize: 11, background: "rgba(0,0,0,0.75)", color: "#fff", padding: "2px", zIndex: 10 }}>0:00</div>
      </div>
    </div>
  );
}

//  Single track row inside the playlist card
interface TrackRowProps {
  track: Track;
  index: number;
  isActiveRow: boolean;
  isPlayingRow: boolean;
  onPlay: () => void;
}

function TrackRow({ track, index, isActiveRow, isPlayingRow, onPlay }: TrackRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      data-test={`playlist-card-track-row-${index}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "6px 0",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        cursor: "pointer",
        transition: "background 0.1s",
        borderRadius: 2,
        background: hovered ? "rgba(255,255,255,0.03)" : "transparent",
      }}
      onClick={onPlay}
    >
      {/* Index / play icon */}
      <div style={{ width: 22, textAlign: "center", flexShrink: 0 }}>
        {hovered || isActiveRow ? (
          <button
            data-test={`playlist-card-track-row-play-${index}`}
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: isActiveRow ? "#eb4926" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          >
            {isPlayingRow ? <FaPause size={10} /> : <FaPlay size={10} />}
          </button>
        ) : (
          <span style={{ fontSize: 12, color: "#666" }}>{index + 1}</span>
        )}
      </div>

      {/* Thumbnail */}
      <div style={{ width: 32, height: 32, borderRadius: 2, overflow: "hidden", flexShrink: 0, background: "#1a1a1a" }}>
        {track.coverUrl
          ? <img src={track.coverUrl} alt={track.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#2d2d2d,#111)" }} />
        }
      </div>

      {/* Artist & title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "#999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {track.artistName}
        </div>
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: isActiveRow ? "#eb4926" : "#fff",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {track.title}
        </div>
      </div>

      {/* Play count */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#666", fontSize: 12, flexShrink: 0 }}>
        <FaPlayCount size={9} />
        {fmtN(track.playCount)}
      </div>

      {/* Duration */}
      <div style={{ fontSize: 12, color: "#666", flexShrink: 0, minWidth: 36, textAlign: "right" }}>
        {track.duration}
      </div>
    </div>
  );
}

//  PlaylistCard (main export)
export interface PlaylistCardProps {
  playlist: Playlist;
  /** Username of whoever reposted this playlist (feed use-case) */
  repostedBy?: string;
  onCopyLink?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PlaylistCard({
  playlist,
  repostedBy,
  onCopyLink,
  onEdit,
  onDelete,
}: PlaylistCardProps) {
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();
  const { user } = useAuthStore();

  const isOwner = !!user && user.username === playlist.creatorUsername;

  const firstTrack = playlist.tracks[0] ?? null;

  // The "active" track for this card: whichever playlist track is currently playing
  const activeTrack = playlist.tracks.find((t) => t.id === currentTrack?.id) ?? null;
  const isCardActive = !!activeTrack;
  const cardIsPlaying = isCardActive && isPlaying;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(playlist.likeCount ?? 0);
  const [repostCount, setRepostCount] = useState(playlist.repostCount ?? 0);
  const [showSharePopup, setShowSharePopup] = useState(false);

  // Synthetic Track object fed to SharePopup
  const shareTrack = {
    id: `playlist-${playlist.id}`,
    title: playlist.title,
    artistName: playlist.creatorName,
    artistUsername: playlist.creatorUsername,
    coverUrl: playlist.coverUrl ?? firstTrack?.coverUrl ?? "",
    audioUrl: firstTrack?.audioUrl ?? "",
    duration: firstTrack?.duration ?? "0:00",
    waveformData: firstTrack?.waveformData,
    playCount: playlist.tracks.reduce((acc, t) => acc + (t.playCount ?? 0), 0),
    genre: firstTrack?.genre ?? "",
    likeCount: playlist.likeCount ?? 0,
    repostCount: playlist.repostCount ?? 0,
  } as unknown as Track;

  useEffect(() => {
    setLikeCount(playlist.likeCount ?? 0);
    setRepostCount(playlist.repostCount ?? 0);
  }, [playlist.likeCount, playlist.repostCount]);

  const handleLike = () => { setLiked((p) => !p); setLikeCount((p) => liked ? p - 1 : p + 1); };

  /** Play/pause the whole playlist or resume/start the first track */
  const handlePlayPause = () => {
    if (isCardActive) {
      togglePlay();
    } else if (firstTrack) {
      setTrack(firstTrack, playlist.tracks);
    }
  };

  const handleTrackPlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      setTrack(track, playlist.tracks);
    }
  };

  // Track shown in waveform: currently active track in the playlist, or first track
  const waveformTrack = activeTrack ?? firstTrack;

  return (
    <div
      data-test="playlist-card"
      style={{ display: "flex", gap: 16, padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/*Cover art with play overlay*/}
      <div
        data-test="playlist-card-cover"
        style={{ position: "relative", width: 130, height: 130, flexShrink: 0, borderRadius: 2, overflow: "hidden", background: "#1a1a1a" }}
      >
        {playlist.coverUrl
          ? <img src={playlist.coverUrl} alt={playlist.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : (
            // Mosaic fallback: first 4 track covers
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", height: "100%" }}>
              {[0, 1, 2, 3].map((i) => {
                const t = playlist.tracks[i];
                return (
                  <div key={i} style={{ background: "#1a1a1a", overflow: "hidden" }}>
                    {t?.coverUrl && (
                      <img src={t.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    )}
                  </div>
                );
              })}
            </div>
          )
        }

        {/* Play overlay */}
        <button
          data-test="playlist-card-play-btn"
          onClick={handlePlayPause}
          style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            background: cardIsPlaying ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
            border: "none", cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.45)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = cardIsPlaying ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)"; }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
            opacity: cardIsPlaying ? 1 : 0,
            transition: "opacity 0.15s",
          }}
            className="play-icon-circle"
          >
            {cardIsPlaying ? <FaPause style={{ color: "#111", fontSize: 13 }} /> : <FaPlay style={{ color: "#111", fontSize: 13, marginLeft: 2 }} />}
          </div>
        </button>

        {/* Private lock badge */}
        {playlist.isPrivate && (
          <div
            data-test="playlist-card-private-badge"
            style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.7)", borderRadius: 3, padding: "2px 6px", display: "flex", alignItems: "center", gap: 4, color: "#ccc", fontSize: 10 }}
          >
            <FaLock size={9} /> Private
          </div>
        )}
      </div>

      {/* Right column */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>

        {/* Row 1: creator / repostedBy  ·  title  ·  timestamp */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Creator line */}
            <div style={{ fontSize: 13, color: "#999", marginBottom: 2, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              <Link
                data-test="playlist-card-creator-link"
                to={`/${playlist.creatorUsername}`}
                style={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "")}
              >
                {playlist.creatorName}
              </Link>
              {repostedBy && (
                <>
                  <BiRepost style={{ fontSize: 14, opacity: 0.7 }} />
                  <Link
                    data-test="playlist-card-reposted-by-link"
                    to={`/${repostedBy}`}
                    style={{ color: "inherit", textDecoration: "none", fontWeight: 500 }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "")}
                  >
                    {repostedBy}
                  </Link>
                </>
              )}
            </div>

            {/* Playlist title */}
            <Link
              data-test="playlist-card-title-link"
              to={`/${playlist.creatorUsername}/sets/${playlist.playlistSlug ?? ""}`}
              style={{ color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 700, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-accent,#eb4926)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
            >
              {playlist.title}
            </Link>
          </div>

          {/* Timestamp + track count */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
            <span data-test="playlist-card-posted-at" style={{ fontSize: 12, color: "#999", whiteSpace: "nowrap" }}>
              {playlist.postedAt}
            </span>
            <span
              data-test="playlist-card-track-count"
              style={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.2)", color: "#e5e7eb", fontSize: 11, fontWeight: 600, padding: "3px 12px", borderRadius: 99, whiteSpace: "nowrap" }}
            >
              {playlist.trackCount} tracks
            </span>
          </div>
        </div>

        {/* Waveform (only when there is a track to preview) */}
        {waveformTrack && (
          <PlaylistWaveform
            track={waveformTrack}
            isActive={!!(activeTrack && activeTrack.id === waveformTrack.id)}
          />
        )}

        {/* Track list */}
        {playlist.tracks.length > 0 && (
          <div data-test="playlist-card-track-list" style={{ marginTop: 4 }}>
            {playlist.tracks.slice(0, 5).map((t, i) => (
              <TrackRow
                key={t.id}
                track={t}
                index={i}
                isActiveRow={currentTrack?.id === t.id}
                isPlayingRow={currentTrack?.id === t.id && isPlaying}
                onPlay={() => handleTrackPlay(t)}
              />
            ))}
            {playlist.trackCount > 5 && (
              <Link
                data-test="playlist-card-view-all-link"
                to={`/${playlist.creatorUsername}/sets/${playlist.playlistSlug ?? ""}`}
                style={{ display: "block", fontSize: 12, color: "#999", marginTop: 6, textDecoration: "none" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#999")}
              >
                View all {playlist.trackCount} tracks →
              </Link>
            )}
          </div>
        )}

        {/* Action bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ScBtn icon={<FaHeart size={13} />} label={fmtN(likeCount)} active={liked} tooltip="Like" onClick={handleLike} dataTest="playlist-card-btn-like" />
            <ScBtn icon={<BiRepost size={18} />} label={fmtN(repostCount)} tooltip="Repost" onClick={() => {}} dataTest="playlist-card-btn-repost" />
            <ScBtn icon={<HiArrowUpOnSquare size={17} />} tooltip="Share" onClick={() => setShowSharePopup(true)} dataTest="playlist-card-btn-share" />
            <ScBtn icon={<LuCopy size={14} />} tooltip="Copy Link" onClick={onCopyLink} dataTest="playlist-card-btn-copy" />
            <ScBtn icon={<MdQueueMusic size={17} />} tooltip="Add to Next up" onClick={() => firstTrack && setTrack(firstTrack, playlist.tracks)} dataTest="playlist-card-btn-add-to-next" />
          </div>

          {/* Stat: total play count (sum of tracks) */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#999", fontSize: 13 }}>
            <FaPlayCount size={10} />
            <span data-test="playlist-card-total-plays">
              {fmtN(playlist.tracks.reduce((acc, t) => acc + (t.playCount ?? 0), 0))}
            </span>
          </div>
        </div>
      </div>
      <style>{`
        [data-test="playlist-card-play-btn"]:hover .play-icon-circle {
          opacity: 1 !important;
        }
      `}</style>

      {/* Share popup */}
      {showSharePopup && (
        <SharePopup track={shareTrack} onClose={() => setShowSharePopup(false)} />
      )}
    </div>
  );
}