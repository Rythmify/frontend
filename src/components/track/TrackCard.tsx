/**
 * TrackCard – reusable component for Profile, Feed, Search, and library
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import { FaPlay, FaPause, FaHeart, FaLock } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { LuCopy, LuPencil, LuTrash2 } from "react-icons/lu";
import { HiDotsHorizontal } from "react-icons/hi";
import { HiArrowUpOnSquare } from "react-icons/hi2";
import {
  TbRadio,
  TbChartBar,
  TbUpload,
} from "react-icons/tb";
import { MdQueueMusic, MdPlaylistAdd, MdComment } from "react-icons/md";
import { FaPlay as FaPlayCount } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";
import FollowButton from "../UI/FollowButton";
import type { Track } from "../../types/track";
import type { Comment } from "../../types/comment";
import type { TrackCardProps } from "./types";
import { usePlayerStore } from "../../stores/player.store";
import { useAuthStore } from "../../stores/auth.store";
import { useLikesStore } from "@/stores/likes.store";
import {
  audio,
  seekAudio,
  setGlobalWaveSurfer,
} from "../../services/audioService";
import SharePopup from "../../pages/[username]/[trackSlug]/components/SharePopup";
import * as engagementService from "../../services/engagement.service";
import * as trackService from "../../services/track.service";
import TrackCommentList from "../../pages/[username]/[trackSlug]/components/TrackCommentList";
import { toast } from "sonner";
import EditTrackModal from "./EditTrackModal";
import DeleteTrackModal from "./DeleteTrackModal";
import ReplaceAudioModal from "./ReplaceAudioModal";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";
import { usePlaybackAccess } from "../../hooks/usePlaybackAccess";
import type { PlaybackAccessState } from "../../utils/playbackAccess";

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
  if (!s) return 0;
  if (typeof s === 'number') return s;
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
  comment: Comment;
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
        bottom: 0,
        width: 22,
        height: 22,
        transform: "translateX(-50%)",
        cursor: "pointer",
        zIndex: 6,
      }}
    >
      <img
        src={c.author.avatar_url || "https://picsum.photos/seed/user/20/20"}
        alt={c.author.display_name}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          objectFit: "cover",
          border: "1.5px solid rgba(255,255,255,0.5)",
          opacity: hovered ? 1 : 0.8,
          transition: "opacity 0.2s"
        }}
      />
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
          <span style={{ fontWeight: 600, color: "#eb4926", marginRight: 2 }}>
            {c.author.display_name}
          </span>
          <span
            style={{
              color: "#ccc",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 100,
            }}
          >
            {c.content}
          </span>
          <span
            style={{
              color: "#666",
              fontSize: 10,
              marginLeft: 4,
              flexShrink: 0,
            }}
          >
            {fmt(c.track_timestamp)}
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
  comments: Comment[];
  pendingRatio: number | null;
  /** From `getPlaybackState` — blocks waveform seek/load when not playable/preview. */
  playbackState: PlaybackAccessState;
  /** When true (e.g. feed), waveform does not open the comment UI. */
  disableComments?: boolean;
}

