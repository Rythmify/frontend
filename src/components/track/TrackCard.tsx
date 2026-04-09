/**
 * TrackCard – reusable component for Profile, Feed, Search, and library
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import { FaPlay, FaPause, FaHeart } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { LuCopy, LuPencil, LuTrash2 } from "react-icons/lu";
import { HiDotsHorizontal } from "react-icons/hi";
import { HiArrowUpOnSquare } from "react-icons/hi2";
import {
  TbRadio,
  TbArrowsExchange,
  TbChartBar,
  TbUpload,
} from "react-icons/tb";
import { MdQueueMusic, MdPlaylistAdd, MdComment } from "react-icons/md";
import { FaPlay as FaPlayCount } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";
import type { Track } from "../../types/track";
import type { TrackComment } from "./types";
import { usePlayerStore } from "../../stores/player.store";
import { useAuthStore } from "../../stores/auth.store";
import {
  audio,
  seekAudio,
  setGlobalWaveSurfer,
  setTrackLoadedLocally,
} from "../../services/audioService";
import SharePopup from "../../pages/[username]/[trackSlug]/components/SharePopup";

// helpers

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec) % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function fmtN(n?: number) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}
function parseDur(s: string) {
  const [m, sec] = s.split(":").map(Number);
  return (m || 0) * 60 + (sec || 0);
}
function buildGradients(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, 100);
  g.addColorStop(0, "#656666");
  g.addColorStop(0.7, "#656666");
  g.addColorStop(0.71, "#ffffff");
  g.addColorStop(0.72, "#ffffff");
  g.addColorStop(0.73, "#B1B1B1");
  g.addColorStop(1, "#B1B1B1");
  const pg = ctx.createLinearGradient(0, 0, 0, 100);
  pg.addColorStop(0, "#F6B094");
  pg.addColorStop(0.7, "#F6B094");
  pg.addColorStop(0.71, "#ffffff");
  pg.addColorStop(0.72, "#ffffff");
  pg.addColorStop(0.73, "#EB4926");
  pg.addColorStop(1, "#EE772F");
  return { g, pg };
}

// CommentMarker

function CommentMarker({
  comment: c,
  ratio,
}: {
  comment: TrackComment;
  ratio: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      data-test="waveform-comment-marker"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left: `${ratio * 100}%`,
        top: 0,
        width: 2,
        height: 24,
        background: "#eb4926",
        cursor: "pointer",
        zIndex: 6,
      }}
    >
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#222",
            color: "#fff",
            fontSize: 12,
            padding: "5px 10px",
            borderRadius: 4,
            zIndex: 9999,
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            maxWidth: 220,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          <img
            src={c.avatarUrl}
            alt={c.username}
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 600, color: "#eb4926", marginRight: 2 }}>
            {c.username}
          </span>
          <span
            style={{
              color: "#ccc",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 100,
            }}
          >
            {c.text}
          </span>
          <span
            style={{
              color: "#666",
              fontSize: 10,
              marginLeft: 4,
              flexShrink: 0,
            }}
          >
            {fmt(c.timestampSec)}
          </span>
        </div>
      )}
    </div>
  );
}

// CardWaveform

interface CardWaveformProps {
  track: Track;
  isActive: boolean;
  onWaveformClick: (ratio: number) => void;
  comments: TrackComment[];
  pendingRatio: number | null;
}

function CardWaveform({
  track,
  isActive,
  onWaveformClick,
  comments,
  pendingRatio,
}: CardWaveformProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const timeRef = useRef<HTMLDivElement | null>(null);
  const durRef = useRef<HTMLDivElement | null>(null);
  const [isHover, setIsHover] = useState(false);

  const cachedPeaks = useRef<number[][] | null>(null);
  const [waveformDuration, setWaveformDuration] = useState(0);
  usePlayerStore((s) => s.duration);

  useEffect(() => {
    if (!containerRef.current) return;
    if (wsRef.current) {
      try {
        wsRef.current.destroy();
      } catch {
        /* ok */
      }
      wsRef.current = null;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { g, pg } = buildGradients(ctx);

    const durationFallback = parseDur(track.duration);
    let ws: WaveSurfer;
    let extraCleanup: (() => void) | undefined;

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
        url:
          currentSrc.includes(targetSrc) || currentSrc === targetSrc
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
        const dur = audio.duration || durationFallback;
        onWaveformClick(dur > 0 ? newTime / dur : 0);
      });

      ws.on("decode", (dur) => {
        if (durRef.current) durRef.current.textContent = fmt(dur);
        setWaveformDuration(dur);
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

      ws.on("decode", (dur) => {
        if (durRef.current) durRef.current.textContent = fmt(dur);
        setWaveformDuration(dur);
        try {
          cachedPeaks.current = ws.exportPeaks();
        } catch {
          /* ok */
        }
      });
    }

    wsRef.current = ws;

    return () => {
      extraCleanup?.();
      try {
        ws.destroy();
      } catch {
        /* ok */
      }
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, track.id, track.audioUrl]);

  const durSec = waveformDuration || parseDur(track.duration);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          position: "relative",
          cursor: isActive ? "pointer" : "default",
        }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <div ref={containerRef} style={{ transform: "scaleY(-1)" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.08)",
            pointerEvents: "none",
            opacity: isHover ? 0.15 : 0.5,
            transition: "opacity 0.1s ease",
            zIndex: 5,
            borderRadius: 2,
          }}
        />
        <div
          ref={timeRef}
          style={{
            position: "absolute",
            left: 0,
            top: "55%",
            transform: "translateY(-50%)",
            fontSize: 11,
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            padding: "2px",
            zIndex: 10,
          }}
        >
          0:00
        </div>
        <div
          ref={durRef}
          style={{
            position: "absolute",
            right: 0,
            top: "55%",
            transform: "translateY(-50%)",
            fontSize: 11,
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            padding: "2px",
            zIndex: 10,
          }}
        >
          0:00
        </div>
      </div>

      {/* COMMENTS on waveform */}
      <div
        data-test="waveform-comments-bar"
        style={{ position: "relative", height: 24 }}
      >
        {comments.map((c) => {
          const ratio = durSec > 0 ? c.timestampSec / durSec : 0;
          return <CommentMarker key={c.id} comment={c} ratio={ratio} />;
        })}
        {pendingRatio !== null && (
          <div
            data-test="waveform-comment-pending-marker"
            style={{
              position: "absolute",
              left: `${pendingRatio * 100}%`,
              top: 0,
              width: 2,
              height: 24,
              background: "rgba(235,73,38,0.45)",
              zIndex: 5,
            }}
          />
        )}
      </div>
    </div>
  );
}

