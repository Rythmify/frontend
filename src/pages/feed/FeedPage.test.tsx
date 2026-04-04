import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FeedPage from "./FeedPage";
import type { FeedItem } from "@/types/feedItem";

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

vi.mock("@/services/mocks/feed", () => ({
  mockFeedItems: [
    { id: "t1", type: "repost", content_type: "track" },
    { id: "t2", type: "post", content_type: "track" },
    { id: "t3", type: "post", content_type: "playlist" },
  ] as FeedItem[],
}));

// ─── Test Suite ───────────────────────────────────────────

describe("FeedPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      "Hear the latest posts from the people you're following",
    );
  });

  it("renders reposts toggle button", () => {
    render(<FeedPage />);
    expect(
      screen.getByTestId("button-feed-reposts-toggle"),
    ).toBeInTheDocument();
  });

  // ── Feed list ────────────────────────────────────────────

  it("renders all feed items by default (reposts ON)", () => {
    render(<FeedPage />);
    expect(screen.getByTestId("mock-feed-item-t1")).toBeInTheDocument();
    expect(screen.getByTestId("mock-feed-item-t2")).toBeInTheDocument();
    expect(screen.getByTestId("mock-feed-item-t3")).toBeInTheDocument();
  });

  it("renders feed list container", () => {
    render(<FeedPage />);
    expect(screen.getByTestId("feed-list")).toBeInTheDocument();
  });

  // ── Reposts toggle ───────────────────────────────────────

  it("hides repost items when toggle is clicked off", () => {
    render(<FeedPage />);
    fireEvent.click(screen.getByTestId("button-feed-reposts-toggle"));
    expect(screen.queryByTestId("mock-feed-item-t1")).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-feed-item-t2")).toBeInTheDocument();
    expect(screen.getByTestId("mock-feed-item-t3")).toBeInTheDocument();
  });

  it("shows all items again when toggle is clicked back on", () => {
    render(<FeedPage />);
    const toggle = screen.getByTestId("button-feed-reposts-toggle");
    fireEvent.click(toggle); // OFF
    fireEvent.click(toggle); // ON
    expect(screen.getByTestId("mock-feed-item-t1")).toBeInTheDocument();
    expect(screen.getByTestId("mock-feed-item-t2")).toBeInTheDocument();
    expect(screen.getByTestId("mock-feed-item-t3")).toBeInTheDocument();
  });

  it("only shows post items when reposts are toggled off", () => {
    render(<FeedPage />);
    fireEvent.click(screen.getByTestId("button-feed-reposts-toggle"));
    const feedList = screen.getByTestId("feed-list");
    expect(feedList.children).toHaveLength(2);
  });

  it("shows all items when reposts are toggled on", () => {
    render(<FeedPage />);
    const feedList = screen.getByTestId("feed-list");
    expect(feedList.children).toHaveLength(3);
  });
});