function CardWaveform({
  track,
  isActive,
  onWaveformClick,
  comments,
  pendingRatio,
  playbackState,
  disableComments = false,
}: CardWaveformProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const timeRef = useRef<HTMLDivElement | null>(null);
  const durRef = useRef<HTMLDivElement | null>(null);
  const [isHover, setIsHover] = useState(false);

  const [waveformDuration, setWaveformDuration] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    if (wsRef.current) {
      try {
        wsRef.current.destroy();
      } catch { /* ok */ }
      wsRef.current = null;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let ws: WaveSurfer | null = null;
    let isMounted = true;

    const initWaveform = async () => {
      if (!ctx || !containerRef.current) return;
      const { g, pg } = buildGradients(ctx);
      const durationFallback = parseDur(track.duration);

      const peaks =
        track.waveformData?.length > 0
          ? track.waveformData
          : await trackService.getTrackWaveform(track.id);
      if (!isMounted) return;

      const hasPeaks = peaks && peaks.length > 0;

      if (isActive) {
        ws = WaveSurfer.create({
          container: containerRef.current!,
          waveColor: g,
          progressColor: pg,
          barWidth: 2,
          barGap: 0.5,
          barRadius: 2,
          height: 80,
          backend: "MediaElement",
          media: audio,
          peaks: hasPeaks ? [peaks] : undefined,
          duration: durationFallback > 0 ? durationFallback : undefined,
        });

        setGlobalWaveSurfer(ws, track.id);

        ws.on("timeupdate", (currentTime: number) => {
          if (timeRef.current) timeRef.current.textContent = fmt(currentTime);
        });

        ws.on("interaction", (newTime: number) => {
          seekAudio(newTime);
          const dur = audio.duration || durationFallback;
          onWaveformClick?.(dur > 0 ? newTime / dur : 0);
        });

        ws.on("decode", (dur) => {
          if (durRef.current) durRef.current.textContent = fmt(dur);
          setWaveformDuration(dur);
        });
      } else {
        const canInteract = playbackState !== "blocked";
        const remoteUrl =
          canInteract && !hasPeaks && track.audioUrl ? track.audioUrl : undefined;
        ws = WaveSurfer.create({
          container: containerRef.current!,
          waveColor: g,
          progressColor: pg,
          barWidth: 2,
          barGap: 0.5,
          barRadius: 2,
          height: 80,
          interact: canInteract,
          peaks: hasPeaks ? [peaks] : undefined,
          duration: durationFallback > 0 ? durationFallback : undefined,
          url: remoteUrl,
        });

        ws.on("interaction", (newTime: number) => {
          if (!canInteract) return;
          const dur = durationFallback;
          onWaveformClick?.(dur > 0 ? newTime / dur : 0);
        });

        ws.on("decode", (dur) => {
          if (durRef.current) durRef.current.textContent = fmt(dur);
          setWaveformDuration(dur);
        });
      }

      ws.on("error", () => { });
      wsRef.current = ws;
    };

    initWaveform();

    return () => {
      isMounted = false;
      try {
        if (ws) ws.destroy();
      } catch { /* ok */ }
      wsRef.current = null;
    };
  }, [isActive, track.id, track.audioUrl, playbackState]);

  const durSec = waveformDuration || parseDur(track.duration);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          position: "relative",
          cursor: "pointer",
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

        {/* Real User Avatars on Waveform */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 6,
          }}
        >
          {comments.map((c) => {
            const ratio = durSec > 0 ? c.track_timestamp / durSec : 0;
            return <CommentMarker key={c.comment_id} comment={c} ratio={ratio} />;
          })}

          {pendingRatio !== null && (
            <div
              style={{
                position: "absolute",
                left: `${pendingRatio * 100}%`,
                top: 0,
                width: 2,
                height: "100%",
                background: "rgba(235,73,38,0.6)",
                zIndex: 7,
                boxShadow: "0 0 8px rgba(235,73,38,0.4)"
              }}
            />
          )}
        </div>

        {/* Geo-blocked tracks use WaveSurfer with interact:false (no playback), so clicks never fire.
            This layer restores "click waveform to comment" using the same ratio as WaveSurfer would. */}
        {playbackState === "blocked" && !disableComments && (
          <button
            type="button"
            aria-label="Add comment at this position on the waveform"
            className="absolute inset-0 z-8 cursor-pointer border-0 bg-transparent p-0"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio =
                rect.width > 0
                  ? Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                  : 0;
              onWaveformClick(ratio);
            }}
          />
        )}
      </div>
    </div>
  );
}

// SoundCloud button style component

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

// Card Props

// Card Props (Moved to types.ts)

