import { useState, useEffect } from "react";
import DiscoverSideBar from "@/components/discover/sidebar/DiscoverSideBar";
import FeedItemCard from "@/components/feed/FeedItemCard";
import { getActivityFeed } from "@/services/feed.service";
import type { FeedItem } from "@/types/feedItem";

const FeedPage = () => {
  const [showReposts, setShowReposts] = useState(true);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setIsLoading(true);
        const { items } = await getActivityFeed(20);
        setFeedItems(items);
      } catch (err) {
        console.error("Failed to load feed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const displayItems = showReposts
    ? feedItems
    : feedItems.filter((item) => item.type === "post");

  return (
    <div
      data-test="feed-page"
      className="min-h-screen w-full container px-4 md:px-8 lg:px-20 bg-bg"
    >
      <div className="flex gap-11 p-0">
        {/* Main Content — 70% */}
        <div
          data-test="feed-main"
          className="flex flex-col flex-[8] min-w-0 pt-10"
        >
          {/* Header row */}
          <div
            data-test="feed-header"
            className="flex items-center justify-between mb-6"
          >
            <h1 className="text-[22px] font-bold text-text-hover">
              Hear the latest posts from the people you're following:
            </h1>
            <div
              data-test="button-feed-reposts-toggle"
              className="flex items-center gap-2"
            >
              <span className="text-sm text-text-secondary">Reposts</span>
              <button
                onClick={() => setShowReposts((prev) => !prev)}
                className={`relative inline-flex items-center w-10.5 h-6.5 rounded-full transition-colors duration-200 ${
                  showReposts ? "bg-accent" : "bg-zinc-600"
                }`}
              >
                <span
                  className={`inline-block w-5 h-5 bg-bg rounded-full shadow transform transition-transform duration-200 ${
                    showReposts ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Feed list */}
          <div data-test="feed-list" className="flex flex-col">
            {isLoading ? (
              <p className="text-text-secondary text-center mt-10">Loading feed...</p>
            ) : displayItems.length > 0 ? (
              displayItems.map((item) => (
                <FeedItemCard key={item.id} item={item} />
              ))
            ) : (
              <p className="text-text-secondary text-center mt-10">Your feed is empty. Follow some artists!</p>
            )}
          </div>
        </div>

        {/* Sidebar — 30% */}
        <div
          data-test="feed-sidebar"
          className="flex-[2] ps-2 pt-8"
        >
          <DiscoverSideBar />
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
