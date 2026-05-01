import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CheckBox from "@/components/MessagingComponents/CheckBox";

describe("Messaging CheckBox", () => {
  it("renders label and unchecked state", () => {
    render(<CheckBox label="Accept Terms" checked={false} onChange={vi.fn()} />);

    expect(screen.getByTestId("checkbox-accept-terms")).toBeInTheDocument();
    expect(screen.getByTestId("checkbox-label")).toHaveTextContent("Accept Terms");
    expect(screen.getByTestId("checkbox-toggle").querySelector("svg")).not.toBeInTheDocument();
  });

  it("shows the check mark when checked", () => {
    render(<CheckBox label="Enabled" checked onChange={vi.fn()} />);

    const svg = screen.getByTestId("checkbox-toggle").querySelector("svg");
    const path = screen.getByTestId("checkbox-toggle").querySelector("path");

    expect(svg).toHaveClass("text-black");
    expect(path).toHaveAttribute("stroke-width", "1.8");
    expect(path).toHaveAttribute("stroke-linecap", "round");
    expect(path).toHaveAttribute("stroke-linejoin", "round");
  });

  it("shows a hover check mark and hides it again on mouse leave", () => {
    render(<CheckBox label="Hover Me" checked={false} onChange={vi.fn()} />);

    fireEvent.mouseEnter(screen.getByTestId("checkbox-toggle"));
    expect(screen.getByTestId("checkbox-toggle").querySelector("svg")).toHaveClass("text-gray-300");

    fireEvent.mouseLeave(screen.getByTestId("checkbox-toggle"));
    expect(screen.getByTestId("checkbox-toggle").querySelector("svg")).not.toBeInTheDocument();
  });

  it("emits the inverse checked value when clicked", () => {
    const onChange = vi.fn();
    const { rerender } = render(<CheckBox label="Flip Switch" checked={false} onChange={onChange} />);

    fireEvent.click(screen.getByTestId("checkbox-toggle"));
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(<CheckBox label="Flip Switch" checked onChange={onChange} />);
    fireEvent.click(screen.getByTestId("checkbox-toggle"));
    expect(onChange).toHaveBeenLastCalledWith(false);
  });
});
