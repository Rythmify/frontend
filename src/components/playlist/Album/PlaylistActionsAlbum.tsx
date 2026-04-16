import { useState, useRef, useEffect } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { FaHeart, FaListUl as FaAddToPlaylist } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { LuListEnd, LuShare, LuCopy } from "react-icons/lu";
import SharePopup from "../../../pages/[username]/[trackSlug]/components/SharePopup";
import {
  repostPlaylist,
  removePlaylistRepost,
  type Playlist,
} from "@/services/api/playlist/playlist.service";
import { useLikesStore } from "@/stores/likes.store";
import { useAuthStore } from "@/stores/auth.store";

interface PlaylistActionsProps {
  playlist: Playlist;
  onAddToNextUp?: () => void;
  onPlaylistUpdated?: (updated: Playlist) => void;
}

export default function PlaylistActions({
  playlist,
  onAddToNextUp,
  onPlaylistUpdated,
}: PlaylistActionsProps) {
  const { isPlaylistLiked, togglePlaylist } = useLikesStore();
  const { user } = useAuthStore(); // Current logged-in user

  const liked = isPlaylistLiked(playlist.playlist_id);
  const isOwner = user?.id === playlist.owner_user_id;

  const [reposted, setReposted] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const handleRepost = async () => {
    if (isOwner) {
      alert("You cannot repost your own playlist."); 
      return;
    }
    try {
      if (reposted) {
        await removePlaylistRepost(playlist.playlist_id); 
      } else {
        await repostPlaylist(playlist.playlist_id); 
      }
      setReposted(!reposted);
    } catch (err) {
      console.error("Failed to update repost status:", err);
    }
  };

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
      <div
        className="flex flex-row items-center gap-2 py-4"
        data-test="album-playlist-actions"
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
          label="Like"
          dataTest="album-action-like"
        >
          <FaHeart
            className={`text-[14px] ${liked ? "text-accent" : "text-white"}`}
          />
          
        </ActionButton>

        {/* Repost Button toggles POST/DELETE */}
        <ActionButton
          onClick={handleRepost}
          active={reposted}
          className={isOwner ? "opacity-50 cursor-not-allowed" : ""}
          label="Repost"
          dataTest="album-action-repost"
        >
          <BiRepost
            className={`text-[20px] ${reposted ? "text-accent" : "text-white"}`}
          />
        </ActionButton>

        {/* Share Button */}
        <ActionButton
          onClick={() => setShareOpen(true)}
          active={shareOpen}
          label="Share"
          dataTest="album-action-share"
        >
          <LuShare className="text-[16px]" />
        </ActionButton>
        
        {/*Copy */}
        <ActionButton
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          label="Copy link"
          dataTest="album-action-copy-link"
        >
          <LuCopy className="text-[16px]" />
        </ActionButton>

        {/* Add to Next up */}
        <ActionButton
          onClick={onAddToNextUp}
          label="Add to Next up"
          dataTest="album-action-add-to-next-up"
        >
          <LuListEnd className="text-[18px]" />
        </ActionButton>

        {shareOpen && (
          <SharePopup playlist={playlist} onClose={() => setShareOpen(false)} />
        )}
      </div>
    </Tooltip.Provider>
  );
}

// ── Components ───────────────────────────────────────────────────────────────

function ActionButton({
  children,
  onClick,
  active = false,
  className = "",
  label, 
  dataTest,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  label?: string; 
  dataTest?: string;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          data-test={dataTest}
          onClick={onClick}
          className={`
            flex items-center gap-2 px-3 py-1.5 h-[32px]
            rounded-[4px] transition-colors duration-150 cursor-pointer
            bg-[#303030] font-bold text-[14px] 
            ${active ? "text-accent" : "text-white border-transparent hover:text-[#717171]"}
            ${className}
          `}
        >
          {children}
        </button>
      </Tooltip.Trigger>

      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          align="center"
          sideOffset={5}
          className="bg-[#303030] text-white text-[12px] px-2 py-1 rounded shadow-lg z-[9999] animate-in fade-in zoom-in duration-200"
        >
          {label}
          <Tooltip.Arrow className="fill-[#303030]" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
