import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UploadSuccessView from "../UploadSuccessView";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderSuccess = (trackId: string | null) =>
  render(
    <MemoryRouter>
      <UploadSuccessView trackId={trackId} />
    </MemoryRouter>,
  );

describe("UploadSuccessView", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders saved to soundcloud heading", () => {
    renderSuccess("abc123");
    expect(screen.getByText(/saved to soundcloud/i)).toBeInTheDocument();
  });

  it("renders congratulations text", () => {
    renderSuccess("abc123");
    expect(screen.getByText(/congratulations/i)).toBeInTheDocument();
  });

  it("renders view track button", () => {
    renderSuccess("abc123");
    expect(screen.getByTestId("view-track-button")).toBeInTheDocument();
  });

  it("renders distribute to more section", () => {
    renderSuccess("abc123");
    expect(screen.getByText(/distribute to more/i)).toBeInTheDocument();
  });

  it("renders unlock artist pro button", () => {
    renderSuccess("abc123");
    expect(screen.getByTestId("unlock-artist-pro-button")).toBeInTheDocument();
  });

  it("renders footer legal links", () => {
    renderSuccess("abc123");
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByText("Privacy")).toBeInTheDocument();
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it("navigates to track page when view track is clicked", async () => {
    renderSuccess("abc123");
    await userEvent.click(screen.getByTestId("view-track-button"));
    expect(window.location.href).toBe("/track/abc123");
  });

  it("navigates to correct page for different trackId", async () => {
    renderSuccess("xyz999");
    await userEvent.click(screen.getByTestId("view-track-button"));
    expect(window.location.href).toBe("/track/xyz999");
  });

  it("calls navigate to plan page when unlock artist pro is clicked", async () => {
    renderSuccess("abc123");
    await userEvent.click(screen.getByTestId("unlock-artist-pro-button"));
    expect(mockNavigate).toHaveBeenCalledWith("/premium");
  });

  // ── Corner cases ───────────────────────────────────────────────────────────

  it("renders without crashing when trackId is null", () => {
    renderSuccess(null);
    expect(screen.getByText(/saved to soundcloud/i)).toBeInTheDocument();
  });
});
