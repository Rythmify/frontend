import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UsernamePage from "@/pages/[username]/UsernamePage";

const mockNavigate = vi.fn();
const mockGetMyProfile = vi.fn();
const mockGetUserById = vi.fn();
const mockGetFollowers = vi.fn();
const mockGetFollowing = vi.fn();
const mockGetFollowStatus = vi.fn();
const mockUpdateMyProfile = vi.fn();
const mockGetMyTracks = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/services/user.service", () => ({
  getMyProfile: (...args: unknown[]) => mockGetMyProfile(...args),
  getUserById: (...args: unknown[]) => mockGetUserById(...args),
  getFollowers: (...args: unknown[]) => mockGetFollowers(...args),
  getFollowing: (...args: unknown[]) => mockGetFollowing(...args),
  getFollowStatus: (...args: unknown[]) => mockGetFollowStatus(...args),
  updateMyProfile: (...args: unknown[]) => mockUpdateMyProfile(...args),
}));

vi.mock("@/services/api/upload/track.service", () => ({
  getMyTracks: (...args: unknown[]) => mockGetMyTracks(...args),
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
    mockUpdateMyProfile.mockResolvedValue({});
    mockGetMyTracks.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 1, total: 0 },
    });
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
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

  it("returns null when user is not authenticated", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      setUser: vi.fn(),
    });
    const { container } = render(<UsernamePage />);
    expect(container.firstChild).toBeNull();
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
    expect(screen.getByTestId("profile-header")).toHaveTextContent(
      "Travis Scott",
    );
  });
});