// SoundCloud button

const SC_BTN: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  height: 32,
  padding: "0 12px",
  background: "#222",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 4,
  cursor: "pointer",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  transition: "background 0.15s",
  minWidth: 32,
};

function ScBtn({ icon, label, tooltip, onClick, active = false, "data-test": dataTest }: {
  icon: React.ReactNode; label?: string; tooltip?: string;
  onClick?: () => void; active?: boolean; "data-test"?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button
        data-test={dataTest}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...SC_BTN,
          color: active ? "var(--color-accent,#eb4926)" : "#fff",
          background: hovered ? "#333" : "#222",
        }}
      >
        {icon}
        {label != null && (
          <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        )}
      </button>
      {tooltip && hovered && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#222",
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 3,
            zIndex: 9999,
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}

// More dropdown

function MoreDropdown({
  isOwner,
  liked,
  onLike,
  onAddToNext,
  onAddToPlaylist,
  onInsights,
  onDistribute,
  onDelete,
}: {
  isOwner: boolean;
  liked?: boolean;
  onLike?: () => void;
  onAddToNext?: () => void;
  onAddToPlaylist?: () => void;
  onInsights?: () => void;
  onDistribute?: () => void;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const ownerItems = [
    {
      label: liked ? "Unlike" : "Like",
      icon: <FaHeart size={14} />,
      action: onLike,
      danger: false,
    },
    {
      label: "Add to Next up",
      icon: <MdQueueMusic size={17} />,
      action: onAddToNext,
      danger: false,
    },
    {
      label: "Add to Playlist",
      icon: <MdPlaylistAdd size={17} />,
      action: onAddToPlaylist,
      danger: false,
    },
    {
      label: "Your Insights",
      icon: <TbChartBar size={16} />,
      action: onInsights,
      danger: false,
    },
    {
      label: "Station",
      icon: <TbRadio size={17} />,
      action: undefined,
      danger: false,
    },
    {
      label: "Distribute",
      icon: <TbUpload size={15} />,
      action: onDistribute,
      danger: false,
    },
    {
      label: "Delete Track",
      icon: <LuTrash2 size={15} />,
      action: onDelete,
      danger: true,
    },
  ];
  const visitorItems = [
    {
      label: "Add to Next up",
      icon: <MdQueueMusic size={17} />,
      action: onAddToNext,
      danger: false,
    },
    {
      label: "Add to Playlist",
      icon: <MdPlaylistAdd size={17} />,
      action: onAddToPlaylist,
      danger: false,
    },
    {
      label: "Station",
      icon: <TbRadio size={17} />,
      action: undefined,
      danger: false,
    },
  ];
  const items = isOwner ? ownerItems : visitorItems;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        data-test="track-card-btn-more"
        style={SC_BTN}
        onClick={() => setOpen((p) => !p)}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#333";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#222";
        }}
      >
        <HiDotsHorizontal size={16} />
      </button>
      {open && (
        <div
          data-test="track-card-more-dropdown"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 9999,
            background: "#1e1e1e",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 6,
            boxShadow: "0 6px 24px rgba(0,0,0,0.7)",
            minWidth: 190,
            overflow: "hidden",
          }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              data-test={`track-card-more-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => {
                item.action?.();
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                textAlign: "left",
                padding: "11px 16px",
                background: "transparent",
                border: "none",
                color: item.danger ? "#ff4444" : "#fff",
                fontSize: 14,
                cursor: "pointer",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              <span
                style={{
                  color: item.danger ? "#ff4444" : "#aaa",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// TrackCard

const EMPTY_COMMENTS: TrackComment[] = [];

export interface TrackCardProps {
  track: Track;
  comments?: TrackComment[];
  onCommentSubmit?: (text: string, timestampSec: number) => void;
  repostedBy?: string;
  onCopyLink?: () => void;
  onAddToPlaylist?: () => void;
  onEdit?: () => void;
  onReplaceFile?: () => void;
  onDelete?: () => void;
  onDistribute?: () => void;
  disableComments?: boolean;
}

export default function TrackCard({
  track,
  comments = EMPTY_COMMENTS,
  onCommentSubmit,
  repostedBy,
  onCopyLink,
  onAddToPlaylist,
  onEdit,
  onReplaceFile,
  onDelete,
  onDistribute,
  disableComments = false,
}: TrackCardProps) {
  const { currentTrack, isPlaying, setTrack, togglePlay, duration } =
    usePlayerStore();
  const { user } = useAuthStore();

  const isOwner = !!user && user.username === track.artistUsername;

  const isActive = currentTrack?.id === track.id;
  const cardIsPlaying = isActive && isPlaying;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(track.likeCount ?? 0);
  const [repostCount, setRepostCount] = useState(track.repostCount ?? 0);
  const [showShare, setShowShare] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [commentRatio, setCommentRatio] = useState<number | null>(null);
  const [localComments, setLocalComments] = useState<TrackComment[]>(comments);
  const [scrollingComment, setScrollingComment] = useState<TrackComment | null>(
    null,
  );

  const currentTime = usePlayerStore((s) => s.currentTime ?? 0);

  useEffect(() => {
    setLikeCount(track.likeCount ?? 0);
    setRepostCount(track.repostCount ?? 0);
  }, [track.likeCount, track.repostCount]);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  useEffect(() => {
    if (!isActive || isOwner || !localComments.length) {
      setScrollingComment(null);
      return;
    }
    const match =
      [...localComments]
        .filter((c) => c.timestampSec <= currentTime + 0.5)
        .sort((a, b) => b.timestampSec - a.timestampSec)[0] ?? null;
    setScrollingComment(match);
  }, [currentTime, isActive, isOwner, localComments]);

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    const durSec =
      isActive && duration > 0 ? duration : parseDur(track.duration);
    const tsSec = (commentRatio ?? 0) * durSec;
    const c: TrackComment = {
      id: Date.now(),
      userId: user?.id ?? "anon",
      username: user?.displayName ?? user?.username ?? "You",
      avatarUrl:
        user?.avatar ??
        `https://picsum.photos/seed/${user?.username ?? "u"}/40/40`,
      text: commentText.trim(),
      timestampSec: tsSec,
    };
    setLocalComments((p) => [...p, c]);
    onCommentSubmit?.(c.text, tsSec);
    setCommentText("");
    setCommentRatio(null);
  };

  const handlePlayPause = () => {
    if (isActive) togglePlay();
    else setTrack(track);
  };

  const handleWaveformClick = useCallback(
    (ratio: number) => {
      if (!disableComments) setCommentRatio(ratio);
      // Only load the track if it isn't active yet (inactive card clicked).
      // When the track IS already active, CardWaveform already seeked
      // audio.currentTime directly — touching the store here would call
      // audio.play() via the subscriber and restart playback from scratch.
      if (!isActive) {
        setTrack(track);
      }
    },
    [isActive, track, setTrack],
  );

  const handleLike = () => {
    setLiked((p) => !p);
    setLikeCount((p) => (liked ? p - 1 : p + 1));
  };

  return (
    <>
      {showShare && (
        <SharePopup track={track} onClose={() => setShowShare(false)} />
      )}

      <div
        data-test="track-card"
        style={{
          display: "flex",
          gap: 16,
          padding: "20px 0",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Album art */}
        <div
          data-test="track-card-cover"
          style={{
            width: 130,
            height: 130,
            flexShrink: 0,
            borderRadius: 2,
            overflow: "hidden",
            background: "#1a1a1a",
          }}
        >
          {track.coverUrl ? (
            <img
              src={track.coverUrl}
              alt={track.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg,#2d2d2d,#111)",
              }}
            />
          )}
        </div>

        {/* Right column */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {/* Row 1: play · artist / title · genre + timestamp */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <button
              data-test="track-card-play-btn"
              onClick={handlePlayPause}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#fff",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 2,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "#e0e0e0")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "#fff")
              }
            >
              {cardIsPlaying ? (
                <FaPause style={{ color: "#111", fontSize: 12 }} />
              ) : (
                <FaPlay
                  style={{ color: "#111", fontSize: 12, marginLeft: 2 }}
                />
              )}
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  color: "#999",
                  marginBottom: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  flexWrap: "wrap",
                }}
              >
                <Link
                  data-test="track-card-artist-link"
                  to={`/${track.artistUsername}`}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "#fff")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "")
                  }
                >
                  {track.artistName}
                </Link>
                {repostedBy && (
                  <>
                    <BiRepost style={{ fontSize: 14, opacity: 0.7 }} />
                    <Link
                      data-test="track-card-reposted-by-link"
                      to={`/${repostedBy}`}
                      style={{
                        color: "inherit",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "#fff")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "")
                      }
                    >
                      {repostedBy}
                    </Link>
                  </>
                )}
              </div>
              <Link
                data-test="track-card-title-link"
                to={`/${track.artistUsername}/${track.trackSlug ?? ""}`}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 700,
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--color-accent,#eb4926)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#fff")
                }
              >
                {track.title}
              </Link>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 6,
                flexShrink: 0,
              }}
            >
              <span
                data-test="track-card-posted-at"
                style={{ fontSize: 12, color: "#999", whiteSpace: "nowrap" }}
              >
                {track.postedAt}
              </span>
              {track.genre && (
                <span
                  data-test="track-card-genre"
                  style={{
                    background: "#1c1c1c",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#e5e7eb",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 12px",
                    borderRadius: 99,
                    whiteSpace: "nowrap",
                  }}
                >
                  # {track.genre}
                </span>
              )}
            </div>
          </div>

          {/* Scrolling comment banner */}
          {!isOwner && scrollingComment && cardIsPlaying && (
            <div
              data-test="track-card-scrolling-comment"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "#ccc",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              <img
                src={scrollingComment.avatarUrl}
                alt={scrollingComment.username}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "#eb4926", fontWeight: 600 }}>
                {scrollingComment.username}:
              </span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {scrollingComment.text}
              </span>
            </div>
          )}

          {/* Waveform */}
          <CardWaveform
            track={track}
            isActive={isActive}
            onWaveformClick={handleWaveformClick}
            comments={localComments}
            pendingRatio={commentRatio}
          />

          {/* Comment bar — only visible after clicking the waveform */}
          {!disableComments && commentRatio !== null && (
            <div
              data-test="track-card-comment-bar"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 2,
              }}
            >
              <img
                src={
                  user?.avatar ??
                  `https://picsum.photos/seed/${user?.username ?? "u"}/40/40`
                }
                alt="You"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <input
                data-test="track-card-comment-input"
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCommentSubmit();
                  if (e.key === "Escape") {
                    setCommentText("");
                    setCommentRatio(null);
                  }
                }}
                placeholder="Write a comment…"
                autoFocus
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 4,
                  color: "#fff",
                  fontSize: 13,
                  padding: "5px 10px",
                  outline: "none",
                }}
              />
              <button
                data-test="track-card-comment-submit"
                onClick={handleCommentSubmit}
                style={{ ...SC_BTN, padding: "0 10px", background: "#222" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#333";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#222";
                }}
              >
                <IoSend size={15} />
              </button>
              <button
                data-test="track-card-comment-cancel"
                onClick={() => {
                  setCommentText("");
                  setCommentRatio(null);
                }}
                style={{
                  ...SC_BTN,
                  padding: "0 10px",
                  background: "#222",
                  color: "#999",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#333";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#222";
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Action bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isOwner ? (
                <>
                  <ScBtn
                    icon={<HiArrowUpOnSquare size={17} />}
                    tooltip="Share"
                    onClick={() => setShowShare(true)}
                    data-test="track-card-btn-share"
                  />
                  <ScBtn
                    icon={<LuCopy size={14} />}
                    tooltip="Copy Link"
                    onClick={onCopyLink}
                    data-test="track-card-btn-copy"
                  />
                  <ScBtn
                    icon={<TbArrowsExchange size={17} />}
                    tooltip="Replace File"
                    onClick={onReplaceFile}
                    data-test="track-card-btn-replace"
                  />
                  <ScBtn
                    icon={<LuPencil size={13} />}
                    tooltip="Edit"
                    onClick={onEdit}
                    data-test="track-card-btn-edit"
                  />
                  <MoreDropdown
                    isOwner
                    liked={liked}
                    onLike={handleLike}
                    onAddToNext={() => {}}
                    onAddToPlaylist={onAddToPlaylist}
                    onInsights={() => {}}
                    onDistribute={onDistribute}
                    onDelete={onDelete}
                  />
                </>
              ) : (
                <>
                  <ScBtn
                    icon={<FaHeart size={13} />}
                    label={fmtN(likeCount)}
                    active={liked}
                    tooltip="Like"
                    onClick={handleLike}
                    data-test="track-card-btn-like"
                  />
                  <ScBtn
                    icon={<BiRepost size={18} />}
                    label={fmtN(repostCount)}
                    tooltip="Repost"
                    onClick={() => {}}
                    data-test="track-card-btn-repost"
                  />
                  <ScBtn
                    icon={<HiArrowUpOnSquare size={17} />}
                    tooltip="Share"
                    onClick={() => setShowShare(true)}
                    data-test="track-card-btn-share"
                  />
                  <ScBtn
                    icon={<LuCopy size={14} />}
                    tooltip="Copy Link"
                    onClick={onCopyLink}
                    data-test="track-card-btn-copy"
                  />
                  <MoreDropdown
                    isOwner={false}
                    onAddToNext={() => {}}
                    onAddToPlaylist={onAddToPlaylist}
                  />
                </>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span
                data-test="track-card-play-count"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "#999",
                  fontSize: 13,
                }}
              >
                <FaPlayCount size={10} />
                {fmtN(track.playCount)}
              </span>
              <span
                data-test="track-card-comment-count"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "#999",
                  fontSize: 13,
                }}
              >
                <MdComment size={13} />
                {fmtN(track.commentCount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
