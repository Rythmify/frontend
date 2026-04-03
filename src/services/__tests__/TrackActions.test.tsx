import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TrackActions from "../../pages/[username]/[trackSlug]/components/TrackActions";
import type { Track } from "../../types/track";

vi.mock("../../services/mocks/Track.service", () => ({
  likeTrack: vi.fn().mockResolvedValue({ liked: true, likeCount: 101 }),
  unlikeTrack: vi.fn().mockResolvedValue({ liked: false, likeCount: 99 }),
  repostTrack: vi.fn().mockResolvedValue({ reposted: true, repostCount: 11 }),
  postComment: vi.fn().mockResolvedValue({}),
}));

const baseTrack: Track = {
  id: 1,
  title: "Test Song",
  artistName: "Test Artist",
  artistUsername: "test-artist",
  coverUrl: "",
  genre: "Pop",
  likeCount: 100,
  repostCount: 10,
  playCount: 5000,
  commentCount: 3,
  duration: "3:00",
  postedAt: "1 day ago",
  waveformData: [],
  audioUrl: "/audio/test.mp3",
  trackSlug: "test-song",
  isPrivate: false,
};

describe("TrackActions", () => {
  const onAddToNextUp = vi.fn();
  const onComment = vi.fn();

  beforeEach(() => {
    onAddToNextUp.mockClear();
    onComment.mockClear();
  });

  it("renders the action bar", () => {
    render(<TrackActions track={baseTrack} onAddToNextUp={onAddToNextUp} onComment={onComment} />);
    expect(screen.getByTestId("track-action-bar")).toBeInTheDocument();
  });

  it("renders like and repost stat counts", () => {
    render(<TrackActions track={baseTrack} />);
    expect(screen.getByTestId("stat-like-count")).toHaveTextContent("100");
    expect(screen.getByTestId("stat-repost-count")).toBeInTheDocument();
  });

  it("formats large like counts as K", () => {
    render(<TrackActions track={{ ...baseTrack, likeCount: 14000 }} />);
    expect(screen.getByTestId("stat-like-count")).toHaveTextContent("14K");
  });

  it("clicking Like calls likeTrack and updates count", async () => {
    render(<TrackActions track={baseTrack} />);
    fireEvent.click(screen.getByTestId("button-like"));
    await waitFor(() => {
      expect(screen.getByTestId("stat-like-count")).toHaveTextContent("101");
    });
  });

  it("clicking More toggles the dropdown", () => {
    render(<TrackActions track={baseTrack} />);
    expect(screen.queryByTestId("dropdown-more")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("button-more"));
    expect(screen.getByTestId("dropdown-more")).toBeInTheDocument();
  });

  it("clicking outside More closes the dropdown", () => {
    render(<TrackActions track={baseTrack} />);
    fireEvent.click(screen.getByTestId("button-more"));
    expect(screen.getByTestId("dropdown-more")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId("dropdown-more")).not.toBeInTheDocument();
  });

  it("shows 'Make public' in dropdown only when track is private", () => {
    render(<TrackActions track={{ ...baseTrack, isPrivate: true }} />);
    fireEvent.click(screen.getByTestId("button-more"));
    expect(screen.getByTestId("dropdown-item-make-public")).toBeInTheDocument();
  });

  it("hides 'Make public' when track is public", () => {
    render(<TrackActions track={baseTrack} />);
    fireEvent.click(screen.getByTestId("button-more"));
    expect(screen.queryByTestId("dropdown-item-make-public")).not.toBeInTheDocument();
  });

  it("clicking Share opens SharePopup", () => {
    render(<TrackActions track={baseTrack} />);
    fireEvent.click(screen.getByTestId("button-share"));
    expect(screen.getByTestId("share-popup-overlay")).toBeInTheDocument();
  });

  it("calls onAddToNextUp when Add to Next Up is clicked", () => {
    render(<TrackActions track={baseTrack} onAddToNextUp={onAddToNextUp} />);
    fireEvent.click(screen.getByTestId("button-add-next-up"));
    expect(onAddToNextUp).toHaveBeenCalledOnce();
  });
});
