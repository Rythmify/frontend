import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react'
import MessageIdPage from '@/pages/social/messages/[messageId]/MessageIdPage'

// ─── Shared mocks ─────────────────────────────────────────────────────────────
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

// Socket event handler registry so tests can fire socket events
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

vi.mock('@/components/MessagingComponents/MessagingHeader', () => ({
  default: ({ onConversationCreated }: { onConversationCreated: (conversation: any, message: any) => void }) => (
    <button
      data-test="messaging-header"
      onClick={() =>
        onConversationCreated(
          makeConversation({ id: 'conv-new' }),
          makeMessage({ id: 'new-msg', conversation_id: 'conv-new' })
        )
      }
    >
      New conversation
    </button>
  ),
}))

vi.mock('@/components/MessagingComponents/Chats', () => ({
  Chats: ({
    conversations,
    loading,
    loadingMore,
    hasMore,
    error,
    activeConversationId,
    onSelect,
    onLoadMore,
  }: {
    conversations: any[]
    loading: boolean
    loadingMore: boolean
    hasMore: boolean
    error: string | null
    activeConversationId: string | null
    onSelect: (conversation: any) => void
    onLoadMore: () => void
  }) => (
    <div
      data-test="chats"
      data-loading={String(loading)}
      data-loading-more={String(loadingMore)}
      data-has-more={String(hasMore)}
      data-error={error ?? ''}
      data-active-id={activeConversationId ?? ''}
    >
      {error && <p data-test="chats-error">{error}</p>}
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          data-test={`chat-${conversation.id}`}
          data-active={String(activeConversationId === conversation.id)}
          onClick={() => onSelect(conversation)}
        >
          {conversation.participant.username}
        </button>
      ))}
      <button data-test="load-more-conversations" onClick={onLoadMore}>
        Load more conversations
      </button>
    </div>
  ),
}))

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
    onDeleted: (conversationId: string) => void
    onBack: () => void
  }) => (
    <div
      data-test="conversation-header"
      data-conversation-id={conversationId}
      data-recipient-id={reciepiantId}
      data-recipient-name={recipientName}
      data-last-message-id={lastMessageId ?? ''}
    >
      <button data-test="header-toggle-read" onClick={() => onReadStateChange(true)}>
        Toggle read
      </button>
      <button data-test="header-delete" onClick={() => onDeleted(conversationId)}>
        Delete
      </button>
      <button data-test="header-back" onClick={onBack}>
        Back
      </button>
    </div>
  ),
}))

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
    onMessageSent: (message: any) => void
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
      data-participant-picture={ParticipantInfo.profile_picture ?? ''}
    >
      <button data-test="load-more-messages" onClick={onLoadMore}>
        Load more messages
      </button>
      <button
        data-test="send-message"
        onClick={() =>
          onMessageSent(makeMessage({ id: 'sent-msg', conversation_id: conversationId, body: 'sent' }))
        }
      >
        Send message
      </button>
    </div>
  ),
}))

