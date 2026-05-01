/**
 * PlaylistComponent - reusable component for Search (Playlists tab)
 */

import { useEffect, useRef, useState, useMemo } from "react";
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
import CoverImage from "@/components/UI/CoverImage";
import SharePopup from "../../pages/[username]/[trackSlug]/components/SharePopup";
import type { Track } from "../../types/track";
import { usePlayerStore } from "../../stores/player.store";
import { useAuthStore } from "../../stores/auth.store";
import { useLikesStore } from "../../stores/likes.store";
import type { PlaylistCardData } from "../UI/PlaylistCard/PlaylistCard";
import { audio, seekAudio, setGlobalWaveSurfer, setTrackLoadedLocally } from "../../services/audioService";
import * as engagementService from "../../services/engagement.service";
import { getTrackWaveform } from "../../services/track.service";
import { formatPostedAt } from "../../services/Time";
import { toast } from "sonner";


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
    let ws: WaveSurfer | null = null;
    let isMounted = true;

    const initWaveform = async () => {
      if (!containerRef.current) return;
      if (wsRef.current) { try { wsRef.current.destroy(); } catch { /* ok */ } wsRef.current = null; }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { g, pg } = buildGradients(ctx);

      const peaks =
        track.waveformData?.length > 0
          ? track.waveformData
          : await getTrackWaveform(track.id);
      if (!isMounted) return;

      const hasPeaks = peaks && peaks.length > 0;

      let parsedDur = 0;
      if (track.duration && typeof track.duration === "string") {
        const parts = track.duration.split(":");
        if (parts.length === 2) {
          parsedDur = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }
      }

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
          duration: parsedDur > 0 ? parsedDur : undefined,
        });

        setGlobalWaveSurfer(ws, track.id);
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
        // FIX 1: always set height (was missing in inactive branch)
        // FIX 2: always provide url so WaveSurfer has an audio source to decode
        //        peaks alone give shape but no duration/interaction without a url
        ws = WaveSurfer.create({
          container: containerRef.current!,
          waveColor: g,
          progressColor: pg,
          barWidth: 2,
          barGap: 0.5,
          barRadius: 2,
          height: 80,           // ← FIX 1: was missing, caused 0px render
          interact: false,
          peaks: hasPeaks ? [peaks] : undefined,
          duration: parsedDur > 0 ? parsedDur : undefined,
          url: track.audioUrl,  // ← FIX 2: was `!hasPeaks ? track.audioUrl : undefined`
        });

        ws.on("decode", (dur: number) => {
          if (durRef.current) durRef.current.textContent = fmt(dur);
        });
      }

      ws.on("error", () => { });
      wsRef.current = ws;
    };

    initWaveform();

    return () => {
      isMounted = false;
      try { if (ws) ws.destroy(); } catch { /* ok */ }
      wsRef.current = null;
    };
  }, [isActive, track.id, track.audioUrl]);

  return (
    <div data-test="playlist-component-waveform" style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative", cursor: isActive ? "pointer" : "default" }}>
        {/* FIX 3: explicit height on the DOM node — WaveSurfer needs the container
            to already have dimensions before it mounts, otherwise it collapses to 0px */}
        <div ref={containerRef} style={{ transform: "scaleY(-1)", height: 80 }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.08)", pointerEvents: "none", opacity: 0.5, borderRadius: 2 }} />
        <div ref={timeRef} style={{ position: "absolute", left: 0, top: "55%", transform: "translateY(-50%)", fontSize: 11, background: "rgba(0,0,0,0.75)", color: "#fff", padding: "2px", zIndex: 10 }}>0:00</div>
        <div ref={durRef} style={{ position: "absolute", right: 0, top: "55%", transform: "translateY(-50%)", fontSize: 11, background: "rgba(0,0,0,0.75)", color: "#fff", padding: "2px", zIndex: 10 }}>0:00</div>
      </div>
    </div>
  );
}

//  Single track row inside the playlist component
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
      data-test={`playlist-component-track-row-${index}`}
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
            data-test={`playlist-component-track-row-play-${index}`}
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
        <CoverImage src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
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

