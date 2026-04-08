import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import SharePopup from "../../pages/[username]/[trackSlug]/components/SharePopup";
import type { Track } from "../../types/track";

beforeAll(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});
afterAll(() => {
  vi.restoreAllMocks();
});

const track: Track = {
  id: "f5e4d3c2-b1a0-4987-8765-43210abcdef7",
  title: "Test Song",
  artistName: "Test Artist",
  artistUsername: "test-artist",
  coverUrl: "https://picsum.photos/seed/track1/300/300",
  genre: "Pop",
  likeCount: 100,
  repostCount: 10,
  playCount: 5000,
  commentCount: 3,
  duration: "3:45",
  postedAt: "1 day ago",
  waveformData: [20, 40, 60, 30],
  audioUrl: "/audio/test.mp3",
  trackSlug: "test-song",
};

describe("SharePopup", () => {
  const onClose = vi.fn();

  it("renders the share popup overlay", () => {
    render(<SharePopup track={track} onClose={onClose} />);
    expect(screen.getByTestId("share-popup-overlay")).toBeInTheDocument();
  });

  it("renders Share, Embed, and Message tabs", () => {
    render(<SharePopup track={track} onClose={onClose} />);
    expect(screen.getByTestId("tab-share")).toBeInTheDocument();
    expect(screen.getByTestId("tab-embed")).toBeInTheDocument();
    expect(screen.getByTestId("tab-message")).toBeInTheDocument();
  });

  it("shows share tab content by default", () => {
    render(<SharePopup track={track} onClose={onClose} />);
    expect(screen.getByTestId("share-tab-content")).toBeInTheDocument();
  });

  it("switches to embed tab on click", () => {
    render(<SharePopup track={track} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("tab-embed"));
    expect(screen.getByTestId("embed-tab-content")).toBeInTheDocument();
  });

  it("switches to message tab on click", () => {
    render(<SharePopup track={track} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("tab-message"));
    expect(screen.getByTestId("message-tab-content")).toBeInTheDocument();
  });

  it("shows social icons in the share tab", () => {
    render(<SharePopup track={track} onClose={onClose} />);
    expect(screen.getByTestId("social-twitter")).toBeInTheDocument();
    expect(screen.getByTestId("social-facebook")).toBeInTheDocument();
  });

  it("close button calls onClose after animation", async () => {
    vi.useFakeTimers();
    render(<SharePopup track={track} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("button-close-share-popup"));
    await vi.runAllTimersAsync();
    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("closes on Escape key", async () => {
    vi.useFakeTimers();
    render(<SharePopup track={track} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    await vi.runAllTimersAsync();
    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("renders Copy button in share tab", () => {
    render(<SharePopup track={track} onClose={onClose} />);
    expect(screen.getByTestId("button-copy-link")).toBeInTheDocument();
  });

  it("renders embed textarea in embed tab", () => {
    render(<SharePopup track={track} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("tab-embed"));
    expect(screen.getByTestId("embed-code-textarea")).toBeInTheDocument();
  });
});
