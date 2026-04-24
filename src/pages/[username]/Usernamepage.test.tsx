import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UsernamePage from "@/pages/[username]/UsernamePage";

const mockNavigate = vi.fn();
const mockGetMyProfile = vi.fn();
const mockGetUserById = vi.fn();
const mockGetFollowers = vi.fn();
const mockGetFollowing = vi.fn();
const mockGetFollowStatus = vi.fn();
const mockResolveUsername = vi.fn();
const mockUpdateMyProfile = vi.fn();
const mockGetMyTracks = vi.fn();
const mockGetUserTracks = vi.fn();
const mockGetUserByUsername = vi.fn();
const mockGetPlaylistsByUser = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: vi.fn(),
  useLocation: vi.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/services/user.service", () => ({
  getMyProfile: (...args: unknown[]) => mockGetMyProfile(...args),
  getUserById: (...args: unknown[]) => mockGetUserById(...args),
  getUserByUsername: (...args: unknown[]) => mockGetUserByUsername(...args),
  getFollowers: (...args: unknown[]) => mockGetFollowers(...args),
  getFollowing: (...args: unknown[]) => mockGetFollowing(...args),
  getFollowStatus: (...args: unknown[]) => mockGetFollowStatus(...args),
  resolveUsername: (...args: unknown[]) => mockResolveUsername(...args),
  updateMyProfile: (...args: unknown[]) => mockUpdateMyProfile(...args),
}));

vi.mock("@/services/track.service", () => ({
  getMyTracks: (...args: unknown[]) => mockGetMyTracks(...args),
  getUserTracks: (...args: unknown[]) => mockGetUserTracks(...args),
}));

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getPlaylistsByUser: (...args: unknown[]) => mockGetPlaylistsByUser(...args),
}));

vi.mock("@/components/Profile/MockData/mock", () => ({
  mockLikedTracks: [],
  mockFollowing: [{ username: "travis-scott" }],
  mockFollowers: [
    { username: "follower1", followers: 3, avatar: "", isVerified: false },
  ],
  mockUserFollowing: {},
  mockUserFollowers: {},
  mockUserProfiles: {
    "travis-scott": {
      displayName: "Travis Scott",
      avatar: "",
      coverUrl: "",
      location: "Houston, TX",
      bio: "Multi-platinum artist",
      followers: 6000000,
      following: 200,
      tracks: 174,
      likedTracks: [],
    },
  },
}));

vi.mock("@/components/Profile/ProfileHeader/ProfileHeader", () => ({
  default: ({ user }: { user: { displayName: string } }) => (
    <div data-test="profile-header">{user.displayName}</div>
  ),
}));

vi.mock("@/components/Profile/ProfileTabs/ProfileTabs", () => ({
  default: ({
    onTabChange,
    onShare,
    onEdit,
    isOwner,
    selectedTab,
  }: {
    onTabChange: (t: string) => void;
    onShare: () => void;
    onEdit: () => void;
    isOwner: boolean;
    selectedTab: string;
  }) => (
    <div data-test="profile-tabs">
      <span data-test="selected-tab">{selectedTab}</span>
      <button data-test="tab-Tracks" onClick={() => onTabChange("Tracks")}>
        Tracks
      </button>
      <button data-test="tab-Albums" onClick={() => onTabChange("Albums")}>
        Albums
      </button>
      {isOwner && (
        <button data-test="owner-share-button" onClick={onShare}>
          Share
        </button>
      )}
      {isOwner && (
        <button data-test="owner-edit-button" onClick={onEdit}>
          Edit
        </button>
      )}
    </div>
  ),
}));

vi.mock("@/components/Profile/ProfileSideBar/ProfileSideBar", () => ({
  default: () => <div data-test="profile-sidebar" />,
}));

