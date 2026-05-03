import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import OwnerInfo from "@/components/playlist/OwnerInfo";
import { useAuthStore } from "@/stores/auth.store";

const mockToggleFollow = vi.fn();
const mockedUseAuthStore = vi.mocked(useAuthStore);

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/components/UI/FollowButton", () => ({
  default: ({ username }: { username: string }) => (
    <button data-test={`follow-button-${username}`}>Follow</button>
  ),
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
        <OwnerInfo
          ownerUserId="owner-id"
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
    expect(screen.getByTestId("album-owner-name")).toHaveTextContent("Ghaliaa");
    expect(screen.getByText("31,500")).toBeInTheDocument();
    expect(screen.getByText("22")).toBeInTheDocument();
    expect(screen.getByTestId("follow-button-ghaliaa")).toBeInTheDocument();
  });

  it("shows the follow button for a non-owner", async () => {
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
        <OwnerInfo
          ownerUserId="owner-id"
          username="ghaliaa"
          followers={0}
          trackNum={0}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("follow-button-ghaliaa")).toBeInTheDocument();
  });

  it("hides the follow button for the owner id", async () => {
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
        <OwnerInfo
          ownerUserId="owner-id"
          username="ghaliaa"
          followers={0}
          trackNum={0}
        />
      </MemoryRouter>,
    );

    expect(
      screen.queryByTestId("follow-button-ghaliaa"),
    ).not.toBeInTheDocument();
  });
});
