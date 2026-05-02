import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EmptyState } from "../EmptyState";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/components/Upload/DropZone", () => ({
  default: ({ onUpload }: { onUpload: () => void }) => (
    <div data-test="mock-dropzone">
      <button data-test="mock-dropzone-trigger" onClick={onUpload}>Trigger Upload</button>
    </div>
  ),
}));

beforeEach(() => {
  mockNavigate.mockClear();
});

describe("EmptyState", () => {
  it("renders the empty state container", () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("artists-empty-state")).toBeInTheDocument();
  });

  it("renders the DropZone component", () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("mock-dropzone")).toBeInTheDocument();
  });

  it("navigates to /upload when DropZone onUpload is called", () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("mock-dropzone-trigger"));
    expect(mockNavigate).toHaveBeenCalledWith("/upload");
  });

  it("renders the How Rythmify works heading", () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/How Rythmify works for artists at any stage/i),
    ).toBeInTheDocument();
  });

  it("renders Upload step", () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("Upload").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Artist uploads tracks to Rythmify and other platforms/i),
    ).toBeInTheDocument();
  });

  it("renders Get Heard step", () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>,
    );
    expect(screen.getByText("Get Heard")).toBeInTheDocument();
    expect(
      screen.getByText(/Track gets recommended to the right listeners/i),
    ).toBeInTheDocument();
  });

  it("renders Get Fans step", () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>,
    );
    expect(screen.getByText("Get Fans")).toBeInTheDocument();
    expect(
      screen.getByText(/Listeners engage directly with the artist/i),
    ).toBeInTheDocument();
  });

  it("renders Get Paid step", () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>,
    );
    expect(screen.getByText("Get Paid")).toBeInTheDocument();
    expect(
      screen.getByText(/Artist makes money from streams/i),
    ).toBeInTheDocument();
  });

  it("renders the MembershipBenefits component", () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("membership-benefits")).toBeInTheDocument();
  });

  it("renders all four how-it-works steps", () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("Upload").length).toBeGreaterThanOrEqual(1);
    ["Get Heard", "Get Fans", "Get Paid"].forEach((step) =>
      expect(screen.getByText(step)).toBeInTheDocument(),
    );
  });
});
