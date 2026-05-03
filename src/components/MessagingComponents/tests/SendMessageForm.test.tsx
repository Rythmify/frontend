import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockSendMessage = vi.fn()
const mockEmitMessageSent = vi.fn()
const mockEmitStopTyping = vi.fn()
const mockUseAuthStore = vi.fn()
let mockObserver: { observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>; unobserve: ReturnType<typeof vi.fn> }
let intersectionCallback: IntersectionObserverCallback = () => {}

vi.mock('@/services/api/messaging/conversationApi', () => ({
  sendMessage: (...args: unknown[]) => mockSendMessage(...args),
}))

vi.mock('@/services/api/messaging/socketService', () => ({
  emitMessageSent: (...args: unknown[]) => mockEmitMessageSent(...args),
  emitStopTyping: (...args: unknown[]) => mockEmitStopTyping(...args),
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: (selector: (state: { user: { id: string; displayName: string; username: string; avatar: string | null; role: string } | null }) => unknown) =>
    mockUseAuthStore(selector),
}))

vi.mock('../MessageBox', () => ({
  MessageBox: ({
    onValueChange,
    onIsEmptyChange,
    onEmbedsResolved,
    hasError,
  }: {
    onValueChange?: (v: string) => void
    onIsEmptyChange?: (e: boolean) => void
    onEmbedsResolved?: (e: unknown[]) => void
    hasError?: boolean
  }) => (
    <div data-test="message-box" data-has-error={String(hasError)}>
      <textarea
        data-test="message-input"
        onChange={(e) => {
          onValueChange?.(e.target.value)
          onIsEmptyChange?.(e.target.value === '')
        }}
      />
      <button data-test="resolve-embed" onClick={() => onEmbedsResolved?.([])}>
        clear embeds
      </button>
    </div>
  ),
}))

vi.mock('../messagecell', () => ({
  default: ({ message, displayName }: { message: { id: string; body: string }; displayName: string }) => (
    <div data-test={`message-cell-${message.id}`} data-display={displayName}>
      {message.body}
    </div>
  ),
}))

