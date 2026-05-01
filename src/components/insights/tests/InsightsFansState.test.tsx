import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { InsightsFansState } from "../InsightsFansState";

describe("InsightsFansState", () => {
  it("renders the fans state container", () => {
    render(<InsightsFansState />);
    expect(screen.getByTestId("insights-fans-state")).toBeInTheDocument();
  });

  it("renders the headline about connecting with fans", () => {
    render(<InsightsFansState />);
    expect(
      screen.getByText(/Connect with your biggest fans/i),
    ).toBeInTheDocument();
  });

  it("renders description about engaged fans", () => {
    render(<InsightsFansState />);
    expect(
      screen.getByText(/See which fans are your most engaged/i),
    ).toBeInTheDocument();
  });

  it("renders the Artist Pro availability notice", () => {
    render(<InsightsFansState />);
    expect(
      screen.getByText(/Available to Artist Pro subscribers/i),
    ).toBeInTheDocument();
  });

  it("renders the Upgrade to Artist Pro link pointing to /premium", () => {
    render(<InsightsFansState />);
    const upgradeBtn = screen.getByTestId("insights-fans-upgrade-btn");
    expect(upgradeBtn).toBeInTheDocument();
    expect(upgradeBtn).toHaveAttribute("href", "/premium");
    expect(upgradeBtn).toHaveTextContent("Upgrade to Artist Pro");
  });

  it("renders the fans illustration image", () => {
    render(<InsightsFansState />);
    expect(screen.getByAltText("Fans illustration")).toBeInTheDocument();
  });
});