export default function TrackCard({
  track,
  contextQueue,
  repostedBy,
  disableComments,
  onCopyLink,
  onAddToPlaylist,
  onEdit,
  onDelete,
  onReplaceFile,
  onDistribute,
}: TrackCardProps) {
  const { currentTrack, isPlaying, setTrack, togglePlay, addNextInQueue } = usePlayerStore();
  const { user } = useAuthStore();
  const loves = useLikesStore();
  const globalStats = loves.getItemStats(track.id);
  
  const isOwner = !!user && (user.username === track.artistUsername || user.id === track.artistId);
  const isActive = currentTrack?.id === track.id;

  // Global derived values
  const isLiked = loves.isTrackLiked(track.id);
  const isReposted = loves.isTrackReposted(track.id) || (globalStats.isReposted ?? track.isReposted ?? false);
  const playCount = globalStats.playCount ?? track.playCount ?? 0;
  const likeCount = globalStats.likeCount ?? track.likeCount ?? 0;
  const repostCount = globalStats.repostCount ?? track.repostCount ?? 0;

  const [showShare, setShowShare] = useState(false);
  const [addedToQueue, setAddedToQueue] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [showCommentBar, setShowCommentBar] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showDiscussion, setShowDiscussion] = useState(false);

  // Track edit / delete modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  // Local overrides applied after a successful edit (so title/cover/genre update instantly)
  const [trackPatch, setTrackPatch] = useState<Partial<Track>>({});
  const displayTrack = { ...track, ...trackPatch };
  const playbackAccess = usePlaybackAccess(displayTrack);

  // Seed initial stats from track prop
  useEffect(() => {
    if (globalStats.likeCount === undefined) {
      loves.updateItemStats(track.id, {
        likeCount: track.likeCount,
        repostCount: track.repostCount,
        playCount: track.playCount,
        isReposted: track.isReposted
      });
    }
  }, [track.id]);

  // Fetch comments for waveform avatars
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await trackService.getTrackComments(track.id);
        setComments(data);
      } catch (err) {
        console.error("Failed to fetch track comments", err);
      }
    };
    fetchComments();
  }, [track.id]);

  // Click outside more dropdown
  const moreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    if (showMore) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMore]);

  // View counting logic
  useEffect(() => {
    let hasCounted = false;
    if (currentTrack?.id !== track.id) return;
    if (playbackAccess.isBlocked) return;

    const unsubscribe = usePlayerStore.subscribe((state) => {
      if (!hasCounted && state.currentTrack?.id === track.id) {
        const durationSec = parseDur(track.duration);
        const threshold = durationSec > 0 && durationSec < 30 ? durationSec * 0.9 : 30;
        
        if (state.currentTime >= threshold && state.currentTime > 0) {
          hasCounted = true;
          trackService.incrementPlayCount(track.id);
          loves.incrementPlayCount(track.id);
        }
      }
    });

    return () => unsubscribe();
  }, [track.id, currentTrack?.id, track.duration, playbackAccess.isBlocked]);

  const handlePlayPause = () => {
    if (playbackAccess.isBlocked) {
      toast.message("Playback unavailable in your region or for this track.");
      return;
    }
    if (isActive) {
      togglePlay();
    } else {
      if (contextQueue) {
        setTrack(track, contextQueue);
      } else {
        usePlayerStore.getState().playContext("track", track.id, track);
      }
    }
  };

  const handleWaveformClick = (ratio: number) => {
    if (!disableComments) {
      setShowCommentBar(true);
      setShowDiscussion(true);
    }
    if (playbackAccess.isBlocked) {
      return;
    }
    if (!isActive) {
      const dur = parseDur(track.duration);
      const startTime = dur * ratio;
      if (contextQueue) {
        setTrack(track, contextQueue, startTime);
      } else {
        usePlayerStore.getState().playContext("track", track.id, track, startTime);
      }
    }
  };

  const handleLike = async () => {
    // Toggle in global store
    loves.toggleTrack(track);
  };

  const handleRepost = async () => {
    if (isOwner) {
      toast.error("You cannot repost your own track!");
      return;
    }
    loves.toggleRepost(track).catch(() => {
      toast.error("Failed to repost track");
    });
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    // Captured at the second of clicking Post
    const tsSec = isActive ? Math.floor(usePlayerStore.getState().currentTime) : 0;

    try {
      const newComment = await trackService.postComment(track.id, commentText, tsSec);
      setComments(prev => [...prev, newComment]);
      setCommentText("");
      setShowCommentBar(false);
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  return (
    <div
      className="group relative flex gap-3 sm:gap-6 py-4 sm:py-6 border-b border-white/5"
      data-test="track-card"
    >
      {showShare && (
        <SharePopup track={displayTrack} onClose={() => setShowShare(false)} />
      )}

      {showEditModal && (
        <EditTrackModal
          track={displayTrack}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => {
            setTrackPatch((prev) => ({ ...prev, ...updated }));
            toast.success("Track updated successfully");
          }}
        />
      )}

      {showReplaceModal && (
        <ReplaceAudioModal
          trackId={track.id}
          trackTitle={displayTrack.title}
          onClose={() => setShowReplaceModal(false)}
          onReplaced={() => {
            toast.info("Audio replaced — track is processing", {
              description: "Playback will resume once processing completes.",
            });
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteTrackModal
          trackId={track.id}
          trackTitle={displayTrack.title}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => {
            toast.success(`"${displayTrack.title}" deleted`);
            onDelete?.();
          }}
        />
      )}

      {/* Cover Art */}
      <div className="relative w-20 h-20 sm:w-[160px] sm:h-[160px] shrink-0 overflow-hidden rounded bg-black/40">
        <img
          src={displayTrack.coverUrl || "https://picsum.photos/seed/rythmify/160/160"}
          alt={displayTrack.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {playbackAccess.isPreview && !playbackAccess.isBlocked && (
          <span
            data-test="track-card-preview-badge"
            className="absolute top-1 right-1 z-10 rounded bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-black"
          >
            Preview
          </span>
        )}
        <button
          type="button"
          onClick={handlePlayPause}
          disabled={playbackAccess.isBlocked}
          aria-disabled={playbackAccess.isBlocked}
          className={`absolute inset-0 flex items-center justify-center bg-black/30 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ${playbackAccess.isBlocked ? "cursor-not-allowed" : ""}`}
        >
          <div
            className={`w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-white shadow-xl ${playbackAccess.isBlocked ? "bg-white/25" : "bg-[#f50]"}`}
          >
            {playbackAccess.isBlocked ? (
              <FaLock size={isActive ? 12 : 18} className="sm:scale-100 scale-75" data-test="track-card-lock-icon" />
            ) : isActive && isPlaying ? (
              <FaPause size={isActive ? 12 : 18} className="sm:scale-100 scale-75" />
            ) : (
              <FaPlay size={isActive ? 12 : 18} className="translate-x-0.5 sm:scale-100 scale-75" data-test="track-card-play-icon" />
            )}
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center sm:justify-start gap-1 sm:gap-4">

        {/* Header: Artist & Title */}
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/50 mb-0.5 sm:mb-1">
              <div className="flex items-center gap-2">
                <Link to={`/${track.artistUsername}`} data-test="track-card-artist-link" className="hover:text-white transition-colors truncate">
                  {track.artistName}
                </Link>
                <FollowButton
                  username={track.artistUsername}
                  userId={track.artistId}
                  className="scale-75 origin-left py-0.5 px-2 h-5 flex items-center"
                />
              </div>
              {repostedBy && (
                <span className="hidden sm:flex items-center gap-1">
                  <BiRepost size={14} className="text-[#f50]" />
                  reposted by <span data-test="track-card-reposted-by-link" className="text-white/80">{repostedBy}</span>
                </span>
              )}
            </div>
            <Link
              to={`/${track.artistUsername}/${track.trackSlug}`}
              data-test="track-card-title-link"
              className="block text-sm sm:text-lg font-bold text-white hover:text-[#f50] transition-colors truncate"
            >
              {displayTrack.title}
            </Link>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div data-test="track-card-posted-at" className="text-[10px] sm:text-xs text-white/40 whitespace-nowrap pt-1">
              {track.postedAt}
            </div>
            {displayTrack.genre && (
              <span data-test="track-card-genre" className="bg-white/10 text-white/60 text-[9px] uppercase px-1.5 py-0.5 rounded-full">
                {displayTrack.genre}
              </span>
            )}
          </div>
        </div>

        {/* Waveform Area - Hidden on mobile for professional look */}
        <div className="hidden md:block relative">
          <CardWaveform
            track={displayTrack}
            isActive={isActive}
            comments={comments}
            pendingRatio={null}
            playbackState={playbackAccess.state}
            disableComments={disableComments}
            onWaveformClick={handleWaveformClick}
          />
        </div>

        {/* Comment Input Bar (Slides in on click) */}
        {showCommentBar && (
          <div className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-sm p-1 animate-in slide-in-from-top-2 duration-300">
            <img src={user?.avatar || "https://picsum.photos/seed/me/40/40"} className="w-8 h-8 rounded-sm object-cover" alt="Me" />
            <input
              autoFocus
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`Write a comment...`}
              className="flex-1 bg-transparent border-none outline-none text-sm text-white py-1 px-2"
              onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
            />
            <div className="flex items-center gap-2 pr-2">
              <button
                onClick={() => setShowCommentBar(false)}
                className="text-xs text-white/40 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCommentSubmit}
                className="bg-[#f50] text-white text-[11px] font-bold uppercase rounded-sm px-4 py-1.5 hover:brightness-110"
              >
                Post
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-y-3 mt-auto">
          <div className="flex flex-wrap items-center gap-2">
            {!isOwner ? (
              <>
                <ScBtn
                  icon={<FaHeart size={14} />}
                  label={fmtN(likeCount)}
                  active={isLiked}
                  onClick={handleLike}
                  tooltip="Like"
                  data-test="track-card-btn-like"
                />
                <ScBtn
                  icon={<BiRepost size={20} />}
                  label={fmtN(repostCount)}
                  active={isReposted}
                  onClick={handleRepost}
                  tooltip="Repost"
                  data-test="track-card-btn-repost"
                />
              </>
            ) : (
              <>
                <ScBtn
                  icon={<LuPencil size={14} />}
                  label="Edit"
                  onClick={() => setShowEditModal(true)}
                  tooltip="Edit Track"
                  data-test="track-card-btn-edit"
                />
                <ScBtn
                  icon={<TbUpload size={16} />}
                  label="Replace File"
                  onClick={() => setShowReplaceModal(true)}
                  tooltip="Replace Audio File"
                  data-test="track-card-btn-replace"
                />
              </>
            )}
            <ScBtn icon={<HiArrowUpOnSquare size={16} />} tooltip="Share" onClick={() => setShowShare(true)} data-test="track-card-btn-share" />
            <ScBtn icon={<LuCopy size={14} />} tooltip="Copy Link" onClick={onCopyLink} data-test="track-card-btn-copy" />
            <ScBtn
              icon={<MdQueueMusic size={16} />}
              tooltip={
                playbackAccess.isBlocked
                  ? "Playback unavailable for this track"
                  : addedToQueue
                    ? "Added!"
                    : "Add to Next up"
              }
              active={addedToQueue}
              data-test="track-card-btn-queue"
              onClick={() => {
                if (playbackAccess.isBlocked) {
                  toast.message("This track cannot be queued for playback here.");
                  return;
                }
                addNextInQueue(track);
                setAddedToQueue(true);
                toast.success(`"${track.title}" added to Next up`, {
                  description: "You can view your queue in the player",
                });
                setTimeout(() => setAddedToQueue(false), 2000);
              }}
            />

            <div className="relative" ref={moreRef}>
              <ScBtn
                icon={<HiDotsHorizontal size={16} />}
                tooltip="More"
                data-test="track-card-btn-more"
                onClick={() => setShowMore(!showMore)}
              />
              {showMore && (
                <div
                  data-test="track-card-more-dropdown"
                  className="absolute bottom-full left-0 mb-2 w-48 bg-[#222] border border-white/10 rounded shadow-xl z-50 py-1"
                >
                  <button
                    onClick={() => { setShowPlaylistModal(true); setShowMore(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <MdPlaylistAdd size={18} /> Add to playlist
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => { setShowDeleteModal(true); setShowMore(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/5 flex items-center gap-2"
                    >
                      <LuTrash2 size={16} /> Delete track
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDiscussion(!showDiscussion)}
              data-test="track-card-btn-comments"
              className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${showDiscussion ? 'text-[#f50]' : 'text-white/60 hover:text-white'}`}
            >
              <MdComment size={16} />
              <span data-test="track-card-comment-count">{comments.length}</span> Comments
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-white/40">
            <span data-test="track-card-play-count" className="flex items-center gap-1">
              <FaPlayCount size={10} />
              {fmtN(playCount)}
            </span>
          </div>
        </div>

        {/* Expandable Discussion Section */}
        {showDiscussion && (
          <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in duration-500">
            <TrackCommentList
              comments={comments}
              trackId={track.id}
              onCommentDeleted={(id) => {
                setComments(prev => prev.filter(c => String(c.comment_id) !== String(id)));
              }}
            />
          </div>
        )}
      </div>
      {showPlaylistModal && (
        <AddToPlaylistModal
          trackId={String(track.id)}
          trackTitle={displayTrack.title}
          trackCoverUrl={displayTrack.coverUrl}
          artistName={track.artistName}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
}
