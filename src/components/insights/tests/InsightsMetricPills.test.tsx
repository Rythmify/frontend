import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InsightsMetricPills } from "../InsightsMetricPills";
import type { Metric } from "../insights.types";

const metrics = [
  { key: "plays" as Metric, label: "Plays", value: 1500, icon: <span>▶</span> },
  { key: "likes" as Metric, label: "Likes", value: 320, icon: <span>♥</span> },
  { key: "comments" as Metric, label: "Comments", value: 45, icon: <span>💬</span> },
];

describe("InsightsMetricPills", () => {
  it("renders all metric pills", () => {
    render(<InsightsMetricPills metrics={metrics} active="plays" onSelect={vi.fn()} />);
    expect(screen.getByTestId("insights-metric-plays")).toBeInTheDocument();
    expect(screen.getByTestId("insights-metric-likes")).toBeInTheDocument();
    expect(screen.getByTestId("insights-metric-comments")).toBeInTheDocument();
  });

  it("renders metric values formatted with locale", () => {
    render(<InsightsMetricPills metrics={metrics} active="plays" onSelect={vi.fn()} />);
    expect(screen.getByText(/1,500/)).toBeInTheDocument();
    expect(screen.getByText(/320/)).toBeInTheDocument();
    expect(screen.getByText(/45/)).toBeInTheDocument();
  });

  it("renders metric labels", () => {
    render(<InsightsMetricPills metrics={metrics} active="plays" onSelect={vi.fn()} />);
    expect(screen.getByText(/Plays/)).toBeInTheDocument();
    expect(screen.getByText(/Likes/)).toBeInTheDocument();
    expect(screen.getByText(/Comments/)).toBeInTheDocument();
  });

  it("applies active styles to the selected metric", () => {
    render(<InsightsMetricPills metrics={metrics} active="plays" onSelect={vi.fn()} />);
    const activeBtn = screen.getByTestId("insights-metric-plays");
    expect(activeBtn.className).toContain("bg-white");
    expect(activeBtn.className).toContain("text-black");
  });

  it("applies inactive styles to non-selected metrics", () => {
    render(<InsightsMetricPills metrics={metrics} active="plays" onSelect={vi.fn()} />);
    const inactiveBtn = screen.getByTestId("insights-metric-likes");
    expect(inactiveBtn.className).toContain("bg-[#1a1a1a]");
  });

  it("calls onSelect with the correct metric key when a pill is clicked", () => {
    const onSelect = vi.fn();
    render(<InsightsMetricPills metrics={metrics} active="plays" onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId("insights-metric-likes"));
    expect(onSelect).toHaveBeenCalledWith("likes");
  });

  it("calls onSelect with 'comments' when comments pill is clicked", () => {
    const onSelect = vi.fn();
    render(<InsightsMetricPills metrics={metrics} active="plays" onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId("insights-metric-comments"));
    expect(onSelect).toHaveBeenCalledWith("comments");
  });

  it("renders zero values without crashing", () => {
    const zeroMetrics = [{ key: "plays" as Metric, label: "Plays", value: 0, icon: <span>▶</span> }];
    render(<InsightsMetricPills metrics={zeroMetrics} active="plays" onSelect={vi.fn()} />);
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it("renders empty metrics list without crashing", () => {
    render(<InsightsMetricPills metrics={[]} active="plays" onSelect={vi.fn()} />);
    expect(document.querySelector('[data-test^="insights-metric"]')).toBeNull();
  });
});
