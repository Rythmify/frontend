import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FollowButton from "@/components/Profile/FollowButton/FollowButton";

const mockToggleFollow = vi.fn();
const mockSetUser = vi.fn();
const mockFollowUser = vi.fn();
const mockUnfollowUser = vi.fn();

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/services/user.service", () => ({
  followUser: (...args: unknown[]) => mockFollowUser(...args),
  unfollowUser: (...args: unknown[]) => mockUnfollowUser(...args),
}));

import { useAuthStore } from "@/stores/auth.store";

describe("FollowButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFollowUser.mockResolvedValue(undefined);
    mockUnfollowUser.mockResolvedValue(undefined);
  });

  it("renders 'Follow' when not following", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { following_ids: [] },
      setUser: mockSetUser,
      toggleFollow: mockToggleFollow,
    });

    render(<FollowButton username="travis-scott" />);
    expect(screen.getByTestId("follow-button-travis-scott")).toHaveTextContent(
      "Follow",
    );
  });

  it("renders 'Following' when already following", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { following_ids: ["travis-scott"] },
      setUser: mockSetUser,
      toggleFollow: mockToggleFollow,
    });

    render(<FollowButton username="travis-scott" />);
    expect(screen.getByTestId("follow-button-travis-scott")).toHaveTextContent(
      "Following",
    );
  });

  it("calls toggleFollow when clicked", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { following_ids: [] },
      setUser: mockSetUser,
      toggleFollow: mockToggleFollow,
    });

    render(<FollowButton username="travis-scott" />);
    fireEvent.click(screen.getByTestId("follow-button-travis-scott"));
    expect(mockToggleFollow).toHaveBeenCalledWith("travis-scott");
  });

  it("stops propagation on click", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { following_ids: [] },
      setUser: mockSetUser,
      toggleFollow: mockToggleFollow,
    });

    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <FollowButton username="travis-scott" />
      </div>,
    );
    fireEvent.click(screen.getByTestId("follow-button-travis-scott"));
    expect(parentClick).not.toHaveBeenCalled();
  });

  it("applies custom className", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { following_ids: [] },
      setUser: mockSetUser,
      toggleFollow: mockToggleFollow,
    });

    render(<FollowButton username="travis-scott" className="custom-class" />);
    expect(screen.getByTestId("follow-button-travis-scott")).toHaveClass(
      "custom-class",
    );
  });

  it("renders correctly when user is null", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      setUser: mockSetUser,
      toggleFollow: mockToggleFollow,
    });

    render(<FollowButton username="travis-scott" />);
    expect(screen.getByTestId("follow-button-travis-scott")).toHaveTextContent(
      "Follow",
    );
  });

  it("calls backend follow when userId is provided", async () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { following_ids: [], username: "me" },
      setUser: mockSetUser,
      toggleFollow: mockToggleFollow,
    });

    render(<FollowButton username="travis-scott" userId="user-123" />);
    fireEvent.click(screen.getByTestId("follow-button-travis-scott"));

    expect(mockFollowUser).toHaveBeenCalledWith("user-123");
  });

  it("uses follow override when supplied", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { following_ids: [], username: "me" },
      setUser: mockSetUser,
      toggleFollow: mockToggleFollow,
    });

    render(
      <FollowButton
        username="travis-scott"
        userId="user-123"
        isFollowingOverride
      />,
    );

    expect(screen.getByTestId("follow-button-travis-scott")).toHaveTextContent(
      "Following",
    );
  });
});
