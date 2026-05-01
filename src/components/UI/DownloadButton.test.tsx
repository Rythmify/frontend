import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DownloadButton from "./DownloadButton";
import { useAuthStore } from "@/stores/auth.store";
import { useDownloadStore } from "@/stores/useDownload";

const mockNavigate = vi.fn();
const mockToggleDownload = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/stores/useDownload", () => ({
  useDownloadStore: vi.fn(),
}));

describe("DownloadButton", () => {
  const track = {
    id: "track-1",
    title: "Track One",
    artistName: "Artist One",
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({ user: { isPro: false } } as any);
    vi.mocked(useDownloadStore).mockReturnValue({
      isDownloaded: vi.fn().mockReturnValue(false),
      toggleDownload: mockToggleDownload,
    } as any);
  });

  it("redirects non-pro users to premium from the icon variant", () => {
    render(<DownloadButton track={track} variant="icon" />);

    expect(screen.getByTestId("download-button-icon")).toHaveAttribute(
      "title",
      "Premium feature",
    );

    fireEvent.click(screen.getByTestId("download-button-icon"));
    expect(mockNavigate).toHaveBeenCalledWith("/premium");
  });

  it("toggles downloads for pro users from the icon variant", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { isPro: true },
    } as any);

    render(<DownloadButton track={track} variant="icon" />);

    expect(screen.getByTestId("download-button-icon")).toHaveAttribute(
      "title",
      "Save for offline",
    );

    fireEvent.click(screen.getByTestId("download-button-icon"));
    expect(mockToggleDownload).toHaveBeenCalledWith(track, true);
  });

  it("shows the hover tooltip in the SC variant", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { isPro: true },
    } as any);

    render(<DownloadButton track={track} />);

    fireEvent.mouseEnter(screen.getByTestId("download-button-sc"));
    expect(screen.getByTestId("download-button-tooltip")).toHaveTextContent(
      "Save for offline",
    );

    fireEvent.mouseLeave(screen.getByTestId("download-button-sc"));
    expect(
      screen.queryByTestId("download-button-tooltip"),
    ).not.toBeInTheDocument();
  });
});