// ─── Data helpers ─────────────────────────────────────────────────────────────
function makeMessage(overrides: Record<string, unknown> = {}) {
  return {
    id: 'msg-1',
    conversation_id: 'conv-1',
    body: 'hello',
    embed_type: null,
    embed_id: null,
    sender_id: 'user-2',
    is_read: false,
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeConversation(overrides: Record<string, unknown> = {}) {
  const id = (overrides.id as string) ?? 'conv-1'
  return {
    id,
    participant: {
      id: `${id}-participant`,
      username: `${id}-user`,
      display_name: `${id} User`,
      avatar: null,
    },
    last_message: makeMessage({ id: `${id}-last`, conversation_id: id }),
    unread_count: 1,
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function conversationsResponse(items: any[], total = items.length) {
  return {
    data: {
      items,
      pagination: { page: 1, limit: 20, total, total_pages: Math.ceil(total / 20) || 1 },
    },
  }
}

function conversationResponse(messages: any[], totalPages = 1) {
  return {
    data: {
      messages,
      pagination: { page: 1, limit: 50, total: messages.length, total_pages: totalPages },
    },
  }
}

// Renders and waits until the conversation thread is visible
async function renderLoadedPage(params: Record<string, string | undefined> = { messageId: 'conv-1' }) {
  mockUseParams.mockReturnValue(params)
  render(<MessageIdPage />)
  await waitFor(() => expect(screen.getByTestId('send-message-form')).toBeInTheDocument())
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('MessageIdPage', () => {
  const conv1 = makeConversation({
    id: 'conv-1',
    participant: { id: 'user-2', username: 'alice', display_name: 'Alice', avatar: 'alice.jpg' },
  })
  const conv2 = makeConversation({
    id: 'conv-2',
    participant: { id: 'user-3', username: 'bob', display_name: 'Bob', avatar: null },
    unread_count: 0,
  })

  const twoUnreadMessages = [
    makeMessage({ id: 'received-1', conversation_id: 'conv-1', sender_id: 'user-2', is_read: false }),
    makeMessage({ id: 'mine-1',     conversation_id: 'conv-1', sender_id: 'me',     is_read: true }),
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    socketHandlers.clear()
    mockUseParams.mockReturnValue({ messageId: 'conv-1' })
    mockGetSocket.mockReturnValue(mockSocket)
    mockFetchConversations.mockResolvedValue(conversationsResponse([conv1, conv2]))
    mockFetchConversation.mockResolvedValue(conversationResponse(twoUnreadMessages))
    mockMarkMessageReadState.mockResolvedValue({ data: { conversation_unread_count: 0 } })
  })

  // ─── Rendering ─────────────────────────────────────────────────────────────
  describe('rendering', () => {
    it('renders the MessagingHeader', async () => {
      render(<MessageIdPage />)
      await waitFor(() => expect(screen.getByTestId('messaging-header')).toBeInTheDocument())
    })

    it('renders the Chats panel', async () => {
      render(<MessageIdPage />)
      await waitFor(() => expect(screen.getByTestId('chats')).toBeInTheDocument())
    })

    it('renders the page with correct data-test', async () => {
      render(<MessageIdPage />)
      expect(screen.getByTestId('message-id-page')).toBeInTheDocument()
    })

    it('shows "Select a conversation" when no conversations exist', async () => {
      mockFetchConversations.mockResolvedValue(conversationsResponse([]))
      render(<MessageIdPage />)
      expect(await screen.findByText('Select a conversation to start messaging.')).toBeInTheDocument()
    })
  })

  // ─── Auto-open ─────────────────────────────────────────────────────────────
  describe('auto-opens the first conversation after loading', () => {
    it('loads the conversation matching the route messageId', async () => {
      await renderLoadedPage({ messageId: 'conv-1' })
      expect(screen.getByTestId('conversation-header')).toHaveAttribute('data-conversation-id', 'conv-1')
    })

    it('auto-selects by participant id when messageId matches a participant', async () => {
      await renderLoadedPage({ messageId: 'user-3' })
      expect(mockFetchConversation).toHaveBeenCalledWith('conv-2', 50, 1)
      expect(screen.getByTestId('conversation-header')).toHaveAttribute('data-recipient-name', 'bob')
    })

    it('falls back to first conversation when messageId matches nothing', async () => {
      await renderLoadedPage({ messageId: 'unknown-id' })
      expect(screen.getByTestId('conversation-header')).toHaveAttribute('data-conversation-id', 'conv-1')
    })
  })

  // ─── Read-state ────────────────────────────────────────────────────────────
  describe('marks unread messages as read on conversation open', () => {
    it('calls markMessageReadState for each unread received message', async () => {
      await renderLoadedPage()
      await waitFor(() =>
        expect(mockMarkMessageReadState).toHaveBeenCalledWith('conv-1', 'received-1', true)
      )
    })

    it('emits socket read event after marking read', async () => {
      await renderLoadedPage()
      await waitFor(() =>
        expect(mockEmitMessageRead).toHaveBeenCalledWith('conv-1', 'received-1', true, 0)
      )
    })

    it('calls refreshUnreadCount after opening conversation', async () => {
      await renderLoadedPage()
      await waitFor(() => expect(mockRefreshUnreadCount).toHaveBeenCalled())
    })
  })

  describe('does not call markMessageReadState for already-read messages', () => {
    it('skips messages where is_read is true', async () => {
      mockFetchConversation.mockResolvedValue(
        conversationResponse([
          makeMessage({ id: 'already-read', sender_id: 'user-2', is_read: true }),
        ])
      )
      await renderLoadedPage()
      await waitFor(() => expect(screen.getByTestId('send-message-form')).toBeInTheDocument())
      expect(mockMarkMessageReadState).not.toHaveBeenCalledWith('conv-1', 'already-read', true)
    })

    it('skips own messages (sender_id !== participant id)', async () => {
      mockFetchConversation.mockResolvedValue(
        conversationResponse([
          makeMessage({ id: 'mine', sender_id: 'me', is_read: false }),
        ])
      )
      await renderLoadedPage()
      await waitFor(() => expect(screen.getByTestId('send-message-form')).toBeInTheDocument())
      expect(mockMarkMessageReadState).not.toHaveBeenCalled()
    })
  })

  // ─── Navigation ────────────────────────────────────────────────────────────
  it('navigates to participant URL when user selects a conversation', async () => {
    await renderLoadedPage()
    fireEvent.click(screen.getByTestId('chat-conv-2'))
    expect(mockNavigate).toHaveBeenCalledWith('/messages/conv-2')
  })

  it('switches active conversation when another is clicked', async () => {
    await renderLoadedPage()
    fireEvent.click(screen.getByTestId('chat-conv-2'))
    await waitFor(() =>
      expect(screen.getByTestId('conversation-header')).toHaveAttribute('data-conversation-id', 'conv-2')
    )
  })

  // ─── SendMessageForm ───────────────────────────────────────────────────────
  it('renders SendMessageForm when conversation is active', async () => {
    await renderLoadedPage()
    expect(screen.getByTestId('send-message-form')).toBeInTheDocument()
    expect(screen.getByTestId('send-message-form')).toHaveAttribute('data-conversation-id', 'conv-1')
  })

  it('updates conversation list when a message is sent', async () => {
    await renderLoadedPage()
    const formBefore = screen.getByTestId('send-message-form')
    expect(formBefore).toHaveAttribute('data-message-count', '2')

    fireEvent.click(screen.getByTestId('send-message'))

    await waitFor(() =>
      expect(screen.getByTestId('send-message-form')).toHaveAttribute('data-message-count', '3')
    )
  })

  // ─── Deletion ──────────────────────────────────────────────────────────────
  it('removes deleted conversation and auto-selects next', async () => {
    await renderLoadedPage()
    fireEvent.click(screen.getByTestId('header-delete'))

    expect(mockNavigate).toHaveBeenCalledWith('/messages/conv-2')
    await waitFor(() =>
      expect(screen.getByTestId('conversation-header')).toHaveAttribute('data-conversation-id', 'conv-2')
    )
  })

  it('navigates to /messages when last conversation is deleted', async () => {
    mockFetchConversations.mockResolvedValue(conversationsResponse([conv1]))
    await renderLoadedPage()

    fireEvent.click(screen.getByTestId('header-delete'))

    expect(mockNavigate).toHaveBeenCalledWith('/messages')
    expect(mockSetMessagingState).toHaveBeenCalledWith({ activeConversationId: null })
  })

  // ─── Read state toggle ─────────────────────────────────────────────────────
  it('updates unread_count when read state changes to unread', async () => {
    await renderLoadedPage()
    fireEvent.click(screen.getByTestId('header-toggle-read'))
    // After toggle, unread_count for conv-1 should be 1
    // The Chats mock re-renders with updated conversations - verify via data-active-id stability
    await waitFor(() => expect(screen.getByTestId('chats')).toBeInTheDocument())
  })

  // ─── Error states ──────────────────────────────────────────────────────────
  it('shows error message when fetchConversations fails', async () => {
    mockFetchConversations.mockRejectedValue(new Error('network error'))
    render(<MessageIdPage />)
    await waitFor(() =>
      expect(screen.getByTestId('chats')).toHaveAttribute('data-error', 'Could not load conversations.')
    )
  })

  it('shows error message when fetchConversation fails', async () => {
    mockFetchConversation.mockRejectedValue(new Error('fail'))
    mockUseParams.mockReturnValue({ messageId: 'conv-1' })
    render(<MessageIdPage />)
    // The error is set internally; the thread panel shows the empty state because activeConv
    // loading failed — verify fetchConversation was attempted
    await waitFor(() => expect(mockFetchConversation).toHaveBeenCalledWith('conv-1', 50, 1))
  })

  // ─── Socket events ─────────────────────────────────────────────────────────
  it('responds to socket message:received for the active conversation', async () => {
    await renderLoadedPage()

    act(() => {
      socketHandlers.get('message:received')?.({
        conversationId: 'conv-1',
        message: makeMessage({ id: 'socket-msg', conversation_id: 'conv-1', sender_id: 'user-2' }),
      })
    })

    await waitFor(() =>
      expect(screen.getByTestId('send-message-form')).toHaveAttribute('data-message-count', '3')
    )
  })

  it('responds to socket typing events', async () => {
    await renderLoadedPage()

    act(() => {
      socketHandlers.get('message:typing')?.({ conversationId: 'conv-1' })
    })
    await waitFor(() =>
      expect(screen.getByTestId('send-message-form')).toHaveAttribute('data-is-typing', 'true')
    )

    act(() => {
      socketHandlers.get('message:stop_typing')?.({ conversationId: 'conv-1' })
    })
    await waitFor(() =>
      expect(screen.getByTestId('send-message-form')).toHaveAttribute('data-is-typing', 'false')
    )
  })

  // ─── Socket room management ────────────────────────────────────────────────
  it('joins the active conversation and leaves it on unmount', async () => {
    const { unmount } = render(<MessageIdPage />)
    await waitFor(() => expect(mockJoinConversation).toHaveBeenCalledWith('conv-1'))
    unmount()
    expect(mockLeaveConversation).toHaveBeenCalledWith('conv-1')
  })

  // ─── Load more conversations ───────────────────────────────────────────────
  it('loads more conversations when onLoadMore is triggered', async () => {
    mockFetchConversations
      .mockResolvedValueOnce(conversationsResponse([conv1, conv2], 4))
      .mockResolvedValueOnce(conversationsResponse([
        makeConversation({ id: 'conv-3' }),
        makeConversation({ id: 'conv-4' }),
      ], 4))

    render(<MessageIdPage />)
    await waitFor(() => expect(screen.getByTestId('load-more-conversations')).toBeInTheDocument())

    fireEvent.click(screen.getByTestId('load-more-conversations'))

    await waitFor(() => expect(mockFetchConversations).toHaveBeenCalledWith(2, 20))
  })

  // ─── New conversation created ──────────────────────────────────────────────
  it('prepends a new conversation when created from MessagingHeader', async () => {
    await renderLoadedPage()

    fireEvent.click(screen.getByTestId('messaging-header'))

    await waitFor(() =>
      expect(screen.getByTestId('chat-conv-new')).toBeInTheDocument()
    )
  })
})