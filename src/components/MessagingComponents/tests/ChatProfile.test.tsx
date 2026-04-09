import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatProfile } from "../ChatProfile";
import type { Conversation } from "@/services/api/messaging/conversationApi";

const baseConversation = {
  id: "conv-1",
  participant: {
    id: "user-1",
    display_name: "Alice",
    profile_picture: "https://example.com/alice.jpg",
    username: "alice",
  },
  last_message: {
    id: "msg-1",
    body: "Hello there",
    created_at: new Date(Date.now() - 60000).toISOString(),
    sender_id: "user-1",
    is_read: true,
  },
  unread_count: 0,
  updated_at: new Date(Date.now() - 60000).toISOString(),
} as Conversation;

const renderProfile = (
  overrides: Partial<Conversation> = {},
  props: { isActive?: boolean; onClick?: () => void } = {}
) =>
  render(
    <ChatProfile
      conversation={{ ...baseConversation, ...overrides } as Conversation}
      {...props}
    />
  );

describe("ChatProfile", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the participant display name", () => {
    renderProfile();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders participant profile picture", () => {
    renderProfile();
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/alice.jpg");
    expect(img).toHaveAttribute("alt", "Alice");
  });

  it("renders the last message body", () => {
    renderProfile();
    expect(screen.getByText("Hello there")).toBeInTheDocument();
  });

  it("renders '·' when there is no last message", () => {
    renderProfile({ last_message: undefined });
    expect(screen.getByText("·")).toBeInTheDocument();
  });

  it("renders time ago string", () => {
    renderProfile();
    // Should render some time-ago text like "1 minutes ago"
    expect(screen.getByText(/ago/i)).toBeInTheDocument();
  });

  // ── Unread badge ───────────────────────────────────────────────────────────

  it("renders unread dot when unread_count > 0", () => {
    const { container } = renderProfile({ unread_count: 3 });
    const dot = container.querySelector(".bg-\\[\\#f50\\]");
    expect(dot).toBeInTheDocument();
  });

  it("does not render unread dot when unread_count is 0", () => {
    const { container } = renderProfile({ unread_count: 0 });
    const dot = container.querySelector(".bg-\\[\\#f50\\]");
    expect(dot).not.toBeInTheDocument();
  });

  // ── Active state ───────────────────────────────────────────────────────────

  it("applies active class when isActive is true", () => {
    const { container } = renderProfile({}, { isActive: true });
    expect(container.querySelector(".bg-black")).toBeInTheDocument();
  });

  it("does not apply active bg-black class when isActive is false", () => {
    const { container } = renderProfile({}, { isActive: false });
    expect(container.querySelector(".bg-black")).not.toBeInTheDocument();
  });

  // ── Click ──────────────────────────────────────────────────────────────────

  it("calls onClick when the profile is clicked", async () => {
    const onClick = vi.fn();
    const { container } = renderProfile({}, { onClick });
    const profileDiv = container.querySelector("[data-test^='chat-profile-']")!;
    await userEvent.click(profileDiv);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // ── data-test attribute ────────────────────────────────────────────────────

  it("has correct data-test attribute", () => {
    const { container } = renderProfile();
    expect(
      container.querySelector("[data-test='chat-profile-conv-1']")
    ).toBeInTheDocument();
  });

  // ── Time formatting ────────────────────────────────────────────────────────

  it("shows 'minutes ago' for recent messages", () => {
    renderProfile({
      updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    });
    expect(screen.getByText(/minutes ago/i)).toBeInTheDocument();
  });

  it("shows 'hours ago' for messages a few hours old", () => {
    renderProfile({
      updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    });
    expect(screen.getByText(/hours ago/i)).toBeInTheDocument();
  });

  it("shows 'days ago' for messages days old", () => {
    renderProfile({
      updated_at: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    });
    expect(screen.getByText(/days ago/i)).toBeInTheDocument();
  });

  it("shows 'months ago' for old messages", () => {
    renderProfile({
      updated_at: new Date(Date.now() - 60 * 86400 * 1000).toISOString(),
    });
    expect(screen.getByText(/months ago/i)).toBeInTheDocument();
  });

  it("shows 'years ago' for very old messages", () => {
    renderProfile({
      updated_at: new Date(Date.now() - 400 * 86400 * 1000).toISOString(),
    });
    expect(screen.getByText(/years ago/i)).toBeInTheDocument();
  });
});