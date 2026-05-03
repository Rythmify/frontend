import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LikesPage from "@/pages/you/likes/LikesPage";
import type { Track } from "@/types/track";
import { getMyLikedTracks, getUserLikedTracks } from "@/services/user.service";

const { mockNavigate, mockTrack, mockAlbum, mockPlaylistCard, mockLikesState, mockSetState } =
  vi.hoisted(() => {
    const mockTrack: Track = {
      id: "track-1",
      title: "Track One",
      artistName: "Artist One",
      artistUsername: "",
      trackSlug: "",
      coverUrl: "",
      audioUrl: "",
      duration: "3:12",
      playCount: 12,
      likeCount: 4,
      repostCount: 0,
      commentCount: 0,
      genre: "House",
      waveformData: [],
      postedAt: "",
    };

    const mockAlbum = {
      playlist_id: "album-1",
      owner_user_id: "me",
      name: "Liked Album",
      description: null,
      is_public: true,
      created_at: "2026-04-24T00:00:00Z",
      track_count: 9,
      like_count: 3,
      cover_image: null,
      is_album_view: true,
    };

    const mockPlaylistCard = {
      id: "playlist-1",
      title: "Liked Playlist",
      owner: "me",
      ownerUsername: "me",
      coverUrl: null,
      isPrivate: false,
      isLiked: true,
      isAlbumView: false,
    };

    const mockLikesState = {
      likedTracks: [mockTrack],
      likedPlaylists: [mockPlaylistCard],
      likedAlbums: [mockAlbum],
    };

    const mockSetState = vi.fn((updater: any) => {
      if (typeof updater === "function") {
        const next = updater(mockLikesState);
        if (next) Object.assign(mockLikesState, next);
        return;
      }

      if (updater && typeof updater === "object") {
        Object.assign(mockLikesState, updater);
      }
    });

    return {
      mockNavigate: vi.fn(),
      mockTrack,
      mockAlbum,
      mockPlaylistCard,
      mockLikesState,
      mockSetState,
    };
  });

const mockCurrentUser = {
  id: "1",
  username: "me",
  displayName: "Me",
  avatar: "",
};

const defaultLikedTracksResponse = {
  items: [
    {
      id: "track-1",
      title: "Track One",
      artist_name: "Artist One",
      cover_image: null,
      stream_url: null,
      duration: 192,
      play_count: 12,
      like_count: 4,
      genre: "House",
    },
  ],
  pagination: { limit: 100, offset: 0, total: 1 },
};

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: Object.assign(
    (selector?: (state: typeof mockLikesState) => unknown) =>
      selector ? selector(mockLikesState) : mockLikesState,
    {
      setState: mockSetState,
    },
  ),
}));

vi.mock("@/services/user.service", () => ({
  getMyLikedTracks: vi.fn().mockResolvedValue({
    items: [
      {
        id: "track-1",
        title: "Track One",
        artist_name: "Artist One",
        cover_image: null,
        stream_url: null,
        duration: 192,
        play_count: 12,
        like_count: 4,
        genre: "House",
      },
    ],
    pagination: { limit: 100, offset: 0, total: 1 },
  }),
  getUserByUsername: vi.fn().mockResolvedValue({
    id: "travis-scott-id",
    display_name: "Travis Scott",
    profile_picture: null,
    username: "travis-scott",
  }),
  getUserWebProfiles: vi.fn().mockResolvedValue([]),
  getUserLikedTracks: vi.fn().mockResolvedValue({
    items: [
      {
        id: "track-2",
        title: "Public Like",
        artist_name: "Artist Two",
        cover_image: null,
        stream_url: null,
        duration: 180,
        play_count: 8,
        like_count: 2,
        genre: "Pop",
      },
    ],
    pagination: { limit: 100, offset: 0, total: 1 },
  }),
}));

