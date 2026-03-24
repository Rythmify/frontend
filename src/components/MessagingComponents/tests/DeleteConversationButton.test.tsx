import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteConversationButton from "../DeleteConversationButton";

// We mock the modal so we don't need to test it again here
vi.mock("./DeleteConversationModal", () => ({
  default: ({
    onClose,
    onDeleted,
    conversationId,
  }: {
    onClose: () => void;
    onDeleted?: (id: string) => void;
    conversationId: string;
  }) => (
    <div data-testid="delete-modal">
      <button onClick={onClose}>Close</button>
      <button onClick={() => onDeleted?.(conversationId)}>Confirm</button>
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

  it("closes the modal when Close is triggered", async () => {
    renderButton();
    await userEvent.click(
      screen.getByRole("button", { name: /delete conversation/i })
    );
    await userEvent.click(screen.getByText("Close"));
    expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
  });

  // ── onDeleted propagation ──────────────────────────────────────────────────

  it("calls onDeleted with conversationId when Confirm is clicked", async () => {
    const onDeleted = vi.fn();
    renderButton({ onDeleted, conversationId: "conv-42" });
    await userEvent.click(
      screen.getByRole("button", { name: /delete conversation/i })
    );
    await userEvent.click(screen.getByText("Confirm"));
    expect(onDeleted).toHaveBeenCalledWith("conv-42");
  });
});
