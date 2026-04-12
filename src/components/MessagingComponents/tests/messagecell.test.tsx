import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MessageCell from "../messagecell";
import type { Message } from "@/services/api/messaging/conversationApi";

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: "msg-1",
  body: "Hello world",
  created_at: new Date().toISOString(),
  sender_id: "user-1",
  is_read: true,
  ...overrides,
} as unknown as Message);

describe("MessageCell", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the message body", () => {
    render(<MessageCell message={makeMessage()} displayName="Alice" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders the display name", () => {
    render(<MessageCell message={makeMessage()} displayName="Alice" />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders 'just now' for very recent messages", () => {
    render(<MessageCell message={makeMessage()} displayName="Alice" />);
    expect(screen.getByText("just now")).toBeInTheDocument();
  });

  it("renders 'X minute(s) ago' for messages older than a minute", () => {
    const msg = makeMessage({
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    });
    render(<MessageCell message={msg} displayName="Alice" />);
    expect(screen.getByText(/5 minutes ago/i)).toBeInTheDocument();
  });

  it("renders '1 minute ago' (singular)", () => {
    const msg = makeMessage({
      created_at: new Date(Date.now() - 65 * 1000).toISOString(),
    });
    render(<MessageCell message={msg} displayName="Alice" />);
    expect(screen.getByText(/1 minute ago/i)).toBeInTheDocument();
  });

  it("renders 'X hour(s) ago' for older messages", () => {
    const msg = makeMessage({
      created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    });
    render(<MessageCell message={msg} displayName="Alice" />);
    expect(screen.getByText(/3 hours ago/i)).toBeInTheDocument();
  });

  it("renders '1 hour ago' (singular)", () => {
    const msg = makeMessage({
      created_at: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    });
    render(<MessageCell message={msg} displayName="Alice" />);
    expect(screen.getByText(/1 hour ago/i)).toBeInTheDocument();
  });

  it("renders 'X day(s) ago' for messages days old", () => {
    const msg = makeMessage({
      created_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    });
    render(<MessageCell message={msg} displayName="Alice" />);
    expect(screen.getByText(/2 days ago/i)).toBeInTheDocument();
  });

  it("renders '1 day ago' (singular)", () => {
    const msg = makeMessage({
      created_at: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
    });
    render(<MessageCell message={msg} displayName="Alice" />);
    expect(screen.getByText(/1 day ago/i)).toBeInTheDocument();
  });

  // ── Profile picture ────────────────────────────────────────────────────────

  it("renders profile picture when provided", () => {
    render(
      <MessageCell
        message={makeMessage()}
        displayName="Alice"
        profilePicture="https://example.com/alice.jpg"
      />
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/alice.jpg");
    expect(img).toHaveAttribute("alt", "Alice");
  });

  it("renders placeholder div when profilePicture is null", () => {
    const { container } = render(
      <MessageCell message={makeMessage()} displayName="Alice" profilePicture={null} />
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-\\[\\#3a3a3a\\]")).toBeInTheDocument();
  });

  it("renders placeholder div when profilePicture is undefined", () => {
    const { container } = render(
      <MessageCell message={makeMessage()} displayName="Alice" />
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-\\[\\#3a3a3a\\]")).toBeInTheDocument();
  });
});