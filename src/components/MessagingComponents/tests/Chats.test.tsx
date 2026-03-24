import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chats } from "../Chats";
import type { Conversation } from "@/services/api/messaging/conversationApi";

vi.mock("@/components/UI/Spinner", () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}));

const makeConversation = (id: string): Conversation => ({
  id,
  participant: {
    id: `user-${id}`,
    display_name: `User ${id}`,
    profile_picture: `https://example.com/${id}.jpg`,
    username: `user${id}`,
  },
  last_message: {
    id: `msg-${id}`,
    body: `Last message from ${id}`,
    created_at: new Date().toISOString(),
    sender_id: `user-${id}`,
    is_read: true,
  },
  unread_count: 0,
  updated_at: new Date().toISOString(),
} as unknown as Conversation);

const defaultProps = {
  conversations: [],
  loading: false,
  error: null,
  activeConversationId: null,
  onSelect: vi.fn(),
};

describe("Chats", () => {
  // ── Loading ────────────────────────────────────────────────────────────────

  it("renders Spinner when loading is true", () => {
    render(<Chats {...defaultProps} loading={true} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("does not render chat list when loading", () => {
    render(<Chats {...defaultProps} loading={true} />);
    expect(screen.queryByTestId("chat-list")).not.toBeInTheDocument();
  });

  // ── Error ──────────────────────────────────────────────────────────────────

  it("renders error message when error is provided", () => {
    render(<Chats {...defaultProps} error="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("does not render chat list on error", () => {
    render(<Chats {...defaultProps} error="Oops" />);
    expect(screen.queryByTestId("chat-list")).not.toBeInTheDocument();
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  it("shows no conversations message when list is empty", () => {
    render(<Chats {...defaultProps} conversations={[]} />);
    expect(screen.getByText(/no conversations yet/i)).toBeInTheDocument();
  });

  it("mentions the New button in empty state", () => {
    render(<Chats {...defaultProps} conversations={[]} />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  // ── List ───────────────────────────────────────────────────────────────────

  it("renders chat-list when conversations exist", () => {
    render(
      <Chats
        {...defaultProps}
        conversations={[makeConversation("a"), makeConversation("b")]}
      />
    );
    expect(screen.getByTestId("chat-list")).toBeInTheDocument();
  });

  it("renders one ChatProfile per conversation", () => {
    render(
      <Chats
        {...defaultProps}
        conversations={[makeConversation("a"), makeConversation("b"), makeConversation("c")]}
      />
    );
    expect(screen.getAllByText(/User/i)).toHaveLength(3);
  });

  it("calls onSelect with the correct conversation when clicked", async () => {
    const onSelect = vi.fn();
    const convA = makeConversation("a");
    render(<Chats {...defaultProps} conversations={[convA]} onSelect={onSelect} />);
    const profile = screen.getByTestId("chat-profile-a");
    await userEvent.click(profile);
    expect(onSelect).toHaveBeenCalledWith(convA);
  });

  it("highlights the active conversation", () => {
    const convA = makeConversation("a");
    const { container } = render(
      <Chats
        {...defaultProps}
        conversations={[convA]}
        activeConversationId="a"
      />
    );
    expect(container.querySelector(".bg-black")).toBeInTheDocument();
  });

  it("does not highlight non-active conversations", () => {
    const convA = makeConversation("a");
    const { container } = render(
      <Chats
        {...defaultProps}
        conversations={[convA]}
        activeConversationId="z"
      />
    );
    expect(container.querySelector(".bg-black")).not.toBeInTheDocument();
  });
});