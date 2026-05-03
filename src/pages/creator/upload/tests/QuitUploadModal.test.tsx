import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { screen, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import QuitUploadModal from "../../../../components/Upload/QuitUploadModal";

describe("QuitUploadModal", () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  // Render tests

  it("renders nothing when isOpen is false", () => {
    render(<QuitUploadModal {...baseProps} isOpen={false} />);
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });

  it("renders modal content when isOpen is true", () => {
    render(<QuitUploadModal {...baseProps} />);
    expect(
      screen.getByText(/are you sure you want to quit/i),
    ).toBeInTheDocument();
  });

  it("renders 'Your changes will not be saved' warning", () => {
    render(<QuitUploadModal {...baseProps} />);
    expect(
      screen.getByText(/your changes will not be saved/i),
    ).toBeInTheDocument();
  });

  it("renders back to upload button", () => {
    render(<QuitUploadModal {...baseProps} />);
    expect(screen.getByTestId("back-to-upload-button")).toBeInTheDocument();
  });

  it("renders quit upload button", () => {
    render(<QuitUploadModal {...baseProps} />);
    expect(screen.getByTestId("quit-upload-button")).toBeInTheDocument();
  });

  // Button interactions

  it("calls onClose when back to upload button is clicked", async () => {
    const onClose = vi.fn();
    render(<QuitUploadModal {...baseProps} onClose={onClose} />);
    await userEvent.click(screen.getByTestId("back-to-upload-button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when quit upload button is clicked", async () => {
    const onConfirm = vi.fn();
    render(<QuitUploadModal {...baseProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByTestId("quit-upload-button"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close X button is clicked", async () => {
    const onClose = vi.fn();
    render(<QuitUploadModal {...baseProps} onClose={onClose} />);
    await userEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking the backdrop overlay", async () => {
    const onClose = vi.fn();
    render(<QuitUploadModal {...baseProps} onClose={onClose} />);
    const overlay = screen.getByText(/are you sure/i).closest(".fixed")!;
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it("does NOT call onClose when clicking inside the modal card", async () => {
    const onClose = vi.fn();
    render(<QuitUploadModal {...baseProps} onClose={onClose} />);
    const card = screen.getByText(/are you sure/i).closest(".relative")!;
    await userEvent.click(card);
    expect(onClose).not.toHaveBeenCalled();
  });

  // Keyboard

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(<QuitUploadModal {...baseProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onClose on Escape when modal is closed", () => {
    const onClose = vi.fn();
    render(<QuitUploadModal {...baseProps} isOpen={false} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not call onClose when other keys are pressed", () => {
    const onClose = vi.fn();
    render(<QuitUploadModal {...baseProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });
});
