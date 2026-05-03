import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import StationCard from "./StationCard";

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

const station = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Late Night Station",
  seedArtist: {
    id: "artist-1",
    displayName: "Artist One",
    username: "artist-one",
    avatarUrl: "https://example.com/avatar.jpg",
  },
  coverUrl: null,
  trackCount: 12,
};

describe("StationCard", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("navigates to the station path when clicked", () => {
    render(<StationCard station={station as any} />);

    fireEvent.click(screen.getByTestId("station-card-11111111-1111-4111-8111-111111111111"));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/discover/stations/late-night-station:11111111-1111-4111-8111-111111111111",
    );
  });
});