vi.mock('../TrackPlaylistPicker', () => ({
  default: ({ onPick, onClose }: { onPick: (item: unknown) => void; onClose: () => void }) => (
    <div data-test="track-playlist-picker">
      <button
        data-test="picker-pick-track"
        onClick={() =>
          onPick({ type: 'track', id: 't1', title: 'My Track', artistName: 'Artist', coverImage: null })
        }
      >
        Pick Track
      </button>
      <button
        data-test="picker-pick-playlist"
        onClick={() =>
          onPick({ type: 'playlist', id: 'p1', title: 'My Playlist', trackCount: 12, coverImage: null })
        }
      >
        Pick Playlist
      </button>
      <button data-test="picker-close" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}))

import SendMessageForm from '../SendMessageForm'
import type { Message } from '@/services/api/messaging/conversationApi'

function makeMessage(id: string, body: string, senderId = 'user-1'): Message {
  return {
    id,
    body,
    embed_type: null,
    embed_id: null,
    sender_id: senderId,
    created_at: new Date().toISOString(),
    conversation_id: 'conv-1',
    is_read: false,
  } as Message
}

function setScrollHeight(element: Element, value: number) {
  Object.defineProperty(element, 'scrollHeight', {
    configurable: true,
    value,
  })
}

const defaultProps = {
  conversationId: 'conv-1',
  existingMessages: [],
  loadingMessages: false,
  hasMoreMessages: false,
  onLoadMore: vi.fn(),
  onMessageSent: vi.fn(),
  isTyping: false,
  ParticipantInfo: { display_name: 'Bob', profile_picture: null },
}

describe('SendMessageForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({ user: { id: 'user-1', displayName: 'Alice', username: 'alice', avatar: null, role: 'listener' } })
    )
    mockSendMessage.mockResolvedValue({ data: makeMessage('new-msg', 'Hello') })

    // IntersectionObserver mock — must use `function`, not an arrow, so `new` works
    mockObserver = { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() }
    intersectionCallback = () => {}
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (callback: IntersectionObserverCallback) {
        intersectionCallback = callback
        return mockObserver
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('rendering', () => {
    it('renders the form container', () => {
      render(<SendMessageForm {...defaultProps} />)
      expect(screen.getByTestId('send-message-form')).toBeInTheDocument()
    })

    it('renders the message list area', () => {
      render(<SendMessageForm {...defaultProps} />)
      expect(screen.getByTestId('send-message-list')).toBeInTheDocument()
    })

    it('renders the MessageBox', () => {
      render(<SendMessageForm {...defaultProps} />)
      expect(screen.getByTestId('message-box')).toBeInTheDocument()
    })

    it('renders the Send button', () => {
      render(<SendMessageForm {...defaultProps} />)
      expect(screen.getByTestId('send-message-button')).toHaveTextContent('Send')
    })

    it('renders existing messages', () => {
      const messages = [makeMessage('m1', 'Hi'), makeMessage('m2', 'Hey')]
      render(<SendMessageForm {...defaultProps} existingMessages={messages} />)
      expect(screen.getByTestId('message-cell-m1')).toBeInTheDocument()
      expect(screen.getByTestId('message-cell-m2')).toBeInTheDocument()
    })

    it('renders loading state when loadingMessages and messages are empty', () => {
      render(<SendMessageForm {...defaultProps} loadingMessages={true} existingMessages={[]} />)
      expect(screen.getByTestId('send-message-loading')).toBeInTheDocument()
    })

    it('renders "Loading older messages…" when loadingMessages and hasMoreMessages', () => {
      render(
        <SendMessageForm
          {...defaultProps}
          loadingMessages={true}
          hasMoreMessages={true}
          existingMessages={[makeMessage('m1', 'Hi')]}
        />
      )
      expect(screen.getByTestId('send-message-loading-more')).toBeInTheDocument()
    })

    it('renders typing indicator when isTyping is true', () => {
      render(<SendMessageForm {...defaultProps} isTyping={true} />)
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
    })

    it('does not render typing indicator when isTyping is false', () => {
      render(<SendMessageForm {...defaultProps} isTyping={false} />)
      expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument()
    })

    it('does not show track/playlist picker button for non-artist user', () => {
      render(<SendMessageForm {...defaultProps} />)
      expect(screen.queryByTestId('add-track-playlist-button')).not.toBeInTheDocument()
    })

    it('shows track/playlist picker button for artist user', () => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ user: { id: 'user-1', displayName: 'Alice', username: 'alice', avatar: null, role: 'artist' } })
      )
      render(<SendMessageForm {...defaultProps} />)
      expect(screen.getByTestId('add-track-playlist-button')).toBeInTheDocument()
    })
  })

  describe('sending messages', () => {
    it('shows error when Send is clicked with empty message and no embeds', async () => {
      render(<SendMessageForm {...defaultProps} />)
      await userEvent.click(screen.getByTestId('send-message-button'))
      expect(screen.getByTestId('send-message-error')).toHaveTextContent(
        'Enter a message or paste a track/playlist link'
      )
    })

    it('calls sendMessage when a message is typed and Send is clicked', async () => {
      render(<SendMessageForm {...defaultProps} />)
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello Bob' } })
      await userEvent.click(screen.getByTestId('send-message-button'))
      await waitFor(() => expect(mockSendMessage).toHaveBeenCalledWith('conv-1', { body: 'Hello Bob' }))
    })

    it('calls onMessageSent after successful send', async () => {
      const onMessageSent = vi.fn()
      render(<SendMessageForm {...defaultProps} onMessageSent={onMessageSent} />)
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } })
      await userEvent.click(screen.getByTestId('send-message-button'))
      await waitFor(() => expect(onMessageSent).toHaveBeenCalled())
    })

    it('calls emitMessageSent after successful send', async () => {
      render(<SendMessageForm {...defaultProps} />)
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } })
      await userEvent.click(screen.getByTestId('send-message-button'))
      await waitFor(() => expect(mockEmitMessageSent).toHaveBeenCalledWith('conv-1', expect.anything()))
    })

    it('calls emitStopTyping after sending', async () => {
      render(<SendMessageForm {...defaultProps} />)
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } })
      await userEvent.click(screen.getByTestId('send-message-button'))
      await waitFor(() => expect(mockEmitStopTyping).toHaveBeenCalledWith('conv-1'))
    })

    it('shows "Sending…" while sending', async () => {
      mockSendMessage.mockReturnValue(new Promise(() => {}))
      render(<SendMessageForm {...defaultProps} />)
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } })
      await userEvent.click(screen.getByTestId('send-message-button'))
      expect(screen.getByTestId('send-message-button')).toHaveTextContent('Sending…')
    })

    it('disables send button while sending', async () => {
      mockSendMessage.mockReturnValue(new Promise(() => {}))
      render(<SendMessageForm {...defaultProps} />)
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } })
      await userEvent.click(screen.getByTestId('send-message-button'))
      expect(screen.getByTestId('send-message-button')).toBeDisabled()
    })

    it('shows generic error when sendMessage throws', async () => {
      mockSendMessage.mockRejectedValue(new Error('fail'))
      render(<SendMessageForm {...defaultProps} />)
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } })
      await userEvent.click(screen.getByTestId('send-message-button'))
      await waitFor(() =>
        expect(screen.getByTestId('send-message-error')).toHaveTextContent('Failed to send message')
      )
    })

    it('shows 403 error message when sendMessage returns 403', async () => {
      mockSendMessage.mockRejectedValue({ response: { status: 403 } })
      render(<SendMessageForm {...defaultProps} />)
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } })
      await userEvent.click(screen.getByTestId('send-message-button'))
      await waitFor(() =>
        expect(screen.getByTestId('send-message-error')).toHaveTextContent('Unable to send message to this user.')
      )
    })

    it('sends via Enter key in the composer', async () => {
      render(<SendMessageForm {...defaultProps} />)
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } })
      const composer = screen.getByTestId('message-input').closest('.shrink-0')!
      fireEvent.keyDown(composer, { key: 'Enter', shiftKey: false })
      await waitFor(() => expect(mockSendMessage).toHaveBeenCalled())
    })

    it('does not send via Shift+Enter in the composer', () => {
      render(<SendMessageForm {...defaultProps} />)
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } })
      const composer = screen.getByTestId('message-input').closest('.shrink-0')!
      fireEvent.keyDown(composer, { key: 'Enter', shiftKey: true })
      expect(mockSendMessage).not.toHaveBeenCalled()
    })

    it('clears empty-message error when MessageBox reports empty content', async () => {
      render(<SendMessageForm {...defaultProps} />)
      await userEvent.click(screen.getByTestId('send-message-button'))
      expect(screen.getByTestId('send-message-error')).toBeInTheDocument()
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'x' } })
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: '' } })
      expect(screen.queryByTestId('send-message-error')).not.toBeInTheDocument()
    })
  })

  describe('loading older messages', () => {
    it('calls onLoadMore when the top sentinel intersects and more messages exist', () => {
      const onLoadMore = vi.fn()
      render(<SendMessageForm {...defaultProps} hasMoreMessages={true} onLoadMore={onLoadMore} />)
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
      expect(onLoadMore).toHaveBeenCalled()
    })

    it('does not load more when sentinel is not intersecting', () => {
      const onLoadMore = vi.fn()
      render(<SendMessageForm {...defaultProps} hasMoreMessages={true} onLoadMore={onLoadMore} />)
      intersectionCallback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver)
      expect(onLoadMore).not.toHaveBeenCalled()
    })

    it('does not load more while messages are already loading', () => {
      const onLoadMore = vi.fn()
      render(
        <SendMessageForm
          {...defaultProps}
          hasMoreMessages={true}
          loadingMessages={true}
          existingMessages={[makeMessage('m1', 'Hi')]}
          onLoadMore={onLoadMore}
        />
      )
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
      expect(onLoadMore).not.toHaveBeenCalled()
    })

    it('does not load more when there are no older messages', () => {
      const onLoadMore = vi.fn()
      render(<SendMessageForm {...defaultProps} hasMoreMessages={false} onLoadMore={onLoadMore} />)
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
      expect(onLoadMore).not.toHaveBeenCalled()
    })
  })

  describe('scroll management', () => {
    it('scrolls to the bottom when messages load for the first time', () => {
      const { rerender } = render(<SendMessageForm {...defaultProps} existingMessages={[]} />)
      const list = screen.getByTestId('send-message-list')
      setScrollHeight(list, 420)

      rerender(<SendMessageForm {...defaultProps} existingMessages={[makeMessage('m1', 'Hello')]} />)

      expect(list.scrollTop).toBe(420)
    })

    it('scrolls to the bottom when a newer message is appended', () => {
      const { rerender } = render(
        <SendMessageForm {...defaultProps} existingMessages={[makeMessage('m1', 'Hello')]} />
      )
      const list = screen.getByTestId('send-message-list')
      setScrollHeight(list, 640)

      rerender(
        <SendMessageForm
          {...defaultProps}
          existingMessages={[makeMessage('m1', 'Hello'), makeMessage('m2', 'New message')]}
        />
      )

      expect(list.scrollTop).toBe(640)
    })

    it('preserves scroll position when older messages are prepended', () => {
      const onLoadMore = vi.fn()
      const { rerender } = render(
        <SendMessageForm
          {...defaultProps}
          hasMoreMessages={true}
          existingMessages={[makeMessage('m2', 'Newest')]}
          onLoadMore={onLoadMore}
        />
      )
      const list = screen.getByTestId('send-message-list')
      setScrollHeight(list, 300)

      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
      setScrollHeight(list, 500)

      rerender(
        <SendMessageForm
          {...defaultProps}
          hasMoreMessages={true}
          existingMessages={[makeMessage('m1', 'Older'), makeMessage('m2', 'Newest')]}
          onLoadMore={onLoadMore}
        />
      )

      expect(list.scrollTop).toBe(200)
    })
  })

  describe('message display', () => {
    it('uses Alice display name for messages sent by the current user', () => {
      const messages = [makeMessage('m1', 'Hi from Alice', 'user-1')]
      render(<SendMessageForm {...defaultProps} existingMessages={messages} />)
      expect(screen.getByTestId('message-cell-m1')).toHaveAttribute('data-display', 'Alice')
    })

    it('uses participant display name for messages from others', () => {
      const messages = [makeMessage('m1', 'Hi from Bob', 'user-2')]
      render(<SendMessageForm {...defaultProps} existingMessages={messages} />)
      expect(screen.getByTestId('message-cell-m1')).toHaveAttribute('data-display', 'Bob')
    })
  })

  describe('track picker (artist only)', () => {
    beforeEach(() => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ user: { id: 'user-1', displayName: 'Alice', username: 'alice', avatar: null, role: 'artist' } })
      )
    })

    it('opens picker when Add track or playlist is clicked', async () => {
      render(<SendMessageForm {...defaultProps} />)
      await userEvent.click(screen.getByTestId('add-track-playlist-button'))
      expect(screen.getByTestId('track-playlist-picker')).toBeInTheDocument()
    })

    it('closes picker when close is clicked inside picker', async () => {
      render(<SendMessageForm {...defaultProps} />)
      await userEvent.click(screen.getByTestId('add-track-playlist-button'))
      await userEvent.click(screen.getByTestId('picker-close'))
      expect(screen.queryByTestId('track-playlist-picker')).not.toBeInTheDocument()
    })

    it('toggles picker off when button is clicked again', async () => {
      render(<SendMessageForm {...defaultProps} />)
      await userEvent.click(screen.getByTestId('add-track-playlist-button'))
      await userEvent.click(screen.getByTestId('add-track-playlist-button'))
      expect(screen.queryByTestId('track-playlist-picker')).not.toBeInTheDocument()
    })

    it('sends a picked track as an embed resource', async () => {
      render(<SendMessageForm {...defaultProps} />)
      await userEvent.click(screen.getByTestId('add-track-playlist-button'))
      await userEvent.click(screen.getByTestId('picker-pick-track'))
      await userEvent.click(screen.getByTestId('send-message-button'))
      await waitFor(() =>
        expect(mockSendMessage).toHaveBeenCalledWith('conv-1', {
          resource: { type: 'track', id: 't1' },
        })
      )
    })

    it('sends a picked playlist as an embed resource', async () => {
      render(<SendMessageForm {...defaultProps} />)
      await userEvent.click(screen.getByTestId('add-track-playlist-button'))
      await userEvent.click(screen.getByTestId('picker-pick-playlist'))
      await userEvent.click(screen.getByTestId('send-message-button'))
      await waitFor(() =>
        expect(mockSendMessage).toHaveBeenCalledWith('conv-1', {
          resource: { type: 'playlist', id: 'p1' },
        })
      )
    })
  })
})
