import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import { RecipientInputBox } from "../RecipientInputBox";

vi.mock("@/services/api/messaging/conversationApi", () => ({
  getSuggestions: vi.fn(),
  globalSearch: vi.fn(),
}));

import {
  getSuggestions,
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

const typeIntoInput = (value: string) => {
  fireEvent.change(screen.getByTestId("recipient-input"), {
    target: { value },
  });
};

const clearInput = () => typeIntoInput("");

describe("RecipientInputBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (getSuggestions as ReturnType<typeof vi.fn>).mockResolvedValue({
      users: [],
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
    typeIntoInput("a");
    expect(onClear).toHaveBeenCalled();
  });

  it("does not search immediately (debounced)", async () => {
    renderInput();
    typeIntoInput("alice");
    expect(getSuggestions).not.toHaveBeenCalled();
  });

  it("calls search APIs after debounce", async () => {
    renderInput();
    typeIntoInput("alice");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() =>
      expect(getSuggestions).toHaveBeenCalledWith("alice", expect.any(AbortSignal))
    );
    expect(globalSearch).toHaveBeenCalledWith("alice", {
      type: "users",
      limit: 10,
    });
  });

  // ── Dropdown ───────────────────────────────────────────────────────────────

  it("shows dropdown with results after search", async () => {
    (getSuggestions as ReturnType<typeof vi.fn>).mockResolvedValue({
      users: [mockUser],
    });
    renderInput();
    typeIntoInput("al");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() =>
      expect(screen.getByTestId("recipient-dropdown")).toBeInTheDocument()
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders profile picture in dropdown when available", async () => {
    (getSuggestions as ReturnType<typeof vi.fn>).mockResolvedValue({
      users: [mockUser],
    });
    renderInput();
    typeIntoInput("al");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => screen.getByTestId("recipient-dropdown"));
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://example.com/alice.jpg"
    );
  });

  it("renders initials when profile picture is null", async () => {
    (getSuggestions as ReturnType<typeof vi.fn>).mockResolvedValue({
      users: [{ ...mockUser, profile_picture: null }],
    });
    renderInput();
    typeIntoInput("al");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => screen.getByTestId("recipient-dropdown"));
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("shows 'user not found' when no results returned", async () => {
    renderInput();
    typeIntoInput("xyz");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() =>
      expect(
        screen.getByText(/soundcloud user not found/i)
      ).toBeInTheDocument()
    );
  });

  it("auto-selects when validation returns exactly one user", async () => {
    const onSelect = vi.fn();
    (getSuggestions as ReturnType<typeof vi.fn>).mockResolvedValue({
      users: [mockUser],
    });
    (globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { users: [mockUser] },
    });
    renderInput({ onSelect });
    typeIntoInput("alice");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith(mockUser));
    expect(screen.queryByTestId("recipient-dropdown")).not.toBeInTheDocument();
  });

  // ── Selection ──────────────────────────────────────────────────────────────

  it("calls onSelect with user when a result is clicked", async () => {
    const onSelect = vi.fn();
    (getSuggestions as ReturnType<typeof vi.fn>).mockResolvedValue({
      users: [mockUser],
    });
    renderInput({ onSelect });
    typeIntoInput("al");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => screen.getByTestId("recipient-dropdown"));
    fireEvent.click(
      screen.getByTestId(`recipient-dropdown-item-${mockUser.id}`)
    );
    expect(onSelect).toHaveBeenCalledWith(mockUser);
  });

  it("fills input with selected user's display name", async () => {
    (getSuggestions as ReturnType<typeof vi.fn>).mockResolvedValue({
      users: [mockUser],
    });
    renderInput();
    typeIntoInput("al");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => screen.getByTestId("recipient-dropdown"));
    fireEvent.click(
      screen.getByTestId(`recipient-dropdown-item-${mockUser.id}`)
    );
    expect(screen.getByTestId("recipient-input")).toHaveValue("Alice");
  });

  it("closes dropdown after selection", async () => {
    (getSuggestions as ReturnType<typeof vi.fn>).mockResolvedValue({
      users: [mockUser],
    });
    renderInput();
    typeIntoInput("al");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => screen.getByTestId("recipient-dropdown"));
    fireEvent.click(
      screen.getByTestId(`recipient-dropdown-item-${mockUser.id}`)
    );
    expect(screen.queryByTestId("recipient-dropdown")).not.toBeInTheDocument();
  });

  // ── Error on search failure ────────────────────────────────────────────────

  it("shows user not found when search throws", async () => {
    (getSuggestions as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network error")
    );
    renderInput();
    typeIntoInput("fail");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() =>
      expect(
        screen.getByText(/soundcloud user not found/i)
      ).toBeInTheDocument()
    );
  });

  // ── Empty query ────────────────────────────────────────────────────────────

  it("hides dropdown when query is cleared", async () => {
    (getSuggestions as ReturnType<typeof vi.fn>).mockResolvedValue({
      users: [mockUser],
    });
    renderInput();
    typeIntoInput("al");
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => screen.getByTestId("recipient-dropdown"));
    clearInput();
    act(() => vi.advanceTimersByTime(400));
    expect(screen.queryByTestId("recipient-dropdown")).not.toBeInTheDocument();
  });
});
