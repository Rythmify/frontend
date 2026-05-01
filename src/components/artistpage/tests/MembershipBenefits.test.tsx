import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MembershipBenefits } from "../MembershipBenefits";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  mockNavigate.mockClear();
});

describe("MembershipBenefits", () => {
  it("renders the membership benefits container", () => {
    render(
      <MemoryRouter>
        <MembershipBenefits />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("membership-benefits")).toBeInTheDocument();
  });

  it("renders the Artist Pro Membership Benefits heading", () => {
    render(
      <MemoryRouter>
        <MembershipBenefits />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Artist Pro Membership Benefits/i)).toBeInTheDocument();
  });

  it("renders the Coming Soon badge", () => {
    render(
      <MemoryRouter>
        <MembershipBenefits />
      </MemoryRouter>,
    );
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });

  it("renders the See all button", () => {
    render(
      <MemoryRouter>
        <MembershipBenefits />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("benefits-see-all-btn")).toBeInTheDocument();
  });

  it("navigates to /premium when See all is clicked", () => {
    render(
      <MemoryRouter>
        <MembershipBenefits />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("benefits-see-all-btn"));
    expect(mockNavigate).toHaveBeenCalledWith("/premium");
  });

  it("renders Splice benefit card", () => {
    render(
      <MemoryRouter>
        <MembershipBenefits />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("benefit-card-splice")).toBeInTheDocument();
  });

  it("renders Groover benefit card", () => {
    render(
      <MemoryRouter>
        <MembershipBenefits />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("benefit-card-groover")).toBeInTheDocument();
  });

  it("renders Native Instruments benefit card", () => {
    render(
      <MemoryRouter>
        <MembershipBenefits />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("benefit-card-native-instruments")).toBeInTheDocument();
  });

  it("renders Output Arcade benefit card", () => {
    render(
      <MemoryRouter>
        <MembershipBenefits />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("benefit-card-output-arcade")).toBeInTheDocument();
  });

  it("renders save buttons for each benefit", () => {
    render(
      <MemoryRouter>
        <MembershipBenefits />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("benefit-save-btn-splice")).toBeInTheDocument();
    expect(screen.getByTestId("benefit-save-btn-groover")).toBeInTheDocument();
    expect(screen.getByTestId("benefit-save-btn-native-instruments")).toBeInTheDocument();
    expect(screen.getByTestId("benefit-save-btn-output-arcade")).toBeInTheDocument();
  });

  it("saves buttons display correct discount amounts", () => {
    render(
      <MemoryRouter>
        <MembershipBenefits />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("benefit-save-btn-splice")).toHaveTextContent("Save $25.98");
    expect(screen.getByTestId("benefit-save-btn-groover")).toHaveTextContent("Save $21");
    expect(screen.getByTestId("benefit-save-btn-native-instruments")).toHaveTextContent("Save $50");
    expect(screen.getByTestId("benefit-save-btn-output-arcade")).toHaveTextContent("Save $39");
  });

  it("navigates to /premium when a save button is clicked", () => {
    render(
      <MemoryRouter>
        <MembershipBenefits />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("benefit-save-btn-splice"));
    expect(mockNavigate).toHaveBeenCalledWith("/premium");
  });

  it("renders descriptive text for Splice benefit", () => {
    render(
      <MemoryRouter>
        <MembershipBenefits />
      </MemoryRouter>,
    );
    expect(screen.getByText(/2 free months of Splice Sounds\+/i)).toBeInTheDocument();
  });
});
