import { useState, useRef, useEffect } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { FaHeart, FaEllipsisH, FaLink, FaGlobe } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { LuListEnd, LuShare } from "react-icons/lu";
import { FaListUl as FaAddToPlaylist } from "react-icons/fa";
import SharePopup from "../../pages/[username]/[trackSlug]/components/SharePopup";
import type { Playlist } from "@/services/api/playlist/playlist.service";
import { useLikesStore } from "@/stores/likes.store";

interface PlaylistActionsProps {
  playlist: Playlist;
  onAddToNextUp?: () => void;
}

export default function PlaylistActions({
  playlist,
  onAddToNextUp,
}: PlaylistActionsProps) {
  const { isPlaylistLiked, togglePlaylist } = useLikesStore();
  const liked = isPlaylistLiked(playlist.playlist_id);

  const [shareOpen, setShareOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
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

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
      <div
        data-test="playlist-action-bar"
        className="flex flex-row items-center gap-2 py-4"
      >
        {/* Like Button */}
        <ActionButton
          onClick={() =>
            togglePlaylist({
              id: playlist.playlist_id,
              title: playlist.name,
              owner: playlist.owner_user_id,
              coverUrl: playlist.cover_image || null,
            })
          }
          active={liked}
        >
          <FaHeart
            className={`text-[14px] ${liked ? "text-[#f50]" : "text-white"}`}
          />
          {liked ? "Liked" : "Like"}
        </ActionButton>

        {/* Share Button */}
        <ActionButton onClick={() => setShareOpen(true)}
          active={shareOpen}
        >
          <LuShare className="text-[16px]" />
          Share
        </ActionButton>

        {/* Add to Next up Button */}
        <ActionButton onClick={onAddToNextUp}>
          <LuListEnd className="text-[18px]" />
          Add to Next up
        </ActionButton>

        {/* More Dropdown */}
        <div ref={moreRef} className="relative">
          <ActionButton
            onClick={() => setMoreOpen((p: boolean) => !p)}
            active={moreOpen}
          >
            <FaEllipsisH className="text-[14px]" />
            More
          </ActionButton>

          {moreOpen && (
            <div className="absolute left-0 top-full mt-1 bg-[#1a1a1a] border border-[#333] rounded-sm shadow-xl z-50 min-w-[190px] py-1">
              <DropdownItem
                icon={<FaAddToPlaylist />}
                label="Add to playlist"
                onClick={() => setMoreOpen(false)}
              />
              {!playlist.is_public && (
                <DropdownItem
                  icon={<FaGlobe />}
                  label="Make public"
                  onClick={() => setMoreOpen(false)}
                />
              )}
              <DropdownItem
                icon={<FaLink />}
                label="Copy link"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setMoreOpen(false);
                }}
              />
              <div className="my-1 border-t border-[#333]" />
              <DropdownItem
                icon={<BiRepost />}
                label="Repost"
                onClick={() => setMoreOpen(false)}
              />
            </div>
          )}
        </div>

        {shareOpen && (
          <SharePopup playlist={playlist} onClose={() => setShareOpen(false)} />
        )}
      </div>
    </Tooltip.Provider>
  );
}

function ActionButton({
  children,
  onClick,
  active = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-1.5 h-[32px]
        rounded-[4px] transition-colors duration-150 cursor-pointer
        bg-[#303030] font-bold text-[14px] 
        ${
          active
            ? "text-accent" 
            : "text-white border-transparent hover:text-[#717171]"
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}

function DropdownItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-[#ccc] hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left"
    >
      <span className="text-[14px] opacity-70">{icon}</span>
      {label}
    </button>
  );
}
