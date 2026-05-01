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

  it("loads my tracks on mount and picks a track", async () => {
    const user = userEvent.setup();
    const { onPick, onClose } = renderPicker();

    expect(screen.getByTestId("track-playlist-picker")).toBeInTheDocument();
    expect(await screen.findByText("Midnight Loop")).toBeInTheDocument();
    expect(screen.getByText("Mina")).toBeInTheDocument();
    expect(screen.getByText("2:05")).toBeInTheDocument();
    expect(mockFetchMyTracks).toHaveBeenCalledWith(50, 0);

    await user.click(screen.getByText("Midnight Loop"));

    expect(onPick).toHaveBeenCalledWith({
      type: "track",
      id: "track-1",
      title: "Midnight Loop",
      artistName: "Mina",
      coverImage: "cover.png",
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("filters the active tab by search query", async () => {
    const user = userEvent.setup();
    renderPicker();
    await screen.findByText("Midnight Loop");

    await user.type(screen.getByPlaceholderText("Select a track or playlist from your profile"), "nothing");
    expect(screen.getByText("No tracks found.")).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("Select a track or playlist from your profile"));
    await user.type(screen.getByPlaceholderText("Select a track or playlist from your profile"), "mina");
    expect(screen.getByText("Midnight Loop")).toBeInTheDocument();
  });

  it("loads reposted tracks and handles missing duration and cover image", async () => {
    const user = userEvent.setup();
    const { onPick } = renderPicker();

    await user.click(screen.getByText("Reposted Tracks"));
    expect(await screen.findByText("Shared Beat")).toBeInTheDocument();
    expect(mockFetchMyRepostedTracks).toHaveBeenCalledWith(50, 0);

    await user.click(screen.getByText("Shared Beat"));
    expect(onPick).toHaveBeenCalledWith({
      type: "track",
      id: "track-2",
      title: "Shared Beat",
      artistName: "Nour",
      coverImage: null,
    });
  });

  it("loads my playlists and picks a playlist", async () => {
    const user = userEvent.setup();
    const { onPick, onClose } = renderPicker();

    await user.click(screen.getByText("My Playlists"));
    expect(await screen.findByText("Studio Picks")).toBeInTheDocument();
    expect(screen.getByText("1 track")).toBeInTheDocument();
    expect(mockFetchUserPlaylists).toHaveBeenCalledWith("me-1", 50, 0);

    await user.click(screen.getByText("Studio Picks"));
    expect(onPick).toHaveBeenCalledWith({
      type: "playlist",
      id: "playlist-1",
      title: "Studio Picks",
      trackCount: 1,
      coverImage: "playlist.png",
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("loads reposted playlists and renders plural track count", async () => {
    const user = userEvent.setup();
    const { onPick } = renderPicker();

    await user.click(screen.getByText("Reposted Playlists"));
    expect(await screen.findByText("Borrowed Gems")).toBeInTheDocument();
    expect(screen.getByText("4 tracks")).toBeInTheDocument();
    expect(mockFetchMyRepostedPlaylists).toHaveBeenCalledWith(50, 0);

    await user.click(screen.getByText("Borrowed Gems"));
    expect(onPick).toHaveBeenCalledWith({
      type: "playlist",
      id: "playlist-2",
      title: "Borrowed Gems",
      trackCount: 4,
      coverImage: null,
    });
  });

  it("shows empty states and ignores failed tab fetches", async () => {
    const user = userEvent.setup();
    mockFetchMyTracks.mockResolvedValueOnce({ data: [] });
    mockFetchMyRepostedTracks.mockRejectedValueOnce(new Error("nope"));

    renderPicker();
    expect(await screen.findByText("No tracks found.")).toBeInTheDocument();

    await user.click(screen.getByText("Reposted Tracks"));
    await waitFor(() => expect(mockFetchMyRepostedTracks).toHaveBeenCalled());
    expect(screen.getByText("No reposted tracks found.")).toBeInTheDocument();
  });

  it("closes when clicking outside the picker", async () => {
    const { onClose } = renderPicker();
    await screen.findByText("Midnight Loop");

    fireEvent.mouseDown(document.body);

    expect(onClose).toHaveBeenCalled();
  });
});
