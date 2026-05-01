import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Chats } from "../Chats";
import type { Conversation } from "@/services/api/messaging/conversationApi";

// 🔹 Mock dependencies
vi.mock("@/components/MessagingComponents/ChatProfile", () => ({
  ChatProfile: ({ conversation, onClick }: any) => (
    <div
      data-test={`chat-${conversation.id}`}
      onClick={onClick}
    >
      {conversation.participant.display_name}
    </div>
  ),
}));

vi.mock("@/components/UI/Spinner", () => ({
  default: () => <div data-test="spinner">Loading...</div>,
}));

const createConversation = (id: string): Conversation =>
  ({
    id,
    updated_at: new Date().toISOString(),
    unread_count: 0,
    participant: {
      display_name: `User ${id}`,
      avatar: "",
    },
    last_message: {
      body: "Hello",
      embed_type: null,
    },
  } as Conversation);

describe("Chats", () => {
  it("renders loading spinner", () => {
    render(
      <Chats
        conversations={[]}
        loading
        loadingMore={false}
        error={null}
        activeConversationId={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders error message", () => {
    render(
      <Chats
        conversations={[]}
        loading={false}
        loadingMore={false}
        error="Something went wrong"
        activeConversationId={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(
      <Chats
        conversations={[]}
        loading={false}
        loadingMore={false}
        error={null}
        activeConversationId={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId("chat-empty-state")).toBeInTheDocument();
  });

  it("renders list of conversations", () => {
    const conversations = [createConversation("1"), createConversation("2")];

    render(
      <Chats
        conversations={conversations}
        loading={false}
        loadingMore={false}
        error={null}
        activeConversationId={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId("chat-1")).toBeInTheDocument();
    expect(screen.getByTestId("chat-2")).toBeInTheDocument();
  });

  it("calls onSelect when a conversation is clicked", () => {
    const conversations = [createConversation("1")];
    const onSelect = vi.fn();

    render(
      <Chats
        conversations={conversations}
        loading={false}
        loadingMore={false}
        error={null}
        activeConversationId={null}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByTestId("chat-1"));

    expect(onSelect).toHaveBeenCalledWith(conversations[0]);
  });

  it("renders loadingMore spinner", () => {
    const conversations = [createConversation("1")];

    render(
      <Chats
        conversations={conversations}
        loading={false}
        loadingMore={true}
        error={null}
        activeConversationId={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getAllByTestId("spinner").length).toBeGreaterThan(0);
  });
});
