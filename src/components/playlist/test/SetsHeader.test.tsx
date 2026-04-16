import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SetsHeader from "../SetsHeader";

const defaultProps = {
  filterText: "",
  setFilterText: vi.fn(),
  activeFilter: "All",
  setActiveFilter: vi.fn(),
  isDropdownOpen: false,
  setIsDropdownOpen: vi.fn(),
  filterOptions: ["All", "Created", "Liked"],
  title: "My Sets",
};

describe("SetsHeader", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the title and filter input", () => {
    render(<SetsHeader {...defaultProps} />);
    expect(screen.getByText("My Sets")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Filter")).toBeInTheDocument();
  });

  it("calls setFilterText on input change", () => {
    render(<SetsHeader {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText("Filter"), {
      target: { value: "test" },
    });
    expect(defaultProps.setFilterText).toHaveBeenCalledWith("test");
  });

  it("shows clear button only when text is present", () => {
    const { rerender } = render(<SetsHeader {...defaultProps} filterText="" />);
    expect(screen.queryByTestId("button-clear-filter")).not.toBeInTheDocument();
    rerender(<SetsHeader {...defaultProps} filterText="hi" />);
    expect(screen.getByTestId("button-clear-filter")).toBeInTheDocument();
  });

  it("clears filter text when clear button is clicked", () => {
    render(<SetsHeader {...defaultProps} filterText="rock" />);
    fireEvent.click(screen.getByTestId("button-clear-filter"));
    expect(defaultProps.setFilterText).toHaveBeenCalledWith("");
  });

  it("toggles dropdown state when clicked", () => {
    render(<SetsHeader {...defaultProps} isDropdownOpen={false} />);
    fireEvent.click(screen.getByTestId("button-filter-dropdown"));
    expect(defaultProps.setIsDropdownOpen).toHaveBeenCalledWith(true);
  });

  it("renders dropdown options when open", () => {
    render(<SetsHeader {...defaultProps} isDropdownOpen={true} />);
    expect(
      screen.getByTestId("button-filter-option-liked"),
    ).toBeInTheDocument();
  });

  it("calls setActiveFilter and closes dropdown on option click", () => {
    render(<SetsHeader {...defaultProps} isDropdownOpen={true} />);
    fireEvent.click(screen.getByTestId("button-filter-option-created"));
    expect(defaultProps.setActiveFilter).toHaveBeenCalledWith("Created");
    expect(defaultProps.setIsDropdownOpen).toHaveBeenCalledWith(false);
  });
});
