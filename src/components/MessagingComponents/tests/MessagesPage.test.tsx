import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MessagesPage from "@/pages/social/messages/MessagesPage";

// Use alias paths so vitest intercepts the same module instance the component loads.
// Relative paths from the test file ("/tests/") don't match what the component
// imports from its own directory, so the real module loads instead of the mock.

vi.mock("@/services/api/messaging/conversationApi", () => ({
  fetchConversations: vi.fn(),
}));

vi.mock("@/components/UI/Spinner", () => ({
  // data-test not data-testid — project testIdAttribute is 'data-test'
  default: () => <div data-test="spinner">Loading...</div>,
}));

vi.mock("@/pages/social/messages/emptyMessagesPage", () => ({
  // data-test not data-testid
  default: () => <div data-test="empty-page">Empty Page</div>,
}));

// Stable navigate reference declared before vi.mock so the hoisted factory
// captures the real function, not undefined.
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import { fetchConversations } from "@/services/api/messaging/conversationApi";

const renderPage = () =>
  render(
    <MemoryRouter>
      <MessagesPage />
    </MemoryRouter>
  );

describe("MessagesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  it("shows spinner while loading", () => {
    (fetchConversations as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );
    renderPage();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  it("renders EmptyMessagesPage when no conversations", async () => {
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [] },
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("empty-page")).toBeInTheDocument()
    );
  });

  it("does not navigate when no conversations", async () => {
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [] },
    });
    renderPage();
    await waitFor(() => screen.getByTestId("empty-page"));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // ── Redirect ───────────────────────────────────────────────────────────────

  it("navigates to the first conversation when conversations exist", async () => {
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        items: [
          { id: "conv-1", participant: { id: "user-1" } },
          { id: "conv-2", participant: { id: "user-2" } },
        ],
      },
    });
    renderPage();
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/messages/conv-1", {
        replace: true,
      })
    );
  });

  // ── Error state ────────────────────────────────────────────────────────────

  it("shows error message when fetch fails with axios error", async () => {
    const axiosError = {
      isAxiosError: true,
      response: { data: { message: "Unauthorized" } },
    };
    vi.doMock("axios", () => ({
      default: { isAxiosError: (e: unknown) => e === axiosError },
      isAxiosError: (e: unknown) => e === axiosError,
    }));

    (fetchConversations as ReturnType<typeof vi.fn>).mockRejectedValue(
      axiosError
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
    );
  });

  it("shows generic error when fetch fails with non-axios error", async () => {
    (fetchConversations as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network error")
    );
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByText(/an unexpected error occurred/i)
      ).toBeInTheDocument()
    );
  });

  it("calls fetchConversations with page and limit", async () => {
    (fetchConversations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { items: [] },
    });
    renderPage();
    await waitFor(() => screen.getByTestId("empty-page"));
    expect(fetchConversations).toHaveBeenCalledWith(1, 20);
  });
});