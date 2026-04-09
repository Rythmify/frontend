import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TrackList from "../../pages/[username]/[trackSlug]/components/TrackList";
import type { Track } from "../../types/track";

vi.mock("react-router-dom", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}));

const makeTrack = (id: string, title = `Track ${id}`): Track => ({
  id,
  title,
  artistName: "Artist",
  artistUsername: "artist",
  coverUrl: `https://picsum.photos/seed/track${id}/100/100`,
  genre: "Pop",
  likeCount: 0,
  repostCount: 0,
  playCount: 0,
  commentCount: 0,
  duration: "3:00",
  postedAt: "1 day ago",
  waveformData: [],
  audioUrl: `/audio/track${id}.mp3`,
  trackSlug: `track-${id}`,
});

const tracks = [
  makeTrack("550e8400-e29b-41d4-a716-442655440000", "Song A"),
  makeTrack("550e8400-e29b-41d4-a716-442655440001", "Song B"),
  makeTrack("550e8400-e29b-41d4-a716-442655440002", "Song C"),
];

describe("TrackList", () => {
  const onTrackPlay = vi.fn();

  beforeEach(() => {
    onTrackPlay.mockClear();
  });

  it("renders the track list container", () => {
    render(<TrackList tracks={tracks} onTrackPlay={onTrackPlay} />);
    expect(screen.getByTestId("track-list")).toBeInTheDocument();
  });

  it("renders all track titles", () => {
    render(<TrackList tracks={tracks} onTrackPlay={onTrackPlay} />);
    expect(screen.getByText("Song A")).toBeInTheDocument();
    expect(screen.getByText("Song B")).toBeInTheDocument();
    expect(screen.getByText("Song C")).toBeInTheDocument();
  });

  it("renders nothing when tracks is empty", () => {
    render(<TrackList tracks={[]} onTrackPlay={onTrackPlay} />);
    expect(screen.getByTestId("track-list")).toBeEmptyDOMElement();
  });

  it("renders nothing when tracks is undefined (guard)", () => {
    render(<TrackList tracks={undefined as any} onTrackPlay={onTrackPlay} />);
    expect(screen.getByTestId("track-list")).toBeEmptyDOMElement();
  });

  it("calls onTrackPlay when a row is clicked", () => {
    render(<TrackList tracks={tracks} onTrackPlay={onTrackPlay} />);
    const rows = document.querySelectorAll("[data-test='track-list'] > *");
    fireEvent.click(rows[0]);
    expect(onTrackPlay).toHaveBeenCalledWith(tracks[0]);
  });

  it("highlights the currently playing track", () => {
    render(
      <TrackList
        tracks={tracks}
        currentTrackId={"550e8400-e29b-41d4-a716-446655440000"}
        isPlaying={true}
        onTrackPlay={onTrackPlay}
      />,
    );
    expect(screen.getByTestId("button-play-track-2")).toBeInTheDocument();
  });
});
