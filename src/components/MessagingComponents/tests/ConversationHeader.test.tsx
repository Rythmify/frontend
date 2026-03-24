import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ConversationHeader from "../ConversationHeader";

vi.mock("@/services/api/messaging/conversationApi", () => ({
  markMessageReadState: vi.fn(),
  unblockUser: vi.fn(),
}));

vi.mock("./Modal", () => ({
  Modal: ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
    onClose: () => void;
  }) => (isOpen ? <div data-testid="modal">{children}</div> : null),
}));

vi.mock("@/components/MessagingComponents/DeleteConversationButton", () => ({
  default: ({
    onDeleted,
    conversationId,
  }: {
    conversationId: string;
    participantId: string;
    onDeleted?: (id: string) => void;
  }) => (
    <button data-testid="delete-button" onClick={() => onDeleted?.(conversationId)}>
      Delete
    </button>
  ),
}));

vi.mock("./BlockModal", () => ({
  BlockUserModal: ({ onClose, onBlocked }: { onClose: () => void; onBlocked: () => void }) => (
    <div data-testid="block-modal">
      <button onClick={onBlocked}>Confirm block</button>
      <button onClick={onClose}>Cancel block</button>
    </div>
  ),
}));

vi.mock("./ReportModal", () => ({
  ReportModal: ({
    onClose,
    onSpamSelected,
  }: {
    onClose: () => void;
    onSpamSelected: () => void;
  }) => (
    <div data-testid="report-modal">
      <button onClick={onSpamSelected}>Select spam</button>
      <button onClick={onClose}>Close report</button>
    </div>
  ),
}));

vi.mock("./SpamModal", () => ({
  SpamModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="spam-modal">
      <button onClick={onClose}>Close spam</button>
    </div>
  ),
}));

import {
  markMessageReadState,
  unblockUser,
} from "@/services/api/messaging/conversationApi";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const defaultProps = {
  reciepiantId: "user-1",
  conversationId: "conv-1",
  recipientName: "Alice",
  lastMessageId: "msg-1",
  onReadStateChange: vi.fn(),
  onDeleted: vi.fn(),
};

const renderHeader = (props = {}) =>
  render(
    <MemoryRouter>
      <ConversationHeader {...defaultProps} {...props} />
    </MemoryRouter>
  );

describe("ConversationHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders with correct data-test", () => {
    renderHeader();
    expect(screen.getByTestId("conversation-header")).toBeInTheDocument();
  });

  it("renders recipient name as a button", () => {
    renderHeader();
    expect(
      screen.getByTestId("conversation-profile-button")
    ).toHaveTextContent("Alice");
  });

  it("renders Block button", () => {
    renderHeader();
    expect(screen.getByTestId("conversation-block-button")).toBeInTheDocument();
    expect(screen.getByTestId("conversation-block-button")).toHaveTextContent("Block");
  });

  it("renders Report button", () => {
    renderHeader();
    expect(screen.getByTestId("conversation-report-button")).toBeInTheDocument();
  });

  it("renders Mark as unread button initially", () => {
    renderHeader();
    expect(screen.getByText(/mark as unread/i)).toBeInTheDocument();
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it("navigates to user profile when name button is clicked", async () => {
    renderHeader();
    await userEvent.click(screen.getByTestId("conversation-profile-button"));
    expect(mockNavigate).toHaveBeenCalledWith("/users/user-1");
  });

  // ── Mark as read / unread ──────────────────────────────────────────────────

  it("calls markMessageReadState with false when Mark as unread is clicked", async () => {
    (markMessageReadState as ReturnType<typeof vi.fn>).mockResolvedValue({});
    renderHeader();
    await userEvent.click(screen.getByText(/mark as unread/i));
    expect(markMessageReadState).toHaveBeenCalledWith("conv-1", "msg-1", false);
  });

  it("toggles button text to 'Mark as read' after marking unread", async () => {
    (markMessageReadState as ReturnType<typeof vi.fn>).mockResolvedValue({});
    renderHeader();
    await userEvent.click(screen.getByText(/mark as unread/i));
    await waitFor(() =>
      expect(screen.getByText(/mark as read/i)).toBeInTheDocument()
    );
  });

  it("calls onReadStateChange with true when marking unread", async () => {
    (markMessageReadState as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const onReadStateChange = vi.fn();
    renderHeader({ onReadStateChange });
    await userEvent.click(screen.getByText(/mark as unread/i));
    await waitFor(() =>
      expect(onReadStateChange).toHaveBeenCalledWith(true)
    );
  });

  it("disables mark button when lastMessageId is null", () => {
    renderHeader({ lastMessageId: null });
    expect(screen.getByText(/mark as unread/i).closest("button")).toBeDisabled();
  });

  it("resets unread state when conversationId changes", async () => {
    (markMessageReadState as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const { rerender } = renderHeader();
    await userEvent.click(screen.getByText(/mark as unread/i));
    await waitFor(() => screen.getByText(/mark as read/i));

    rerender(
      <MemoryRouter>
        <ConversationHeader
          {...defaultProps}
          conversationId="conv-2"
          onReadStateChange={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.getByText(/mark as unread/i)).toBeInTheDocument();
  });

  // ── Block modal ────────────────────────────────────────────────────────────

  it("opens block modal when Block is clicked", async () => {
    renderHeader();
    await userEvent.click(screen.getByTestId("conversation-block-button"));
    expect(screen.getByTestId("block-modal")).toBeInTheDocument();
  });

  it("shows Unblock button after blocking", async () => {
    renderHeader();
    await userEvent.click(screen.getByTestId("conversation-block-button"));
    await userEvent.click(screen.getByText("Confirm block"));
    await waitFor(() =>
      expect(screen.getByTestId("conversation-block-button")).toHaveTextContent("Unblock")
    );
  });

  it("calls unblockUser when Unblock is clicked", async () => {
    (unblockUser as ReturnType<typeof vi.fn>).mockResolvedValue({});
    renderHeader();
    // Block first
    await userEvent.click(screen.getByTestId("conversation-block-button"));
    await userEvent.click(screen.getByText("Confirm block"));
    await waitFor(() => screen.getByText("Unblock"));
    await userEvent.click(screen.getByTestId("conversation-block-button"));
    expect(unblockUser).toHaveBeenCalledWith("user-1");
  });

  // ── Report modal ───────────────────────────────────────────────────────────

  it("opens report modal when Report is clicked", async () => {
    renderHeader();
    await userEvent.click(screen.getByTestId("conversation-report-button"));
    expect(screen.getByTestId("report-modal")).toBeInTheDocument();
  });

  it("opens spam modal when spam is selected from report", async () => {
    renderHeader();
    await userEvent.click(screen.getByTestId("conversation-report-button"));
    await userEvent.click(screen.getByText("Select spam"));
    await waitFor(() =>
      expect(screen.getByTestId("spam-modal")).toBeInTheDocument()
    );
  });

  // ── Delete ─────────────────────────────────────────────────────────────────

  it("calls onDeleted when delete button triggers delete", async () => {
    const onDeleted = vi.fn();
    renderHeader({ onDeleted });
    await userEvent.click(screen.getByTestId("delete-button"));
    expect(onDeleted).toHaveBeenCalledWith("conv-1");
  });
});
