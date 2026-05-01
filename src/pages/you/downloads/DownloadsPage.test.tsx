import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import DownloadsPage from "./DownloadsPage";
import { useAuthStore } from "@/stores/auth.store";
import { useDownloadStore } from "@/stores/useDownload";

const mockToggleDownload = vi.fn();

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/stores/useDownload", () => ({
  useDownloadStore: vi.fn(),
}));

vi.mock("@/components/UI/card/Card", () => ({
  default: ({ track }: { track: { title: string } }) => (
    <div data-test="download-track-card">{track.title}</div>
  ),
}));

describe("DownloadsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({ user: { isPro: false } } as any);
    vi.mocked(useDownloadStore).mockReturnValue({
      downloadedTracks: [],
      toggleDownload: mockToggleDownload,
    } as any);
  });

  it("shows the premium upsell for non-pro users", () => {
    render(
      <MemoryRouter>
        <DownloadsPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Offline listening is a Premium feature"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try Premium" })).toHaveAttribute(
      "href",
      "/premium",
    );
  });

  it("shows an empty state when a premium user has no downloads", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { isPro: true },
    } as any);

    render(
      <MemoryRouter>
        <DownloadsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("No downloads yet")).toBeInTheDocument();
    expect(
      screen.getByText(/Hit the download button on any track/i),
    ).toBeInTheDocument();
  });

  it("renders downloaded tracks and removes them on click", () => {
    const track = {
      id: "track-1",
      title: "Track One",
      artistName: "Artist One",
    };

    vi.mocked(useAuthStore).mockReturnValue({
      user: { isPro: true },
    } as any);
    vi.mocked(useDownloadStore).mockReturnValue({
      downloadedTracks: [track],
      toggleDownload: mockToggleDownload,
    } as any);

    render(
      <MemoryRouter>
        <DownloadsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("1 track downloaded")).toBeInTheDocument();
    expect(screen.getByTestId("download-track-card")).toHaveTextContent(
      "Track One",
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove Track One from downloads",
      }),
    );

    expect(mockToggleDownload).toHaveBeenCalledWith(track, true);
  });
});
