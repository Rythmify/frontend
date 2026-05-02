import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import FollowButton from "@/components/UI/FollowButton";

const mockToggleFollow = vi.fn();
const mockFollowUser = vi.fn();
const mockUnfollowUser = vi.fn();
const mockSetUser = vi.fn();

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/services/user.service", () => ({
  followUser: (...args: unknown[]) => mockFollowUser(...args),
  unfollowUser: (...args: unknown[]) => mockUnfollowUser(...args),
}));

import { useAuthStore } from "@/stores/auth.store";

describe("UI FollowButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFollowUser.mockResolvedValue(undefined);
    mockUnfollowUser.mockResolvedValue(undefined);
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "user-1",
        username: "me",
        following_ids: [],
      },
      toggleFollow: mockToggleFollow,
      setUser: mockSetUser,
    } as any);
  });

  it("renders Follow when not following", () => {
    render(<FollowButton username="travis-scott" userId="artist-1" />);

    expect(screen.getByTestId("follow-button-travis-scott")).toHaveTextContent(
      "Follow",
    );
  });

  it("follows a user when clicked", async () => {
    render(<FollowButton username="travis-scott" userId="artist-1" />);

    fireEvent.click(screen.getByTestId("follow-button-travis-scott"));

    await waitFor(() => {
      expect(mockToggleFollow).toHaveBeenCalledWith("travis-scott", [
        "artist-1",
      ]);
      expect(mockFollowUser).toHaveBeenCalledWith("artist-1");
    });
  });

  it("unfollows a user when already following", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "user-1",
        username: "me",
        following_ids: ["artist-1"],
      },
      toggleFollow: mockToggleFollow,
      setUser: mockSetUser,
    } as any);

    render(<FollowButton username="travis-scott" userId="artist-1" />);

    expect(screen.getByTestId("follow-button-travis-scott")).toHaveTextContent(
      "Following",
    );

    fireEvent.click(screen.getByTestId("follow-button-travis-scott"));

    await waitFor(() => {
      expect(mockToggleFollow).toHaveBeenCalledWith("travis-scott", [
        "artist-1",
      ]);
      expect(mockUnfollowUser).toHaveBeenCalledWith("artist-1");
    });
  });

  it("shows Blocked when blocked without following", () => {
    render(
      <FollowButton username="travis-scott" userId="artist-1" blocked>
        Blocked
      </FollowButton>,
    );

    expect(screen.getByTestId("follow-button-travis-scott")).toHaveTextContent(
      "Blocked",
    );
    expect(screen.getByTestId("follow-button-travis-scott")).toBeDisabled();
  });
});
