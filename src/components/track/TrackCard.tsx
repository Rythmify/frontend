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
  TbChartBar,
  TbUpload,
} from "react-icons/tb";
import { MdQueueMusic, MdPlaylistAdd, MdComment } from "react-icons/md";
import { FaPlay as FaPlayCount } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";
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
  setTrackLoadedLocally,
} from "../../services/audioService";
import SharePopup from "../../pages/[username]/[trackSlug]/components/SharePopup";
import * as engagementService from "../../services/engagement.service";
import * as trackService from "../../services/track.service";
import TrackCommentList from "../../pages/[username]/[trackSlug]/components/TrackCommentList";

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
          barGap: 0.5,
          barRadius: 2,
          height: 80,
          interact: true, // Enable interaction even if not active so user can click waveform to comment
          peaks: hasPeaks ? [peaks] : undefined,
          duration: durationFallback > 0 ? durationFallback : undefined,
          url: !hasPeaks ? track.audioUrl : undefined,
        });

        ws.on("interaction", (newTime: number) => {
          const dur = durationFallback;
          onWaveformClick(dur > 0 ? newTime / dur : 0);
        });

        ws.on("decode", (dur) => {
          if (durRef.current) durRef.current.textContent = fmt(dur);
          setWaveformDuration(dur);
        });
      }

      ws.on("error", () => {});
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
  }, [isActive, track.id, track.audioUrl]);

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
  repostedBy,
  disableComments,
  onCopyLink,
  onAddToPlaylist,
  onEdit,
  onDelete,
  onReplaceFile,
  onDistribute,
}: TrackCardProps) {
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();
  const { user } = useAuthStore();
  const loves = useLikesStore();

  const isOwner = !!user && (user.username === track.artistUsername || user.id === track.artistId);
  const isActive = currentTrack?.id === track.id;

  const [likeCount, setLikeCount] = useState(track.likeCount ?? 0);
  const [repostCount, setRepostCount] = useState(track.repostCount ?? 0);
  const [playCount, setPlayCount] = useState(track.playCount ?? 0);
  const [isLiked, setIsLiked] = useState(false); // Initially from backend normalize
  const [isReposted, setIsReposted] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [showCommentBar, setShowCommentBar] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showDiscussion, setShowDiscussion] = useState(false);

  // Sync state with track props
  useEffect(() => {
    setIsLiked(track.isLiked || false);
    setIsReposted(track.isReposted || false);
    setLikeCount(track.likeCount || 0);
    setRepostCount(track.repostCount || 0);
    setPlayCount(track.playCount || 0);
  }, [track]);

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

  const handlePlayPause = () => {
    if (isActive) {
      togglePlay();
    } else {
      setTrack(track);
      setPlayCount(prev => prev + 1); // Optimistic increment
    }
  };

  const handleWaveformClick = (ratio: number) => {
    if (!disableComments) {
      setShowCommentBar(true);
    }
    if (!isActive) {
      setTrack(track);
      setPlayCount(prev => prev + 1); // Optimistic increment
    }
  };

  const handleLike = async () => {
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
    
    try {
      if (wasLiked) await engagementService.unlikeTrack(track.id);
      else await engagementService.likeTrack(track.id);
    } catch (err) {
      setIsLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error("Like toggle failed", err);
    }
  };

  const handleRepost = async () => {
    if (isOwner) {
      alert("You cannot repost your own track!");
      return;
    }
    const wasReposted = isReposted;
    setIsReposted(!wasReposted);
    setRepostCount(prev => wasReposted ? prev - 1 : prev + 1);

    try {
      if (wasReposted) await engagementService.removeRepost(track.id);
      else await engagementService.repostTrack(track.id);
    } catch (err) {
      setIsReposted(wasReposted);
      setRepostCount(prev => wasReposted ? prev - 1 : prev + 1);
      console.error("Repost toggle failed", err);
    }
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
      className="group relative flex gap-6 py-6 border-b border-white/5"
      data-test="track-card"
    >
      {showShare && (
        <SharePopup track={track} onClose={() => setShowShare(false)} />
      )}

      {/* Cover Art */}
      <div className="relative w-[160px] h-[160px] shrink-0 overflow-hidden rounded bg-black/40">
        <img 
          src={track.coverUrl || "https://picsum.photos/seed/rythmify/160/160"} 
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <button 
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-12 h-12 flex items-center justify-center bg-[#f50] rounded-full text-white shadow-xl">
            {isActive && isPlaying ? <FaPause size={18} /> : <FaPlay size={18} className="translate-x-0.5" />}
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        
        {/* Header: Artist & Title */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                <Link to={`/${track.artistUsername}`} className="hover:text-white transition-colors">
                  {track.artistName}
                </Link>
                {repostedBy && (
                  <span className="flex items-center gap-1">
                    <BiRepost size={14} className="text-[#f50]" />
                    reposted by <span className="text-white/80">{repostedBy}</span>
                  </span>
                )}
             </div>
             <Link 
              to={`/${track.artistUsername}/${track.trackSlug}`}
              className="block text-lg font-bold text-white hover:text-[#f50] transition-colors overflow-hidden text-overflow-ellipsis whitespace-nowrap"
             >
               {track.title}
             </Link>
          </div>
          <div className="text-xs text-white/40 whitespace-nowrap pt-1">
            {track.postedAt}
          </div>
        </div>

        {/* Waveform Area */}
        <div className="relative">
          <CardWaveform 
            track={track}
            isActive={isActive}
            comments={comments}
            pendingRatio={null}
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
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <ScBtn 
              icon={<FaHeart size={14} />} 
              label={fmtN(likeCount)} 
              active={isLiked} 
              onClick={handleLike} 
              tooltip="Like"
            />
            <ScBtn 
              icon={<BiRepost size={20} />} 
              label={fmtN(repostCount)} 
              active={isReposted} 
              onClick={handleRepost} 
              tooltip="Repost"
            />
            <ScBtn icon={<HiArrowUpOnSquare size={16} />} tooltip="Share" onClick={() => setShowShare(true)} />
            <ScBtn icon={<LuCopy size={14} />} tooltip="Copy Link" onClick={onCopyLink} />
            <button 
               onClick={() => setShowDiscussion(!showDiscussion)}
               className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${showDiscussion ? 'text-[#f50]' : 'text-white/60 hover:text-white'}`}
            >
              <MdComment size={16} />
              {comments.length} Comments
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1">
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
    </div>
  );
}
