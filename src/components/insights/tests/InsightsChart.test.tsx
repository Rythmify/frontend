import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InsightsChart } from "../InsightsChart";

const bars7 = [10, 20, 30, 5, 15, 25, 40];
const labels7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

describe("InsightsChart", () => {
  it("renders the chart container", () => {
    render(<InsightsChart bars={bars7} labels={labels7} />);
    expect(screen.getByTestId("insights-chart")).toBeInTheDocument();
  });

  it("renders an SVG element with aria-label", () => {
    const { container } = render(<InsightsChart bars={bars7} labels={labels7} />);
    const svg = container.querySelector('svg[aria-label="Insights bar chart"]');
    expect(svg).toBeInTheDocument();
  });

  it("renders y-axis labels: 0, midpoint, and max", () => {
    render(<InsightsChart bars={bars7} labels={labels7} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("renders the correct number of rect bars", () => {
    const { container } = render(<InsightsChart bars={bars7} labels={labels7} />);
    const rects = container.querySelectorAll("rect");
    expect(rects).toHaveLength(bars7.length);
  });

  it("renders axis labels in the SVG", () => {
    render(<InsightsChart bars={bars7} labels={labels7} />);
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
  });

  it("shows tooltip value on bar hover", () => {
    const { container } = render(<InsightsChart bars={bars7} labels={labels7} />);
    const rects = container.querySelectorAll("rect");
    fireEvent.mouseEnter(rects[6]);
    // After hover, "40" appears as both the y-axis max label and the tooltip
    expect(screen.getAllByText("40").length).toBeGreaterThanOrEqual(2);
  });

  it("hides tooltip on mouse leave", () => {
    const { container } = render(<InsightsChart bars={bars7} labels={labels7} />);
    const rects = container.querySelectorAll("rect");
    fireEvent.mouseEnter(rects[6]);
    fireEvent.mouseLeave(rects[6]);
    // After mouse leave the tooltip text node is gone; only the y-axis label remains
    expect(screen.getAllByText("40")).toHaveLength(1);
  });

  it("renders with all-zero bars without crashing", () => {
    const zeroBars = [0, 0, 0, 0, 0, 0, 0];
    render(<InsightsChart bars={zeroBars} labels={labels7} />);
    expect(screen.getByTestId("insights-chart")).toBeInTheDocument();
  });

  it("renders with a single bar", () => {
    render(<InsightsChart bars={[100]} labels={["Mon"]} />);
    const { container } = render(<InsightsChart bars={[100]} labels={["Mon"]} />);
    const rects = container.querySelectorAll("rect");
    expect(rects).toHaveLength(1);
  });

  it("renders empty labels without crashing", () => {
    const labels = ["Mon", "", "", "Thu", "", "", "Sun"];
    render(<InsightsChart bars={bars7} labels={labels} />);
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
  });
});
