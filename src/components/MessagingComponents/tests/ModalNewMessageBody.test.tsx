import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ModalNewMessageBody from "@/pages/social/messages/ModalNewMessageBody";

// ── Module mocks ───────────────────────────────────────────────────────────────
//
// NOTE: this project sets testIdAttribute: "data-test" in its Testing Library
// config, so getByTestId() queries for data-test (not the default data-testid).
// All attributes in the mocks below use data-test to match that convention.

vi.mock("@/services/api/messaging/conversationApi", () => ({
  startConversation: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock("@/components/MessagingComponents/MessageBox", () => ({
  MessageBox: ({
    onValueChange,
    onSubmit,
    hasError,
  }: {
    onValueChange: (v: string) => void;
    onIsEmptyChange: (empty: boolean) => void;
    onEmbedsResolved: (embeds: unknown[]) => void;
    onSubmit?: () => void;
    hasError?: boolean;
  }) => (
    <div>
      <textarea
        data-test="message-box-input"
        data-has-error={hasError ? "true" : "false"}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit?.();
          }
        }}
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
    <div data-test="recipient-input-box">
      <button
        data-test="select-user"
        onClick={() => onSelect({ id: "user-1", display_name: "Alice" })}
      >
        Select Alice
      </button>
      <button data-test="clear-user" onClick={onClear}>
        Clear
      </button>
      {error && <p data-test="recipient-error">{error}</p>}
    </div>
  ),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import { startConversation } from "@/services/api/messaging/conversationApi";

// ── Helpers ────────────────────────────────────────────────────────────────────

const renderModal = (onClose = vi.fn()) =>
  render(
    <MemoryRouter>
      <ModalNewMessageBody onClose={onClose} />
    </MemoryRouter>
  );

// Query by role so we're decoupled from whichever data attribute the Send
// button uses, and to avoid ambiguity during the "Sending…" state change.
const getSendButton = () => screen.getByRole("button", { name: /^send$/i });

describe("ModalNewMessageBody", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (startConversation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        conversation: { id: "conv-1" },
        message: { id: "msg-1", conversation_id: "conv-1" },
      },
    });
  });

  // ── Rendering ────────────────────────────────────────────────────────────────

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
    expect(getSendButton()).toBeInTheDocument();
  });

  // ── Validation ───────────────────────────────────────────────────────────────

  it("shows recipient error when Send is clicked without recipient", async () => {
    renderModal();
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(getSendButton());
    expect(screen.getByTestId("recipient-error")).toHaveTextContent(
      "Enter a recipient."
    );
  });

  it("shows message error when Send is clicked without message", async () => {
    renderModal();
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.click(getSendButton());
    expect(screen.getByText(/enter a message/i)).toBeInTheDocument();
  });

  it("shows both errors when neither recipient nor message is provided", async () => {
    renderModal();
    await userEvent.click(getSendButton());
    expect(screen.getByTestId("recipient-error")).toBeInTheDocument();
    expect(screen.getByText(/enter a message/i)).toBeInTheDocument();
  });

  // ── Success flow ─────────────────────────────────────────────────────────────

  it("calls startConversation with correct payload on valid send", async () => {
    renderModal();
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello Alice");
    await userEvent.click(getSendButton());
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
    const onClose = vi.fn();
    renderModal(onClose);
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(getSendButton());
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("navigates to the returned conversation after successful send", async () => {
    renderModal();
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(getSendButton());
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/messages/conv-1")
    );
  });

  it("does nothing when the API does not return a conversation id", async () => {
    (startConversation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        conversation: {},
        message: { id: "msg-1" },
      },
    });
    const onClose = vi.fn();
    renderModal(onClose);
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(getSendButton());
    await waitFor(() => expect(startConversation).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByTestId("message-box-input")).toHaveValue("Hello");
  });

  it("pressing Enter performs the same action as the send button", async () => {
    renderModal();
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello{enter}");
    await waitFor(() =>
      expect(startConversation).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient_id: "user-1",
          body: "Hello",
        })
      )
    );
    expect(mockNavigate).toHaveBeenCalledWith("/messages/conv-1");
  });

  // ── Error flow ───────────────────────────────────────────────────────────────

  it("shows error message when startConversation fails", async () => {
    (startConversation as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Server error")
    );
    renderModal();
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(getSendButton());
    await waitFor(() =>
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
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
    await userEvent.click(getSendButton());
    expect(screen.getByText(/sending…/i)).toBeInTheDocument();
    resolve({ data: { conversation: { id: "conv-1" } } });
  });

  // ── Clearing recipient ────────────────────────────────────────────────────────

  it("clears selected recipient when onClear is called", async () => {
    renderModal();
    await userEvent.click(screen.getByTestId("select-user"));
    await userEvent.click(screen.getByTestId("clear-user"));
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(getSendButton());
    expect(screen.getByTestId("recipient-error")).toBeInTheDocument();
    expect(startConversation).not.toHaveBeenCalled();
  });
});
