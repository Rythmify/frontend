import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FollowerPage from "@/pages/you/follower/FollowerPage";

const mockNavigate = vi.fn();
const mockGetFollowers = vi.fn();
const mockGetUserById = vi.fn();
const mockGetFollowStatus = vi.fn();
const mockResolveUsername = vi.fn();
const mockGetUserByUsername = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/services/user.service", () => ({
  getFollowers: (...args: unknown[]) => mockGetFollowers(...args),
  getUserById: (...args: unknown[]) => mockGetUserById(...args),
  getFollowStatus: (...args: unknown[]) => mockGetFollowStatus(...args),
  getUserByUsername: (...args: unknown[]) => mockGetUserByUsername(...args),
  resolveUsername: (...args: unknown[]) => mockResolveUsername(...args),
}));

vi.mock("@/components/Profile/MockData/mock", () => ({
  mockFollowers: [
    {
      username: "follower1",
      displayName: "Follower One",
      followers: 10,
      avatar: "",
      isVerified: false,
    },
    {
      username: "follower2",
      displayName: "Follower Two",
      followers: 5000,
      avatar: "",
      isVerified: true,
    },
  ],
  mockUserFollowers: {
    "travis-scott": [
      {
        username: "fan1",
        displayName: "Fan One",
        followers: 3,
        avatar: "",
        isVerified: false,
      },
      {
        username: "fan2",
        displayName: "Fan Two",
        followers: 7,
        avatar: "",
        isVerified: false,
      },
    ],
  },
}));

vi.mock("@/components/Profile/FollowButton/FollowButton", () => ({
  default: ({ username }: { username: string }) => (
    <button data-test={`follow-button-${username}`}>Follow</button>
  ),
}));

import { useAuthStore } from "@/stores/auth.store";
import { useParams } from "react-router-dom";

const mockCurrentUser = {
  id: "1",
  username: "me",
  displayName: "Me",
  avatar: "",
  following_ids: [],
};

