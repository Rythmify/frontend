import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import UploadQuotaBar from "../../../../components/Upload/UploadQuotaBar";
import { MemoryRouter } from "react-router-dom"; // <-- import MemoryRouter

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

// ─── Mock quota service ───────────────────────────────────────────────────────

vi.mock("@/services/api/upload/quota.service", () => ({
  getUploadQuota: vi.fn(),
}));

import { getUploadQuota } from "@/services/api/upload/quota.service";
const mockGetUploadQuota = getUploadQuota as ReturnType<typeof vi.fn>;

describe("UploadQuotaBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = () =>
    render(
      <MemoryRouter>
        <UploadQuotaBar />
      </MemoryRouter>,
    );

  // ── Loading state ─────────────────────────────────────────────────────────

  it("renders a loading skeleton while quota is being fetched", () => {
    mockGetUploadQuota.mockReturnValue(new Promise(() => {}));
    const { container } = renderWithRouter();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("does not render the quota bar content while loading", () => {
    mockGetUploadQuota.mockReturnValue(new Promise(() => {}));
    renderWithRouter();
    expect(screen.queryByText(/uploads used/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/tracks uploaded/i)).not.toBeInTheDocument();
  });

  // ── Free plan ─────────────────────────────────────────────────────────────

  it("renders percentage text for a free plan", async () => {
    mockGetUploadQuota.mockResolvedValue({ usedTracks: 1, trackLimit: 3 });
    renderWithRouter();
    await waitFor(() =>
      expect(screen.getByText(/of uploads used/i)).toBeInTheDocument(),
    );
  });

  it("renders correct track count for free plan", async () => {
    mockGetUploadQuota.mockResolvedValue({ usedTracks: 1, trackLimit: 3 });
    renderWithRouter();
    await waitFor(() =>
      expect(screen.getByText(/1 of 3 tracks/i)).toBeInTheDocument(),
    );
  });

  it("renders 0 of limit when no tracks uploaded on free plan", async () => {
    mockGetUploadQuota.mockResolvedValue({ usedTracks: 0, trackLimit: 3 });
    renderWithRouter();
    await waitFor(() =>
      expect(screen.getByText(/0 of 3 tracks/i)).toBeInTheDocument(),
    );
  });

  it("renders correct percentage value for free plan (1/3)", async () => {
    mockGetUploadQuota.mockResolvedValue({ usedTracks: 1, trackLimit: 3 });
    renderWithRouter();
    await waitFor(() =>
      expect(screen.getByText(/33\.33% of uploads used/i)).toBeInTheDocument(),
    );
  });

  it("caps percentage at 100% when usedTracks exceeds trackLimit", async () => {
    mockGetUploadQuota.mockResolvedValue({ usedTracks: 5, trackLimit: 3 });
    renderWithRouter();
    await waitFor(() =>
      expect(screen.getByText(/100\.00% of uploads used/i)).toBeInTheDocument(),
    );
  });

  // ── Premium / unlimited plan ──────────────────────────────────────────────

  it("renders 'Unlimited uploads' text for a premium plan", async () => {
    mockGetUploadQuota.mockResolvedValue({ usedTracks: 10, trackLimit: null });
    renderWithRouter();
    await waitFor(() =>
      expect(screen.getByText(/^Unlimited uploads$/)).toBeInTheDocument(),
    );
  });

  it("renders correct track count for unlimited plan", async () => {
    mockGetUploadQuota.mockResolvedValue({ usedTracks: 10, trackLimit: null });
    renderWithRouter();
    await waitFor(() =>
      expect(screen.getByText(/10 tracks uploaded/i)).toBeInTheDocument(),
    );
  });

  it("renders '0 tracks uploaded' for premium user with no uploads", async () => {
    mockGetUploadQuota.mockResolvedValue({ usedTracks: 0, trackLimit: null });
    renderWithRouter();
    await waitFor(() =>
      expect(screen.getByText(/0 tracks uploaded/i)).toBeInTheDocument(),
    );
  });

  it("does not render percentage text for unlimited plan", async () => {
    mockGetUploadQuota.mockResolvedValue({ usedTracks: 5, trackLimit: null });
    renderWithRouter();
    await waitFor(() =>
      expect(screen.queryByText(/of uploads used/i)).not.toBeInTheDocument(),
    );
  });

  // ── CTA button ────────────────────────────────────────────────────────────

  it("renders 'Get unlimited uploads' button", async () => {
    mockGetUploadQuota.mockResolvedValue({ usedTracks: 1, trackLimit: 3 });
    renderWithRouter();
    await waitFor(() =>
      expect(
        screen.getByTestId("get-unlimited-uploads-button-quota-bar"),
      ).toBeInTheDocument(),
    );
  });

  it("renders 'Get unlimited uploads' button for a premium plan", async () => {
    mockGetUploadQuota.mockResolvedValue({ usedTracks: 10, trackLimit: null });
    renderWithRouter();
    await waitFor(() =>
      expect(
        screen.getByTestId("get-unlimited-uploads-button-quota-bar"),
      ).toBeInTheDocument(),
    );
  });

  // ── Error / failure ───────────────────────────────────────────────────────

  it("does not crash when getUploadQuota rejects", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetUploadQuota.mockRejectedValue(new Error("Network error"));
    renderWithRouter();
    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch quota:",
        expect.any(Error),
      ),
    );
    consoleSpy.mockRestore();
  });

  it("navigates to plan page when the CTA is clicked", async () => {
    mockGetUploadQuota.mockResolvedValue({ usedTracks: 1, trackLimit: 3 });
    renderWithRouter();
    await waitFor(() =>
      expect(
        screen.getByTestId("get-unlimited-uploads-button-quota-bar"),
      ).toBeInTheDocument(),
    );

    screen.getByTestId("get-unlimited-uploads-button-quota-bar").click();
    expect(mockNavigate).toHaveBeenCalledWith("/premium");
  });
});
