import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InsightsTabs } from "../InsightsTabs";
import type { InsightsTab } from "../InsightsTabs";

describe("InsightsTabs", () => {
  it("renders all three tab buttons", () => {
    render(<InsightsTabs active="Rythmify" onChange={vi.fn()} />);
    expect(screen.getByTestId("insights-tab-rythmify")).toBeInTheDocument();
    expect(screen.getByTestId("insights-tab-all-platforms")).toBeInTheDocument();
    expect(screen.getByTestId("insights-tab-fans")).toBeInTheDocument();
  });

  it("renders tab labels", () => {
    render(<InsightsTabs active="Rythmify" onChange={vi.fn()} />);
    expect(screen.getByText("Rythmify")).toBeInTheDocument();
    expect(screen.getByText("All Platforms")).toBeInTheDocument();
    expect(screen.getByText("Fans")).toBeInTheDocument();
  });

  it("applies active styles to the active tab", () => {
    render(<InsightsTabs active="Rythmify" onChange={vi.fn()} />);
    const activeTab = screen.getByTestId("insights-tab-rythmify");
    expect(activeTab.className).toContain("border-white");
    expect(activeTab.className).toContain("text-white");
  });

  it("applies inactive styles to non-active tabs", () => {
    render(<InsightsTabs active="Rythmify" onChange={vi.fn()} />);
    const inactiveTab = screen.getByTestId("insights-tab-all-platforms");
    expect(inactiveTab.className).toContain("border-transparent");
  });

  it("calls onChange with correct tab when Rythmify is clicked", () => {
    const onChange = vi.fn();
    render(<InsightsTabs active="All Platforms" onChange={onChange} />);
    fireEvent.click(screen.getByTestId("insights-tab-rythmify"));
    expect(onChange).toHaveBeenCalledWith("Rythmify");
  });

  it("calls onChange with 'All Platforms' when that tab is clicked", () => {
    const onChange = vi.fn();
    render(<InsightsTabs active="Rythmify" onChange={onChange} />);
    fireEvent.click(screen.getByTestId("insights-tab-all-platforms"));
    expect(onChange).toHaveBeenCalledWith("All Platforms");
  });

  it("calls onChange with 'Fans' when fans tab is clicked", () => {
    const onChange = vi.fn();
    render(<InsightsTabs active="Rythmify" onChange={onChange} />);
    fireEvent.click(screen.getByTestId("insights-tab-fans"));
    expect(onChange).toHaveBeenCalledWith("Fans");
  });

  it("renders 'Coming soon' badge on All Platforms tab", () => {
    render(<InsightsTabs active="Rythmify" onChange={vi.fn()} />);
    expect(screen.getAllByText("Coming soon").length).toBeGreaterThanOrEqual(1);
  });

  it("renders 'NEW' badge on Fans tab", () => {
    render(<InsightsTabs active="Rythmify" onChange={vi.fn()} />);
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });

  it("active tab switches correctly when prop changes", () => {
    const { rerender } = render(<InsightsTabs active="Rythmify" onChange={vi.fn()} />);
    expect(screen.getByTestId("insights-tab-rythmify").className).toContain("text-white");

    rerender(<InsightsTabs active="Fans" onChange={vi.fn()} />);
    expect(screen.getByTestId("insights-tab-fans").className).toContain("text-white");
    expect(screen.getByTestId("insights-tab-rythmify").className).not.toContain("text-white border-white");
  });
});
