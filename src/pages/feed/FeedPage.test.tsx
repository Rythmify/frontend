import { render, screen, fireEvent, waitFor, configure } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FeedPage from "./FeedPage";
import type { FeedItem } from "@/types/feedItem";
import { getActivityFeed } from "@/services/feed.service";

configure({ testIdAttribute: "data-test" });

// ─── Mock Setup ───────────────────────────────────────────

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("@/components/discover/sidebar/DiscoverSideBar", () => ({
  default: () => <div data-test="mock-sidebar" />,
}));

vi.mock("@/components/feed/FeedItemCard", () => ({
  default: ({ item }: { item: FeedItem }) => (
    <div data-test={`mock-feed-item-${item.id}`}>{item.type}</div>
  ),
}));

vi.mock("@/services/feed.service", () => ({
  getActivityFeed: vi.fn(),
}));

const mockFeedItems: FeedItem[] = [
  { id: "t1", type: "repost", content_type: "track", created_at: "2024-01-01T12:00:00Z" } as any,
  { id: "t2", type: "post", content_type: "track", created_at: "2024-01-01T12:01:00Z" } as any,
  { id: "t3", type: "post", content_type: "playlist", created_at: "2024-01-01T12:02:00Z" } as any,
];

// ─── Test Suite ───────────────────────────────────────────

