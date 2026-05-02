import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react'
import MessageIdPage from '@/pages/social/messages/[messageId]/MessageIdPage'

// ─── Mock functions ───────────────────────────────────────────────────────────
const mockNavigate = vi.fn()
const mockUseParams = vi.fn()
const mockFetchConversations = vi.fn()
const mockFetchConversation = vi.fn()
const mockMarkMessageReadState = vi.fn()
const mockJoinConversation = vi.fn()
const mockLeaveConversation = vi.fn()
const mockGetSocket = vi.fn()
const mockEmitMessageRead = vi.fn()
const mockRefreshUnreadCount = vi.fn()
const mockSetMessagingState = vi.fn()

// Socket handler registry so tests can fire socket events
const socketHandlers = new Map<string, (...args: any[]) => void>()
const mockSocket = {
  on: vi.fn((event: string, handler: (...args: any[]) => void) => {
    socketHandlers.set(event, handler)
  }),
  off: vi.fn((event: string) => {
    socketHandlers.delete(event)
  }),
}

// ─── Module mocks ─────────────────────────────────────────────────────────────
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}))

vi.mock('@/stores/messaging.store', () => ({
  useMessagingStore: Object.assign(
    () => ({ refreshUnreadCount: mockRefreshUnreadCount }),
    { setState: (...args: unknown[]) => mockSetMessagingState(...args) }
  ),
}))

vi.mock('@/services/api/messaging/conversationApi', () => ({
  fetchConversations: (...args: unknown[]) => mockFetchConversations(...args),
  fetchConversation: (...args: unknown[]) => mockFetchConversation(...args),
  markMessageReadState: (...args: unknown[]) => mockMarkMessageReadState(...args),
}))

vi.mock('@/services/api/messaging/socketService', () => ({
  joinConversation: (...args: unknown[]) => mockJoinConversation(...args),
  leaveConversation: (...args: unknown[]) => mockLeaveConversation(...args),
  getSocket: () => mockGetSocket(),
  emitMessageRead: (...args: unknown[]) => mockEmitMessageRead(...args),
}))

// ─── Component mocks ──────────────────────────────────────────────────────────

vi.mock('@/components/MessagingComponents/MessagingHeader', () => ({
  default: ({ onConversationCreated }: { onConversationCreated: (c: any, m: any) => void }) => (
    <div data-test="messaging-header">
      Header
      <button
        data-test="create-conversation"
        onClick={() =>
          onConversationCreated(
            makeConversation({ id: 'new' }),
            makeMessage({ id: 'new-msg', conversation_id: 'new' })
          )
        }
      >
        New
      </button>
    </div>
  ),
}))

// Chats mock: data-test="conv-{id}"
vi.mock('@/components/MessagingComponents/Chats', () => ({
  Chats: ({
    conversations,
    error,
    activeConversationId,
    onSelect,
    onLoadMore,
    loading,
    loadingMore,
    hasMore,
  }: {
    conversations: any[]
    error: string | null
    activeConversationId: string | null
    onSelect: (c: any) => void
    onLoadMore: () => void
    loading: boolean
    loadingMore: boolean
    hasMore: boolean
  }) => (
    <div
      data-test="chats"
      data-loading={String(loading)}
      data-loading-more={String(loadingMore)}
      data-has-more={String(hasMore)}
    >
      {error && <p data-test="chats-error">{error}</p>}
      {conversations.map((c) => (
        <button
          key={c.id}
          data-test={`conv-${c.id}`}
          data-active={String(activeConversationId === c.id)}
          onClick={() => onSelect(c)}
        >
          {c.participant.username}
        </button>
      ))}
      <button data-test="load-more-conversations" onClick={onLoadMore}>Load more</button>
    </div>
  ),
}))

// ConversationHeader mock
vi.mock('@/components/MessagingComponents/ConversationHeader', () => ({
  default: ({
    conversationId,
    reciepiantId,
    recipientName,
    lastMessageId,
    onReadStateChange,
    onDeleted,
    onBack,
  }: {
    conversationId: string
    reciepiantId: string
    recipientName: string
    lastMessageId: string | null
    onReadStateChange: (isUnread: boolean) => void
    onDeleted: (id: string) => void
    onBack: () => void
  }) => (
    <div
      data-test="conversation-header"
      data-conversation-id={conversationId}
      data-recipient-id={reciepiantId}
      data-recipient-name={recipientName}
      data-last-message-id={lastMessageId ?? ''}
    >
      <button data-test="delete-conv" onClick={() => onDeleted(conversationId)}>Delete</button>
      <button data-test="mark-unread" onClick={() => onReadStateChange(true)}>Mark unread</button>
      <button data-test="header-back" onClick={onBack}>Back</button>
    </div>
  ),
}))

