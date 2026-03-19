import { useState, useRef, useEffect } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  FaHeart,
  FaListUl as FaAddToPlaylist,
  FaEllipsisH,
  FaGlobe,
  FaLink,
} from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { LuListEnd } from "react-icons/lu";
import { HiUpload } from "react-icons/hi";
import { IoSend } from "react-icons/io5";
import SharePopup from "./SharePopup";
import type { Track } from "../../../../types/track";
import { likeTrack, unlikeTrack, repostTrack, postComment } from "../../../../services/mocks/Track.service";

interface TrackActionsProps {
  track: Track;
  isLiked?: boolean;
  currentUserAvatar?: string;
  onAddToNextUp?: () => void;
  onComment?: (text: string) => void;
}

export default function TrackActions({
  track,
  isLiked = false,
  currentUserAvatar = "https://picsum.photos/seed/shahd/100/100",
  onAddToNextUp,
  onComment,
}: TrackActionsProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(track.likeCount ?? 0);
  const [repostCount, setRepostCount] = useState(track.repostCount ?? 0);

  // Sync counts when track data changes from MSW
  useEffect(() => {
    setLikeCount(track.likeCount ?? 0);
    setRepostCount(track.repostCount ?? 0);
  }, [track.likeCount, track.repostCount]);
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
        const res = await unlikeTrack(track.id);
        setLiked(false);
        setLikeCount(res.likeCount);
      } else {
        const res = await likeTrack(track.id);
        setLiked(true);
        setLikeCount(res.likeCount);
      }
    } catch {
      // optimistic fallback
      setLiked((p) => !p);
    }
  };

  // Repost - calls MSW (/api/tracks/:id/repost) 
  const handleRepost = async () => {
    try {
      const res = await repostTrack(track.id);
      setRepostCount(res.repostCount);
    } catch {
      console.error("Repost failed");
    }
  };

  // Comment - calls MSW (/api/tracks/:id/comments) => not sure i should implement it now or later 
//   const handleCommentSubmit = async () => {
//     if (!comment.trim()) return;
//     try {
//       await postComment(track.id, comment.trim(), 0);
//       onComment?.(comment.trim());
//       setComment("");
//     } catch {
//       console.error("Comment failed");
//     }
//   };

  const formatCount = (n: number | undefined) =>
    n == null ? "0" : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);
  const formatExact = (n: number | undefined) =>
    n == null ? "0" : n.toLocaleString();

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
      <>
        <div data-test="track-actions-wrapper" className="flex flex-col">

          {/* ── Comment Input ── */}
          {/* <div data-test="comment-input-row" className="flex items-center gap-3 py-3">
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
                  flex-1 bg-[var(--color-input-bg)] text-[var(--color-text-hover)]
                  placeholder:text-[var(--color-text-muted)]
                  text-sm px-4 py-2.5 rounded-[var(--radius-sm)]
                  border border-transparent
                  outline-none focus:border-[var(--color-border-light)]
                  transition-colors duration-150
                "
              />
              <button
                data-test="button-submit-comment"
                onClick={handleCommentSubmit}
                disabled={!comment.trim()}
                className="
                  w-10 h-10 flex items-center justify-center shrink-0
                  bg-[var(--color-input-bg)] rounded-[var(--radius-sm)]
                  border border-transparent
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-150 cursor-pointer group
                "
              >
                <IoSend className="text-base text-[var(--color-text-muted)] group-hover:text-white transition-colors duration-150" />
              </button>
            </div>
          </div> */}

          {/* Action Icons + Stats*/}
          <div
            data-test="track-action-bar"
            className="flex flex-row items-center justify-between py-2 border-b border-[var(--color-border)]"
          >
            <div className="flex items-center gap-3">

              {/* Like */}
              <IconButton data-test="button-like" onClick={handleLike} active={liked} tooltip="Like">
                <FaHeart className="text-[15px]" />
              </IconButton>

              {/* Share */}
              <IconButton data-test="button-share" onClick={() => setShareOpen(true)} tooltip="Share">
                <HiUpload className="text-[17px]" />
              </IconButton>

              {/* Add to Next up */}
              <IconButton data-test="button-add-next-up" onClick={onAddToNextUp} tooltip="Add to Next up">
                <LuListEnd className="text-[17px]" />
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
                    <DropdownItem icon={<FaAddToPlaylist />} label="Add to playlist" data-test="dropdown-item-add-playlist" onClick={() => setMoreOpen(false)} />
                    {track.isPrivate && (
                      <DropdownItem icon={<FaGlobe />} label="Make public" data-test="dropdown-item-make-public" onClick={() => setMoreOpen(false)} />
                    )}
                    <DropdownItem
                      icon={<FaLink />}
                      label="Copy link"
                      data-test="dropdown-item-copy-link"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setMoreOpen(false);
                      }}
                    />
                    <DropdownItem
                      icon={<BiRepost />}
                      label="Repost"
                      data-test="dropdown-item-repost"
                      onClick={() => {
                        handleRepost();
                        setMoreOpen(false);
                      }}
                    />
                    <div className="my-1 border-t border-[var(--color-border)]" />
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-[var(--color-text-muted)] text-xs">
              <StatWithTooltip data-test="stat-like-count" tooltip={`${formatExact(likeCount)} likes`}>
                <FaHeart className="text-[11px]" />
                {formatCount(likeCount)}
              </StatWithTooltip>
              <StatWithTooltip data-test="stat-repost-count" tooltip={`${formatExact(repostCount)} reposts`}>
                <BiRepost className="text-[15px]" />
                {repostCount}
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
          className="
            w-10 h-10 flex items-center justify-center
            rounded-[var(--radius-sm)] border
            bg-[var(--color-input-bg)] border-[var(--color-border)]
            transition-colors duration-150 cursor-pointer group
          "
        >
          <span className={`transition-colors duration-150 ${active ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)] group-hover:text-white"}`}>
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