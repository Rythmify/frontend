import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FollowButton from "@/components/Profile/FollowButton/FollowButton";

const mockToggleFollow = vi.fn();
const mockFollowUser = vi.fn();
const mockUnfollowUser = vi.fn();
const mockResolveUsername = vi.fn();

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/services/user.service", () => ({
  followUser: (...args: unknown[]) => mockFollowUser(...args),
  unfollowUser: (...args: unknown[]) => mockUnfollowUser(...args),
  resolveUsername: (...args: unknown[]) => mockResolveUsername(...args),
}));

import { useAuthStore } from "@/stores/auth.store";

describe("FollowButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFollowUser.mockResolvedValue(undefined);
    mockUnfollowUser.mockResolvedValue(undefined);
    mockResolveUsername.mockResolvedValue("resolved-id");
  });

  it("renders 'Follow' when not following", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { following_ids: [] },
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
      toggleFollow: mockToggleFollow,
    });

    render(<FollowButton username="travis-scott" />);
    expect(screen.getByTestId("follow-button-travis-scott")).toHaveTextContent(
      "Following",
    );
  });

  it("calls follow service and toggleFollow when clicked", async () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { following_ids: [] },
      toggleFollow: mockToggleFollow,
    });

    render(<FollowButton username="travis-scott" />);
    fireEvent.click(screen.getByTestId("follow-button-travis-scott"));
    await Promise.resolve();
    expect(mockResolveUsername).toHaveBeenCalledWith("travis-scott");
    expect(mockFollowUser).toHaveBeenCalledWith("resolved-id");
    expect(mockToggleFollow).toHaveBeenCalledWith("travis-scott", []);
  });

  it("uses provided userId instead of resolving username", async () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { following_ids: [] },
      toggleFollow: mockToggleFollow,
    });

    render(<FollowButton username="travis-scott" userId="user-123" />);
    fireEvent.click(screen.getByTestId("follow-button-travis-scott"));
    await Promise.resolve();
    expect(mockResolveUsername).not.toHaveBeenCalled();
    expect(mockFollowUser).toHaveBeenCalledWith("user-123");
    expect(mockToggleFollow).toHaveBeenCalledWith("travis-scott", ["user-123"]);
  });

  it("calls unfollow service when already following", async () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { following_ids: ["user-123"] },
      toggleFollow: mockToggleFollow,
    });

    render(<FollowButton username="travis-scott" userId="user-123" />);
    fireEvent.click(screen.getByTestId("follow-button-travis-scott"));
    await Promise.resolve();
    expect(mockUnfollowUser).toHaveBeenCalledWith("user-123");
    expect(mockToggleFollow).toHaveBeenCalledWith("travis-scott", ["user-123"]);
  });

  it("renders 'Following' when already following by userId", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { following_ids: ["user-123"] },
      toggleFollow: mockToggleFollow,
    });

    render(<FollowButton username="travis-scott" userId="user-123" />);
    expect(screen.getByTestId("follow-button-travis-scott")).toHaveTextContent(
      "Following",
    );
  });

  it("stops propagation on click", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { following_ids: [] },
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
      toggleFollow: mockToggleFollow,
    });

    render(<FollowButton username="travis-scott" />);
    expect(screen.getByTestId("follow-button-travis-scott")).toHaveTextContent(
      "Follow",
    );
  });
});
