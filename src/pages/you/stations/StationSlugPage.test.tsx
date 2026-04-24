import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import StationSlugPage from "./StationSlugPage";

const mockAddStation = vi.fn();
const mockGetHome = vi.fn();
const mockGetStationTracks = vi.fn();
const mockGetUserById = vi.fn();

vi.mock("@/services/api/discover.service", () => ({
  getHome: () => mockGetHome(),
}));

vi.mock("@/services/api/playlist/playlist.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/services/api/playlist/playlist.service")
  >("@/services/api/playlist/playlist.service");

  return {
    ...actual,
    getStationTracks: (...args: unknown[]) => mockGetStationTracks(...args),
  };
});

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
  images: {
    left: "https://picsum.photos/seed/501/200/200",
    center: "https://picsum.photos/seed/502/200/200",
    right: "https://picsum.photos/seed/503/200/200",
  },
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
    mockGetStationTracks.mockResolvedValue({
      station,
      tracks: [
        {
          track_id: "track-1",
          position: 1,
          added_at: "2026-04-01T10:30:00Z",
          title: "Butterfly Effect",
          duration: 225,
          cover_image: "https://picsum.photos/seed/501/200/200",
          is_public: true,
          deleted_at: null,
          artist_name: "Travis Scott",
          artist_id: "artist-travis",
          audio_url: "https://example.com/audio/butterfly-effect.mp3",
          play_count: 75000,
        },
        {
          track_id: "track-2",
          position: 2,
          added_at: "2026-04-01T10:30:00Z",
          title: "Blinding Lights",
          duration: 200,
          cover_image: "https://picsum.photos/seed/401/200/200",
          is_public: true,
          deleted_at: null,
          artist_name: "The Weeknd",
          artist_id: "artist-weeknd",
          audio_url: "https://example.com/audio/blinding-lights.mp3",
          play_count: 95000,
        },
      ],
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

    expect(await screen.findAllByText("Drake's Station")).toHaveLength(2);
    expect(mockGetStationTracks).toHaveBeenCalledWith("artist-1");

    expect(screen.getByTestId("playlist-hero")).toBeInTheDocument();
    expect(
      screen.getByTestId("playlist-hero-station-rings"),
    ).toBeInTheDocument();
    expect(screen.getAllByAltText("Based on Drake")).toHaveLength(3);
    expect(screen.getByTestId("playlist-action-bar")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("button-play-pause-hero-playlist"));

    expect(mockAddStation).toHaveBeenCalledWith(
      expect.objectContaining({
        id: station.id,
        name: station.name,
      }),
    );
  });

  it("falls back to the station id when the artist id lookup fails", async () => {
    mockGetStationTracks
      .mockRejectedValueOnce(new Error("Station not found"))
      .mockResolvedValueOnce({
        station,
        tracks: [],
      });

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

    expect(await screen.findAllByText("Drake's Station")).toHaveLength(2);
    expect(mockGetStationTracks).toHaveBeenNthCalledWith(1, "artist-1");
    expect(mockGetStationTracks).toHaveBeenNthCalledWith(
      2,
      "aaaa1111-2222-4333-8444-555566667777",
    );
  });
});

