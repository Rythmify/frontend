import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfileSideBar from "@/components/Profile/ProfileSideBar/ProfileSideBar";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/components/Profile/FollowButton", () => ({
  default: ({ username }: { username: string }) => (
    <button data-test={`follow-button-${username}`}>Follow</button>
  ),
}));

vi.mock("@/components/Profile/ProfileSideBar/TrackItem", () => ({
  default: ({ title }: { title: string }) => (
    <div data-test={`track-item-${title}`}>{title}</div>
  ),
}));

const mockUser = {
  id: "1",
  username: "testuser",
  displayName: "Test User",
  firstName: "Test",
  lastName: "User",
  bio: "This is a test bio",
  email: "test@test.com",
  role: "listener" as const,
  isPro: false,
  following_ids: [],
};

const defaultProps = {
  user: mockUser,
  isOwner: true,
  stats: { followers: 100, following: 50, tracks: 5 },
  likedTracks: [
    { id: "1", title: "Track One", artist: "Artist One" },
    { id: "2", title: "Track Two", artist: "Artist Two" },
  ],
  following: [],
  followers: [],
  onTabChange: vi.fn(),
  onUnlike: vi.fn(),
};

describe("ProfileSideBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders follower, following and tracks stats", () => {
    render(<ProfileSideBar {...defaultProps} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders bio when present", () => {
    render(<ProfileSideBar {...defaultProps} />);
    expect(screen.getByText("This is a test bio")).toBeInTheDocument();
  });

  it("does not render bio section when bio is empty", () => {
    render(
      <ProfileSideBar {...defaultProps} user={{ ...mockUser, bio: "" }} />,
    );
    expect(screen.queryByText("Show more")).not.toBeInTheDocument();
  });

  it("shows 'Show more' for long bio", () => {
    const longBio = "a".repeat(150);
    render(
      <ProfileSideBar {...defaultProps} user={{ ...mockUser, bio: longBio }} />,
    );
    expect(screen.getByText("Show more")).toBeInTheDocument();
  });

  it("expands bio on 'Show more' click", () => {
    const longBio = "a".repeat(150);
    render(
      <ProfileSideBar {...defaultProps} user={{ ...mockUser, bio: longBio }} />,
    );
    fireEvent.click(screen.getByText("Show more"));
    expect(screen.getByText("Show less")).toBeInTheDocument();
  });

  it("renders liked tracks", () => {
    render(<ProfileSideBar {...defaultProps} />);
    expect(screen.getByTestId("track-item-Track One")).toBeInTheDocument();
    expect(screen.getByTestId("track-item-Track Two")).toBeInTheDocument();
  });

  it("shows LIKES count and View all button", () => {
    render(<ProfileSideBar {...defaultProps} />);
    expect(screen.getByTestId("likes-button")).toHaveTextContent("2 LIKES");
    expect(screen.getByTestId("likes-view-all")).toBeInTheDocument();
  });

  it("navigates to likes page on likes button click", () => {
    render(<ProfileSideBar {...defaultProps} />);
    fireEvent.click(screen.getByTestId("likes-button"));
    expect(mockNavigate).toHaveBeenCalledWith("/testuser/likes");
  });

  it("navigates to likes page on view all click", () => {
    render(<ProfileSideBar {...defaultProps} />);
    fireEvent.click(screen.getByTestId("likes-view-all"));
    expect(mockNavigate).toHaveBeenCalledWith("/testuser/likes");
  });

  it("shows ON TOUR section for owner", () => {
    render(<ProfileSideBar {...defaultProps} isOwner={true} />);
    expect(screen.getByText("ON TOUR")).toBeInTheDocument();
    expect(screen.getByTestId("upgrade-pro-button")).toBeInTheDocument();
  });

  it("hides ON TOUR section for non-owner", () => {
    render(<ProfileSideBar {...defaultProps} isOwner={false} />);
    expect(screen.queryByText("ON TOUR")).not.toBeInTheDocument();
  });

  it("shows followers avatars for non-owner", () => {
    const followers = [
      { username: "follower1", avatar: "" },
      { username: "follower2", avatar: "" },
    ];
    render(
      <ProfileSideBar
        {...defaultProps}
        isOwner={false}
        followers={followers}
        stats={{ followers: 2, following: 0, tracks: 0 }}
      />,
    );
    expect(screen.getByText("2 FOLLOWERS")).toBeInTheDocument();
  });

  it("hides followers section for owner", () => {
    const followers = [{ username: "follower1", avatar: "" }];
    render(
      <ProfileSideBar {...defaultProps} isOwner={true} followers={followers} />,
    );
    expect(screen.queryByText(/FOLLOWERS/)).not.toBeInTheDocument();
  });

  it("shows following section when following list is not empty", () => {
    const following = [
      {
        username: "travis-scott",
        followers: 6000000,
        tracks: 174,
        avatar: "",
        isVerified: true,
      },
    ];
    render(<ProfileSideBar {...defaultProps} following={following} />);
    expect(screen.getByText("travis-scott")).toBeInTheDocument();
    expect(
      screen.getByTestId("follow-button-travis-scott"),
    ).toBeInTheDocument();
  });

  it("navigates to follower page when followers stat is clicked", () => {
    render(<ProfileSideBar {...defaultProps} />);
    fireEvent.click(screen.getByTestId("followers-stat"));
    expect(mockNavigate).toHaveBeenCalledWith("/testuser/follower");
  });

  it("navigates to following page when following stat is clicked", () => {
    render(<ProfileSideBar {...defaultProps} />);
    fireEvent.click(screen.getByTestId("following-stat"));
    expect(mockNavigate).toHaveBeenCalledWith("/testuser/following");
  });

  it("calls onTabChange with 'Tracks' when tracks stat is clicked", () => {
    const onTabChange = vi.fn();
    render(<ProfileSideBar {...defaultProps} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByTestId("tracks-stat"));
    expect(onTabChange).toHaveBeenCalledWith("Tracks");
  });

  it("navigates to checkout on Upgrade to Artist Pro click", () => {
    render(<ProfileSideBar {...defaultProps} isOwner={true} />);
    fireEvent.click(screen.getByTestId("upgrade-pro-button"));
    expect(mockNavigate).toHaveBeenCalledWith("/creator/checkout");
  });
});
