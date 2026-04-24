import { useState, useRef, useEffect } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  FaHeart,
  FaListUl as FaAddToPlaylist,
  FaEllipsisH,
  FaGlobe,
  FaLink,
} from "react-icons/fa";
import { IoSend, IoPlaySharp, IoShareOutline } from "react-icons/io5";
import { AiOutlineRetweet } from "react-icons/ai";
import { LuListEnd } from "react-icons/lu";
import SharePopup from "./SharePopup";
import type { Track } from "../../../../types/track";
import * as engagementService from "../../../../services/engagement.service";
import { postComment } from "../../../../services/track.service";
import { usePlayerStore } from "../../../../stores/player.store";
import { useAuthStore } from "../../../../stores/auth.store";

interface TrackActionsProps {
  track: Track;
  isLiked?: boolean;
  currentUserAvatar?: string;
  onAddToNextUp?: () => void;
  onComment?: (text: string, timestampSec: number) => void;
}

export default function TrackActions({
  track,
  isLiked = false,
  onAddToNextUp,
  onComment,
}: TrackActionsProps) {
  const { user } = useAuthStore();
  const currentUserAvatar = user?.avatar || "https://picsum.photos/seed/rythmify/100/100";
  
  const [liked, setLiked] = useState(isLiked);
  const [reposted, setReposted] = useState(track.isReposted || false);
  const [likeCount, setLikeCount] = useState(track.likeCount ?? 0);
  const [repostCount, setRepostCount] = useState(track.repostCount ?? 0);
  const [playCount, setPlayCount] = useState(track.playCount ?? 0);
  const [commentCount, setCommentCount] = useState(track.commentCount ?? 0);

  // Sync counts when track data changes from MSW
  useEffect(() => {
    setLikeCount(track.likeCount ?? 0);
    setRepostCount(track.repostCount ?? 0);
    setPlayCount(track.playCount ?? 0);
    setCommentCount(track.commentCount ?? 0);
    setLiked(track.isLiked || false);
    setReposted(track.isReposted || false);
  }, [track]);

  const [shareOpen, setShareOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [comment, setComment] = useState("");
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Like - calls MSW ( /api/tracks/:id/like )
  const handleLike = async () => {
    try {
      if (liked) {
        await engagementService.unlikeTrack(track.id);
        setLiked(false);
        setLikeCount((p) => p - 1);
      } else {
        await engagementService.likeTrack(track.id);
        setLiked(true);
        setLikeCount((p) => p + 1);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert("Session expired or unauthorized. Please log out and back in.");
      }
      setLiked((p) => !p);
    }
  };

  const isOwner = !!user && (user.username === track.artistUsername || user.id === track.artistId);

  // Repost - calls /api/tracks/:id/repost
  const handleRepost = async () => {
    if (isOwner) {
      alert("You cannot repost your own track!");
      return;
    }
    const wasReposted = reposted;
    // Optimistic update
    setReposted(!wasReposted);
    setRepostCount((p) => wasReposted ? Math.max(0, p - 1) : p + 1);

    try {
      if (wasReposted) {
        await engagementService.removeRepost(track.id);
      } else {
        await engagementService.repostTrack(track.id);
      }
    } catch (err: any) {
      console.error("Repost failed", err);
      // Handle generic errors
      setReposted(wasReposted);
      setRepostCount((p) => wasReposted ? p + 1 : Math.max(0, p - 1));
    }
  };

  // Comment - calls MSW (/api/tracks/:id/comments)
  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    const currentTime = usePlayerStore.getState().currentTime;
    try {
      // Internal service call if needed, but we pass it up to the parent
      onComment?.(comment.trim(), Math.floor(currentTime));
      setComment("");
    } catch {
      console.error("Comment failed");
    }
  };

  const formatCount = (n: number | undefined) =>
    n == null ? "0" : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);
  const formatExact = (n: number | undefined) =>
    n == null ? "0" : n.toLocaleString();

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
      <>
        <div data-test="track-actions-wrapper" className="flex flex-col">

          {/* ── Comment Input ── */}
          <div data-test="comment-input-row" className="flex items-center gap-3 py-3">
            <img
              src={currentUserAvatar}
              alt="Your avatar"
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
            <div className="flex-1 flex items-center gap-2">
              <input
                data-test="comment-input"
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit()}
                placeholder="Write a comment"
                className="
                  flex-1 bg-[#252525] text-[#ccc]
                  placeholder:text-[#666]
                  text-sm px-3 py-1.5 rounded-[3px]
                  border border-[#333]
                  outline-none focus:border-[#555]
                  transition-colors duration-150
                "
              />
              <button
                data-test="button-submit-comment"
                onClick={handleCommentSubmit}
                disabled={!comment.trim()}
                className="
                  w-8 h-8 flex items-center justify-center shrink-0
                  bg-[#252525] rounded-[3px]
                  border border-[#333]
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-150 cursor-pointer group
                "
              >
                <IoSend className="text-sm text-[#999] group-hover:text-white transition-colors duration-150" />
              </button>

            </div>
          </div>

          {/* Action Icons + Stats*/}
          <div
            data-test="track-action-bar"
            className="flex flex-row items-center justify-between py-2 mt-1"
          >
            <div className="flex items-center gap-3">

              {/* Like */}
              <IconButton data-test="button-like" onClick={handleLike} active={liked} tooltip="Like">
                <FaHeart className="text-[15px]" />
              </IconButton>

              {/* Repost */}
              <IconButton data-test="button-repost" onClick={handleRepost} active={reposted} tooltip="Repost">
                <AiOutlineRetweet className="text-[18px]" />
              </IconButton>

              {/* Share */}
              <IconButton data-test="button-share" onClick={() => setShareOpen(true)} tooltip="Share">
                <IoShareOutline className="text-[18px]" />
              </IconButton>

              {/* Copy Link */}
              <IconButton
                data-test="button-copy-link"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied!");
                }}
                tooltip="Copy Link"
              >
                <FaLink className="text-[14px]" />
              </IconButton>

              {/* Add to Next up */}
              <IconButton
                data-test="button-add-next-up"
                onClick={() => {
                  onAddToNextUp?.();
                  alert("Added to Next up!");
                }}
                tooltip="Add to Next up"
              >
                <LuListEnd className="text-[18px]" />
              </IconButton>

              {/* More dropdown */}
              <div ref={moreRef} className="relative">
                <IconButton
                  data-test="button-more"
                  onClick={() => setMoreOpen((p) => !p)}
                  active={moreOpen}
                  tooltip="More"
                >
                  <FaEllipsisH className="text-[13px]" />
                </IconButton>

                {moreOpen && (
                  <div
                    data-test="dropdown-more"
                    className="absolute left-0 top-full mt-1 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] shadow-[var(--shadow-md)] z-50 min-w-[190px] py-1"
                  >
                    <DropdownItem
                      icon={<FaAddToPlaylist />}
                      label="Add to playlist"
                      data-test="dropdown-item-add-playlist"
                      onClick={() => {
                        alert("Add to playlist feature is not implemented yet.");
                        setMoreOpen(false);
                      }}
                    />
                    {track.isPrivate && (
                      <DropdownItem icon={<FaGlobe />} label="Make public" data-test="dropdown-item-make-public" onClick={() => setMoreOpen(false)} />
                    )}
                    <div className="my-1 border-t border-[var(--color-border)]" />
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-[#999] text-[13px] font-medium">
              <div className="flex items-center gap-1.5 cursor-default hover:text-white transition-colors" title={`${formatExact(playCount)} plays`}>
                <IoPlaySharp className="text-[14px]" />
                <span>{formatCount(playCount)}</span>
              </div>
              <StatWithTooltip data-test="stat-like-count" tooltip={`${formatExact(likeCount)} likes`}>
                <FaHeart className="text-[12px]" />
                <span>{formatCount(likeCount)}</span>
              </StatWithTooltip>
              <StatWithTooltip data-test="stat-repost-count" tooltip={`${formatExact(repostCount)} reposts`}>
                <AiOutlineRetweet className="text-[16px]" />
                <span>{formatCount(repostCount)}</span>
              </StatWithTooltip>
              <StatWithTooltip data-test="stat-comment-count" tooltip={`${formatExact(commentCount)} comments`}>
                <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
                <span>{formatCount(commentCount)}</span>
              </StatWithTooltip>
            </div>
          </div>
        </div>

        {shareOpen && <SharePopup track={track} onClose={() => setShareOpen(false)} />}
      </>
    </Tooltip.Provider>
  );
}

// Stat Tooltip 
function StatWithTooltip({ children, tooltip, "data-test": dataTest }: {
  children: React.ReactNode; tooltip: string; "data-test"?: string;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span data-test={dataTest} className="flex items-center gap-1.5 cursor-default select-none">
          {children}
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side="top" sideOffset={6} className="
          bg-[var(--color-input-bg)] border border-[var(--color-border)]
          text-[var(--color-text-hover)] text-[11px] font-medium
          px-2.5 py-1.5 rounded-[var(--radius-xs)] shadow-[var(--shadow-md)] z-[100]
          data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95
          data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
        ">
          {tooltip}
          <Tooltip.Arrow className="fill-[var(--color-border)]" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

// Icon Button 
function IconButton({ children, onClick, active = false, tooltip, "data-test": dataTest }: {
  children: React.ReactNode; onClick?: () => void; active?: boolean; tooltip?: string; "data-test"?: string;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          data-test={dataTest}
          onClick={onClick}
          className={`
            w-8 h-6 flex items-center justify-center
            rounded-[3px] border transition-all duration-150 cursor-pointer group
            ${active 
              ? "bg-[#252525] border-[#f50] text-[#f50]" 
              : "bg-[#252525] border-[#333] text-[#ccc] hover:border-[#555] hover:text-white"}
          `}
        >
          <span className="shrink-0">
            {children}
          </span>
        </button>
      </Tooltip.Trigger>
      {tooltip && (
        <Tooltip.Portal>
          <Tooltip.Content side="bottom" sideOffset={6} className="
            bg-[var(--color-input-bg)] border border-[var(--color-border)]
            text-[var(--color-text-hover)] text-[11px] font-medium
            px-2.5 py-1.5 rounded-[var(--radius-xs)] shadow-[var(--shadow-md)] z-[100]
            data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95
            data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
          ">
            {tooltip}
            <Tooltip.Arrow className="fill-[var(--color-border)]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      )}
    </Tooltip.Root>
  );
}

// Dropdown Item 
function DropdownItem({ icon, label, onClick, danger = false, "data-test": dataTest }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; "data-test"?: string;
}) {
  return (
    <button
      data-test={dataTest}
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5
        text-xs font-medium transition-colors duration-100 cursor-pointer text-left
        ${danger ? "text-[var(--color-error)] hover:bg-red-500/10" : "text-[var(--color-text)] hover:bg-white/5 hover:text-[var(--color-text-hover)]"}
      `}
    >
      <span className="text-[13px] opacity-70">{icon}</span>
      {label}
    </button>
  );
}