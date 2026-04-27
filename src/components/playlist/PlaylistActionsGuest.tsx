import { useEffect, useRef, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { FaHeart } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { LuListEnd, LuShare, LuCopy } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import SharePopup from "@/pages/[username]/[trackSlug]/components/SharePopup";
import type { Playlist } from "@/services/api/playlist/playlist.service";
import { useLikesStore } from "@/stores/likes.store";

interface PlaylistActionsProps {
  playlist: Playlist;
  onAddToNextUp?: () => void;
}

export default function PlaylistActionsGuest({
  playlist,
  onAddToNextUp,
}: PlaylistActionsProps) {
  const { isPlaylistLiked } = useLikesStore();
  const liked = isPlaylistLiked(playlist.playlist_id);

  const [shareOpen, setShareOpen] = useState(false);
  const [addedToQueue, setAddedToQueue] = useState(false);
  const queueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const handleAuthRequiredAction = () => {
    navigate("/signin");
  };

  const handleAddToNextUp = () => {
    if (!onAddToNextUp) return;

    onAddToNextUp();
    setAddedToQueue(true);

    if (queueTimerRef.current) {
      clearTimeout(queueTimerRef.current);
    }

    queueTimerRef.current = setTimeout(() => {
      setAddedToQueue(false);
      queueTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (queueTimerRef.current) clearTimeout(queueTimerRef.current);
    };
  }, []);

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
      <div
        className="flex flex-row items-center gap-4 py-4"
        data-test="album-playlist-actions"
      >
        <ActionButton
          onClick={handleAuthRequiredAction}
          active={liked}
          label="Like"
          dataTest="album-action-like"
        >
          <FaHeart
            className={`text-[14px] ${liked ? "text-accent" : "text-white"}`}
          />
        </ActionButton>

        <ActionButton
          onClick={handleAuthRequiredAction}
          active={false}
          label="Repost"
          dataTest="album-action-repost"
        >
          <BiRepost className="text-[20px] text-white" />
        </ActionButton>

        <ActionButton
          onClick={() => setShareOpen(true)}
          active={shareOpen}
          label="Share"
          dataTest="album-action-share"
        >
          <LuShare className="text-[16px]" />
        </ActionButton>

        <ActionButton
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          label="Copy link"
          dataTest="album-action-copy-link"
        >
          <LuCopy className="text-[16px]" />
        </ActionButton>

        <ActionButton
          onClick={handleAddToNextUp}
          active={addedToQueue}
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
