import { useState, useRef, useEffect } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { FaHeart, FaListUl as FaAddToPlaylist } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { LuListEnd, LuShare, LuCopy } from "react-icons/lu";
import SharePopup from "../../../pages/[username]/[trackSlug]/components/SharePopup";
import {
  convertPlaylist,
  type Playlist,
  type PlaylistTrackItem,
  repostPlaylist,
  removePlaylistRepost,
} from "@/services/api/playlist/playlist.service";
import { useLikesStore } from "@/stores/likes.store";
import { useAuthStore } from "@/stores/auth.store";
import { usePlayerStore } from "@/stores/player.store";
import type { Track } from "@/types/track";

interface PlaylistActionsProps {
  playlist: Playlist & { tracks?: PlaylistTrackItem[] };
  onAddToNextUp?: () => void;
  onPlaylistUpdated?: (updated: Playlist) => void;
  engagementKind?: "album" | "genre" | "playlist";
  backendPlaylistExists?: boolean;
}

export default function PlaylistActionsAlbum({
  playlist,
  onAddToNextUp,
  engagementKind = "album",
  backendPlaylistExists = false,
}: PlaylistActionsProps) {
  const {
    isPlaylistLiked,
    isGenreLiked,
    togglePlaylist,
    toggleGenre,
  } = useLikesStore();
  const { addToQueue } = usePlayerStore();
  const { user } = useAuthStore(); // Current logged-in user

  const liked =
    engagementKind === "genre"
      ? isGenreLiked(playlist.playlist_id)
      : isPlaylistLiked(playlist.playlist_id)
        
  const isOwner = user?.id === playlist.owner_user_id;

  const [reposted, setReposted] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [addedToQueue, setAddedToQueue] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const queueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const parseDuration = (duration?: number | null): string => {
    if (typeof duration !== "number" || Number.isNaN(duration)) return "0:00";
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const buildPlaylistLikePayload = () => ({
    id: playlist.playlist_id,
    title: playlist.name,
    owner: playlist.owner_user_id,
    ownerUsername: playlist.owner_user_id,
    slug: playlist.slug ?? null,
    coverUrl: playlist.cover_image ?? null,
    isPrivate: !playlist.is_public,
    isLiked: true,
    isAlbumView: engagementKind === "album",
  });

  const toPlayerTrack = (track: PlaylistTrackItem): Track => ({
    id: track.track_id,
    title: track.title ?? "Untitled track",
    artistName: track.artist_name ?? "Unknown Artist",
    artistUsername: track.artist_username ?? "",
    coverUrl: track.cover_image ?? "",
    genre: "",
    likeCount: 0,
    repostCount: 0,
    playCount: track.play_count ?? 0,
    commentCount: 0,
    duration: parseDuration(track.duration),
    postedAt: track.added_at ?? "",
    waveformData: [],
    audioUrl: track.audio_url ?? "",
    isPrivate: !track.is_public,
  });

  const handleRepost = async () => {
    if (engagementKind === "genre" || isOwner) {
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

  const handleAddToNextUp = () => {
    const tracks = playlist.tracks?.map(toPlayerTrack) ?? [];
    if (!tracks.length && !onAddToNextUp) return;

    tracks.forEach((track) => addToQueue(track));
    onAddToNextUp?.();
    setAddedToQueue(true);

    if (queueTimerRef.current) {
      clearTimeout(queueTimerRef.current);
    }

    queueTimerRef.current = setTimeout(() => {
      setAddedToQueue(false);
      queueTimerRef.current = null;
    }, 3000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);

      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => {
        setCopySuccess(false);
        copyTimerRef.current = null;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy playlist link:", err);
    }
  };

  const handleLike = async () => {
    try {
      if (engagementKind === "genre") {
        await toggleGenre({
          id: playlist.playlist_id,
          genre: playlist.name,
          cover_image: playlist.cover_image ?? null,
        });
        return;
      }

      if (engagementKind === "playlist") {
        await togglePlaylist({
          id: playlist.playlist_id,
          title: playlist.name,
          owner: playlist.owner_user_id,
          ownerUsername: playlist.owner_user_id,
          slug: playlist.slug ?? null,
          coverUrl: playlist.cover_image || null,
          isPrivate: !playlist.is_public,
          isLiked: true,
          isAlbumView: false,
        });
        return;
      }

      if (!backendPlaylistExists) {
        if (!playlist.playlist_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          console.warn("Skipping convert for non-UUID album id:", playlist.playlist_id);
          return;
        }

        await convertPlaylist(playlist.playlist_id, {
          name: playlist.name,
          is_public: playlist.is_public,
        });
      }

      await togglePlaylist(buildPlaylistLikePayload());
    } catch (err) {
      console.error("Failed to toggle playlist like:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (queueTimerRef.current) clearTimeout(queueTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
      <div
        className="flex flex-row items-center gap-4 py-4"
        data-test="album-playlist-actions"
      >
        {/* Like Button */}
        <ActionButton
          onClick={handleLike}
          active={liked}
          label={liked ? "Unlike" : "Like"}
          dataTest="album-action-like"
        >
          <FaHeart
            className={`text-[14px] ${liked ? "text-accent" : "text-white"}`}
          />
        </ActionButton>

        {/* Repost Button toggles POST/DELETE */}
        {engagementKind !== "genre" && (
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
        )}

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
          onClick={handleCopyLink}
          label="Copy link"
          dataTest="album-action-copy-link"
        >
          <LuCopy className="text-[16px]" />
        </ActionButton>

        {/* Add to Next up */}
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

        {copySuccess && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 rounded-md bg-black/90 px-3 py-2 text-xs font-semibold text-white shadow-lg"
          >
            Link copied
          </div>
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
