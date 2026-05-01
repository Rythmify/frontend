import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RepostsPage from "@/pages/[username]/reposts/RepostsPage";

const mockNavigate = vi.fn();
const mockGetUserRepostedTracks = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ username: "other-user" }),
}));

vi.mock("@/services/hooks/useProfileData", () => ({
  useProfileData: () => ({
    user: {
      id: "other-user-id",
      username: "other-user",
      displayName: "Other User",
      firstName: "",
      lastName: "",
      bio: "",
      email: "",
      role: "listener",
      isPro: false,
      following_ids: [],
    },
    profileData: {
      id: "other-user-id",
      username: "other-user",
      display_name: "Other User",
      bio: "",
      location: "",
      gender: null,
      role: "listener",
      profile_picture: null,
      cover_photo: null,
      is_private: false,
      is_verified: false,
      followers_count: 0,
      following_count: 0,
      created_at: "2026-01-01T00:00:00Z",
    },
    stats: { followers: 0, following: 0, tracks: 0 },
    followers: [],
    following: [],
    isOwner: false,
    isLoadingProfile: false,
    handleTabChange: vi.fn(),
    handleSave: vi.fn(),
  }),
}));

vi.mock("@/services/engagement.service", () => ({
  getUserRepostedTracks: (...args: unknown[]) => mockGetUserRepostedTracks(...args),
}));

vi.mock("../../[username]/shareLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/Profile/ShareModal/ShareModal", () => ({
  default: () => null,
}));

vi.mock("@/components/Profile/EditProfileModal/EditProfileModal", () => ({
  default: () => null,
}));

describe("RepostsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserRepostedTracks.mockResolvedValue({
      data: [
        {
          id: "track-1",
          title: "Shared Song",
          genre: null,
          duration: null,
          cover_image: "https://example.com/cover.jpg",
          user_id: "artist-1",
          artist_name: "Artist One",
          play_count: 10,
          like_count: 5,
          stream_url: null,
        },
      ],
      pagination: { limit: 50, offset: 0, total: 1 },
    });
  });

  it("shows another user's reposts from the backend endpoint", async () => {
    render(<RepostsPage />);

    await waitFor(() => {
      expect(mockGetUserRepostedTracks).toHaveBeenCalledWith("other-user-id", {
        limit: 50,
      });
    });

    expect(screen.getByText("Shared Song")).toBeInTheDocument();
    expect(screen.getByText("Artist One")).toBeInTheDocument();
    expect(screen.getByText("Reposted")).toBeInTheDocument();
  });
});
