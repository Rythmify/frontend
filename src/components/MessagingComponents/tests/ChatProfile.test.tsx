import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ChatProfile } from "../ChatProfile";
import type { Conversation, Message } from "@/services/api/messaging/conversationApi";

// 🔹 Mock UserAvatar
vi.mock("@/components/UI/UserAvatar", () => ({
  default: ({ name }: { name: string }) => <div>{name}</div>,
}));

// 🔹 FULL Message factory (FIXED ✅)
const createMessage = (overrides?: Partial<Message>): Message => ({
  id: "msg-1",
  conversation_id: "conv-1",
  sender_id: "user-1",
  body: "Hello there",
  embed_type: null,
  embed_id: null,
  is_read: false,
  created_at: new Date().toISOString(),
  ...overrides,
});

// 🔹 Conversation factory
const createConversation = (overrides?: Partial<Conversation>): Conversation =>
  ({
    id: "conv-1",
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    unread_count: 0,
    participant: {
      id: "user-2",
      username: "john",
      display_name: "John Doe",
      bio: "",
      location: "",
      gender: "",
      role: "",
      avatar: "avatar.png",
      cover_photo: "",
      is_private: false,
      is_verified: false,
      followers_count: 0,
      following_count: 0,
      created_at: new Date().toISOString(),
    },
    last_message: createMessage(),
    ...overrides,
  } as Conversation);

describe("ChatProfile", () => {
  it("renders participant name", () => {
    const conv = createConversation();

    render(<ChatProfile conversation={conv} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders message preview (text)", () => {
    const conv = createConversation({
      last_message: createMessage({ body: "Test message" }),
    });

    render(<ChatProfile conversation={conv} />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders fallback when message body is empty and no embed", () => {
    const conv = createConversation({
      last_message: createMessage({ body: "" }),
    });

    render(<ChatProfile conversation={conv} />);
    expect(screen.getByText("·")).toBeInTheDocument();
  });

  it("renders track embed preview", () => {
    const conv = createConversation({
      last_message: createMessage({ body: "", embed_type: "track" }),
    });

    render(<ChatProfile conversation={conv} />);
    expect(screen.getByText("🎵 Shared a track")).toBeInTheDocument();
  });

  it("renders playlist embed preview", () => {
    const conv = createConversation({
      last_message: createMessage({ body: "", embed_type: "playlist" }),
    });

    render(<ChatProfile conversation={conv} />);
    expect(screen.getByText("🎶 Shared a playlist")).toBeInTheDocument();
  });

  it("shows unread indicator when unread_count > 0", () => {
    const conv = createConversation({ unread_count: 2 });

    render(<ChatProfile conversation={conv} />);
    expect(screen.getByTestId("chat-profile-unread-dot")).toBeInTheDocument();
  });

  it("does not show unread indicator when unread_count = 0", () => {
    const conv = createConversation({ unread_count: 0 });

    render(<ChatProfile conversation={conv} />);
    expect(
      screen.queryByTestId("chat-profile-unread-dot")
    ).not.toBeInTheDocument();
  });

  it("applies active class when isActive is true", () => {
    const conv = createConversation();

    const { container } = render(
      <ChatProfile conversation={conv} isActive />
    );

    expect(container.firstChild).toHaveClass("bg-[#303030]");
  });

  it("calls onClick when clicked", () => {
    const conv = createConversation();
    const onClick = vi.fn();

    render(<ChatProfile conversation={conv} onClick={onClick} />);
    fireEvent.click(screen.getByTestId("chat-profile-conv-1"));

    expect(onClick).toHaveBeenCalled();
  });

  it("renders 'just now' for recent time", () => {
    const conv = createConversation({
      updated_at: new Date().toISOString(),
    });

    render(<ChatProfile conversation={conv} />);
    expect(screen.getByText(/just now/i)).toBeInTheDocument();
  });
});