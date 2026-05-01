import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as Tooltip from "@radix-ui/react-tooltip";
import TrackItem from "@/components/playlist/TrackItem";
import { useLikesStore } from "@/stores/likes.store";
import { usePlayerStore } from "@/stores/player.store";
import { getUsernameFromId } from "@/services/user.service";

const mockNavigate = vi.fn();
const mockSetTrack = vi.fn();
const mockRepostTrack = vi.fn();
const mockWriteText = vi.fn(() => Promise.resolve());

Object.defineProperty(navigator, "clipboard", {
  value: { writeText: mockWriteText },
  configurable: true,
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/stores/player.store", () => ({
  usePlayerStore: vi.fn((selector: (state: { setTrack: typeof mockSetTrack }) => unknown) =>
    selector({ setTrack: mockSetTrack }),
  ),
}));

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: vi.fn(),
}));

vi.mock("@/services/user.service", () => ({
  getUsernameFromId: vi.fn(),
}));

vi.mock("@/services/mocks/Track.service", () => ({
  repostTrack: (...args: unknown[]) => mockRepostTrack(...args),
}));

vi.mock("@/pages/[username]/[trackSlug]/components/SharePopup", () => ({
  default: ({ onClose }: any) => (
    <div data-test="share-popup">
      <button onClick={onClose}>close</button>
    </div>
  ),
}));

const mockAddToPlaylistModal = vi.fn();

vi.mock("@/components/playlist/AddToPlaylistModal", () => ({
  default: (props: any) => {
    mockAddToPlaylistModal(props);
    return (
      <div data-test="add-to-playlist-modal">
        <button onClick={props.onClose}>close</button>
      </div>
    );
  },
}));

const mockTrack = {
  track_id: "t1",
  title: "Alpha",
  artist_name: "ArtA",
  artist_id: "ua-id",
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
    mockNavigate.mockReset();
    mockWriteText.mockResolvedValue(undefined);
    vi.mocked(getUsernameFromId).mockResolvedValue("ua");
    vi.mocked(useLikesStore).mockReturnValue({
      isTrackLiked: vi.fn(() => false),
      toggleTrack: vi.fn(),
    } as any);
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
        artistName: "ua",
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

  it("navigates to the artist station from the more menu", () => {
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
    fireEvent.click(screen.getByTestId("dropdown-station-track-t1"));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/discover/stations/ua:ua-id",
    );
  });

  it("toggles track likes from the shared store", () => {
    const toggleTrack = vi.fn();
    vi.mocked(useLikesStore).mockReturnValue({
      isTrackLiked: vi.fn(() => false),
      toggleTrack,
    } as any);

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
    fireEvent.click(screen.getByTestId("button-like-track-t1"));

    expect(toggleTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "t1",
        title: "Alpha",
        artistName: "ua",
      }),
    );
  });

  it("shows repost active styling after reposting", async () => {
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
    fireEvent.click(screen.getByTestId("button-repost-track-t1"));

    expect(mockRepostTrack).toHaveBeenCalledWith("t1");
    await waitFor(() =>
      expect(screen.getByTestId("button-repost-track-t1")).toHaveClass(
        "text-[var(--color-accent)]",
      ),
    );
  });

  it("shows a link copied message when copy link is clicked", async () => {
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
    fireEvent.click(screen.getByTestId("button-copy-link-track-t1"));

    expect(mockWriteText).toHaveBeenCalledWith(
      `${window.location.origin}/ua/t1`,
    );
    expect(await screen.findByText("Link copied")).toBeInTheDocument();
  });

  it("falls back to the track username when artist_id is missing", async () => {
    const fallbackTrack = { ...mockTrack, artist_id: undefined, artist_username: "fallback-user" };

    render(
      <Tooltip.Provider>
        <MemoryRouter>
          <TrackItem
            track={fallbackTrack}
            index={1}
            isCurrent={false}
            isPlaying={false}
            onLike={vi.fn()}
          />
        </MemoryRouter>
      </Tooltip.Provider>,
    );

    expect(getUsernameFromId).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "ArtA" })).toHaveAttribute(
      "href",
      expect.stringContaining("/fallback-user"),
    );
  });

  it("keeps the fallback username when the lookup fails", async () => {
    vi.mocked(getUsernameFromId).mockRejectedValueOnce(new Error("boom"));

    render(
      <Tooltip.Provider>
        <MemoryRouter>
          <TrackItem
            track={mockTrack}
            index={1}
            isCurrent={false}
            isPlaying={false}
            onLike={vi.fn() }
          />
        </MemoryRouter>
      </Tooltip.Provider>,
    );

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "ArtA" })).toHaveAttribute(
        "href",
        expect.stringContaining("/ua"),
      ),
    );
  });

  it("adds the track to the next up queue from the more menu", () => {
    const addToQueue = vi.fn();
    vi.mocked(useLikesStore).mockReturnValue({
      isTrackLiked: vi.fn(() => false),
      toggleTrack: vi.fn(),
    } as any);
    vi.mocked(usePlayerStore).mockImplementation((selector: any) =>
      selector({ setTrack: mockSetTrack, addToQueue }),
    );

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
    fireEvent.click(screen.getByText("Add to Next up"));

    expect(addToQueue).toHaveBeenCalledTimes(1);
  });

  it("opens the add-to-playlist modal from the more menu", () => {
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
    fireEvent.click(screen.getByText("Add to Playlist"));

    expect(screen.getByTestId("add-to-playlist-modal")).toBeInTheDocument();
    expect(mockAddToPlaylistModal).toHaveBeenCalledWith(
      expect.objectContaining({
        trackId: "t1",
        trackTitle: "Alpha",
        onClose: expect.any(Function),
      }),
    );
    fireEvent.click(screen.getByText("close"));
    expect(screen.queryByTestId("add-to-playlist-modal")).not.toBeInTheDocument();
  });

  it("opens the share popup and lets it close again", () => {
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
    fireEvent.click(screen.getByTestId("button-share-track"));
    expect(screen.getByTestId("share-popup")).toBeInTheDocument();
    fireEvent.click(screen.getByText("close"));
    expect(screen.queryByTestId("share-popup")).not.toBeInTheDocument();
  });

  it("does not bubble clicks from the artist or title links", () => {
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

    fireEvent.click(screen.getByRole("link", { name: "ArtA" }));
    fireEvent.click(screen.getByTestId("link-track-title-t1"));

    expect(mockSetTrack).not.toHaveBeenCalled();
  });

  it("resets the hover menu when the row loses hover", () => {
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

    const row = screen.getByTestId("track-Item-t1");
    fireEvent.mouseEnter(row);
    fireEvent.click(screen.getByTestId("button-more-track-t1"));
    expect(screen.getByTestId("dropdown-more-track-t1")).toBeInTheDocument();
    fireEvent.mouseLeave(row);
    expect(screen.queryByTestId("dropdown-more-track-t1")).not.toBeInTheDocument();
  });

  it("logs repost and copy failures without crashing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockRepostTrack.mockRejectedValueOnce(new Error("boom"));
    mockWriteText.mockRejectedValueOnce(new Error("copy boom"));

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
    fireEvent.click(screen.getByTestId("button-repost-track-t1"));
    fireEvent.click(screen.getByTestId("button-copy-link-track-t1"));

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        "Failed to repost track:",
        expect.any(Error),
      ),
    );
    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        "Failed to copy link:",
        expect.any(Error),
      ),
    );
    errorSpy.mockRestore();
  });
});
