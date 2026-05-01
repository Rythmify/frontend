import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TrackPlaylistPicker from "@/components/MessagingComponents/TrackPlaylistPicker";
import {
  fetchMyTracks,
  fetchMyRepostedTracks,
  fetchMyRepostedPlaylists,
  fetchUserPlaylists,
} from "@/services/api/messaging/conversationApi";

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector: (state: { user: { id: string } }) => unknown) =>
    selector({ user: { id: "me-1" } }),
}));

vi.mock("@/services/api/messaging/conversationApi", () => ({
  fetchMyTracks: vi.fn(),
  fetchMyRepostedTracks: vi.fn(),
  fetchMyRepostedPlaylists: vi.fn(),
  fetchUserPlaylists: vi.fn(),
}));

const mockFetchMyTracks = fetchMyTracks as ReturnType<typeof vi.fn>;
const mockFetchMyRepostedTracks = fetchMyRepostedTracks as ReturnType<typeof vi.fn>;
const mockFetchMyRepostedPlaylists = fetchMyRepostedPlaylists as ReturnType<typeof vi.fn>;
const mockFetchUserPlaylists = fetchUserPlaylists as ReturnType<typeof vi.fn>;

const myTrack = {
  id: "track-1",
  title: "Midnight Loop",
  artist_name: "Mina",
  cover_image: "cover.png",
  duration: 125,
};

const repostedTrack = {
  id: "track-2",
  title: "Shared Beat",
  artist_name: "Nour",
  cover_image: null,
  duration: null,
};

const playlist = {
  playlist_id: "playlist-1",
  name: "Studio Picks",
  cover_image: "playlist.png",
  track_count: 1,
  is_public: false,
};

const repostedPlaylist = {
  id: "playlist-2",
  title: "Borrowed Gems",
  cover_image: null,
  track_count: 4,
};

function renderPicker(onPick = vi.fn(), onClose = vi.fn()) {
  render(<TrackPlaylistPicker onPick={onPick} onClose={onClose} />);
  return { onPick, onClose };
}

describe("TrackPlaylistPicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchMyTracks.mockResolvedValue({ data: [myTrack] });
    mockFetchMyRepostedTracks.mockResolvedValue({ data: [repostedTrack] });
    mockFetchUserPlaylists.mockResolvedValue({ data: [playlist] });
    mockFetchMyRepostedPlaylists.mockResolvedValue({ data: [repostedPlaylist] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads all track and playlist sources on mount", async () => {
    renderPicker();

    expect(screen.getByTestId("track-playlist-picker")).toBeInTheDocument();
    expect(await screen.findByText("Midnight Loop")).toBeInTheDocument();
    expect(screen.getByText("Shared Beat")).toBeInTheDocument();
    expect(screen.getByText("Studio Picks")).toBeInTheDocument();
    expect(screen.getByText("Borrowed Gems")).toBeInTheDocument();

    expect(mockFetchMyTracks).toHaveBeenCalledWith(50, 0);
    expect(mockFetchMyRepostedTracks).toHaveBeenCalledWith(50, 0);
    expect(mockFetchUserPlaylists).toHaveBeenCalledWith("me-1", 50, 0);
    expect(mockFetchMyRepostedPlaylists).toHaveBeenCalledWith(50, 0);
  });

  it("picks tracks and playlists from the combined menu", async () => {
    const user = userEvent.setup();
    const { onPick, onClose } = renderPicker();

    await user.click(await screen.findByText("Midnight Loop"));
    expect(onPick).toHaveBeenCalledWith({
      type: "track",
      id: "track-1",
      title: "Midnight Loop",
      artistName: "Mina",
      coverImage: "cover.png",
    });
    expect(onClose).toHaveBeenCalledTimes(1);

    onPick.mockClear();
    onClose.mockClear();
    renderPicker(onPick, onClose);

    await user.click(await screen.findByText("Studio Picks"));
    expect(onPick).toHaveBeenCalledWith({
      type: "playlist",
      id: "playlist-1",
      title: "Studio Picks",
      trackCount: 1,
      coverImage: "playlist.png",
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("filters combined results by search query", async () => {
    const user = userEvent.setup();
    renderPicker();
    await screen.findByText("Midnight Loop");

    const input = screen.getByPlaceholderText("Select a track or playlist from your profile");
    await user.type(input, "borrowed");

    expect(screen.getByText("Borrowed Gems")).toBeInTheDocument();
    expect(screen.queryByText("Midnight Loop")).not.toBeInTheDocument();
    expect(screen.queryByText("Studio Picks")).not.toBeInTheDocument();
  });

  it("displays fulfilled sources when another endpoint fails", async () => {
    mockFetchMyTracks.mockRejectedValueOnce(new Error("no tracks"));

    renderPicker();

    await waitFor(() => expect(mockFetchMyTracks).toHaveBeenCalled());
    expect(await screen.findByText("Shared Beat")).toBeInTheDocument();
    expect(screen.getByText("Studio Picks")).toBeInTheDocument();
    expect(screen.getByText("Borrowed Gems")).toBeInTheDocument();
    expect(screen.queryByText("Midnight Loop")).not.toBeInTheDocument();
  });

  it("shows an empty state when every source returns no results", async () => {
    mockFetchMyTracks.mockResolvedValueOnce({ data: [] });
    mockFetchMyRepostedTracks.mockResolvedValueOnce({ data: [] });
    mockFetchUserPlaylists.mockResolvedValueOnce({ data: [] });
    mockFetchMyRepostedPlaylists.mockResolvedValueOnce({ data: [] });

    renderPicker();

    expect(await screen.findByText("No tracks or playlists found.")).toBeInTheDocument();
  });

  it("closes when clicking outside the picker", async () => {
    const { onClose } = renderPicker();
    await screen.findByText("Midnight Loop");

    fireEvent.mouseDown(document.body);

    expect(onClose).toHaveBeenCalled();
  });
});
