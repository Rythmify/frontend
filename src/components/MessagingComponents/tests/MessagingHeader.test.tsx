import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MessagingHeader from "../MessagingHeader";

vi.mock("@/components/MessagingComponents/Modal", () => ({
  Modal: ({
    isOpen,
    children,
    onClose,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        {children}
        <button onClick={onClose}>Close modal</button>
      </div>
    ) : null,
}));

vi.mock("@/pages/social/messages/ModalNewMessageBody", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="new-message-body">
      <button onClick={onClose}>Close body</button>
    </div>
  ),
}));

const renderHeader = () =>
  render(
    <MemoryRouter>
      <MessagingHeader />
    </MemoryRouter>
  );

describe("MessagingHeader", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the Messages heading", () => {
    renderHeader();
    expect(
      screen.getByRole("heading", { name: /messages/i })
    ).toBeInTheDocument();
  });

  it("renders the New button", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: /new/i })).toBeInTheDocument();
  });

  it("does not show modal initially", () => {
    renderHeader();
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  // ── Modal open / close ─────────────────────────────────────────────────────

  it("opens the modal when New is clicked", async () => {
    renderHeader();
    await userEvent.click(screen.getByRole("button", { name: /new/i }));
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("renders ModalNewMessageBody inside the modal", async () => {
    renderHeader();
    await userEvent.click(screen.getByRole("button", { name: /new/i }));
    expect(screen.getByTestId("new-message-body")).toBeInTheDocument();
  });

  it("closes the modal when onClose is called from Modal", async () => {
    renderHeader();
    await userEvent.click(screen.getByRole("button", { name: /new/i }));
    await userEvent.click(screen.getByText("Close modal"));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("closes the modal when onClose is called from ModalNewMessageBody", async () => {
    renderHeader();
    await userEvent.click(screen.getByRole("button", { name: /new/i }));
    await userEvent.click(screen.getByText("Close body"));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });
});
