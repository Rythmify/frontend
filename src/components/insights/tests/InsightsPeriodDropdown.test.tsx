import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InsightsPeriodDropdown } from "../InsightsPeriodDropdown";

describe("InsightsPeriodDropdown", () => {
  it("renders the period button with current label", () => {
    render(<InsightsPeriodDropdown period="7d" onChange={vi.fn()} />);
    expect(screen.getByTestId("insights-period-btn")).toBeInTheDocument();
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
  });

  it("renders 'Today' label when period is today", () => {
    render(<InsightsPeriodDropdown period="today" onChange={vi.fn()} />);
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("does not show dropdown by default", () => {
    render(<InsightsPeriodDropdown period="7d" onChange={vi.fn()} />);
    expect(screen.queryByTestId("insights-period-dropdown")).not.toBeInTheDocument();
  });

  it("opens dropdown when button is clicked", () => {
    render(<InsightsPeriodDropdown period="7d" onChange={vi.fn()} />);
    fireEvent.click(screen.getByTestId("insights-period-btn"));
    expect(screen.getByTestId("insights-period-dropdown")).toBeInTheDocument();
  });

  it("renders all period options in the dropdown", () => {
    render(<InsightsPeriodDropdown period="7d" onChange={vi.fn()} />);
    fireEvent.click(screen.getByTestId("insights-period-btn"));
    expect(screen.getByTestId("insights-period-today")).toBeInTheDocument();
    expect(screen.getByTestId("insights-period-7d")).toBeInTheDocument();
    expect(screen.getByTestId("insights-period-30d")).toBeInTheDocument();
    expect(screen.getByTestId("insights-period-12m")).toBeInTheDocument();
    expect(screen.getByTestId("insights-period-all")).toBeInTheDocument();
  });

  it("calls onChange with selected period and closes dropdown", () => {
    const onChange = vi.fn();
    render(<InsightsPeriodDropdown period="7d" onChange={onChange} />);
    fireEvent.click(screen.getByTestId("insights-period-btn"));
    fireEvent.click(screen.getByTestId("insights-period-30d"));
    expect(onChange).toHaveBeenCalledWith("30d");
    expect(screen.queryByTestId("insights-period-dropdown")).not.toBeInTheDocument();
  });

  it("calls onChange with 'today' when Today option is clicked", () => {
    const onChange = vi.fn();
    render(<InsightsPeriodDropdown period="7d" onChange={onChange} />);
    fireEvent.click(screen.getByTestId("insights-period-btn"));
    fireEvent.click(screen.getByTestId("insights-period-today"));
    expect(onChange).toHaveBeenCalledWith("today");
  });

  it("calls onChange with 'all' when All time option is clicked", () => {
    const onChange = vi.fn();
    render(<InsightsPeriodDropdown period="7d" onChange={onChange} />);
    fireEvent.click(screen.getByTestId("insights-period-btn"));
    fireEvent.click(screen.getByTestId("insights-period-all"));
    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("closes dropdown when clicking outside", () => {
    render(
      <div>
        <div data-test="outside">Outside</div>
        <InsightsPeriodDropdown period="7d" onChange={vi.fn()} />
      </div>,
    );
    fireEvent.click(screen.getByTestId("insights-period-btn"));
    expect(screen.getByTestId("insights-period-dropdown")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByTestId("insights-period-dropdown")).not.toBeInTheDocument();
  });

  it("shows a check icon next to the currently active period", () => {
    render(<InsightsPeriodDropdown period="7d" onChange={vi.fn()} />);
    fireEvent.click(screen.getByTestId("insights-period-btn"));
    const activeOption = screen.getByTestId("insights-period-7d");
    expect(activeOption.className).toContain("font-bold");
    const svg = activeOption.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