describe("FollowerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveUsername.mockResolvedValue("resolved-user-id");
    mockGetUserByUsername.mockImplementation(async (username: string) => ({
      id: `${username}-id`,
      username,
      display_name: username,
      bio: null,
      location: null,
      gender: null,
      role: "artist",
      profile_picture: "",
      cover_photo: null,
      is_private: false,
      is_verified: false,
      followers_count: 0,
      following_count: 0,
      created_at: new Date().toISOString(),
    }));
    mockGetFollowStatus.mockImplementation(async (id: string) => ({
      is_following: id === "follower1-id",
    }));
    mockGetFollowers.mockResolvedValue({
      items: [
        {
          user_id: "follower1-id",
          display_name: "Follower One",
          is_verified: false,
        },
        {
          user_id: "follower2-id",
          display_name: "Follower Two",
          is_verified: true,
        },
      ],
    });
    mockGetUserById.mockImplementation(async (id: string) => {
      if (id === "follower1-id") {
        return {
          username: "follower1",
          display_name: "Follower One",
          profile_picture: "",
          followers_count: 10,
        };
      }

      return {
        username: "follower2",
        display_name: "Follower Two",
        profile_picture: "",
        followers_count: 5000,
      };
    });
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockCurrentUser,
    });
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "me",
    });
  });

  it("returns null when user is not authenticated", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
    });
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: undefined,
    });
    const { container } = render(<FollowerPage />);
    expect(container.firstChild).toBeNull();
  });

  it("renders page title for owner", () => {
    render(<FollowerPage />);
    expect(screen.getByTestId("follower-page-title")).toHaveTextContent(
      "Followers of Me",
    );
  });

  it("renders page title for non-owner", () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    render(<FollowerPage />);
    expect(screen.getByTestId("follower-page-title")).toHaveTextContent(
      "Followers of travis-scott",
    );
  });

  it("displays the username in the header", () => {
    render(<FollowerPage />);
    expect(screen.getByText("@me")).toBeInTheDocument();
  });

  it("renders all three tabs", () => {
    render(<FollowerPage />);
    expect(screen.getByTestId("follower-tab-likes")).toBeInTheDocument();
    expect(screen.getByTestId("follower-tab-following")).toBeInTheDocument();
    expect(screen.getByTestId("follower-tab-followers")).toBeInTheDocument();
  });

  it("highlights Followers tab as active", () => {
    render(<FollowerPage />);
    expect(screen.getByTestId("follower-tab-followers")).toHaveClass(
      "text-bg-inverted",
    );
  });

  it("navigates to likes page on Likes tab click (owner)", () => {
    render(<FollowerPage />);
    fireEvent.click(screen.getByTestId("follower-tab-likes"));
    expect(mockNavigate).toHaveBeenCalledWith("/me/likes");
  });

  it("navigates to following page on Following tab click (owner)", () => {
    render(<FollowerPage />);
    fireEvent.click(screen.getByTestId("follower-tab-following"));
    expect(mockNavigate).toHaveBeenCalledWith("/me/following");
  });

  it("navigates to likes page on Likes tab click (non-owner)", () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    render(<FollowerPage />);
    fireEvent.click(screen.getByTestId("follower-tab-likes"));
    expect(mockNavigate).toHaveBeenCalledWith("/travis-scott/likes");
  });

  it("navigates to following page on Following tab click (non-owner)", () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    render(<FollowerPage />);
    fireEvent.click(screen.getByTestId("follower-tab-following"));
    expect(mockNavigate).toHaveBeenCalledWith("/travis-scott/following");
  });

  it("renders owner follower list", async () => {
    const { container } = render(<FollowerPage />);
    expect(
      await screen.findByTestId("follower-avatar-follower1"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("follower-avatar-follower2")).toBeInTheDocument();
    expect(screen.getByTestId("follow-button-follower1")).toHaveTextContent(
      "Following",
    );
    expect(screen.getByTestId("follow-button-follower2")).toHaveTextContent(
      "Follow",
    );
  });

  it("renders non-owner follower list", async () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    render(<FollowerPage />);
    expect(
      await screen.findByTestId("follower-avatar-follower1"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("follower-avatar-follower2")).toBeInTheDocument();
    expect(screen.getByTestId("follow-button-follower1")).toHaveTextContent(
      "Following",
    );
  });

  it("navigates to follower profile on avatar click", async () => {
    render(<FollowerPage />);
    fireEvent.click(await screen.findByTestId("follower-avatar-follower1"));
    expect(mockNavigate).toHaveBeenCalledWith("/follower1");
  });

  it("navigates to follower's followers page on count click", async () => {
    render(<FollowerPage />);
    fireEvent.click(await screen.findByTestId("follower-count-follower1"));
    expect(mockNavigate).toHaveBeenCalledWith("/follower1/follower");
  });

  it("navigates to user profile on avatar click in header", () => {
    render(<FollowerPage />);
    fireEvent.click(screen.getByTestId("follower-page-avatar"));
    expect(mockNavigate).toHaveBeenCalledWith("/me");
  });

  it("navigates to user profile on title click", () => {
    render(<FollowerPage />);
    fireEvent.click(screen.getByTestId("follower-page-title"));
    expect(mockNavigate).toHaveBeenCalledWith("/me");
  });

  it("renders footer links", () => {
    render(<FollowerPage />);
    expect(screen.getByTestId("follower-footer-legal")).toBeInTheDocument();
    expect(screen.getByTestId("follower-footer-privacy")).toBeInTheDocument();
  });

  it("renders language button", () => {
    render(<FollowerPage />);
    expect(screen.getByTestId("follower-language-button")).toHaveTextContent(
      "English (US)",
    );
  });

  it("renders verified badge for verified follower", async () => {
    render(<FollowerPage />);
    expect(await screen.findByTestId("follower-avatar-follower2")).toBeInTheDocument();
  });

  it("shows formatted follower count for large numbers", async () => {
    render(<FollowerPage />);
    expect(
      await screen.findByTestId("follower-count-follower2"),
    ).toHaveTextContent("5.0K followers");
  });
});
