interface TrackItemProps {
  title: string;
  artist: string;
  coverUrl?: string;
  plays?: number;
  likes?: number;
  reposts?: number;
  comments?: number;
}

const TrackItem: React.FC<TrackItemProps> = ({
  title,
  artist,
  coverUrl,
  plays,
  likes,
  reposts,
  comments,
}) => {
  return (
    <div className="flex gap-3">
      <div className="w-12 h-12 flex-shrink-0 bg-border rounded overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-border" />
        )}
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <p className="text-xs font-semibold text-text-secondary text-left truncate">
          {artist}
        </p>
        <p className="text-sm font-semibold text-white text-left truncate">
          {title}
        </p>
        <div className="flex items-center gap-2  text-xs text-text-secondary">
          {plays !== undefined && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-play text-[10px]" />
              {(plays / 1e6).toFixed(1)}M
            </span>
          )}
          {likes !== undefined && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-heart text-[10px]" />
              {(likes / 1e6).toFixed(2)}M
            </span>
          )}
          {reposts !== undefined && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-retweet text-[10px]" />
              {(reposts / 1000).toFixed(1)}K
            </span>
          )}
          {comments !== undefined && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-comment text-[10px]" />
              {comments.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackItem;
