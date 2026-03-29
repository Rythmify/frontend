import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MessagesPage from "@/pages/social/messages/emptyMessagesPage";

// All mocks use data-test (not data-testid) to match this project's testIdAttribute config

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
      <div data-test="modal">
        {children}
        <button onClick={onClose}>Close modal</button>
      </div>
    ) : null,
}));

vi.mock("@/components/MessagingComponents/MessagingHeader", () => ({
  default: () => <div data-test="messaging-header">Header</div>,
}));

// ModalNewMessageBody is imported by the page via a relative path from the page's
// own directory (@/pages/social/messages/). Mock it by its absolute alias so
// vitest intercepts it regardless of where this test file lives.
vi.mock("@/pages/social/messages/ModalNewMessageBody", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-test="new-message-body">
      <button onClick={onClose}>Close body</button>
    </div>
  ),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <MessagesPage />
    </MemoryRouter>
  );

describe("emptyMessagesPage", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders MessagingHeader", () => {
    renderPage();
    expect(screen.getByTestId("messaging-header")).toBeInTheDocument();
  });

  it("renders 'You have no messages' text", () => {
    renderPage();
    expect(screen.getByText(/you have no messages/i)).toBeInTheDocument();
  });

  it("renders 'Send someone a message' text", () => {
    renderPage();
    expect(screen.getByText(/send someone a message/i)).toBeInTheDocument();
  });

  it("renders 'Write one' button", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /write one/i })).toBeInTheDocument();
  });

  it("does not show modal initially", () => {
    renderPage();
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  // ── Modal ──────────────────────────────────────────────────────────────────

  it("opens modal when 'Write one' is clicked", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /write one/i }));
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("renders ModalNewMessageBody inside the modal", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /write one/i }));
    expect(screen.getByTestId("new-message-body")).toBeInTheDocument();
  });

  it("closes modal when modal onClose is called", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /write one/i }));
    await userEvent.click(screen.getByText("Close modal"));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("closes modal when body onClose is called", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /write one/i }));
    await userEvent.click(screen.getByText("Close body"));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });
});