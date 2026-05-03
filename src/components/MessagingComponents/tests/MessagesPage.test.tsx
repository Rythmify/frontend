import { render, screen, waitFor, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import MessagesPage from "@/pages/social/messages/MessagesPage"
import * as conversationApi from "../../../services/api/messaging/conversationApi"

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("../../../services/api/messaging/conversationApi", () => ({
  fetchConversations: vi.fn(),
}))

vi.mock("../../../components/UI/Spinner", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-test="messages-loading" {...props}>Loading...</div>
  ),
}))

vi.mock("./emptyMessagesPage", () => ({
  default: () => <div data-test="empty-messages-page">No messages</div>,
}))

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, useNavigate: () => mockNavigate }
})

// Mock axios module so isAxiosError is fully controllable per-test
const mockIsAxiosError = vi.fn((_err: unknown): boolean => false)
vi.mock("axios", () => ({
  default: { isAxiosError: (err: unknown) => mockIsAxiosError(err) },
  isAxiosError: (err: unknown) => mockIsAxiosError(err),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockFetchConversations = vi.mocked(conversationApi.fetchConversations)

const makeConversation = (id: string) => ({
  id,
  created_at: "2024-01-01T00:00:00Z",
  last_message: null,
  participants: [],
})

function renderPage() {
  return render(
    <MemoryRouter>
      <MessagesPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockIsAxiosError.mockImplementation(() => false)
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MessagesPage", () => {

  // ── Loading state ──────────────────────────────────────────────────────────

  it("shows spinner while loading", () => {
    mockFetchConversations.mockReturnValueOnce(new Promise(() => {}))
    renderPage()
    expect(screen.getByTestId("messages-loading")).toBeInTheDocument()
  })

  it("does not render EmptyMessagesPage or error while loading", () => {
    mockFetchConversations.mockReturnValueOnce(new Promise(() => {}))
    renderPage()
    expect(screen.queryByTestId("empty-messages-page")).not.toBeInTheDocument()
    expect(screen.queryByTestId("messages-error")).not.toBeInTheDocument()
  })

  // ── Success: empty ─────────────────────────────────────────────────────────

  it("renders EmptyMessagesPage when there are no conversations", async () => {
    mockFetchConversations.mockResolvedValueOnce({ data: { items: [] } } as any)
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId("empty-messages-page")).toBeInTheDocument()
    )
  })

  it("does not navigate when conversations list is empty", async () => {
    mockFetchConversations.mockResolvedValueOnce({ data: { items: [] } } as any)
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId("empty-messages-page")).toBeInTheDocument()
    )
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  // ── Success: with conversations ────────────────────────────────────────────

  it("redirects to conversations[0] with replace:true", async () => {
    mockFetchConversations.mockResolvedValueOnce({
      data: { items: [makeConversation("conv-1"), makeConversation("conv-2")] },
    } as any)
    renderPage()
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/messages/conv-1", { replace: true })
    )
  })

  it("calls fetchConversations with page 1 and limit 20", async () => {
    mockFetchConversations.mockResolvedValueOnce({ data: { items: [] } } as any)
    renderPage()
    await waitFor(() =>
      expect(mockFetchConversations).toHaveBeenCalledWith(1, 20)
    )
  })

  // ── Error: axios with response message ────────────────────────────────────

  it("shows the response message from an axios error", async () => {
    mockIsAxiosError.mockImplementation(() => true)
    mockFetchConversations.mockRejectedValueOnce({
      response: { data: { message: "Unauthorized access" } },
    })
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId("messages-error")).toHaveTextContent("Unauthorized access")
    )
  })

  // ── Error: axios with no message field ────────────────────────────────────

  it("falls back to default message when axios error has no response message", async () => {
    mockIsAxiosError.mockImplementation(() => true)
    mockFetchConversations.mockRejectedValueOnce({ response: { data: {} } })
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId("messages-error")).toHaveTextContent(
        "Failed to load conversations."
      )
    )
  })

  // ── Error: axios with no response at all ──────────────────────────────────

  it("falls back to default message when axios error has no response object", async () => {
    mockIsAxiosError.mockImplementation(() => true)
    mockFetchConversations.mockRejectedValueOnce({})
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId("messages-error")).toHaveTextContent(
        "Failed to load conversations."
      )
    )
  })

  // ── Error: non-axios ──────────────────────────────────────────────────────

  it("shows generic error for non-axios errors", async () => {
    mockIsAxiosError.mockImplementation(() => false)
    mockFetchConversations.mockRejectedValueOnce(new Error("Network failure"))
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId("messages-error")).toHaveTextContent(
        "An unexpected error occurred."
      )
    )
  })

  // ── Cancellation: unmount before resolve ──────────────────────────────────

  it("does not set state or navigate when component unmounts before fetch resolves", async () => {
    let resolvePromise!: (v: any) => void
    mockFetchConversations.mockReturnValueOnce(
      new Promise((res) => { resolvePromise = res })
    )

    const { unmount } = renderPage()

    // Unmount triggers cancelled = true in the cleanup function
    unmount()

    // Resolve after unmount — the cancelled guard should prevent all state updates
    await act(async () => {
      resolvePromise({ data: { items: [makeConversation("conv-unmounted")] } })
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("does not set error state when component unmounts before fetch rejects", async () => {
    let rejectPromise!: (reason?: any) => void
    mockFetchConversations.mockReturnValueOnce(
      new Promise((_, rej) => { rejectPromise = rej })
    )

    const { unmount } = renderPage()
    unmount()

    // Reject after unmount — cancelled guard should swallow the branch
    await act(async () => {
      rejectPromise(new Error("late error"))
    })

    expect(screen.queryByTestId("messages-error")).not.toBeInTheDocument()
  })
})