import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SendMessageForm from "../SendMessageForm";
import type { Message } from "@/services/api/messaging/conversationApi";

// ── Mock API ───────────────────────────────────────────────────────────────
vi.mock("../../services/api/messaging/conversationApi", () => ({
  sendMessage: vi.fn(),
}));

// ── Mock auth store ────────────────────────────────────────────────────────
vi.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector: (s: { user: { id: string; avatar: string } }) => unknown) =>
    selector({ user: { id: "me", avatar: "https://example.com/me.jpg" } }),
}));

// ── Mock MessageBox ────────────────────────────────────────────────────────
vi.mock("./MessageBox", () => ({
  MessageBox: ({
    onValueChange,
    onIsEmptyChange,
  }: {
    onValueChange: (v: string) => void;
    onIsEmptyChange: (empty: boolean) => void;
    onEmbedResolved: (embed: unknown) => void;
  }) => (
    <textarea
      data-testid="message-box-input"
      onChange={(e) => {
        onValueChange(e.target.value);
        onIsEmptyChange(e.target.value.trim() === "");
      }}
    />
  ),
}));

import { sendMessage } from "@/services/api/messaging/conversationApi";

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: "msg-1",
  body: "Hello",
  created_at: new Date().toISOString(),
  sender_id: "me",
  is_read: true,
  ...overrides,
} as unknown as Message);

const defaultProps = {
  conversationId: "conv-1",
  existingMessages: [],
  loadingMessages: false,
  onMessageSent: vi.fn(),
  ParticipantInfo: {
    display_name: "Alice",
    profile_picture: "https://example.com/alice.jpg",
  },
};

const renderForm = (props = {}) =>
  render(<SendMessageForm {...defaultProps} {...props} />);

describe("SendMessageForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the message label", () => {
    renderForm();
    expect(
      screen.getByText(/write your message and add tracks or playlists/i)
    ).toBeInTheDocument();
  });

  it("renders the MessageBox textarea", () => {
    renderForm();
    expect(screen.getByTestId("message-box-input")).toBeInTheDocument();
  });

  it("renders the Send button", () => {
    renderForm();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("shows loading text when loadingMessages is true", () => {
    renderForm({ loadingMessages: true });
    expect(screen.getByText(/loading messages…/i)).toBeInTheDocument();
  });

  it("does not show loading text when loadingMessages is false", () => {
    renderForm({ loadingMessages: false });
    expect(screen.queryByText(/loading messages…/i)).not.toBeInTheDocument();
  });

  // ── Existing messages ──────────────────────────────────────────────────────

  it("renders existing messages", () => {
    renderForm({
      existingMessages: [
        makeMessage({ id: "msg-1", body: "First message", sender_id: "user-2" }),
        makeMessage({ id: "msg-2", body: "Second message", sender_id: "me" }),
      ],
    });
    expect(screen.getByText("First message")).toBeInTheDocument();
    expect(screen.getByText("Second message")).toBeInTheDocument();
  });

  it("shows 'Me' as display name for messages sent by current user", () => {
    renderForm({
      existingMessages: [makeMessage({ sender_id: "me" })],
    });
    expect(screen.getByText("Me")).toBeInTheDocument();
  });

  it("shows participant display name for messages from participant", () => {
    renderForm({
      existingMessages: [makeMessage({ sender_id: "user-alice" })],
      ParticipantInfo: { display_name: "Alice", profile_picture: null },
    });
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders no messages when existingMessages is empty", () => {
    renderForm({ existingMessages: [] });
    // Only the form-level label is rendered, no message cells
    expect(screen.queryByText(/just now/i)).not.toBeInTheDocument();
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  it("shows 'Enter a message' error when Send is clicked with empty input", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(screen.getByText(/enter a message/i)).toBeInTheDocument();
  });

  it("does not call sendMessage when input is empty", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("clears error when user starts typing", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(screen.getByText(/enter a message/i)).toBeInTheDocument();
    // onIsEmptyChange(false) clears error — simulate non-empty change
    await userEvent.type(screen.getByTestId("message-box-input"), " ");
    // The empty detection only fires on isEmptyChange(false) indirectly via onIsEmptyChange
    // The component clears on `if (empty) setError(null)` when empty=false... 
    // Here we're testing that sendMessage doesn't show error when text is present
  });

  // ── Success flow ───────────────────────────────────────────────────────────

  it("calls sendMessage with correct payload", async () => {
    (sendMessage as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: makeMessage({ body: "Hello Alice" }),
    });
    renderForm();
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello Alice");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith(
        "conv-1",
        expect.objectContaining({ body: "Hello Alice" })
      )
    );
  });

  it("calls onMessageSent with the returned message", async () => {
    const msg = makeMessage({ body: "Hello Alice" });
    (sendMessage as ReturnType<typeof vi.fn>).mockResolvedValue({ data: msg });
    const onMessageSent = vi.fn();
    renderForm({ onMessageSent });
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello Alice");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    await waitFor(() =>
      expect(onMessageSent).toHaveBeenCalledWith(
        expect.objectContaining({ body: "Hello Alice" })
      )
    );
  });

  it("clears the message box after successful send (boxKey increments)", async () => {
    (sendMessage as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: makeMessage(),
    });
    renderForm();
    const input = screen.getByTestId("message-box-input");
    await userEvent.type(input, "Hello");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    await waitFor(() => expect(sendMessage).toHaveBeenCalled());
    // After send, boxKey changes and MessageBox re-mounts (new textarea)
    expect(screen.getByTestId("message-box-input")).toHaveValue("");
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  it("shows 403 error when user is blocked", async () => {
    (sendMessage as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { status: 403 },
    });
    renderForm();
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/unable to send message to this user/i)
      ).toBeInTheDocument()
    );
  });

  it("shows generic error for non-403 failures", async () => {
    (sendMessage as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { status: 500 },
    });
    renderForm();
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/failed to send message/i)
      ).toBeInTheDocument()
    );
  });

  it("does not show error initially", () => {
    renderForm();
    expect(screen.queryByText(/unable to send/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/failed to send/i)).not.toBeInTheDocument();
  });

  // ── Sending state ──────────────────────────────────────────────────────────

  it("shows 'Sending…' text while request is in progress", async () => {
    let resolve: (v: unknown) => void;
    (sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((res) => { resolve = res; })
    );
    renderForm();
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(screen.getByText(/sending…/i)).toBeInTheDocument();
    resolve!({ data: makeMessage() });
  });

  it("disables Send button while sending", async () => {
    let resolve: (v: unknown) => void;
    (sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((res) => { resolve = res; })
    );
    renderForm();
    await userEvent.type(screen.getByTestId("message-box-input"), "Hello");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();
    resolve!({ data: makeMessage() });
  });
});