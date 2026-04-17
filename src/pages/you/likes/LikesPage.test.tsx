import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LikesPage from "@/pages/you/likes/LikesPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/components/Profile/MockData/mock", () => ({
  mockLikedTracks: [
    { id: "1", title: "Track One", artist: "Artist One" },
    { id: "2", title: "Track Two", artist: "Artist Two" },
  ],
  mockUserProfiles: {
    "travis-scott": {
      displayName: "Travis Scott",
      avatar: "",
      likedTracks: [{ id: "3", title: "Track Three", artist: "Travis Scott" }],
    },
  },
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

import { useAuthStore } from "@/stores/auth.store";
import { useParams, useLocation } from "react-router-dom";

const mockCurrentUser = {
  id: "1",
  username: "me",
  displayName: "Me",
  avatar: "",
};

describe("LikesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(screen.getByTestId("likes-page-title")).toHaveTextContent(
      "Likes by Travis Scott",
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
    expect(mockNavigate).toHaveBeenCalledWith("/you/following");
  });

  it("navigates to followers page on Followers tab click", () => {
    render(<LikesPage />);
    fireEvent.click(screen.getByTestId("likes-tab-followers"));
    expect(mockNavigate).toHaveBeenCalledWith("/you/follower");
  });

  it("shows owner description text", () => {
    render(<LikesPage />);
    expect(screen.getByTestId("likes-description")).toHaveTextContent(
      "Hear the tracks you've liked",
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
    expect(screen.getByTestId("likes-description")).toHaveTextContent(
      "Hear the tracks Travis Scott has liked",
    );
  });

  it("shows empty state for owner", () => {
    render(<LikesPage />);
    expect(screen.getByTestId("likes-empty-state")).toHaveTextContent(
      "You have no likes yet.",
    );
  });

  it("shows empty state for non-owner", () => {
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      username: "travis-scott",
    });
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: "/travis-scott/likes",
    });

    render(<LikesPage />);
    expect(screen.getByTestId("likes-empty-state")).toHaveTextContent(
      "Travis Scott hasn't liked any tracks.",
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
