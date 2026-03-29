import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteConversationButton from "../DeleteConversationButton";

// Mock path is relative to THIS file (inside /tests/), so modal is one level up ("../")
// Button labels match the real modal: "Cancel" to close, "Archive" to confirm
vi.mock("../DeleteConversationModal", () => ({
  default: ({
    onClose,
    onDeleted,
    conversationId,
  }: {
    onClose: () => void;
    onDeleted?: (id: string) => void;
    conversationId: string;
  }) => (
    <div data-test="delete-modal">
      <button onClick={onClose}>Cancel</button>
      <button onClick={() => onDeleted?.(conversationId)}>Archive</button>
    </div>
  ),
}));

const renderButton = (
  props: {
    conversationId?: string;
    participantId?: string;
    onDeleted?: (id: string) => void;
  } = {}
) =>
  render(
    <DeleteConversationButton
      conversationId="conv-1"
      participantId="user-1"
      onDeleted={vi.fn()}
      {...props}
    />
  );

describe("DeleteConversationButton", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders a button with aria-label", () => {
    renderButton();
    expect(
      screen.getByRole("button", { name: /delete conversation/i })
    ).toBeInTheDocument();
  });

  it("does not render modal initially", () => {
    renderButton();
    expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
  });

  it("renders a trash SVG icon inside the button", () => {
    const { container } = renderButton();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  // ── Open modal ─────────────────────────────────────────────────────────────

  it("opens the modal when the button is clicked", async () => {
    renderButton();
    await userEvent.click(
      screen.getByRole("button", { name: /delete conversation/i })
    );
    expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
  });

  // ── Close modal ────────────────────────────────────────────────────────────

  it("closes the modal when Cancel is clicked", async () => {
    renderButton();
    await userEvent.click(
      screen.getByRole("button", { name: /delete conversation/i })
    );
    await userEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
  });

  // ── onDeleted propagation ──────────────────────────────────────────────────

  it("calls onDeleted with conversationId when Archive is clicked", async () => {
    const onDeleted = vi.fn();
    renderButton({ onDeleted, conversationId: "conv-42" });
    await userEvent.click(
      screen.getByRole("button", { name: /delete conversation/i })
    );
    await userEvent.click(screen.getByText("Archive"));
    expect(onDeleted).toHaveBeenCalledWith("conv-42");
  });
});