vi.mock("@/components/Profile/ShareModal/ShareModal", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-test="share-modal">
      <button data-test="close-share" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

vi.mock("@/components/Profile/EditProfileModal/EditProfileModal", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-test="edit-modal">
      <button data-test="close-edit" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

import { useAuthStore } from "@/stores/auth.store";
import { useParams, useLocation } from "react-router-dom";

const mockCurrentUser = {
  id: "1",
  username: "me",
  displayName: "Me",
  firstName: "Me",
  lastName: "",
  bio: "My bio",
  email: "me@test.com",
  role: "listener" as const,
  isPro: false,
  following_ids: ["travis-scott"],
  followers_ids: [],
  avatar: "",
  coverUrl: "",
  location: "",
};

describe("UsernamePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMyProfile.mockResolvedValue({
      id: "1",
      username: "me",
      display_name: "Me",
      bio: "My bio",
      city: null,
      country: null,
      profile_picture: null,
      cover_photo: null,
      followers_count: 1,
      following_count: 1,
    });
    mockGetUserById.mockResolvedValue({
      id: "travis-scott-id",
      username: "travis-scott",
      display_name: "Travis Scott",
      bio: "Multi-platinum artist",
      location: "Houston, TX",
      profile_picture: null,
      cover_photo: null,
      followers_count: 6000000,
      following_count: 200,
    });
    mockGetFollowers.mockResolvedValue({ items: [], meta: { total: 0 } });
    mockGetFollowing.mockResolvedValue({ items: [], meta: { total: 0 } });
    mockGetFollowStatus.mockResolvedValue({ is_following: true });
    mockResolveUsername.mockImplementation(async (value: unknown) => {
      if (value === "travis-scott") {
        return "travis-scott-id";
      }
      return "1";
    });
    mockGetUserByUsername.mockResolvedValue({
      id: "travis-scott-id",
      username: "travis-scott",
      display_name: "Travis Scott",
      bio: "Multi-platinum artist",
      location: "Houston, TX",
      profile_picture: null,
      cover_photo: null,
      followers_count: 6000000,
      following_count: 200,
      gender: null,
      role: "artist",
      is_private: false,
      is_verified: false,
      created_at: "2024-01-01T00:00:00Z",
    });
    mockUpdateMyProfile.mockResolvedValue({});
    mockGetMyTracks.mockResolvedValue({
      tracks: [],
      total: 0,
    });
    mockGetUserTracks.mockResolvedValue({
      tracks: [],
      total: 0,
    });
    mockGetPlaylistsByUser.mockResolvedValue({
      data: {
        items: [],
        meta: { limit: 100, offset: 0, total: 0 },
      },
      message: "ok",
    });
    const authStoreMock = useAuthStore as unknown as ReturnType<typeof vi.fn>;
    authStoreMock.mockReturnValue({
      user: mockCurrentUser,
      setUser: vi.fn(),
    });
    (authStoreMock as unknown as { getState: () => unknown }).getState = () => ({
      user: mockCurrentUser,
      setUser: vi.fn(),
    });
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/me",
    });
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "me",
    });
    localStorage.clear();
  });

  it("renders profile header", () => {
    render(<UsernamePage />);
    expect(screen.getByTestId("profile-header")).toBeInTheDocument();
  });

  it("renders profile tabs", () => {
    render(<UsernamePage />);
    expect(screen.getByTestId("profile-tabs")).toBeInTheDocument();
  });

  it("renders profile sidebar", () => {
    render(<UsernamePage />);
    expect(screen.getByTestId("profile-sidebar")).toBeInTheDocument();
  });

  it("shows empty state message", () => {
    render(<UsernamePage />);
    expect(screen.getByTestId("empty-state-message")).toHaveTextContent(
      "Seems a little quiet over here",
    );
  });

  it("renders tracks and albums in the All tab when data exists", async () => {
    mockGetMyTracks.mockResolvedValue({
      tracks: [
        {
          id: "track-1",
          title: "Track One",
          artistUsername: "me",
          trackSlug: "track-one",
        },
      ],
      total: 1,
    });
    mockGetUserTracks.mockResolvedValue({
      tracks: [
        {
          id: "track-1",
          title: "Track One",
          artistUsername: "me",
          trackSlug: "track-one",
        },
      ],
      total: 1,
    });

    mockGetPlaylistsByUser.mockResolvedValue({
      data: {
        items: [
          {
            playlist_id: "album-1",
            owner_user_id: "1",
            name: "Album One",
            slug: "album-one",
            description: null,
            is_public: true,
            cover_image: null,
            subtype: "album",
            release_date: null,
            genre_id: null,
            tags: [],
            secret_token: null,
            created_at: "",
            updated_at: null,
            track_count: 10,
            like_count: 0,
            is_album_view: true,
          },
        ],
        meta: { limit: 100, offset: 0, total: 1 },
      },
      message: "ok",
    });

    render(<UsernamePage />);

    await waitFor(() => {
      expect(screen.getByText("Tracks")).toBeInTheDocument();
      expect(screen.getByText("Albums")).toBeInTheDocument();
    });
    expect(screen.getByText("Track One")).toBeInTheDocument();
    expect(screen.getByText("Album One")).toBeInTheDocument();
  });

  it("shows Upload now button for owner on All tab", () => {
    render(<UsernamePage />);
    expect(screen.getByTestId("upload-now-button")).toBeInTheDocument();
  });

  it("hides Upload now button for non-owner", () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/travis-scott",
    });

    render(<UsernamePage />);
    expect(screen.queryByTestId("upload-now-button")).not.toBeInTheDocument();
  });

  it("navigates to /upload when Upload now is clicked", () => {
    render(<UsernamePage />);
    fireEvent.click(screen.getByTestId("upload-now-button"));
    expect(mockNavigate).toHaveBeenCalledWith("/upload");
  });

  it("navigates to tracks page when Tracks tab is clicked", () => {
    render(<UsernamePage />);
    fireEvent.click(screen.getByTestId("tab-Tracks"));
    expect(mockNavigate).toHaveBeenCalledWith("/me/tracks");
  });

  it("navigates to albums page when Albums tab is clicked", () => {
    render(<UsernamePage />);
    fireEvent.click(screen.getByTestId("tab-Albums"));
    expect(mockNavigate).toHaveBeenCalledWith("/me/albums");
  });

  it("detects active tab from URL — Tracks", () => {
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/me/tracks",
    });
    render(<UsernamePage />);
    expect(screen.getByTestId("selected-tab")).toHaveTextContent("Tracks");
  });

  it("detects active tab from URL — All", () => {
    render(<UsernamePage />);
    expect(screen.getByTestId("selected-tab")).toHaveTextContent("All");
  });

  it("opens share modal when Share is clicked", () => {
    render(<UsernamePage />);
    fireEvent.click(screen.getByTestId("owner-share-button"));
    expect(screen.getByTestId("share-modal")).toBeInTheDocument();
  });

  it("closes share modal on close", () => {
    render(<UsernamePage />);
    fireEvent.click(screen.getByTestId("owner-share-button"));
    fireEvent.click(screen.getByTestId("close-share"));
    expect(screen.queryByTestId("share-modal")).not.toBeInTheDocument();
  });

  it("opens edit modal when Edit is clicked", () => {
    render(<UsernamePage />);
    fireEvent.click(screen.getByTestId("owner-edit-button"));
    expect(screen.getByTestId("edit-modal")).toBeInTheDocument();
  });

  it("closes edit modal on close", () => {
    render(<UsernamePage />);
    fireEvent.click(screen.getByTestId("owner-edit-button"));
    fireEvent.click(screen.getByTestId("close-edit"));
    expect(screen.queryByTestId("edit-modal")).not.toBeInTheDocument();
  });

  it("renders non-owner profile with correct displayName", () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/travis-scott",
    });

    render(<UsernamePage />);
    expect(screen.getByText("Loading profile…")).toBeInTheDocument();
    return waitFor(() => {
      expect(screen.getByTestId("profile-header")).toHaveTextContent(
        "Travis Scott",
      );
    });
  });
});
