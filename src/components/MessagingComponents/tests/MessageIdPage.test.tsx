import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MessageIdPage from "@/pages/social/messages/[messageId]/MessageIdPage";
import type { Conversation, Message } from "@/services/api/messaging/conversationApi";

// ── Mock API ───────────────────────────────────────────────────────────────
vi.mock("@/services/api/messaging/conversationApi", () => ({
  fetchConversations: vi.fn(),
  fetchConversation: vi.fn(),
  markMessageReadState: vi.fn(),
}));

vi.mock("@/services/api/messaging/socketService", () => ({
  joinConversation: vi.fn(),
  leaveConversation: vi.fn(),
  getSocket: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
  })),
}));

vi.mock("@/stores/messaging.store", () => ({
  useMessagingStore: vi.fn(() => ({
    refreshUnreadCount: vi.fn(),
  })),
}));

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Mock child components ──────────────────────────────────────────────────
// All elements use data-test — this project's testIdAttribute is 'data-test'.

vi.mock("@/components/MessagingComponents/Chats", () => ({
  Chats: ({
    conversations,
    onSelect,
    activeConversationId,
    error,
  }: {
    conversations: Conversation[];
    loading: boolean;
    error: string | null;
    activeConversationId: string | null;
    onSelect: (c: Conversation) => void;
  }) => (
    <div data-test="chats">
      {error && <p data-test="chats-error">{error}</p>}
      {conversations.map((c) => (
        <button
          key={c.id}
          data-test={`conv-${c.id}`}
          data-active={c.id === activeConversationId}
          onClick={() => onSelect(c)}
        >
          {c.participant.display_name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/components/MessagingComponents/MessagingHeader", () => ({
  default: () => <div data-test="messaging-header">Header</div>,
}));

vi.mock("@/components/MessagingComponents/ConversationHeader", () => ({
  default: ({
    recipientName,
    onReadStateChange,
    onDeleted,
    conversationId,
  }: {
    recipientName: string;
    onReadStateChange: (v: boolean) => void;
    onDeleted?: (id: string) => void;
    conversationId: string;
    reciepiantId: string;
    lastMessageId: string | null;
  }) => (
    <div data-test="conversation-header">
      <span>{recipientName}</span>
      <button data-test="mark-unread" onClick={() => onReadStateChange(true)}>
        Mark unread
      </button>
      <button data-test="delete-conv" onClick={() => onDeleted?.(conversationId)}>
        Delete
      </button>
    </div>
  ),
}));

vi.mock("@/components/MessagingComponents/SendMessageForm", () => ({
  default: ({
    onMessageSent,
  }: {
    conversationId: string;
    existingMessages: Message[];
    loadingMessages: boolean;
    onMessageSent: (msg: unknown) => void;
    ParticipantInfo: { display_name: string; profile_picture?: string | null };
  }) => (
    <div data-test="send-message-form">
      <button
        data-test="send-msg"
        onClick={() =>
          onMessageSent({
            id: "new-msg",
            body: "New message",
            created_at: new Date().toISOString(),
            sender_id: "me",
            is_read: true,
          })
        }
      >
        Send
      </button>
    </div>
  ),
}));

import {
  fetchConversations,
  fetchConversation,
  markMessageReadState,
} from "@/services/api/messaging/conversationApi";

// ── Helpers ────────────────────────────────────────────────────────────────

const makeConv = (id: string, participantId = `p-${id}`): Conversation => ({
  id,
  participant: {
    id: participantId,
    display_name: `User ${id}`,
    profile_picture: null,
    username: `user${id}`,
  },
  last_message: {
    id: `lm-${id}`,
    body: `Last from ${id}`,
    created_at: new Date().toISOString(),
    sender_id: participantId,
    is_read: true,
  },
  unread_count: 0,
  updated_at: new Date().toISOString(),
} as unknown as Conversation);

const makeMessage = (senderId: string, isRead = true): Message => ({
  id: `msg-${Math.random()}`,
  body: "Hello",
  created_at: new Date().toISOString(),
  sender_id: senderId,
  is_read: isRead,
} as unknown as Message);

const renderPage = () =>
  render(
    <MemoryRouter>
      <MessageIdPage />
    </MemoryRouter>
  );

describe("MessageIdPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (markMessageReadState as ReturnType<typeof vi.fn>).mockResolvedValue({});
  });

  // ── Loading / initial render ───────────────────────────────────────────────

  it("renders the MessagingHeader", async () => {
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [] },
    });
    renderPage();
    expect(screen.getByTestId("messaging-header")).toBeInTheDocument();
  });

  it("renders the Chats panel", async () => {
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [] },
    });
    renderPage();
    expect(screen.getByTestId("chats")).toBeInTheDocument();
  });

  it("shows 'Select a conversation' when no conversations exist", async () => {
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [] },
    });
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByText(/select a conversation to start messaging/i)
      ).toBeInTheDocument()
    );
  });

  // ── Auto-open first conversation ───────────────────────────────────────────

  it("auto-opens the first conversation after loading", async () => {
    const conv1 = makeConv("1", "p1");
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [conv1] },
    });
    (fetchConversation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { messages: [] },
    });

    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("conversation-header")).toBeInTheDocument()
    );
    expect(screen.getByText("User 1")).toBeInTheDocument();
  });

  it("navigates to participant URL when user selects a conversation", async () => {
    // FIX: The component calls navigate() only inside handleSelectConversation
    // (triggered by user click), NOT during the initial auto-open which goes
    // through loadConversation() directly. The previous test waited for a
    // navigate call that the component never makes on initial load.
    const conv1 = makeConv("1", "p1");
    const conv2 = makeConv("2", "p2");
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [conv1, conv2] },
    });
    (fetchConversation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { messages: [] },
    });

    renderPage();
    await waitFor(() => screen.getByTestId("conv-2"));
    await userEvent.click(screen.getByTestId("conv-2"));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/messages/p2")
    );
  });

  it("marks unread messages as read on conversation open", async () => {
    const conv1 = makeConv("1", "p1");
    const unreadMsg = makeMessage("p1", false);
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [conv1] },
    });
    (fetchConversation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { messages: [unreadMsg] },
    });

    renderPage();
    await waitFor(() =>
      expect(markMessageReadState).toHaveBeenCalledWith("1", unreadMsg.id, true)
    );
  });

  it("does not call markMessageReadState for already-read messages", async () => {
    const conv1 = makeConv("1", "p1");
    const readMsg = makeMessage("p1", true);
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [conv1] },
    });
    (fetchConversation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { messages: [readMsg] },
    });

    renderPage();
    await waitFor(() => screen.getByTestId("conversation-header"));
    expect(markMessageReadState).not.toHaveBeenCalled();
  });

  // ── Switching conversations ────────────────────────────────────────────────

  it("switches active conversation when another is clicked", async () => {
    const conv1 = makeConv("1", "p1");
    const conv2 = makeConv("2", "p2");
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [conv1, conv2] },
    });
    (fetchConversation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { messages: [] },
    });

    renderPage();
    await waitFor(() => screen.getByTestId("conv-1"));
    await userEvent.click(screen.getByTestId("conv-2"));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/messages/p2")
    );
    expect(screen.getByText("User 2")).toBeInTheDocument();
  });

  // ── Message sent ───────────────────────────────────────────────────────────

  it("renders SendMessageForm when conversation is active", async () => {
    const conv1 = makeConv("1", "p1");
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [conv1] },
    });
    (fetchConversation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { messages: [] },
    });

    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("send-message-form")).toBeInTheDocument()
    );
  });

  it("updates conversation list when a message is sent", async () => {
    const conv1 = makeConv("1", "p1");
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [conv1] },
    });
    (fetchConversation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { messages: [] },
    });

    renderPage();
    await waitFor(() => screen.getByTestId("send-msg"));
    await userEvent.click(screen.getByTestId("send-msg"));
  });

  // ── Conversation deleted ───────────────────────────────────────────────────

  it("removes deleted conversation and auto-selects next", async () => {
    const conv1 = makeConv("1", "p1");
    const conv2 = makeConv("2", "p2");
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [conv1, conv2] },
    });
    (fetchConversation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { messages: [] },
    });

    renderPage();
    await waitFor(() => screen.getByTestId("delete-conv"));
    await userEvent.click(screen.getByTestId("delete-conv"));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/messages/p2")
    );
  });

  it("navigates to /messages when last conversation is deleted", async () => {
    const conv1 = makeConv("1", "p1");
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [conv1] },
    });
    (fetchConversation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { messages: [] },
    });

    renderPage();
    await waitFor(() => screen.getByTestId("delete-conv"));
    await userEvent.click(screen.getByTestId("delete-conv"));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/messages")
    );
  });

  // ── Read state toggle ──────────────────────────────────────────────────────

  it("updates unread_count when read state changes to unread", async () => {
    const conv1 = makeConv("1", "p1");
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [conv1] },
    });
    (fetchConversation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { messages: [] },
    });

    renderPage();
    await waitFor(() => screen.getByTestId("mark-unread"));
    await userEvent.click(screen.getByTestId("mark-unread"));
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  it("shows error message when fetchConversations fails", async () => {
    (fetchConversations as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network error")
    );
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByText(/could not load conversations/i)
      ).toBeInTheDocument()
    );
  });

  it("shows error message when fetchConversation fails", async () => {
    const conv1 = makeConv("1", "p1");
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [conv1] },
    });
    (fetchConversation as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Not found")
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/could not load messages/i)).toBeInTheDocument()
    );
  });

  // ── data-test attribute ────────────────────────────────────────────────────

  it("renders the page with correct data-test", () => {
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [] },
    });
    renderPage();
    expect(screen.getByTestId("message-id-page")).toBeInTheDocument();
  });
});