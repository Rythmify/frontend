import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { InsightsTopListeners } from "../InsightsTopListeners";

describe("InsightsTopListeners", () => {
  it("renders the top listeners container", () => {
    render(<InsightsTopListeners period="7d" />);
    expect(screen.getByTestId("insights-top-listeners")).toBeInTheDocument();
  });

  it("renders the Top listeners heading", () => {
    render(<InsightsTopListeners period="7d" />);
    expect(screen.getByText("Top listeners")).toBeInTheDocument();
  });

  it("shows the period label", () => {
    render(<InsightsTopListeners period="7d" />);
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
  });

  it("shows period label for today", () => {
    render(<InsightsTopListeners period="today" />);
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("shows period label for 30d", () => {
    render(<InsightsTopListeners period="30d" />);
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  it("shows the Artist Pro locked overlay", () => {
    render(<InsightsTopListeners period="7d" />);
    expect(screen.getByText("Artist Pro")).toBeInTheDocument();
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });

  it("renders the See all button", () => {
    render(<InsightsTopListeners period="7d" />);
    expect(screen.getByText("See all")).toBeInTheDocument();
  });
});