// SendMessageForm mock
vi.mock('@/components/MessagingComponents/SendMessageForm', () => ({
  default: ({
    conversationId,
    existingMessages,
    loadingMessages,
    hasMoreMessages,
    onLoadMore,
    onMessageSent,
    isTyping,
    ParticipantInfo,
  }: {
    conversationId: string
    existingMessages: any[]
    loadingMessages: boolean
    hasMoreMessages: boolean
    onLoadMore: () => void
    onMessageSent: (m: any) => void
    isTyping: boolean
    ParticipantInfo: { display_name: string; profile_picture: string | null }
  }) => (
    <div
      data-test="send-message-form"
      data-conversation-id={conversationId}
      data-message-count={existingMessages.length}
      data-loading={String(loadingMessages)}
      data-has-more={String(hasMoreMessages)}
      data-is-typing={String(isTyping)}
      data-participant-name={ParticipantInfo.display_name}
    >
      <button data-test="load-more-messages" onClick={onLoadMore}>Load more</button>
      <button
        data-test="send-msg"
        onClick={() =>
          onMessageSent(makeMessage({ id: 'sent-msg', conversation_id: conversationId, body: 'hi' }))
        }
      >
        Send
      </button>
    </div>
  ),
}))

// ─── Data helpers ─────────────────────────────────────────────────────────────

