import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FollowingPage from "@/pages/you/following/FollowingPage";

const mockNavigate = vi.fn();
const mockGetFollowing = vi.fn();
const mockGetUserById = vi.fn();
const mockResolveUsername = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/services/user.service", () => ({
  getFollowing: (...args: unknown[]) => mockGetFollowing(...args),
  getUserById: (...args: unknown[]) => mockGetUserById(...args),
  resolveUsername: (...args: unknown[]) => mockResolveUsername(...args),
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
  following_ids: ["artist1", "artist2"],
};

describe("FollowingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveUsername.mockResolvedValue("resolved-user-id");
    mockGetFollowing.mockResolvedValue({
      items: [
        {
          user_id: "artist1",
          display_name: "Artist One",
          is_verified: true,
        },
        {
          user_id: "artist2",
          display_name: "Artist Two",
          is_verified: false,
        },
      ],
    });
    mockGetUserById.mockImplementation(async (id: string) => {
      if (id === "artist1") {
        return {
          username: "artist1",
          display_name: "Artist One",
          profile_picture: "",
          followers_count: 500000,
        };
      }

      if (id === "artist2") {
        return {
          username: "artist2",
          display_name: "Artist Two",
          profile_picture: "",
          followers_count: 1200,
        };
      }

      return {
        username: "producer1",
        display_name: "Producer One",
        profile_picture: "",
        followers_count: 3000,
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
    const { container } = render(<FollowingPage />);
    expect(container.firstChild).toBeNull();
  });

  it("renders page title for owner", () => {
    render(<FollowingPage />);
    expect(screen.getByTestId("following-page-title")).toHaveTextContent(
      "Me is following",
    );
  });

  it("renders page title for non-owner", () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    render(<FollowingPage />);
    expect(screen.getByTestId("following-page-title")).toHaveTextContent(
      "travis-scott is following",
    );
  });

  it("renders all three tabs", () => {
    render(<FollowingPage />);
    expect(screen.getByTestId("following-tab-likes")).toBeInTheDocument();
    expect(screen.getByTestId("following-tab-following")).toBeInTheDocument();
    expect(screen.getByTestId("following-tab-followers")).toBeInTheDocument();
  });

  it("highlights Following tab as active", () => {
    render(<FollowingPage />);
    expect(screen.getByTestId("following-tab-following")).toHaveClass(
      "text-bg-inverted",
    );
  });

  it("navigates to likes page on Likes tab click (owner)", () => {
    render(<FollowingPage />);
    fireEvent.click(screen.getByTestId("following-tab-likes"));
    expect(mockNavigate).toHaveBeenCalledWith("/you/likes");
  });

  it("navigates to followers page on Followers tab click (owner)", () => {
    render(<FollowingPage />);
    fireEvent.click(screen.getByTestId("following-tab-followers"));
    expect(mockNavigate).toHaveBeenCalledWith("/you/follower");
  });

  it("navigates to likes page on Likes tab click (non-owner)", () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    render(<FollowingPage />);
    fireEvent.click(screen.getByTestId("following-tab-likes"));
    expect(mockNavigate).toHaveBeenCalledWith("/travis-scott/likes");
  });

  it("navigates to followers page on Followers tab click (non-owner)", () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    render(<FollowingPage />);
    fireEvent.click(screen.getByTestId("following-tab-followers"));
    expect(mockNavigate).toHaveBeenCalledWith("/travis-scott/follower");
  });

  it("renders owner following list", async () => {
    render(<FollowingPage />);
    expect(
      await screen.findByTestId("following-avatar-artist1"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("following-avatar-artist2")).toBeInTheDocument();
  });

  it("renders non-owner following list", async () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    render(<FollowingPage />);
    expect(
      await screen.findByTestId("following-avatar-artist1"),
    ).toBeInTheDocument();
  });

  it("navigates to following user profile on avatar click", async () => {
    render(<FollowingPage />);
    fireEvent.click(await screen.findByTestId("following-avatar-artist1"));
    expect(mockNavigate).toHaveBeenCalledWith("/artist1");
  });

  it("navigates to following user's followers page on count click", async () => {
    render(<FollowingPage />);
    fireEvent.click(await screen.findByTestId("following-count-artist1"));
    expect(mockNavigate).toHaveBeenCalledWith("/artist1/follower");
  });

  it("navigates to user profile on header avatar click", () => {
    render(<FollowingPage />);
    fireEvent.click(screen.getByTestId("following-page-avatar"));
    expect(mockNavigate).toHaveBeenCalledWith("/me");
  });

  it("navigates to user profile on title click", () => {
    render(<FollowingPage />);
    fireEvent.click(screen.getByTestId("following-page-title"));
    expect(mockNavigate).toHaveBeenCalledWith("/me");
  });

  it("renders footer links", () => {
    render(<FollowingPage />);
    expect(screen.getByTestId("following-footer-legal")).toBeInTheDocument();
    expect(screen.getByTestId("following-footer-privacy")).toBeInTheDocument();
  });

  it("renders language button", () => {
    render(<FollowingPage />);
    expect(screen.getByTestId("following-language-button")).toHaveTextContent(
      "English (US)",
    );
  });

  it("shows formatted follower count", async () => {
    render(<FollowingPage />);
    expect(
      await screen.findByTestId("following-count-artist1"),
    ).toHaveTextContent("500000 followers");
  });

  it("renders empty following list for non-owner with no data", async () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "unknown-user",
    });
    mockResolveUsername.mockRejectedValueOnce(new Error("not found"));
    render(<FollowingPage />);
    await waitFor(() => {
      expect(
        screen.queryByTestId("following-avatar-artist1"),
      ).not.toBeInTheDocument();
    });
  });
});
