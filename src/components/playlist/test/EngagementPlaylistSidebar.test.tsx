import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EngagementPlaylistSidebar from "../EngagementPlaylistSidebar";
import {
  getPlaylistLikers,
  getPlaylistReposters,
} from "@/services/api/playlist/playlist.service";

vi.mock("@/services/api/playlist/playlist.service", () => ({
  getPlaylistLikers: vi.fn(),
  getPlaylistReposters: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const playlist = {
  playlist_id: "pl-1",
  like_count: 3,
  repost_count: 2,
} as any;

describe("EngagementPlaylistSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders likers and reposters from normalized api payloads", async () => {
    vi.mocked(getPlaylistLikers).mockResolvedValue({
      data: [
        {
          user_id: "u1",
          display_name: "Alice",
          profile_picture: "alice.jpg",
          username: "alice",
        },
      ],
    } as any);
    vi.mocked(getPlaylistReposters).mockResolvedValue({
      items: [{ id: "u2", username: "bob" }],
    } as any);

    render(
      <MemoryRouter>
        <EngagementPlaylistSidebar playlist={playlist} />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId("sidebar-liked-by")).toBeInTheDocument());
    expect(screen.getByTestId("sidebar-reposted-by")).toBeInTheDocument();
    expect(screen.getByText("3 Likes")).toBeInTheDocument();
    expect(screen.getByText("2 Reposts")).toBeInTheDocument();
    expect(screen.getByAltText("Alice")).toHaveAttribute("src", "alice.jpg");
  });

  it("shows overflow when more than nine users are returned", async () => {
    vi.mocked(getPlaylistLikers).mockResolvedValue(
      Array.from({ length: 10 }).map((_, index) => ({
        user_id: `u${index}`,
        display_name: `User ${index}`,
        profile_picture: null,
        username: `user${index}`,
      })) as any,
    );
    vi.mocked(getPlaylistReposters).mockResolvedValue([] as any);

    render(
      <MemoryRouter>
        <EngagementPlaylistSidebar playlist={playlist} />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("+1")).toBeInTheDocument());
  });

  it("hides a strip when count is zero", async () => {
    vi.mocked(getPlaylistLikers).mockResolvedValue([] as any);
    vi.mocked(getPlaylistReposters).mockResolvedValue([] as any);

    render(
      <MemoryRouter>
        <EngagementPlaylistSidebar
          playlist={{ ...playlist, like_count: 0, repost_count: 0 }}
        />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.queryByTestId("sidebar-liked-by")).not.toBeInTheDocument(),
    );
    expect(screen.queryByTestId("sidebar-reposted-by")).not.toBeInTheDocument();
  });
});
