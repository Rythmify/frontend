import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
}) => {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      onUnlike?.(id);
    } else {
      setLiked(true);
    }
  };

  const trackSlug = title.toLowerCase().replace(/\s+/g, "-");
  const artistSlug = artist.toLowerCase().replace(/\s+/g, "-");

  return (
    <div
      data-test={`track-item-${id}`}
      className="relative flex gap-3 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowMore(false);
      }}
    >
      {/* Cover */}
      <div className="w-12 h-12 cursor-pointer flex-shrink-0 bg-border rounded overflow-hidden">
        {coverUrl ? (
          <img
            data-test={`track-cover-${id}`}
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
            onClick={() => navigate(`/${artistSlug}/${trackSlug}`)}
          />
        ) : (
          <div className="w-full h-full bg-border" />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <button
          data-test={`track-artist-${id}`}
          onClick={() => navigate(`/${artistSlug}`)}
          className="text-xs cursor-pointer font-semibold text-text-secondary text-left truncate"
        >
          {artist}
        </button>
        <button
          data-test={`track-title-${id}`}
          onClick={() => navigate(`/${artistSlug}/${trackSlug}`)}
          className="text-sm cursor-pointer font-semibold text-white text-left truncate"
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
          {reposts !== undefined && (
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
              onClick={() => navigate(`/${artistSlug}/${trackSlug}`)}
              className="flex cursor-pointer items-center gap-1"
            >
              <i className="fa-solid fa-comment text-[10px]" />
              {comments.toLocaleString()}
            </button>
          )}
        </div>
      </div>

      {/* Like + More */}
      {hovered && (
        <div className="absolute right-0 top-1 flex items-center gap-2">
          <button
            data-test={`track-like-button-${id}`}
            onClick={handleLike}
            className="w-9 h-8 cursor-pointer flex items-center justify-center rounded bg-zinc-700 hover:bg-zinc-600 transition-colors"
          >
            <i
              className={`fa-heart text-sm ${liked ? "fa-solid text-red-500" : "fa-regular text-white"}`}
            />
          </button>
          <div className="relative">
            <button
              data-test={`track-more-button-${id}`}
              onClick={() => setShowMore((p) => !p)}
              className="w-9 cursor-pointer h-8 flex items-center justify-center rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
            >
              <i className="fa-solid fa-ellipsis text-sm" />
            </button>
            {showMore && (
              <div className="absolute right-0 top-10 z-50 bg-[#1a1a1a] border border-border rounded shadow-lg w-48 py-1">
                {[
                  { icon: "fa-retweet", label: "Repost" },
                  { icon: "fa-arrow-up-from-bracket", label: "Share" },
                  { icon: "fa-copy", label: "Copy Link" },
                  { icon: "fa-list", label: "Add to Playlist" },
                  { icon: "fa-tower-broadcast", label: "Station" },
                ].map(({ icon, label }) => (
                  <button
                    key={label}
                    data-test={`track-more-${label.toLowerCase().replace(/\s+/g, "-")}-${id}`}
                    className="flex cursor-pointer items-center gap-3 w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    <i className={`fa-solid ${icon} text-xs w-4`} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackItem;
