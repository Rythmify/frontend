import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "@/stores/player.store";
import { useLikesStore } from "@/stores/likes.store";
import { useHistoryStore } from "@/stores/history.store";
import { useAuthStore } from "@/stores/auth.store";
import { useDownloadStore } from "@/stores/useDownload";
import * as engagementService from "@/services/engagement.service";
import { getRelatedTracks } from "@/services/track.service";
import SharePopup from "@/pages/[username]/[trackSlug]/components/SharePopup";
import AddToPlaylistModal from "@/components/playlist/AddToPlaylistModal";
import type { Track } from "@/types/track";

interface TrackItemProps {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  plays?: number;
  likes?: number;
  reposts?: number;
  comments?: number;
  onUnlike?: (id: string) => void;
  initialLiked?: boolean;
  initialReposted?: boolean;
  artistUsername?: string;
  audioUrl?: string;
  genre?: string;
  duration?: string;
  postedAt?: string;
  isPrivate?: boolean;
  trackSlug?: string;
  artistId?: string;
  contextQueue?: Track[];
}

const formatCount = (n: number) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

const TrackItem: React.FC<TrackItemProps> = ({
  id,
  title,
  artist,
  coverUrl,
  plays,
  likes,
  reposts,
  comments,
  onUnlike,
  initialLiked = false,
  initialReposted = false,
  artistUsername,
  audioUrl,
  genre = "",
  duration = "0:00",
  postedAt = "",
  isPrivate = false,
  trackSlug,
  artistId,
  contextQueue,
}) => {
  const [hovered, setHovered] = useState(false);
  const [coverHovered, setCoverHovered] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [reposted, setReposted] = useState(initialReposted);
  const [shareOpen, setShareOpen] = useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const navigate = useNavigate();
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const isTrackLiked = useLikesStore((s) => s.isTrackLiked);
  const toggleTrack = useLikesStore((s) => s.toggleTrack);
  const { addTrack } = useHistoryStore();
  const { user } = useAuthStore();
  const { isDownloaded, toggleDownload } = useDownloadStore();

  const liked = isTrackLiked(id);
  const finalArtistSlug =
    artistUsername || (artist ?? "").toLowerCase().replace(/\s+/g, "-");

  const trackPath = `/discover/personalised/${trackSlug ?? ""}:${id}`;
  const trackForActions: Track = {
    id,
    title,
    artistName: artist,
    artistUsername: finalArtistSlug,
    coverUrl: coverUrl || "",
    audioUrl: audioUrl ?? "",
    genre: genre || "",
    likeCount: likes || 0,
    repostCount: reposts || 0,
    playCount: plays || 0,
    commentCount: comments || 0,
    duration: duration || "0:00",
    postedAt: postedAt || "",
    waveformData: [],
    isPrivate,
    artistId: artistId || "",
  };

  const handleLike = () => {
    toggleTrack(trackForActions);
    if (liked) onUnlike?.(id);
  };

  const isThisTrackPlaying = currentTrack?.id === id && isPlaying;
  const downloaded = isDownloaded(id);
  const canRemoveDownload = downloaded && !!user?.isPro;

  const handleRepost = async () => {
    if (!!user && user.username === finalArtistSlug) {
      alert("You cannot repost your own track!");
      return;
    }
    const wasReposted = reposted;
    setReposted(!wasReposted);
    try {
      if (wasReposted) {
        await engagementService.removeRepost(id);
      } else {
        await engagementService.repostTrack(id);
      }
    } catch (err) {
      console.error("Repost failed", err);
      setReposted(wasReposted);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/${finalArtistSlug}/${trackSlug ?? id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied!");
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (currentTrack?.id === id) {
      togglePlay();
      return;
    }
    const trackForPlayer: Track = {
      id: id,
      title,
      artistName: artist,
      artistUsername: finalArtistSlug,
      coverUrl: coverUrl || "",
      audioUrl: audioUrl ?? "",
      genre: genre,
      likeCount: likes || 0,
      repostCount: reposts || 0,
      playCount: plays || 0,
      commentCount: comments || 0,
      duration: duration,
      postedAt: postedAt,
      waveformData: [],
      isPrivate: isPrivate,
      artistId: artistId || "",
    };

    if (contextQueue) {
      setTrack(trackForPlayer, contextQueue);
    } else {
      usePlayerStore.getState().playContext("track", id, trackForPlayer);
    }
  };

  return (
    <div
      data-test={`track-item-${id}`}
      className="relative flex gap-3 group max-w-[320px] "
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowMore(false);
      }}
    >
      {/* Cover */}
      <div
        className="w-12 h-12 cursor-pointer flex-shrink-0 bg-border rounded overflow-hidden relative"
        onMouseEnter={() => setCoverHovered(true)}
        onMouseLeave={() => setCoverHovered(false)}
      >
        {coverUrl ? (
          <img
            data-test={`track-cover-${id}`}
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
            onClick={() => navigate(`/${finalArtistSlug}/${id}`)}
          />
        ) : (
          <div className="w-full h-full bg-border" />
        )}

        {/* Play Button Overlay - Shows on hover or when this track is playing */}
        {(coverHovered || isThisTrackPlaying) && (
          <div
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
            onClick={handlePlayClick}
          >
            <button
              data-test={`track-play-button-${id}`}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            >
              <i
                className={`fa-solid ${isThisTrackPlaying ? "fa-pause" : "fa-play"} text-black text-xs ${isThisTrackPlaying ? "" : "pl-0.5"}`}
              ></i>
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <button
          data-test={`track-artist-${id}`}
          onClick={() => navigate(`/${finalArtistSlug}`)}
          className="text-xs cursor-pointer font-semibold text-text-secondary text-left truncate"
        >
          {artist}
        </button>
        <button
          data-test={`track-title-${id}`}
          onClick={() => navigate(trackPath)}
          className="text-sm cursor-pointer font-semibold text-text-hover text-left truncate"
        >
          {title}
        </button>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          {plays !== undefined && (
            <span
              data-test={`track-plays-${id}`}
              className="flex items-center gap-1"
            >
              <i className="fa-solid fa-play text-[10px]" />
              {formatCount(plays)}
            </span>
          )}
          {likes !== undefined && (
            <span
              data-test={`track-likes-${id}`}
              className="flex cursor-pointer items-center gap-1"
            >
              <i className="fa-solid fa-heart text-[10px]" />
              {formatCount(likes)}
            </span>
          )}
          {/* {reposts !== undefined && (
            <span
              data-test={`track-reposts-${id}`}
              className="flex cursor-pointer items-center gap-1"
            >
              <i className="fa-solid fa-retweet text-[10px]" />
              {formatCount(reposts)}
            </span>
          )}
          {comments !== undefined && (
            <button
              data-test={`track-comments-${id}`}
              onClick={() => navigate(`/${finalArtistSlug}/${id}`)}
              className="flex cursor-pointer items-center gap-1"
            >
              <i className="fa-solid fa-comment text-[10px]" />
              {comments.toLocaleString()}
            </button>
          )} */}
        </div>
      </div>

      {/* Like + More */}
      {hovered && (
        <div className="absolute right-0 top-1 flex items-center gap-2">
          <button
            data-test={`track-like-button-${id}`}
            onClick={handleLike}
            className="w-9 h-8 cursor-pointer flex items-center justify-center rounded bg-input-bg hover:bg-border transition-colors"
          >
            <i
              className={`fa-heart text-sm ${liked ? "fa-solid text-red-500" : "fa-regular text-text-hover"}`}
            />
          </button>
          <div className="relative">
            <button
              data-test={`track-more-button-${id}`}
              onClick={() => setShowMore((p) => !p)}
              className="w-9 cursor-pointer h-8 flex items-center justify-center rounded bg-input-bg hover:bg-border text-text-hover transition-colors"
            >
              <i className="fa-solid fa-ellipsis text-sm" />
            </button>
            {showMore && (
              <div className="absolute right-0 top-10 z-50 bg-input-bg border border-border rounded shadow-lg w-48 py-1">
                <button
                  data-test={`track-more-repost-${id}`}
                  onClick={handleRepost}
                  className="flex cursor-pointer items-center gap-3 w-full px-4 py-2 text-sm text-text-hover hover:bg-border/50 transition-colors"
                >
                  <i
                    className={`fa-solid fa-retweet text-xs w-4 ${
                      reposted ? "text-[#1D9E75]" : ""
                    }`}
                  />
                  {reposted ? "Unrepost" : "Repost"}
                </button>

                <button
                  data-test={`track-more-share-${id}`}
                  onClick={() => {
                    setShareOpen(true);
                    setShowMore(false);
                  }}
                  className="flex cursor-pointer items-center gap-3 w-full px-4 py-2 text-sm text-text-hover hover:bg-border/50 transition-colors"
                >
                  <i className="fa-solid fa-arrow-up-from-bracket text-xs w-4" />
                  Share
                </button>

                <button
                  data-test={`track-more-copy-link-${id}`}
                  onClick={handleCopyLink}
                  className="flex cursor-pointer items-center gap-3 w-full px-4 py-2 text-sm text-text-hover hover:bg-border/50 transition-colors"
                >
                  <i className="fa-solid fa-copy text-xs w-4" />
                  Copy Link
                </button>

                <button
                  data-test={`track-more-download-${id}`}
                  onClick={() => {
                    if (!user?.isPro) {
                      navigate("/premium");
                    } else {
                      toggleDownload(trackForActions, true);
                    }
                    setShowMore(false);
                  }}
                  className="flex cursor-pointer items-center gap-3 w-full px-4 py-2 text-sm text-text-hover hover:bg-border/50 transition-colors"
                >
                  <i
                    className={`fa-solid ${
                      canRemoveDownload ? "fa-check" : "fa-download"
                    } text-xs w-4 ${canRemoveDownload ? "text-[#1D9E75]" : ""}`}
                  />
                  {canRemoveDownload ? "Remove Download" : "Download"}
                </button>

                <button
                  data-test={`track-more-add-to-playlist-${id}`}
                  onClick={() => {
                    setPlaylistModalOpen(true);
                    setShowMore(false);
                  }}
                  className="flex cursor-pointer items-center gap-3 w-full px-4 py-2 text-sm text-text-hover hover:bg-border/50 transition-colors"
                >
                  <i className="fa-solid fa-list text-xs w-4" />
                  Add to Playlist
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {playlistModalOpen && (
        <AddToPlaylistModal
          trackTitle={title}
          trackCoverUrl={coverUrl}
          fetchTracks={async () => {
            const { tracks } = await getRelatedTracks(id);
            return tracks.map((t) => ({
              id: t.id,
              title: t.title,
              artistName: t.artistName,
              coverUrl: t.coverUrl,
            }));
          }}
          onClose={() => setPlaylistModalOpen(false)}
        />
      )}
      {shareOpen && (
        <SharePopup
          track={trackForActions}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
};

export default TrackItem;
