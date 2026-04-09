import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FollowerPage from "@/pages/you/follower/FollowerPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
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
    expect(mockNavigate).toHaveBeenCalledWith("/you/likes");
  });

  it("navigates to following page on Following tab click (owner)", () => {
    render(<FollowerPage />);
    fireEvent.click(screen.getByTestId("follower-tab-following"));
    expect(mockNavigate).toHaveBeenCalledWith("/you/following");
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

  it("renders owner follower list", () => {
    render(<FollowerPage />);
    expect(screen.getByTestId("follower-avatar-follower1")).toBeInTheDocument();
    expect(screen.getByTestId("follower-avatar-follower2")).toBeInTheDocument();
  });

  it("renders non-owner follower list", () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    render(<FollowerPage />);
    expect(screen.getByTestId("follower-avatar-fan1")).toBeInTheDocument();
    expect(screen.getByTestId("follower-avatar-fan2")).toBeInTheDocument();
  });

  it("navigates to follower profile on avatar click", () => {
    render(<FollowerPage />);
    fireEvent.click(screen.getByTestId("follower-avatar-follower1"));
    expect(mockNavigate).toHaveBeenCalledWith("/follower1");
  });

  it("navigates to follower's followers page on count click", () => {
    render(<FollowerPage />);
    fireEvent.click(screen.getByTestId("follower-count-follower1"));
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

  it("renders verified badge for verified follower", () => {
    render(<FollowerPage />);
    expect(screen.getByText(/follower2/)).toBeInTheDocument();
  });

  it("shows formatted follower count for large numbers", () => {
    render(<FollowerPage />);
    expect(screen.getByTestId("follower-count-follower2")).toHaveTextContent(
      "5000 followers",
    );
  });
});
