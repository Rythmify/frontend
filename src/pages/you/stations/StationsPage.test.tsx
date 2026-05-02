import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import StationsPage from "./StationsPage";
import { useLikesStore } from "@/stores/likes.store";

vi.mock("@/stores/likes.store", () => ({
  useLikesStore: vi.fn(),
}));

vi.mock("@/components/UI/StationCard/StationCard", () => ({
  default: ({ station, colorIndex }: any) => (
    <div data-test="station-card" data-color-index={colorIndex}>
      {station.name}
    </div>
  ),
}));

describe("StationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the empty state when there are no liked stations", () => {
    vi.mocked(useLikesStore).mockReturnValue({ likedStations: [] } as any);

    render(<StationsPage />);

    expect(screen.getByText("Stations you have liked:")).toBeInTheDocument();
    expect(screen.getByText("You have no liked stations yet.")).toBeInTheDocument();
  });

  it("renders liked stations with indexes", () => {
    vi.mocked(useLikesStore).mockReturnValue({
      likedStations: [
        { id: "s1", name: "Station One" },
        { id: "s2", name: "Station Two" },
      ],
    } as any);

    render(<StationsPage />);

    expect(screen.getAllByTestId("station-card")).toHaveLength(2);
    expect(screen.getByText("Station One")).toHaveAttribute("data-color-index", "0");
    expect(screen.getByText("Station Two")).toHaveAttribute("data-color-index", "1");
  });
});
