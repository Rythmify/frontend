import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ModalNewMessageBody from "@/pages/social/messages/ModalNewMessageBody";

vi.mock("@/services/api/messaging/conversationApi", () => ({
  startConversation: vi.fn(),
}));

vi.mock("@/components/MessagingComponents/MessageBox", () => ({
  MessageBox: ({
    onValueChange,
    hasError,
  }: {
    onValueChange: (v: string) => void;
    onIsEmptyChange: (empty: boolean) => void;
    onEmbedResolved: (embed: unknown) => void;
    hasError?: boolean;
  }) => (
    <div>
      <textarea
        data-testid="message-box-input"
        data-has-error={hasError ? "true" : "false"}
        onChange={(e) => onValueChange(e.target.value)}
      />
    </div>
  ),
}));

vi.mock("@/components/MessagingComponents/RecipientInputBox", () => ({
  RecipientInputBox: ({
    onSelect,
    onClear,
    error,
  }: {
    onSelect: (user: { id: string; display_name: string }) => void;
    onClear: () => void;
    error?: string | null;
  }) => (
    <div data-testid="recipient-input-box">
      <button
        data-testid="select-user"
        onClick={() =>
          onSelect({ id: "user-1", display_name: "Alice" })
        }
      >
        Select Alice
      </button>
      <button data-testid="clear-user" onClick={onClear}>
        Clear
      </button>
      {error && <p data-testid="recipient-error">{error}</p>}
    </div>
  ),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import { startConversation } from "@/services/api/messaging/conversationApi";

const renderModal = (onClose = vi.fn()) =>
  render(
    <MemoryRouter>
      <ModalNewMessageBody onClose={onClose} />
    </MemoryRouter>
  );

describe("ModalNewMessageBody", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the heading 'New message'", () => {
    renderModal();
    expect(screen.getByText(/new message/i)).toBeInTheDocument();
  });

  it("renders 'To' label", () => {
    renderModal();
    expect(screen.getByText(/^To/)).toBeInTheDocument();
  });

  it("renders 'Write your message' label", () => {
    renderModal();
    expect(
      screen.getByText(/write your message and add tracks or playlists/i)
    ).toBeInTheDocument();
  });

  it("renders the RecipientInputBox", () => {
    renderModal();
    expect(screen.getByTestId("recipient-input-box")).toBeInTheDocument();
  });

  it("renders the MessageBox", () => {
    renderModal();
    expect(screen.getByTestId("message-box-input")).toBeInTheDocument();
  });

  it("renders Send button", () => {
    renderModal();
    expect(screen.getByTestId("send-message-button")).toBeInTheDocument();
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  it("shows recipient error when Send is clicked without recipient", async () => {
    renderModal();
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(screen.getByTestId("send-message-button"));
    expect(screen.getByTestId("recipient-error")).toHaveTextContent(
      "Enter a recipient."
    );
  });

  it("shows message error when Send is clicked without message", async () => {
    renderModal();
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.click(screen.getByTestId("send-message-button"));
    expect(screen.getByText(/enter a message/i)).toBeInTheDocument();
  });

  it("shows both errors when neither recipient nor message is provided", async () => {
    renderModal();
    await userEvent.click(screen.getByTestId("send-message-button"));
    expect(screen.getByTestId("recipient-error")).toBeInTheDocument();
    expect(screen.getByText(/enter a message/i)).toBeInTheDocument();
  });

  // ── Success flow ───────────────────────────────────────────────────────────

  it("calls startConversation with correct payload on valid send", async () => {
    (startConversation as ReturnType<typeof vi.fn>).mockResolvedValue({});
    renderModal();
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello Alice");
    await userEvent.click(screen.getByTestId("send-message-button"));
    await waitFor(() =>
      expect(startConversation).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient_id: "user-1",
          body: "Hello Alice",
        })
      )
    );
  });

  it("calls onClose after successful send", async () => {
    (startConversation as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const onClose = vi.fn();
    renderModal(onClose);
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(screen.getByTestId("send-message-button"));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("navigates to recipient's messages after successful send", async () => {
    (startConversation as ReturnType<typeof vi.fn>).mockResolvedValue({});
    renderModal();
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(screen.getByTestId("send-message-button"));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/messages/user-1")
    );
  });

  // ── Error flow ─────────────────────────────────────────────────────────────

  it("shows error message when startConversation fails", async () => {
    (startConversation as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Server error")
    );
    renderModal();
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(screen.getByTestId("send-message-button"));
    await waitFor(() =>
      expect(
        screen.getByText(/failed to send message/i)
      ).toBeInTheDocument()
    );
  });

  it("shows 'Sending…' text while in progress", async () => {
    let resolve!: (value: unknown) => void;
    (startConversation as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((res) => { resolve = res; })
    );
    renderModal();
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(screen.getByTestId("send-message-button"));
    expect(screen.getByText(/sending…/i)).toBeInTheDocument();
    resolve(undefined);
  });

  // ── Clearing recipient ────────────────────────────────────────────────────

  it("clears selected recipient when onClear is called", async () => {
    (startConversation as ReturnType<typeof vi.fn>).mockResolvedValue({});
    renderModal();
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.click(screen.getByTestId("clear-user"));
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(screen.getByTestId("send-message-button"));
    // After clearing, recipient is null, so error appears
    expect(screen.getByTestId("recipient-error")).toBeInTheDocument();
    expect(startConversation).not.toHaveBeenCalled();
  });
});