describe("FeedPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getActivityFeed).mockResolvedValue({
      items: mockFeedItems,
      hasMore: false,
      total: 3,
    });
  });

  // ── Layout ───────────────────────────────────────────────

  it("renders feed page container", () => {
    render(<FeedPage />);
    expect(screen.getByTestId("feed-page")).toBeInTheDocument();
  });

  it("renders main content area", () => {
    render(<FeedPage />);
    expect(screen.getByTestId("feed-main")).toBeInTheDocument();
  });

  it("renders sidebar", () => {
    render(<FeedPage />);
    expect(screen.getByTestId("feed-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
  });

  // ── Header ───────────────────────────────────────────────

  it("renders header with following text", () => {
    render(<FeedPage />);
    expect(screen.getByTestId("feed-header")).toHaveTextContent(
      "Hear the latest posts from the people you're following:",
    );
  });

  it("renders reposts toggle button", () => {
    render(<FeedPage />);
    expect(
      screen.getByTestId("button-feed-reposts-toggle"),
    ).toBeInTheDocument();
  });

  // ── Feed list ────────────────────────────────────────────

  it("renders all feed items by default (reposts ON)", async () => {
    render(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-feed-item-t1")).toBeInTheDocument();
      expect(screen.getByTestId("mock-feed-item-t2")).toBeInTheDocument();
      expect(screen.getByTestId("mock-feed-item-t3")).toBeInTheDocument();
    });
  });

  it("renders feed list container", () => {
    render(<FeedPage />);
    expect(screen.getByTestId("feed-list")).toBeInTheDocument();
  });

  // ── Reposts toggle ───────────────────────────────────────

  it("hides repost items when toggle is clicked off", async () => {
    render(<FeedPage />);
    await waitFor(() => expect(screen.getByTestId("mock-feed-item-t1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("button-feed-reposts-toggle"));
    await waitFor(() => {
      expect(screen.queryByTestId("mock-feed-item-t1")).not.toBeInTheDocument();
      expect(screen.getByTestId("mock-feed-item-t2")).toBeInTheDocument();
      expect(screen.getByTestId("mock-feed-item-t3")).toBeInTheDocument();
    });
  });

  it("shows all items again when toggle is clicked back on", async () => {
    render(<FeedPage />);
    await waitFor(() => expect(screen.getByTestId("mock-feed-item-t1")).toBeInTheDocument());
    const toggle = screen.getByTestId("button-feed-reposts-toggle");
    fireEvent.click(toggle); // OFF
    expect(screen.queryByTestId("mock-feed-item-t1")).not.toBeInTheDocument();
    fireEvent.click(toggle); // ON
    expect(screen.getByTestId("mock-feed-item-t1")).toBeInTheDocument();
    expect(screen.getByTestId("mock-feed-item-t2")).toBeInTheDocument();
    expect(screen.getByTestId("mock-feed-item-t3")).toBeInTheDocument();
  });

  it("only shows post items when reposts are toggled off", async () => {
    render(<FeedPage />);
    await waitFor(() => expect(screen.getByTestId("mock-feed-item-t1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("button-feed-reposts-toggle"));
    await waitFor(() => {
      const feedList = screen.getByTestId("feed-list");
      expect(feedList.children).toHaveLength(2);
    });
  });

  it("shows all items when reposts are toggled on", async () => {
    render(<FeedPage />);
    await waitFor(() => expect(screen.getByTestId("mock-feed-item-t1")).toBeInTheDocument());
    const feedList = screen.getByTestId("feed-list");
    expect(feedList.children).toHaveLength(3);
  });

  // ── Loading state ─────────────────────────────────────────

  it("shows loading text while fetching", () => {
    vi.mocked(getActivityFeed).mockReturnValue(new Promise(() => {}));
    render(<FeedPage />);
    expect(screen.getByText("Loading feed...")).toBeInTheDocument();
  });

  // ── Empty state ───────────────────────────────────────────

  it("shows empty feed image when there are no items", async () => {
    vi.mocked(getActivityFeed).mockResolvedValue({ items: [], hasMore: false, total: 0 });
    render(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByAltText("Empty feed")).toBeInTheDocument();
    });
  });

  it("shows empty feed message when there are no items", async () => {
    vi.mocked(getActivityFeed).mockResolvedValue({ items: [], hasMore: false, total: 0 });
    render(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByText("Your feed is empty.")).toBeInTheDocument();
    });
  });

  it("shows follow suggestion when feed is empty", async () => {
    vi.mocked(getActivityFeed).mockResolvedValue({ items: [], hasMore: false, total: 0 });
    render(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByText(/Follow some artists/)).toBeInTheDocument();
    });
  });

  // ── Load more button ──────────────────────────────────────

  it("shows load more button when hasMore is true", async () => {
    vi.mocked(getActivityFeed).mockResolvedValue({ items: mockFeedItems, hasMore: true, total: 10 });
    render(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByTestId("feed-load-more")).toBeInTheDocument();
    });
  });

  it("does not show load more button when hasMore is false", async () => {
    render(<FeedPage />);
    await waitFor(() => expect(screen.getByTestId("mock-feed-item-t1")).toBeInTheDocument());
    expect(screen.queryByTestId("feed-load-more")).not.toBeInTheDocument();
  });

  // ── Load more interaction ─────────────────────────────────

  it("calls getActivityFeed with the correct offset on load more click", async () => {
    const extraItems: FeedItem[] = [
      { id: "t4", type: "post", content_type: "track", created_at: "2024-01-01T12:03:00Z" } as any,
    ];
    vi.mocked(getActivityFeed)
      .mockResolvedValueOnce({ items: mockFeedItems, hasMore: true, total: 10 })
      .mockResolvedValueOnce({ items: extraItems, hasMore: false, total: 10 });
    render(<FeedPage />);
    await waitFor(() => screen.getByTestId("feed-load-more"));
    fireEvent.click(screen.getByTestId("feed-load-more"));
    await waitFor(() => {
      expect(getActivityFeed).toHaveBeenCalledWith(20, 3);
    });
  });

  it("appends items after load more", async () => {
    const extraItems: FeedItem[] = [
      { id: "t4", type: "post", content_type: "track", created_at: "2024-01-01T12:03:00Z" } as any,
      { id: "t5", type: "post", content_type: "track", created_at: "2024-01-01T12:04:00Z" } as any,
    ];
    vi.mocked(getActivityFeed)
      .mockResolvedValueOnce({ items: mockFeedItems, hasMore: true, total: 10 })
      .mockResolvedValueOnce({ items: extraItems, hasMore: false, total: 10 });
    render(<FeedPage />);
    await waitFor(() => screen.getByTestId("feed-load-more"));
    fireEvent.click(screen.getByTestId("feed-load-more"));
    await waitFor(() => {
      expect(screen.getByTestId("mock-feed-item-t4")).toBeInTheDocument();
      expect(screen.getByTestId("mock-feed-item-t5")).toBeInTheDocument();
      expect(screen.getByTestId("mock-feed-item-t1")).toBeInTheDocument();
    });
  });

  it("disables load more button while loading more", async () => {
    vi.mocked(getActivityFeed)
      .mockResolvedValueOnce({ items: mockFeedItems, hasMore: true, total: 10 })
      .mockReturnValueOnce(new Promise(() => {}));
    render(<FeedPage />);
    await waitFor(() => screen.getByTestId("feed-load-more"));
    fireEvent.click(screen.getByTestId("feed-load-more"));
    expect(screen.getByTestId("feed-load-more")).toBeDisabled();
    expect(screen.getByTestId("feed-load-more")).toHaveTextContent("Loading...");
  });

  // ── Error resilience ──────────────────────────────────────

  it("does not crash when getActivityFeed rejects", async () => {
    vi.mocked(getActivityFeed).mockRejectedValue(new Error("Network error"));
    render(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByTestId("feed-page")).toBeInTheDocument();
    });
  });
});
