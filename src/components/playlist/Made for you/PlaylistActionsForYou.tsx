import { useState, useRef, useEffect } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { FaHeart, FaEllipsisH, FaLink, FaGlobe } from "react-icons/fa";
import { LuListEnd, LuShare } from "react-icons/lu";
import { FaListUl as FaAddToPlaylist } from "react-icons/fa";
import SharePopup from "../../../pages/[username]/[trackSlug]/components/SharePopup";
import {
  updatePlaylist,
  type Playlist,
  type PlaylistDetails,
  type PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";
import { useLikesStore } from "@/stores/likes.store";
import { usePlayerStore } from "@/stores/player.store";
import AddToPlaylistModal from "../AddToPlaylistModal";
import type { Track } from "@/types/track";

interface PlaylistActionsProps {
  playlist: Playlist & Partial<Pick<PlaylistDetails, "tracks">>;
  initialTracks?: PlaylistTrackItem[];
  isGeneratedPlaylist?: boolean;
  engagementKind?: "playlist" | "mix" | "station" | "none";
  generatedPlaylistTitle?: string;
  onAddToNextUp?: () => void;
  onPlaylistUpdated?: (updated: Playlist) => void;
  isStation?: boolean;
}

export default function PlaylistActions({
  playlist,
  initialTracks,
  isGeneratedPlaylist = false,
  engagementKind,
  generatedPlaylistTitle,
  onAddToNextUp,
  onPlaylistUpdated,
  isStation = false,
}: PlaylistActionsProps) {
  const {
    isPlaylistLiked,
    isMixLiked,
    isStationLiked,
    togglePlaylist,
    toggleMix,
    toggleStation,
  } = useLikesStore();
  const { addToQueue } = usePlayerStore();
  const resolvedEngagementKind =
    engagementKind ?? (isStation ? "station" : isGeneratedPlaylist ? "mix" : "playlist");
  const liked =
    resolvedEngagementKind === "mix"
      ? isMixLiked(playlist.playlist_id)
      : resolvedEngagementKind === "station"
        ? isStationLiked(playlist.playlist_id)
        : isPlaylistLiked(playlist.playlist_id);

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [addedToQueue, setAddedToQueue] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const queueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMakePublic = async () => {
    try {
      const res = await updatePlaylist(playlist.playlist_id, {
        is_public: true,
      });
      onPlaylistUpdated?.(res.data);
      setMoreOpen(false);
    } catch (err) {
      console.error("Failed to make playlist public:", err);
    }
  };

  const parseDuration = (duration?: number | null): string => {
    if (typeof duration !== "number" || Number.isNaN(duration)) return "0:00";
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

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

  const handleAddToNextUp = () => {
    const tracks = (playlist.tracks ?? []).map(toPlayerTrack);
    if (!tracks.length) return;
    tracks.forEach((track) => addToQueue(track));
    onAddToNextUp?.();

    setAddedToQueue(true);
    if (queueTimerRef.current) clearTimeout(queueTimerRef.current);
    queueTimerRef.current = setTimeout(() => {
      setAddedToQueue(false);
      queueTimerRef.current = null;
    }, 3000);
  };

  const handleLike = async () => {
    try {
      if (resolvedEngagementKind === "none") {
        return;
      }

      if (resolvedEngagementKind === "station") {
        await toggleStation({
          id: playlist.playlist_id,
          name: playlist.name,
          seedArtist: {
            id: playlist.owner_user_id,
            displayName: playlist.name,
          },
          coverUrl: playlist.cover_image || null,
          trackCount: playlist.track_count ?? 0,
        });
        return;
      }

      if (resolvedEngagementKind === "mix") {
        await toggleMix({
          id: playlist.playlist_id,
          mix_id: playlist.playlist_id,
        });
        return;
      }

      await togglePlaylist({
        id: playlist.playlist_id,
        title: playlist.name,
        owner: playlist.owner_user_id,
        coverUrl: playlist.cover_image || null,
      });
    } catch (err) {
      console.error("Failed to toggle playlist like:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (queueTimerRef.current) clearTimeout(queueTimerRef.current);
    };
  }, []);

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
      <div
        data-test="playlist-actions-for-you"
        className="flex flex-row items-center gap-2 py-4"
      >
        {/* Like Button */}
        <ActionButton
          onClick={handleLike}
          active={liked}
          dataTest="playlist-actions-for-you-like"
        >
          <FaHeart
            className={`text-[14px] ${liked ? "text-accent" : "text-white"}`}
          />
          {liked ? "Liked" : "Like"}
        </ActionButton>

        {/* Share Button */}
        <ActionButton
          onClick={() => setShareOpen(true)}
          active={shareOpen}
          dataTest="playlist-actions-for-you-share"
        >
          <LuShare className="text-[16px]" />
          Share
        </ActionButton>

        {/* Add to Next up Button */}
        <ActionButton
          onClick={handleAddToNextUp}
          active={addedToQueue}
          dataTest="playlist-actions-for-you-next-up"
        >
          <LuListEnd className="text-[18px]" />
          Add to Next up
        </ActionButton>

        {/* More Dropdown */}
        <div ref={moreRef} className="relative">
          {isStation ? (
            <ActionButton
              onClick={() => setShowPlaylistModal(true)}
              active={showPlaylistModal}
              dataTest="playlist-actions-for-you-add-to-playlist"
            >
              <FaAddToPlaylist className="text-[14px]" />
              Add to playlist
            </ActionButton>
          ) : (
            <>
              <ActionButton
                onClick={() => setMoreOpen((p) => !p)}
                active={moreOpen}
                dataTest="playlist-actions-for-you-more"
              >
                <FaEllipsisH className="text-[14px]" />
                More
              </ActionButton>

              {moreOpen && (
                <div
                  className="fixed z-[2000] bg-bg w-44 border font-bold border-[#353535] rounded shadow-xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownItem
                    icon={<FaAddToPlaylist />}
                    label="Add to playlist"
                    onClick={() => {
                      setMoreOpen(false);
                      setShowPlaylistModal(true);
                    }}
                  />

                  {/* Only show "Make public" if the playlist is currently private */}
                  {!playlist.is_public && (
                    <DropdownItem
                      icon={<FaGlobe />}
                      label="Make public"
                      onClick={handleMakePublic}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {shareOpen && (
          <SharePopup playlist={playlist} onClose={() => setShareOpen(false)} />
        )}

        {showPlaylistModal && (
          <AddToPlaylistModal
            playlistId={
              isStation || isGeneratedPlaylist ? undefined : playlist.playlist_id
            }
            trackTitle={
              generatedPlaylistTitle ??
              (isGeneratedPlaylist ? "More of what you like" : playlist.name)
            }
            initialTracks={initialTracks?.map((track) => ({
              id: track.track_id,
              title: track.title ?? "Untitled track",
              artistName: track.artist_name ?? undefined,
              coverUrl: track.cover_image ?? undefined,
            }))}
            moreOfLike={isGeneratedPlaylist}
            onClose={() => setShowPlaylistModal(false)}
          />
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
  dataTest,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  dataTest?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      data-test={dataTest}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-3 py-1.5 h-[32px]
        rounded-[4px] transition-colors duration-150 cursor-pointer
        bg-bg-actionbutton font-bold text-[14px] 
        ${
          active
            ? "text-accent"
            : "text-text-upload border-transparent hover:text-[#717171]"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
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
      className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-bold text-white hover:bg-white/10 transition-colors cursor-pointer text-left"
    >
      <span className="text-[14px]">{icon}</span>
      {label}
    </button>
  );
}
