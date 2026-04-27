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
});