vi.mock("@/components/Profile/ShareModal/ShareModal", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-test="share-modal">
      <button data-test="close-share-modal" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

vi.mock("@/components/UI/LikesContent/LikesContent", () => ({
  default: ({ tracks }: { tracks: Track[] }) => (
    <div data-test="likes-content">
      {tracks.map((track) => (
        <span key={track.id}>{track.title}</span>
      ))}
    </div>
  ),
}));

vi.mock("@/components/UI/PlaylistCard/PlaylistCard", () => ({
  default: ({ item }: { item: { id: string; title: string } }) => (
    <div data-test="liked-playlist-card">{item.title}</div>
  ),
}));

vi.mock("@/components/playlist/PlaylistCard", () => ({
  default: ({ playlist }: { playlist: { playlist_id: string; name: string } }) => (
    <div data-test="liked-album-card">{playlist.name}</div>
  ),
}));

import { useAuthStore } from "@/stores/auth.store";
import { useParams, useLocation } from "react-router-dom";

describe("LikesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockLikesState, {
      likedTracks: [mockTrack],
      likedPlaylists: [mockPlaylistCard],
      likedAlbums: [mockAlbum],
    });
    vi.mocked(getMyLikedTracks).mockResolvedValue(
      defaultLikedTracksResponse as any,
    );

    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockCurrentUser,
    });
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/me/likes",
    });
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "me",
    });
  });

  it("renders page title for owner", () => {
    render(<LikesPage />);
    expect(screen.getByTestId("likes-page-title")).toHaveTextContent(
      "Likes by Me",
    );
  });

  it("renders page title for non-owner", () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/travis-scott/likes",
    });

    render(<LikesPage />);
    return waitFor(() =>
      expect(screen.getByTestId("likes-page-title")).toHaveTextContent(
        "Likes by Travis Scott",
      ),
    );
  });

  it("renders all tabs", () => {
    render(<LikesPage />);
    expect(screen.getByTestId("likes-tab-likes")).toBeInTheDocument();
    expect(screen.getByTestId("likes-tab-following")).toBeInTheDocument();
    expect(screen.getByTestId("likes-tab-followers")).toBeInTheDocument();
  });

  it("highlights Likes tab as active", () => {
    render(<LikesPage />);
    expect(screen.getByTestId("likes-tab-likes")).toHaveClass(
      "text-bg-inverted",
    );
  });

  it("navigates to following page on Following tab click", () => {
    render(<LikesPage />);
    fireEvent.click(screen.getByTestId("likes-tab-following"));
    expect(mockNavigate).toHaveBeenCalledWith("/me/following");
  });

  it("navigates to followers page on Followers tab click", () => {
    render(<LikesPage />);
    fireEvent.click(screen.getByTestId("likes-tab-followers"));
    expect(mockNavigate).toHaveBeenCalledWith("/me/follower");
  });

  it("shows owner description text", () => {
    render(<LikesPage />);
    expect(screen.getByTestId("likes-description")).toHaveTextContent(
      "Hear the tracks, playlists, and albums you've liked",
    );
  });

  it("shows non-owner description text", () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/travis-scott/likes",
    });

    render(<LikesPage />);
    return waitFor(() =>
      expect(screen.getByTestId("likes-description")).toHaveTextContent(
        "Hear the tracks, playlists, and albums Travis Scott has liked",
      ),
    );
  });

  it("renders public liked tracks for non-owner", async () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/travis-scott/likes",
    });

    render(<LikesPage />);

    await waitFor(() => {
      expect(getUserLikedTracks).toHaveBeenCalledWith("travis-scott-id", {
        limit: 100,
      });
    });

    expect(screen.getByTestId("likes-content")).toHaveTextContent("Public Like");
  });

  it("renders liked tracks, playlists, and albums for owner", () => {
    render(<LikesPage />);

    expect(screen.getByTestId("likes-content")).toHaveTextContent("Track One");
    expect(screen.getByText("Liked playlists")).toBeInTheDocument();
    expect(screen.getAllByTestId("liked-playlist-card")[0]).toHaveTextContent(
      "Liked Playlist",
    );
    expect(screen.getByText("Liked albums")).toBeInTheDocument();
    expect(screen.getAllByTestId("liked-playlist-card")[1]).toHaveTextContent(
      "Liked Album",
    );
  });

  it("shows empty state for owner", () => {
    Object.assign(mockLikesState, {
      likedTracks: [],
      likedPlaylists: [],
      likedAlbums: [],
    });
    vi.mocked(getMyLikedTracks).mockResolvedValue({
      items: [],
      pagination: { limit: 100, offset: 0, total: 0 },
    } as any);

    render(<LikesPage />);
    return waitFor(() =>
      expect(screen.getByText("You have no likes yet.")).toBeInTheDocument(),
    );
  });

  it("shows empty state for non-owner when there are no liked tracks", async () => {
    vi.mocked(getUserLikedTracks).mockResolvedValueOnce({
      items: [],
      pagination: { limit: 100, offset: 0, total: 0 },
    } as any);
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/travis-scott/likes",
    });

    render(<LikesPage />);
    return waitFor(() =>
      expect(
        screen.getByText("Travis Scott hasn't liked anything yet."),
      ).toBeInTheDocument(),
    );
  });

  it("opens share modal on share button click", () => {
    render(<LikesPage />);
    fireEvent.click(screen.getByTestId("likes-share-button"));
    expect(screen.getByTestId("share-modal")).toBeInTheDocument();
  });

  it("closes share modal on close", () => {
    render(<LikesPage />);
    fireEvent.click(screen.getByTestId("likes-share-button"));
    fireEvent.click(screen.getByTestId("close-share-modal"));
    expect(screen.queryByTestId("share-modal")).not.toBeInTheDocument();
  });

  it("navigates to user profile when avatar is clicked", () => {
    render(<LikesPage />);
    fireEvent.click(screen.getByTestId("likes-user-avatar"));
    expect(mockNavigate).toHaveBeenCalledWith("/me");
  });

  it("renders footer links", () => {
    render(<LikesPage />);
    expect(screen.getByTestId("footer-link-legal")).toBeInTheDocument();
    expect(screen.getByTestId("footer-link-privacy")).toBeInTheDocument();
  });

  it("renders language selector", () => {
    render(<LikesPage />);
    expect(screen.getByTestId("language-selector")).toHaveTextContent(
      "English (US)",
    );
  });
});
