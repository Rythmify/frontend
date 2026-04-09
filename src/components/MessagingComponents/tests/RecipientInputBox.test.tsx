import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipientInputBox } from "../RecipientInputBox";

vi.mock("@/services/api/messaging/conversationApi", () => ({
  searchFollowing: vi.fn(),
  globalSearch: vi.fn(),
}));

import {
  searchFollowing,
  globalSearch,
} from "@/services/api/messaging/conversationApi";

const mockUser = {
  id: "user-1",
  username: "alice",
  display_name: "Alice",
  profile_picture: "https://example.com/alice.jpg",
};

const renderInput = (props = {}) =>
  render(
    <RecipientInputBox
      onSelect={vi.fn()}
      onClear={vi.fn()}
      error={null}
      {...props}
    />
  );

describe("RecipientInputBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (searchFollowing as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [] },
    });
    (globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { users: [] },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the input", () => {
    renderInput();
    expect(screen.getByTestId("recipient-input")).toBeInTheDocument();
  });

  it("renders the container with correct data-test", () => {
    renderInput();
    expect(screen.getByTestId("recipient-input-box")).toBeInTheDocument();
  });

  it("does not show dropdown initially", () => {
    renderInput();
    expect(screen.queryByTestId("recipient-dropdown")).not.toBeInTheDocument();
  });

  // ── Error display ──────────────────────────────────────────────────────────

  it("shows error text when error prop is provided", () => {
    renderInput({ error: "Enter a recipient." });
    expect(screen.getByText("Enter a recipient.")).toBeInTheDocument();
  });

  it("applies red border when error is set", () => {
    renderInput({ error: "Error!" });
    expect(screen.getByTestId("recipient-input")).toHaveClass("border-red-500");
  });

  it("does not show error when error prop is null", () => {
    renderInput({ error: null });
    expect(screen.queryByText(/enter a recipient/i)).not.toBeInTheDocument();
  });

  // ── Typing ─────────────────────────────────────────────────────────────────

  it("calls onClear when user types", async () => {
    const onClear = vi.fn();
    renderInput({ onClear });
    await userEvent.type(screen.getByTestId("recipient-input"), "a");
    expect(onClear).toHaveBeenCalled();
  });

  it("does not search immediately (debounced)", async () => {
    renderInput();
    await userEvent.type(screen.getByTestId("recipient-input"), "alice");
    expect(searchFollowing).not.toHaveBeenCalled();
  });

  it("calls search APIs after debounce", async () => {
    renderInput();
    await userEvent.type(screen.getByTestId("recipient-input"), "alice");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() =>
      expect(searchFollowing).toHaveBeenCalledWith("alice", 10, 0)
    );
    expect(globalSearch).toHaveBeenCalledWith("alice", {
      type: "users",
      limit: 10,
    });
  });

  // ── Dropdown ───────────────────────────────────────────────────────────────

  it("shows dropdown with results after search", async () => {
    (searchFollowing as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [mockUser] },
    });
    renderInput();
    await userEvent.type(screen.getByTestId("recipient-input"), "al");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() =>
      expect(screen.getByTestId("recipient-dropdown")).toBeInTheDocument()
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders profile picture in dropdown when available", async () => {
    (searchFollowing as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [mockUser] },
    });
    renderInput();
    await userEvent.type(screen.getByTestId("recipient-input"), "al");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => screen.getByTestId("recipient-dropdown"));
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://example.com/alice.jpg"
    );
  });

  it("renders initials when profile picture is null", async () => {
    (searchFollowing as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        items: [{ ...mockUser, profile_picture: null }],
      },
    });
    renderInput();
    await userEvent.type(screen.getByTestId("recipient-input"), "al");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => screen.getByTestId("recipient-dropdown"));
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("shows 'user not found' when no results returned", async () => {
    renderInput();
    await userEvent.type(screen.getByTestId("recipient-input"), "xyz");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() =>
      expect(
        screen.getByText(/soundcloud user not found/i)
      ).toBeInTheDocument()
    );
  });

  it("deduplicates users appearing in both following and global results", async () => {
    (searchFollowing as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [mockUser] },
    });
    (globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { users: [mockUser] }, // same user
    });
    renderInput();
    await userEvent.type(screen.getByTestId("recipient-input"), "alice");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => screen.getByTestId("recipient-dropdown"));
    const items = screen.getAllByText("Alice");
    expect(items).toHaveLength(1);
  });

  // ── Selection ──────────────────────────────────────────────────────────────

  it("calls onSelect with user when a result is clicked", async () => {
    const onSelect = vi.fn();
    (searchFollowing as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [mockUser] },
    });
    renderInput({ onSelect });
    await userEvent.type(screen.getByTestId("recipient-input"), "al");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => screen.getByTestId("recipient-dropdown"));
    await userEvent.click(
      screen.getByTestId(`recipient-dropdown-item-${mockUser.id}`)
    );
    expect(onSelect).toHaveBeenCalledWith(mockUser);
  });

  it("fills input with selected user's display name", async () => {
    (searchFollowing as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [mockUser] },
    });
    renderInput();
    await userEvent.type(screen.getByTestId("recipient-input"), "al");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => screen.getByTestId("recipient-dropdown"));
    await userEvent.click(
      screen.getByTestId(`recipient-dropdown-item-${mockUser.id}`)
    );
    expect(screen.getByTestId("recipient-input")).toHaveValue("Alice");
  });

  it("closes dropdown after selection", async () => {
    (searchFollowing as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [mockUser] },
    });
    renderInput();
    await userEvent.type(screen.getByTestId("recipient-input"), "al");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => screen.getByTestId("recipient-dropdown"));
    await userEvent.click(
      screen.getByTestId(`recipient-dropdown-item-${mockUser.id}`)
    );
    expect(screen.queryByTestId("recipient-dropdown")).not.toBeInTheDocument();
  });

  // ── Error on search failure ────────────────────────────────────────────────

  it("shows user not found when search throws", async () => {
    (searchFollowing as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network error")
    );
    renderInput();
    await userEvent.type(screen.getByTestId("recipient-input"), "fail");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() =>
      expect(
        screen.getByText(/soundcloud user not found/i)
      ).toBeInTheDocument()
    );
  });

  // ── Empty query ────────────────────────────────────────────────────────────

  it("hides dropdown when query is cleared", async () => {
    (searchFollowing as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [mockUser] },
    });
    renderInput();
    const input = screen.getByTestId("recipient-input");
    await userEvent.type(input, "al");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => screen.getByTestId("recipient-dropdown"));
    await userEvent.clear(input);
    act(() => vi.advanceTimersByTime(400));
    expect(screen.queryByTestId("recipient-dropdown")).not.toBeInTheDocument();
  });
});