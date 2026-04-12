import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckBox from "../CheckBox";

const renderCheckBox = (props = {}) =>
  render(
    <CheckBox
      label="Test label"
      checked={false}
      onChange={vi.fn()}
      {...props}
    />
  );

describe("CheckBox", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the label text", () => {
    renderCheckBox({ label: "My label" });
    expect(screen.getByText("My label")).toBeInTheDocument();
  });

  it("renders a checkbox-like div", () => {
    const { container } = renderCheckBox();
    expect(container.querySelector("label")).toBeInTheDocument();
  });

  it("does not show checkmark when unchecked and not hovering", () => {
    const { container } = renderCheckBox({ checked: false });
    // no SVG path visible initially
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("shows checkmark svg when checked", () => {
    const { container } = renderCheckBox({ checked: true });
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  // ── Interaction ────────────────────────────────────────────────────────────

  it("calls onChange with true when unchecked box is clicked", async () => {
    const onChange = vi.fn();
    const { container } = renderCheckBox({ checked: false, onChange });
    const box = container.querySelector("div[class*='border']")!;
    await userEvent.click(box);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when checked box is clicked", async () => {
    const onChange = vi.fn();
    const { container } = renderCheckBox({ checked: true, onChange });
    const box = container.querySelector("div[class*='border']")!;
    await userEvent.click(box);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("calls onChange exactly once per click", async () => {
    const onChange = vi.fn();
    const { container } = renderCheckBox({ onChange });
    const box = container.querySelector("div[class*='border']")!;
    await userEvent.click(box);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  // ── Hover ──────────────────────────────────────────────────────────────────

  it("shows checkmark svg on hover even when unchecked", async () => {
    const { container } = renderCheckBox({ checked: false });
    const box = container.querySelector("div[class*='border']")!;
    fireEvent.mouseEnter(box);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("hides checkmark svg after mouse leaves when unchecked", async () => {
    const { container } = renderCheckBox({ checked: false });
    const box = container.querySelector("div[class*='border']")!;
    fireEvent.mouseEnter(box);
    fireEvent.mouseLeave(box);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  // ── Styling ────────────────────────────────────────────────────────────────

  it("applies bg-white when checked", () => {
    const { container } = renderCheckBox({ checked: true });
    const box = container.querySelector("div[class*='bg-white']");
    expect(box).toBeInTheDocument();
  });

  it("applies bg-transparent when unchecked", () => {
    const { container } = renderCheckBox({ checked: false });
    const box = container.querySelector("div[class*='bg-transparent']");
    expect(box).toBeInTheDocument();
  });
});
