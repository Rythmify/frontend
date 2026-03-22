import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UploadGuestPage from "../UploadGuestPage";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderGuest = () =>
  render(
    <MemoryRouter>
      <UploadGuestPage />
    </MemoryRouter>
  );

describe("UploadGuestPage", () => {
  beforeEach(() => mockNavigate.mockClear());

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders hero heading", () => {
    renderGuest();
    expect(screen.getByText(/first upload to first album/i)).toBeInTheDocument();
  });

  it("renders upload your first track button", () => {
    renderGuest();
    expect(screen.getByTestId("upload-guestpage-button")).toBeInTheDocument();
  });

  it("renders real-time stats feature", () => {
    renderGuest();
    expect(screen.getByText(/real-time stats/i)).toBeInTheDocument();
  });

  it("renders find your community feature", () => {
    renderGuest();
    expect(screen.getByText(/find your community/i)).toBeInTheDocument();
  });

  it("renders connect directly with fans feature", () => {
    renderGuest();
    expect(screen.getByText(/connect directly with fans/i)).toBeInTheDocument();
  });

  it("renders artists section", () => {
    renderGuest();
    expect(screen.getByText(/made here, played everywhere/i)).toBeInTheDocument();
  });

  it("renders try it free button", () => {
    renderGuest();
    expect(screen.getByText(/try it free/i)).toBeInTheDocument();
  });

  it("renders learn more about pro plans button", () => {
    renderGuest();
    expect(screen.getByText(/learn more about pro plans/i)).toBeInTheDocument();
  });

  it("renders footer legal links", () => {
    renderGuest();
    expect(screen.getByText("Legal")).toBeInTheDocument();
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it("navigates to /signin when upload first track is clicked", async () => {
    renderGuest();
    await userEvent.click(screen.getByTestId("upload-guestpage-button"));
    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });

  it("navigates to /signin when try it free is clicked", async () => {
    renderGuest();
    await userEvent.click(screen.getByText(/try it free/i));
    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });

  it("navigates to /artist-pro when learn more about pro plans is clicked", async () => {
    renderGuest();
    await userEvent.click(screen.getByText(/learn more about pro plans/i));
    expect(mockNavigate).toHaveBeenCalledWith("/artist-pro");
  });
});