import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../Modal";

const renderModal = (props: Partial<React.ComponentProps<typeof Modal>> = {}) =>
  render(
    <Modal
      isOpen={true}
      onClose={vi.fn()}
      {...props}
    >
      <p>Modal content</p>
    </Modal>
  );

describe("Modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the backdrop when isOpen is true", () => {
    renderModal();
    expect(screen.getByTestId("modal-backdrop")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderModal({ isOpen: false });
    expect(screen.queryByTestId("modal-backdrop")).not.toBeInTheDocument();
  });

  it("renders children inside the modal", () => {
    renderModal();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("renders the close button", () => {
    renderModal();
    expect(screen.getByTestId("modal-close-button")).toBeInTheDocument();
  });

  // ── Closing behaviour ──────────────────────────────────────────────────────

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });
    await user.click(screen.getByTestId("modal-close-button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });
    await user.click(screen.getByTestId("modal-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when the modal content area is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });
    await user.click(screen.getByText("Modal content"));
    expect(onClose).not.toHaveBeenCalled();
  });

  // ── Escape key ─────────────────────────────────────────────────────────────

  it("calls onClose when Escape is pressed and modal is open", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ isOpen: true, onClose });
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when Escape is pressed and modal is closed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ isOpen: false, onClose });
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not call onClose when a non-Escape key is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ isOpen: true, onClose });
    await user.keyboard("{Enter}");
    expect(onClose).not.toHaveBeenCalled();
  });

  // ── Event listener lifecycle ───────────────────────────────────────────────

  it("removes the keydown listener when modal closes", () => {
    const removeEventListener = vi.spyOn(document, "removeEventListener");
    const { rerender } = renderModal({ isOpen: true });
    rerender(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>
    );
    expect(removeEventListener).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("removes the keydown listener on unmount", () => {
    const removeEventListener = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderModal({ isOpen: true });
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith("keydown", expect.any(Function));
  });
});