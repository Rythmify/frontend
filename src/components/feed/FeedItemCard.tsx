import { useNavigate } from "react-router-dom";
import type { FeedItem } from "@/types/feedItem";
import TrackCard from "@/components/track/TrackCard";
import PlaylistComponent from "@/components/playlist/PlaylistComponent";
import UserAvatar from "@/components/UI/UserAvatar";

const timeAgo = (isoString: string): string => {
  const seconds = Math.floor(
    (Date.now() - new Date(isoString).getTime()) / 1000,
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

interface FeedItemCardProps {
  item: FeedItem;
}

const FeedItemCard = ({ item }: FeedItemCardProps) => {
  const navigate = useNavigate();
  const contentLabel = item.content_type === "track" ? "track" : "playlist";
  const actionLabel = item.type === "repost" ? "reposted" : "posted";

  const cardBody =
    item.content_type === "track" ? (
      <TrackCard track={item.track} />
    ) : (
      <PlaylistComponent playlist={item.playlist} />
    );

  return (
    <div
      data-test={`feed-item-${item.id}`}
      className={`flex flex-col py-4 ${item.content_type === "track" ? "border-b border-border" : ""}`}
    >
      {/* User header */}
      <div
        data-test={`feed-item-header-${item.id}`}
        className="flex items-center gap-2 mb-3"
      >
        <UserAvatar
          src={item.user.avatar}
          name={item.user.displayName ?? item.user.username}
          alt={item.user.displayName}
          dataTest={`feed-item-avatar-${item.id}`}
          wrapperClassName="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
          imageClassName="h-full w-full object-cover"
          initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-700 text-white text-xs font-bold"
          onClick={() => navigate(`/${item.user.username}`)}
        />
        <span className="text-sm text-text-secondary pl-2">
          <button
            data-test={`feed-item-username-${item.id}`}
            onClick={() => navigate(`/${item.user.username}`)}
            className="text-text-hover font-semibold hover:text-text-muted"
          >
            {item.user.displayName}
          </button>
          {item.type === "repost" && (
            <i className="fa-solid fa-retweet text-text-secondary text-xs mx-1" />
          )}{" "}
          {actionLabel} a {contentLabel} <span>{timeAgo(item.created_at)}</span>
        </span>
      </div>

      {/* Track or Playlist card */}
      <div data-test={`feed-item-body-${item.id}`}>{cardBody}</div>
    </div>
  );
};

export default FeedItemCard;
