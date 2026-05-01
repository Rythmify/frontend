import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminTracksPage from "../tracks/AdminTracksPage";

const mockAxiosGet = vi.hoisted(() => vi.fn());
const mockAdminDeleteTrack = vi.hoisted(() => vi.fn());
const mockAdminToggleTrackVisibility = vi.hoisted(() => vi.fn());

vi.mock("@/services/api/axiosInstance", () => ({
  default: { get: mockAxiosGet },
}));

vi.mock("@/services/api/admin.service", () => ({
  adminDeleteTrack: mockAdminDeleteTrack,
  adminToggleTrackVisibility: mockAdminToggleTrackVisibility,
}));

const makeApiTrack = (overrides: Record<string, unknown> = {}) => ({
  id: "t1",
  title: "Test Track",
  artist_name: "Test Artist",
  user_id: "u1",
  genre_name: "Pop",
  play_count: 50,
  like_count: 10,
  duration: 240,
  is_hidden: false,
  cover_image: null,
  created_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

const emptyTracksResponse = {
  data: { data: { tracks: [] }, pagination: { total: 0 } },
};

const tracksResponse = (tracks: ReturnType<typeof makeApiTrack>[]) => ({
  data: { data: { tracks }, pagination: { total: tracks.length } },
});

beforeEach(() => {
  mockAxiosGet.mockResolvedValue(emptyTracksResponse);
  mockAdminDeleteTrack.mockResolvedValue(undefined);
  mockAdminToggleTrackVisibility.mockResolvedValue(undefined);
});

describe("AdminTracksPage", () => {
  it("renders the Track Moderation heading", async () => {
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Track Moderation")).toBeInTheDocument();
  });

  it("renders the search input", () => {
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("input-track-search")).toBeInTheDocument();
  });

  it("renders the refresh button", () => {
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("btn-refresh")).toBeInTheDocument();
  });

  it("calls the search API on mount", async () => {
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalled();
    });
  });

  it("shows empty state when no tracks are returned", async () => {
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText("No tracks found")).toBeInTheDocument();
    });
  });

  it("renders track rows when tracks are returned", async () => {
    mockAxiosGet.mockResolvedValue(tracksResponse([makeApiTrack()]));
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText("Test Track")).toBeInTheDocument();
    });
  });

  it("renders artist name in track row", async () => {
    mockAxiosGet.mockResolvedValue(tracksResponse([makeApiTrack()]));
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText("Test Artist")).toBeInTheDocument();
    });
  });

  it("renders action dropdown button per track", async () => {
    mockAxiosGet.mockResolvedValue(tracksResponse([makeApiTrack({ id: "t1" })]));
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("btn-track-actions-t1")).toBeInTheDocument();
    });
  });

  it("opens action dropdown when button is clicked", async () => {
    mockAxiosGet.mockResolvedValue(tracksResponse([makeApiTrack({ id: "t1" })]));
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-track-actions-t1")));
    expect(screen.getByTestId("btn-toggle-hide")).toBeInTheDocument();
    expect(screen.getByTestId("btn-delete-track")).toBeInTheDocument();
  });

  it("opens hide modal when Hide Track is clicked", async () => {
    mockAxiosGet.mockResolvedValue(tracksResponse([makeApiTrack({ id: "t1", is_hidden: false })]));
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-track-actions-t1")));
    fireEvent.click(screen.getByTestId("btn-toggle-hide"));
    // "Hide Track" appears in both the modal heading and the confirm button
    expect(screen.getAllByText("Hide Track").length).toBeGreaterThanOrEqual(1);
  });

  it("closes hide modal when cancel is clicked", async () => {
    mockAxiosGet.mockResolvedValue(tracksResponse([makeApiTrack({ id: "t1" })]));
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-track-actions-t1")));
    fireEvent.click(screen.getByTestId("btn-toggle-hide"));
    fireEvent.click(screen.getByTestId("btn-hide-cancel"));
    expect(screen.queryByTestId("btn-hide-cancel")).not.toBeInTheDocument();
  });

  it("opens delete modal when Delete Track is clicked", async () => {
    mockAxiosGet.mockResolvedValue(tracksResponse([makeApiTrack({ id: "t1" })]));
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-track-actions-t1")));
    fireEvent.click(screen.getByTestId("btn-delete-track"));
    // "Delete Track" appears in both the heading and the confirm button
    expect(screen.getAllByText("Delete Track").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("This action is permanent")).toBeInTheDocument();
  });

  it("cancels delete modal when cancel is clicked", async () => {
    mockAxiosGet.mockResolvedValue(tracksResponse([makeApiTrack({ id: "t1" })]));
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-track-actions-t1")));
    fireEvent.click(screen.getByTestId("btn-delete-track"));
    fireEvent.click(screen.getByTestId("btn-delete-cancel"));
    expect(screen.queryByText("This action is permanent")).not.toBeInTheDocument();
  });

  it("calls adminDeleteTrack when delete is confirmed", async () => {
    mockAxiosGet.mockResolvedValue(tracksResponse([makeApiTrack({ id: "t1" })]));
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    await waitFor(() => fireEvent.click(screen.getByTestId("btn-track-actions-t1")));
    fireEvent.click(screen.getByTestId("btn-delete-track"));
    fireEvent.click(screen.getByTestId("btn-delete-confirm"));
    await waitFor(() => {
      expect(mockAdminDeleteTrack).toHaveBeenCalledWith("t1");
    });
  });

  it("renders legend for track visibility status", async () => {
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Public")).toBeInTheDocument();
    expect(screen.getByText("Private")).toBeInTheDocument();
    expect(screen.getByText("Hidden by Admin")).toBeInTheDocument();
  });

  it("renders clear search button when search has value", async () => {
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-track-search"), {
      target: { value: "test" },
    });
    expect(screen.getByTestId("btn-clear-search")).toBeInTheDocument();
  });

  it("clears search when clear button is clicked", async () => {
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByTestId("input-track-search"), {
      target: { value: "test" },
    });
    fireEvent.click(screen.getByTestId("btn-clear-search"));
    const input = screen.getByTestId("input-track-search") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("renders track title without strikethrough for tracks loaded via search", async () => {
    // The search API mapping always sets is_hidden: false, so titles are never struck through
    mockAxiosGet.mockResolvedValue(
      tracksResponse([makeApiTrack({ id: "t1", title: "Normal Song" })]),
    );
    render(
      <MemoryRouter>
        <AdminTracksPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      const titleEl = screen.getByText("Normal Song");
      expect(titleEl.className).not.toContain("line-through");
    });
  });
});
