import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import StationSlugPage from "./StationSlugPage";

const mockAddStation = vi.fn();
const mockGetHome = vi.fn();
const mockGetUserById = vi.fn();

vi.mock("@/services/api/discover.service", () => ({
  getHome: () => mockGetHome(),
}));

vi.mock("@/services/user.service", () => ({
  getUserById: (...args: unknown[]) => mockGetUserById(...args),
}));

vi.mock("@/stores/history.store", () => ({
  useHistoryStore: (selector: any) => selector({ addStation: mockAddStation }),
}));

vi.mock("@/components/Upload/GuestPageFooter", () => ({
  default: () => <div data-test="mock-guest-footer" />,
}));

const station = {
  id: "aaaa1111-2222-4333-8444-555566667777",
  name: "Based on Drake",
  artist_id: "artist-1",
  artist_name: "Drake",
  cover_image: "https://picsum.photos/seed/501/200/200",
  track_count: 50,
  follower_count: 5000000,
};

describe("StationSlugPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetHome.mockResolvedValue({
      discover_with_stations: [station],
      more_of_what_you_like: null,
      trending_by_genre: { genres: [], initial_tab: { genre_id: "", genre_name: "", tracks: [] } },
      mixed_for_you: [],
      made_for_you: null,
      artists_to_watch: [],
    });
    mockGetUserById.mockResolvedValue({
      id: "artist-1",
      username: "drake",
      display_name: "Drake",
      bio: null,
      location: null,
      gender: null,
      role: "artist",
      profile_picture: null,
      cover_photo: null,
      is_private: false,
      is_verified: true,
      followers_count: 0,
      following_count: 0,
      created_at: "",
    });
  });

  it("loads the station from the route slug and plays it", async () => {
    render(
      <MemoryRouter initialEntries={["/discover/stations/based-on-drake:aaaa1111-2222-4333-8444-555566667777"]}>
        <Routes>
          <Route
            path="/discover/stations/:stationSlug"
            element={<StationSlugPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Based on Drake" }),
      ).toBeInTheDocument(),
    );

    expect(screen.getByTestId("playlist-hero")).toBeInTheDocument();
    expect(screen.getByTestId("playlist-action-bar")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("button-play-pause-hero-playlist"));

    expect(mockAddStation).toHaveBeenCalledWith(
      expect.objectContaining({
        id: station.id,
        name: station.name,
      }),
    );
  });
});