function makeMessage(overrides: Record<string, unknown> = {}) {
  return {
    id: 'msg-1',
    conversation_id: '1',
    body: 'hello',
    embed_type: null,
    embed_id: null,
    sender_id: 'user-other',
    is_read: false,
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeConversation(overrides: Record<string, unknown> = {}) {
  const id = (overrides.id as string) ?? '1'
  return {
    id,
    participant: {
      id: `participant-${id}`,
      username: `User ${id}`,
      display_name: `User ${id}`,
      avatar: null,
    },
    last_message: makeMessage({ id: `last-msg-${id}`, conversation_id: id }),
    unread_count: 1,
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function convListResponse(items: any[], total = items.length) {
  return {
    data: {
      items,
      // total_pages=1 prevents the component from making extra fetchConversation pages calls
      pagination: { page: 1, limit: 20, total, total_pages: 1 },
    },
  }
}

function convMsgResponse(messages: any[], totalPages = 1) {
  return {
    data: {
      messages,
      // total_pages MUST stay 1 — the component fetches page 1, then if total_pages > 1
      // fetches the LAST page too. A second unmocked call returns undefined and crashes
      // silently, leaving activeConv null so send-message-form never appears.
      pagination: { page: 1, limit: 50, total: messages.length, total_pages: totalPages },
    },
  }
}

async function renderAndLoad(params: Record<string, string | undefined> = { messageId: '1' }) {
  mockUseParams.mockReturnValue(params)
  render(<MessageIdPage />)
  await waitFor(
    () => expect(screen.getByTestId('send-message-form')).toBeInTheDocument(),
    { timeout: 3000 }
  )
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const conv1 = makeConversation({
  id: '1',
  participant: { id: 'participant-1', username: 'User 1', display_name: 'User 1', avatar: null },
})

const conv2 = makeConversation({
  id: '2',
  participant: { id: 'participant-2', username: 'User 2', display_name: 'User 2', avatar: null },
  unread_count: 0,
})

const defaultMessages = [
  makeMessage({ id: 'received-1', conversation_id: '1', sender_id: 'participant-1', is_read: false }),
  makeMessage({ id: 'mine-1', conversation_id: '1', sender_id: 'me', is_read: true }),
]

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('MessageIdPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    socketHandlers.clear()
    mockUseParams.mockReturnValue({ messageId: '1' })
    mockGetSocket.mockReturnValue(mockSocket)
    mockFetchConversations.mockResolvedValue(convListResponse([conv1, conv2]))
    mockFetchConversation.mockResolvedValue(convMsgResponse(defaultMessages, 1))
    mockMarkMessageReadState.mockResolvedValue({ data: { conversation_unread_count: 0 } })
  })

  it('renders the MessagingHeader', async () => {
    render(<MessageIdPage />)
    await waitFor(() => expect(screen.getByTestId('messaging-header')).toBeInTheDocument())
  })

  it('renders the Chats panel', async () => {
    render(<MessageIdPage />)
    await waitFor(() => expect(screen.getByTestId('chats')).toBeInTheDocument())
  })

  it("shows 'Select a conversation' when no conversations exist", async () => {
    mockFetchConversations.mockResolvedValue(convListResponse([]))
    render(<MessageIdPage />)
    expect(await screen.findByText('Select a conversation to start messaging.')).toBeInTheDocument()
  })

  it('auto-opens the first conversation after loading', async () => {
    await renderAndLoad({ messageId: '1' })
    expect(screen.getByTestId('conversation-header')).toHaveAttribute('data-conversation-id', '1')
    expect(screen.getByTestId('send-message-form')).toBeInTheDocument()
  })

  it('navigates to participant URL when user selects a conversation', async () => {
    await renderAndLoad()
    fireEvent.click(screen.getByTestId('conv-2'))
    expect(mockNavigate).toHaveBeenCalledWith('/messages/2')
  })

  it('marks unread messages as read on conversation open', async () => {
    await renderAndLoad()
    await waitFor(() =>
      expect(mockMarkMessageReadState).toHaveBeenCalledWith('1', 'received-1', true)
    )
  })

  it('does not call markMessageReadState for already-read messages', async () => {
    mockFetchConversation.mockResolvedValue(
      convMsgResponse([
        makeMessage({ id: 'already-read', conversation_id: '1', sender_id: 'participant-1', is_read: true }),
        makeMessage({ id: 'own-msg', conversation_id: '1', sender_id: 'me', is_read: false }),
      ], 1)
    )
    await renderAndLoad()
    await new Promise((r) => setTimeout(r, 50))
    expect(mockMarkMessageReadState).not.toHaveBeenCalled()
  })

  it('switches active conversation when another is clicked', async () => {
    await renderAndLoad()
    fireEvent.click(screen.getByTestId('conv-2'))
    await waitFor(() =>
      expect(screen.getByTestId('conversation-header')).toHaveAttribute('data-conversation-id', '2')
    )
  })

  it('renders SendMessageForm when conversation is active', async () => {
    await renderAndLoad()
    expect(screen.getByTestId('send-message-form')).toHaveAttribute('data-conversation-id', '1')
  })

  it('updates conversation list when a message is sent', async () => {
    await renderAndLoad()
    expect(screen.getByTestId('send-message-form')).toHaveAttribute('data-message-count', '2')
    fireEvent.click(screen.getByTestId('send-msg'))
    await waitFor(() =>
      expect(screen.getByTestId('send-message-form')).toHaveAttribute('data-message-count', '3')
    )
  })

  it('removes deleted conversation and auto-selects next', async () => {
    await renderAndLoad()
    fireEvent.click(screen.getByTestId('delete-conv'))
    expect(mockNavigate).toHaveBeenCalledWith('/messages/2')
    await waitFor(() =>
      expect(screen.getByTestId('conversation-header')).toHaveAttribute('data-conversation-id', '2')
    )
  })

  it('navigates to /messages when last conversation is deleted', async () => {
    mockFetchConversations.mockResolvedValue(convListResponse([conv1]))
    await renderAndLoad()
    fireEvent.click(screen.getByTestId('delete-conv'))
    expect(mockNavigate).toHaveBeenCalledWith('/messages')
    expect(mockSetMessagingState).toHaveBeenCalledWith({ activeConversationId: null })
  })

  it('updates unread_count when read state changes to unread', async () => {
    await renderAndLoad()
    fireEvent.click(screen.getByTestId('mark-unread'))
    await waitFor(() => expect(screen.getByTestId('conv-1')).toBeInTheDocument())
  })

  it('shows error message when fetchConversations fails', async () => {
    mockFetchConversations.mockRejectedValue(new Error('network fail'))
    render(<MessageIdPage />)
    await waitFor(() =>
      expect(screen.getByTestId('chats-error')).toHaveTextContent('Could not load conversations.')
    )
  })

  it('shows error message when fetchConversation fails', async () => {
    mockFetchConversation.mockRejectedValue(new Error('msg fail'))
    render(<MessageIdPage />)
    await waitFor(() => expect(mockFetchConversation).toHaveBeenCalledWith('1', 50, 1))
    expect(screen.getByTestId('message-id-page')).toBeInTheDocument()
  })

  it('renders the page with correct data-test', () => {
    render(<MessageIdPage />)
    expect(screen.getByTestId('message-id-page')).toBeInTheDocument()
  })
})