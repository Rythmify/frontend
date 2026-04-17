import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AlbumOwnerInfo from "@/components/playlist/Album/AlbumOwnerInfo";
import { useAuthStore } from "@/stores/auth.store";

const mockToggleFollow = vi.fn();
const mockFollowUser = vi.fn();
const mockUnfollowUser = vi.fn();
const mockedUseAuthStore = vi.mocked(useAuthStore);

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("../../../services/mocks/User.service", () => ({
  followUser: (...args: unknown[]) => mockFollowUser(...args),
  unfollowUser: (...args: unknown[]) => mockUnfollowUser(...args),
}));

describe("AlbumOwnerInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the owner avatar, name, and stats", () => {
    mockedUseAuthStore.mockReturnValue({
      user: {
        id: "me",
        username: "me",
        following_ids: [],
      },
      toggleFollow: mockToggleFollow,
    } as any);

    render(
      <MemoryRouter>
        <AlbumOwnerInfo
          username="ghaliaa"
          displayName="Ghaliaa"
          avatarUrl="https://example.com/avatar.jpg"
          followers={31500}
          trackNum={22}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("album-owner-avatar")).toHaveAttribute(
      "src",
      "https://example.com/avatar.jpg",
    );
    expect(screen.getByTestId("album-owner-name")).toHaveTextContent(
      "Ghaliaa",
    );
    expect(screen.getByText("31,500")).toBeInTheDocument();
    expect(screen.getByText("22")).toBeInTheDocument();
    expect(screen.getByTestId("album-owner-follow-button")).toBeInTheDocument();
  });

  it("calls followUser and toggleFollow when following a user", async () => {
    mockedUseAuthStore.mockReturnValue({
      user: {
        id: "me",
        username: "me",
        following_ids: [],
      },
      toggleFollow: mockToggleFollow,
    } as any);

    render(
      <MemoryRouter>
        <AlbumOwnerInfo username="ghaliaa" followers={0} trackNum={0} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("album-owner-follow-button"));

    await waitFor(() => {
      expect(mockFollowUser).toHaveBeenCalledWith("ghaliaa");
      expect(mockToggleFollow).toHaveBeenCalledWith("ghaliaa");
    });
  });

  it("calls unfollowUser when already following", async () => {
    mockedUseAuthStore.mockReturnValue({
      user: {
        id: "me",
        username: "me",
        following_ids: ["ghaliaa"],
      },
      toggleFollow: mockToggleFollow,
    } as any);

    render(
      <MemoryRouter>
        <AlbumOwnerInfo username="ghaliaa" followers={0} trackNum={0} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("album-owner-follow-button")).toHaveTextContent(
      "Following",
    );

    fireEvent.click(screen.getByTestId("album-owner-follow-button"));

    await waitFor(() => {
      expect(mockUnfollowUser).toHaveBeenCalledWith("ghaliaa");
      expect(mockToggleFollow).toHaveBeenCalledWith("ghaliaa");
    });
  });

  it("hides the follow button for the owner", () => {
    mockedUseAuthStore.mockReturnValue({
      user: {
        id: "owner-id",
        username: "ghaliaa",
        following_ids: [],
      },
      toggleFollow: mockToggleFollow,
    } as any);

    render(
      <MemoryRouter>
        <AlbumOwnerInfo username="ghaliaa" followers={0} trackNum={0} />
      </MemoryRouter>,
    );

    expect(
      screen.queryByTestId("album-owner-follow-button"),
    ).not.toBeInTheDocument();
  });
});
