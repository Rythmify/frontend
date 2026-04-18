import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import * as Tooltip from "@radix-ui/react-tooltip";
import TrackItem from "@/components/playlist/TrackItem";

const mockSetTrack = vi.fn();
const mockRepostTrack = vi.fn();

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: vi.fn((selector: (state: { setTrack: typeof mockSetTrack }) => unknown) =>
    selector({ setTrack: mockSetTrack }),
  ),
}));

vi.mock("@/services/mocks/Track.service", () => ({
  repostTrack: (...args: unknown[]) => mockRepostTrack(...args),
}));

vi.mock("@/pages/[username]/[trackSlug]/components/SharePopup", () => ({
  default: () => <div data-test="share-popup" />,
}));

vi.mock("@/components/playlist/AddToPlaylistModal", () => ({
  default: () => <div data-test="add-to-playlist-modal" />,
}));

const mockTrack = {
  track_id: "t1",
  title: "Alpha",
  artist_name: "ArtA",
  artist_username: "ua",
  play_count: 2500,
  duration: 120,
  cover_image: "https://example.com/cover.jpg",
  added_at: "2026-01-01T00:00:00Z",
  is_public: true,
} as any;

describe("Playlist TrackItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the track metadata and cover", () => {
    render(
      <Tooltip.Provider>
        <MemoryRouter>
          <TrackItem
            track={mockTrack}
            index={1}
            isCurrent={false}
            isPlaying={false}
            onLike={vi.fn()}
          />
        </MemoryRouter>
      </Tooltip.Provider>,
    );

    expect(screen.getByRole("link", { name: "ArtA" })).toHaveAttribute(
      "href",
      expect.stringContaining("/ua"),
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByAltText("Alpha")).toHaveAttribute(
      "src",
      "https://example.com/cover.jpg",
    );
    expect(screen.getByTestId("link-track-title-t1")).toHaveAttribute(
      "href",
      "/ua/t1",
    );
    expect(screen.getByText("2.5K")).toBeInTheDocument();
  });

  it("calls onPlay when the play button is clicked", () => {
    const onPlay = vi.fn();

    render(
      <Tooltip.Provider>
        <MemoryRouter>
          <TrackItem
            track={mockTrack}
            index={1}
            isCurrent={false}
            isPlaying={false}
            onPlay={onPlay}
            onLike={vi.fn()}
          />
        </MemoryRouter>
      </Tooltip.Provider>,
    );

    fireEvent.mouseEnter(screen.getByTestId("track-Item-t1"));
    fireEvent.click(screen.getByTestId("button-play-track-t1"));

    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(mockSetTrack).not.toHaveBeenCalled();
  });

  it("sets the player track when the row is clicked without onPlay", () => {
    render(
      <Tooltip.Provider>
        <MemoryRouter>
          <TrackItem
            track={mockTrack}
            index={1}
            isCurrent={false}
            isPlaying={false}
            onLike={vi.fn()}
          />
        </MemoryRouter>
      </Tooltip.Provider>,
    );

    fireEvent.click(screen.getByTestId("track-Item-t1"));

    expect(mockSetTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "t1",
        title: "Alpha",
        artistName: "ArtA",
        artistUsername: "ua",
      }),
    );
  });

  it("opens the more menu on hover and click", () => {
    render(
      <Tooltip.Provider>
        <MemoryRouter>
          <TrackItem
            track={mockTrack}
            index={1}
            isCurrent={false}
            isPlaying={false}
            onLike={vi.fn()}
          />
        </MemoryRouter>
      </Tooltip.Provider>,
    );

    fireEvent.mouseEnter(screen.getByTestId("track-Item-t1"));
    fireEvent.click(screen.getByTestId("button-more-track-t1"));

    expect(screen.getByText("Add to Next up")).toBeInTheDocument();
    expect(screen.getByText("Add to Playlist")).toBeInTheDocument();
    expect(screen.getByText("Station")).toBeInTheDocument();
  });
});
