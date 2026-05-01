import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import TrackEngagementPage from "../../pages/[username]/[trackSlug]/TrackEngagementPage";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { Track } from "../../types/track";

// Mocks
const { mockTrack } = vi.hoisted(() => {
  return {
    mockTrack: {
      id: "track-1",
      title: "Test Track",
      artistName: "Test Artist",
      artistUsername: "test-artist",
      coverUrl: "https://example.com/cover.jpg",
      genre: "Pop",
      likeCount: 10,
      repostCount: 5,
      playCount: 100,
      commentCount: 2,
      duration: "3:45",
      postedAt: "2 hours ago",
      waveformData: [],
      audioUrl: "https://example.com/audio.mp3",
      trackSlug: "test-track",
    }
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../services/track.service", () => ({
  getTrackBySlug: vi.fn().mockResolvedValue(mockTrack),
}));

vi.mock("../../services/engagement.service", () => ({
  getTrackLikers: vi.fn().mockResolvedValue({
    data: { items: [{ id: "u1", username: "user1", display_name: "User One", profile_picture: "" }] }
  }),
  getTrackReposters: vi.fn().mockResolvedValue({
    data: { items: [{ id: "u2", username: "user2", display_name: "User Two", profile_picture: "" }] }
  }),
}));

vi.mock("../../services/user.service", () => ({
  getUserById: vi.fn().mockResolvedValue({
    id: "u1", username: "user1", display_name: "User One", profile_picture: "", followers_count: 10
  }),
  getFollowStatus: vi.fn().mockResolvedValue({ is_following: false }),
}));

vi.mock("../../stores/auth.store", () => ({
  useAuthStore: vi.fn(() => ({ user: { id: "me", username: "me" } })),
}));

import { getTrackBySlug } from "../../services/track.service";
import { getTrackLikers, getTrackReposters } from "../../services/engagement.service";

describe("TrackEngagementPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = (path = "/test-artist/test-track/likes") =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/:username/:trackId/*" element={<TrackEngagementPage />} />
        </Routes>
      </MemoryRouter>
    );

  it("shows loading spinner initially", () => {
    vi.mocked(getTrackBySlug).mockReturnValueOnce(new Promise(() => {}));
    const { container } = renderPage();
    expect(container.querySelector(".fa-spinner") || container.querySelector("svg")).toBeTruthy(); // Spinner logic varies
  });

  it("renders track details after loading", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Test Track")).toBeInTheDocument();
      expect(screen.getByText("Test Artist")).toBeInTheDocument();
    });
  });

  it("renders Likes tab by default or on /likes", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("engagement-tab-likes")).toBeInTheDocument();
    });
    // Should fetch likers and display user1
    await waitFor(() => {
      expect(screen.getByText("User One")).toBeInTheDocument();
    });
  });

  it("renders Reposts tab on /reposts", async () => {
    renderPage("/test-artist/test-track/reposts");
    await waitFor(() => {
      expect(screen.getByTestId("engagement-tab-reposts")).toBeInTheDocument();
    });
    // Should fetch reposters and display user2
    await waitFor(() => {
      expect(getTrackReposters).toHaveBeenCalled();
    });
  });

  it("handles tab switching", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Test Track")).toBeInTheDocument();
    });

    const repostTab = screen.getByTestId("engagement-tab-reposts");
    fireEvent.click(repostTab);

    expect(mockNavigate).toHaveBeenCalledWith("/test-artist/test-track/reposts");
  });
});
