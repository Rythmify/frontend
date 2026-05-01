import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as Tooltip from "@radix-ui/react-tooltip";
import TrackItem from "@/components/playlist/TrackItem";
import { useLikesStore } from "@/stores/likes.store";
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
  default: () => <div data-test="share-popup" />,
}));

vi.mock("@/components/playlist/AddToPlaylistModal", () => ({
  default: () => <div data-test="add-to-playlist-modal" />,
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

    expect(screen.getByRole("link", { name: "ua" })).toHaveAttribute(
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
});
