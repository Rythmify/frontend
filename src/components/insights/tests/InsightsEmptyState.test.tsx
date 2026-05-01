import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { InsightsEmptyState } from "../InsightsEmptyState";

describe("InsightsEmptyState", () => {
  it("renders the empty state container", () => {
    render(<InsightsEmptyState />);
    expect(screen.getByTestId("insights-empty-state")).toBeInTheDocument();
  });

  it("renders the headline text", () => {
    render(<InsightsEmptyState />);
    expect(
      screen.getByText(/Get unmatched insights into your listeners/i),
    ).toBeInTheDocument();
  });

  it("renders the descriptive paragraph", () => {
    render(<InsightsEmptyState />);
    expect(
      screen.getByText(/Rythmify is the only platform/i),
    ).toBeInTheDocument();
  });

  it("renders the upload call-to-action text", () => {
    render(<InsightsEmptyState />);
    expect(
      screen.getByText(/To get started, all it takes is an upload/i),
    ).toBeInTheDocument();
  });

  it("renders the Upload link pointing to /upload", () => {
    render(<InsightsEmptyState />);
    const uploadBtn = screen.getByTestId("insights-empty-upload-btn");
    expect(uploadBtn).toBeInTheDocument();
    expect(uploadBtn).toHaveAttribute("href", "/upload");
    expect(uploadBtn).toHaveTextContent("Upload");
  });
});
