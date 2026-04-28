import { useState, useEffect, useCallback } from "react";
import DiscoverSideBar from "@/components/discover/sidebar/DiscoverSideBar";
import FeedItemCard from "@/components/feed/FeedItemCard";
import { getActivityFeed } from "@/services/feed.service";
import type { FeedItem } from "@/types/feedItem";

const PAGE_SIZE = 20;

const FeedPage = () => {
  const [showReposts, setShowReposts] = useState(true);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchFeed = useCallback(async (currentOffset: number, append: boolean) => {
    try {
      if (append) setIsLoadingMore(true); else setIsLoading(true);
      const { items, hasMore: more } = await getActivityFeed(PAGE_SIZE, currentOffset);
      setFeedItems((prev) => (append ? [...prev, ...items] : items));
      setHasMore(more);
      setOffset(currentOffset + items.length);
    } catch (err) {
      console.error("Failed to load feed:", err);
    } finally {
      if (append) setIsLoadingMore(false); else setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(0, false);
  }, [fetchFeed]);

  const displayItems = showReposts
    ? feedItems
    : feedItems.filter((item) => item.type === "post");

  return (
    <div
      data-test="feed-page"
      className="min-h-screen w-full container px-4 md:px-8 lg:px-20 bg-bg"
    >
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-11 p-0">
        {/* Main Content */}
        <div
          data-test="feed-main"
          className="flex flex-col w-full lg:flex-[8] min-w-0 pt-10"
        >
          {/* Header row */}
          <div
            data-test="feed-header"
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
          >
            <h1 className="text-lg sm:text-[22px] font-bold text-white">
              Hear the latest posts from the people you're following:
            </h1>
            <div
              className="flex items-center gap-2 shrink-0"
            >
              <span className="text-sm text-white/50">Reposts</span>
              <button
                data-test="button-feed-reposts-toggle"
                onClick={() => setShowReposts((prev) => !prev)}
                className={`relative inline-flex items-center w-10.5 h-6.5 rounded-full transition-colors duration-200 ${
                  showReposts ? "bg-[#f50]" : "bg-zinc-600"
                }`}
              >
                <span
                  className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                    showReposts ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Feed list */}
          <div data-test="feed-list" className="flex flex-col gap-4">
            {isLoading ? (
              <p className="text-white/40 text-center mt-10">
                Loading feed...
              </p>
            ) : displayItems.length > 0 ? (
              <>
                {displayItems.map((item) => (
                  <FeedItemCard key={item.id} item={item} />
                ))}
                {hasMore && (
                  <button
                    data-test="feed-load-more"
                    onClick={() => fetchFeed(offset, true)}
                    disabled={isLoadingMore}
                    className="mt-6 mx-auto px-6 py-2 text-sm text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded disabled:opacity-50 transition-colors"
                  >
                    {isLoadingMore ? "Loading..." : "Load more"}
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-6 mt-16 text-center">
                <img
                  src="/images/hero-slide-1.jpg"
                  alt="Empty feed"
                  className="w-64 h-40 object-cover rounded-xl opacity-40"
                />
                <div>
                  <p className="text-white/60 font-semibold text-base">Your feed is empty.</p>
                  <p className="text-white/30 text-sm mt-1">Follow some artists to see their latest posts here.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Hidden on mobile/tablet, shown on desktop */}
        <div data-test="feed-sidebar" className="hidden lg:block lg:flex-[3] xl:flex-[2] pt-8 sticky top-0 h-fit">
          <DiscoverSideBar />
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
