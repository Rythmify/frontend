import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ArtistsSectionGuest from "../ArtistsSectionGuest";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderArtists = () =>
  render(
    <MemoryRouter>
      <ArtistsSectionGuest />
    </MemoryRouter>
  );

describe("ArtistsSectionGuest", () => {
  beforeEach(() => mockNavigate.mockClear());

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders section heading", () => {
    renderArtists();
    expect(screen.getByText(/made here, played everywhere/i)).toBeInTheDocument();
  });

  it("renders all three artist names", () => {
    renderArtists();
    expect(screen.getByText("Tei Shi")).toBeInTheDocument();
    expect(screen.getByText("Eli Sostre")).toBeInTheDocument();
    expect(screen.getByText("Pollari")).toBeInTheDocument();
  });

  it("renders all three artist images", () => {
    renderArtists();
    expect(screen.getByAltText("Tei Shi")).toBeInTheDocument();
    expect(screen.getByAltText("Eli Sostre")).toBeInTheDocument();
    expect(screen.getByAltText("Pollari")).toBeInTheDocument();
  });

  it("renders all three follower counts", () => {
    renderArtists();
    expect(screen.getByText("36.5K")).toBeInTheDocument();
    expect(screen.getByText("48K")).toBeInTheDocument();
    expect(screen.getByText("62.1K")).toBeInTheDocument();
  });

  it("renders Join Now button", () => {
    renderArtists();
    expect(screen.getByText(/join now/i)).toBeInTheDocument();
  });

  it("renders the orange accent bar", () => {
    const { container } = renderArtists();
    expect(container.querySelector(".bg-\\[\\#ff5500\\]")).toBeInTheDocument();
  });

  it("renders the section description text", () => {
    renderArtists();
    expect(screen.getByText(/join the world's most diverse community/i)).toBeInTheDocument();
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it("navigates to /signin when Join Now is clicked", async () => {
    renderArtists();
    await userEvent.click(screen.getByText(/join now/i));
    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });
});