//  PlaylistComponent (main export)
export interface PlaylistComponentProps {
  playlist: Playlist;
  /** Username of whoever reposted this playlist (feed use-case) */
  repostedBy?: string;
  onCopyLink?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  urlSegment?: "sets" | "album";
  variant?: "default" | "compact";
  isEmbedded?: boolean;
  uniqueId?: string;
}

export default function PlaylistComponent({
  playlist,
  repostedBy,
  onCopyLink,
  onEdit,
  onDelete,
  urlSegment = "sets",
  variant = "default",
  isEmbedded = false,
  uniqueId,
}: PlaylistComponentProps) {
  const { currentTrack, isPlaying, setTrack, togglePlay, addTracksNext, activeSourceId } = usePlayerStore();
  const { user } = useAuthStore();

  const instanceId = useMemo(() => uniqueId ?? `playlist-instance-${Math.random().toString(36).substr(2, 9)}`, [uniqueId]);

  const isOwner = !!user && user.username === playlist.creatorUsername;

  const firstTrack = playlist.tracks[0] ?? null;

  // The "active" track for this component: whichever playlist track is currently playing
  // AND this specific instance was the one that started it.
  const isMatch = !activeSourceId || activeSourceId === instanceId;
  const activeTrack = isMatch ? (playlist.tracks.find((t) => t.id === currentTrack?.id) ?? null) : null;
  const isComponentActive = !!activeTrack;
  const componentIsPlaying = isComponentActive && isPlaying;

  const {
    isPlaylistLiked,
    togglePlaylist,
    isPlaylistReposted,
    togglePlaylistRepost,
    getItemStats,
    updateItemStats
  } = useLikesStore();

  const globalStats = getItemStats(playlist.id);
  const liked = isPlaylistLiked(playlist.id);
  const reposted = isPlaylistReposted(playlist.id) || (globalStats.isReposted ?? false);

  const likeCount = globalStats.likeCount ?? playlist.likeCount ?? 0;
  const repostCount = globalStats.repostCount ?? playlist.repostCount ?? 0;

  const [showSharePopup, setShowSharePopup] = useState(false);


  useEffect(() => {
    if (globalStats.likeCount === undefined) {
      updateItemStats(playlist.id, {
        likeCount: playlist.likeCount,
        repostCount: playlist.repostCount,
        isReposted: !!reposted
      });
    }
  }, [playlist.id]);

  const handleLike = async () => {
    if (isOwner) {
      toast.error("You cannot like your own playlist!");
      return;
    }

    const playlistData: PlaylistCardData = {
      id: playlist.id,
      title: playlist.title,
      owner: playlist.creatorName,
      coverUrl: playlist.coverUrl ?? firstTrack?.coverUrl ?? null,
      isPrivate: playlist.isPrivate || false,
      isLiked: !liked,
    };

    try {
      await togglePlaylist(playlistData);
    } catch (err) {
      console.error("Failed to toggle playlist like:", err);
    }
  };

  const handleRepost = async () => {
    if (isOwner) {
      toast.error("You cannot repost your own playlist!");
      return;
    }

    try {
      await togglePlaylistRepost(playlist.id, { repostCount: playlist.repostCount });
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast.error("Reposting is not supported by the Rythmify backend API yet!");
      } else if (err.response?.status === 401) {
        toast.error("Session expired or unauthorized. Please log out and back in.");
      } else {
        toast.error("Failed to repost playlist");
      }
      console.error("Failed to repost playlist:", err);
    }
  };

  /** Play/pause the whole playlist or resume/start the first track */
  const handlePlayPause = () => {
    if (isComponentActive) {
      togglePlay();
    } else if (firstTrack) {
      setTrack(firstTrack, playlist.tracks, 0, instanceId);
    }
  };

  const handleTrackPlay = (track: Track) => {
    if (currentTrack?.id === track.id && isComponentActive) {
      togglePlay();
    } else {
      setTrack(track, playlist.tracks, 0, instanceId);
    }
  };

  // Track shown in waveform: currently active track in the playlist, or first track
  const waveformTrack = activeTrack ?? firstTrack;

  if (variant === "compact") {
    return (
      <div
        data-test="playlist-component-compact"
        className="flex items-center gap-3 p-3 bg-[#1a1a1a] border border-white/5 rounded-lg group/compact"
      >
        <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden bg-[#333]">
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-black" />
          )}
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/compact:opacity-100 transition-opacity"
          >
            {componentIsPlaying ? <FaPause size={12} className="text-white" /> : <FaPlay size={12} className="text-white ml-0.5" />}
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/${playlist.creatorUsername}/sets/${playlist.playlistSlug}`}
            className="block text-sm font-bold text-white hover:text-[#f50] truncate"
          >
            {playlist.title}
          </Link>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Link to={`/${playlist.creatorUsername}`} className="hover:text-white truncate">
              {playlist.creatorName}
            </Link>
            <span>•</span>
            <span>{playlist.trackCount} tracks</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/40">
          <button
            onClick={handleLike}
            className={`p-1.5 hover:text-white transition-colors ${liked ? "text-[#f50]" : ""}`}
          >
            <FaHeart size={14} />
          </button>
          <button
            onClick={() => setShowSharePopup(true)}
            className="p-1.5 hover:text-white transition-colors"
          >
            <HiArrowUpOnSquare size={16} />
          </button>
        </div>
        {showSharePopup && (
          <SharePopup playlist={playlist} onClose={() => setShowSharePopup(false)} />
        )}
      </div>
    );
  }

  return (
    <div
      data-test="playlist-component"
      className="flex gap-3 sm:gap-6 py-4 sm:py-5 border-b border-white/5"
    >
      {/* Cover art with play overlay */}
      <div
        data-test="playlist-component-cover"
        className="relative w-20 h-20 sm:w-[160px] sm:h-[160px] shrink-0 rounded overflow-hidden bg-[#1a1a1a]"
      >
        <CoverImage src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover block" />

        {/* Play overlay */}
        <button
          data-test="playlist-component-play-btn"
          onClick={handlePlayPause}
          className={`absolute inset-0 flex items-center justify-center transition-background duration-150 ${componentIsPlaying ? 'bg-black/45' : 'bg-transparent hover:bg-black/45'}`}
        >
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-xl transition-opacity duration-150 play-icon-circle ${componentIsPlaying ? 'opacity-100' : 'opacity-0'}`}
          >
            {componentIsPlaying ? (
              <FaPause className="text-[#111] text-[10px] sm:text-[13px]" />
            ) : (
              <FaPlay className="text-[#111] text-[10px] sm:text-[13px] ml-0.5" />
            )}
          </div>
        </button>

        {/* Private lock badge */}
        {playlist.isPrivate && (
          <div
            data-test="playlist-component-private-badge"
            className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 bg-black/70 rounded px-1.5 py-0.5 flex items-center gap-1 text-[#ccc] text-[8px] sm:text-[10px]"
          >
            <FaLock size={8} /> Private
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="flex-1 min-w-0 flex flex-col justify-center sm:justify-start gap-1 sm:gap-1.5">

        {/* Row 1: creator / repostedBy · title · timestamp */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-0.5 sm:gap-4">
          <div className="flex-1 min-w-0">
            {/* Creator line */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/50 mb-0.5">
              <Link
                data-test="playlist-component-creator-link"
                to={`/${playlist.creatorUsername}`}
                className="font-semibold hover:text-white transition-colors truncate max-w-[120px] sm:max-w-none"
              >
                {playlist.creatorName}
              </Link>
              {repostedBy && (
                <>
                  <BiRepost size={16} className="text-[#f50] hidden sm:block" />
                  <Link
                    data-test="playlist-component-reposted-by-link"
                    to={`/${repostedBy}`}
                    className="font-medium hover:text-white transition-colors truncate hidden sm:block"
                  >
                    reposted by {repostedBy}
                  </Link>
                </>
              )}
            </div>

            {/* Playlist title */}
            <Link
              data-test="playlist-component-title-link"
              to={`/${playlist.creatorUsername}/${urlSegment}/${playlist.playlistSlug ?? ""}`}
              className="block text-sm sm:text-lg font-bold text-white hover:text-[#f50] transition-colors truncate"
            >
              {playlist.title}
            </Link>
          </div>

          {/* Timestamp + track count */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1.5 shrink-0">
            <span data-test="playlist-component-posted-at" className="text-[10px] sm:text-xs text-white/40">
              {formatPostedAt(playlist.postedAt)}
            </span>
            <span
              data-test="playlist-component-track-count"
              className="bg-white/5 border border-white/10 text-white/80 text-[8px] sm:text-[11px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"
            >
              {playlist.trackCount} tracks
            </span>
          </div>
        </div>

        {/* Waveform Area */}
        {waveformTrack && (
          <div className="hidden md:block mt-4">
            <PlaylistWaveform
              track={waveformTrack}
              isActive={!!(activeTrack && activeTrack.id === waveformTrack.id) && !isEmbedded}
            />
          </div>
        )}

        {/* Track list */}
        {playlist.tracks.length > 0 && (
          <div data-test="playlist-component-track-list" className="hidden md:block mt-4 space-y-1">
            {playlist.tracks.slice(0, 5).map((t, i) => (
              <TrackRow
                key={t.id}
                track={t}
                index={i}
                isActiveRow={!!(currentTrack?.id && t.id && currentTrack.id === t.id && isMatch)}
                isPlayingRow={!!(currentTrack?.id && t.id && currentTrack.id === t.id && isPlaying && isMatch)}
                onPlay={() => handleTrackPlay(t)}
              />
            ))}
            {playlist.trackCount > 5 && (
              <Link
                data-test="playlist-component-view-all-link"
                to={`/${playlist.creatorUsername}/${urlSegment}/${playlist.playlistSlug ?? ""}`}
                className="inline-block text-xs text-white/40 hover:text-white transition-colors mt-2"
              >
                View all {playlist.trackCount} tracks →
              </Link>
            )}
          </div>
        )}

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-y-3 mt-4">
          <div className="flex flex-wrap items-center gap-2">
            {!isOwner ? (
              <>
                <ScBtn icon={<FaHeart size={13} />} label={fmtN(likeCount)} active={liked} tooltip="Like" onClick={handleLike} dataTest="playlist-component-btn-like" />
                <ScBtn icon={<BiRepost size={18} />} label={fmtN(repostCount)} active={reposted} tooltip="Repost" onClick={handleRepost} dataTest="playlist-component-btn-repost" />
              </>
            ) : (
              <>
                <ScBtn icon={<LuPencil size={14} />} label="Edit" onClick={onEdit} tooltip="Edit Playlist" dataTest="playlist-component-btn-edit" />
                <ScBtn icon={<LuTrash2 size={14} />} label="Delete" onClick={onDelete} tooltip="Delete Playlist" dataTest="playlist-component-btn-delete" />
              </>
            )}
            <ScBtn icon={<HiArrowUpOnSquare size={17} />} tooltip="Share" onClick={() => setShowSharePopup(true)} dataTest="playlist-component-btn-share" />
            <ScBtn icon={<LuCopy size={14} />} tooltip="Copy Link" onClick={onCopyLink} dataTest="playlist-component-btn-copy" />
            <ScBtn
              icon={<MdQueueMusic size={17} />}
              tooltip="Add to Next up"
              onClick={() => {
                if (playlist.tracks.length > 0) {
                  addTracksNext(playlist.tracks);
                  toast.success(`Playlist "${playlist.title}" added to Next up`);
                }
              }}
              dataTest="playlist-component-btn-add-to-next"
            />
          </div>

          {/* Stat: total play count (sum of tracks) */}
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <FaPlayCount size={10} />
            <span data-test="playlist-component-total-plays">
              {fmtN(playlist.tracks.reduce((acc, t) => acc + (t.playCount ?? 0), 0))}
            </span>
          </div>
        </div>
      </div>
      <style>{`
        [data-test="playlist-component-play-btn"]:hover .play-icon-circle {
          opacity: 1 !important;
        }
      `}</style>

      {showSharePopup && (
        <SharePopup playlist={playlist} onClose={() => setShowSharePopup(false)} />
      )}
    </div>
  );
}