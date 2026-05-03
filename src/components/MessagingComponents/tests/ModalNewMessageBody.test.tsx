import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import ModalNewMessageBody from '@/pages/social/messages/ModalNewMessageBody'
import type { RecipientResult } from '@/components/MessagingComponents/RecipientInputBox'

// ─────────────────────────────────────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

const mockStartConversation = vi.fn()
const mockSendMessage = vi.fn()
vi.mock('@/services/api/messaging/conversationApi', () => ({
  startConversation: (...args: unknown[]) => mockStartConversation(...args),
  sendMessage: (...args: unknown[]) => mockSendMessage(...args),
}))

// ── MessageBox mock ──────────────────────────────────────────────────────────

let latestMessageBoxProps: {
  onValueChange: (val: string) => void
  onIsEmptyChange: (empty: boolean) => void
  onEmbedsResolved: (embeds: { type: string; id: string }[]) => void
  onSubmit: () => void
  hasError: boolean
} | null = null

vi.mock('@/components/MessagingComponents/MessageBox', () => ({
  MessageBox: (props: typeof latestMessageBoxProps) => {
    latestMessageBoxProps = props as typeof latestMessageBoxProps
    return (
      <div
        data-testid="message-box"
        data-has-error={String((props as { hasError: boolean }).hasError)}
      />
    )
  },
}))

// ── RecipientInputBox mock ───────────────────────────────────────────────────

let latestRecipientProps: {
  onSelect: (user: { id: string; username: string; display_name: string }) => void
  onClear: () => void
  error: string | null
} | null = null

vi.mock('@/components/MessagingComponents/RecipientInputBox', () => ({
  RecipientInputBox: (props: typeof latestRecipientProps) => {
    latestRecipientProps = props as typeof latestRecipientProps
    return (
      <div
        data-testid="recipient-input-box"
        data-error={(props as { error: string | null }).error ?? ''}
      />
    )
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const mockOnClose = vi.fn()
const mockOnConversationCreated = vi.fn()

const defaultProps = {
  onClose: mockOnClose,
  onConversationCreated: mockOnConversationCreated,
}

const RECIPIENT: RecipientResult = {
  id: 'user-1',
  username: 'johndoe',
  display_name: 'John Doe',
  profile_picture: null,
}

/** Build a well-formed API success response */
function makeResponse(overrides: {
  conversation?: { id: string } | null
  conversation_id?: string
  message?: { id: string; conversation_id?: string; conversationId?: string } | null
} = {}) {
  return {
    data: {
      conversation: { id: 'conv-123' },
      conversation_id: 'conv-123',
      message: { id: 'msg-1', conversation_id: 'conv-123' },
      ...overrides,
    },
  }
}

function renderComponent(
  props: Partial<typeof defaultProps> & { prefilledRecipient?: RecipientResult } = {}
) {
  latestMessageBoxProps = null
  latestRecipientProps = null
  return render(<ModalNewMessageBody {...defaultProps} {...props} />)
}

/** Simulate the user selecting a recipient via the RecipientInputBox callback */
function selectRecipient(user = RECIPIENT) {
  act(() => {
    latestRecipientProps!.onSelect(user)
  })
}

/** Simulate typing into MessageBox */
function typeMessage(text: string) {
  act(() => {
    latestMessageBoxProps!.onValueChange(text)
  })
}

/**
 * Simulate embeds being resolved in MessageBox.
 * Must be awaited so the setEmbeds state update is flushed before clickSend()
 * fires handleSend — otherwise embeds.length is still 0 and lines 70–87 are
 * never entered.
 */
async function resolveEmbeds(embeds: { type: string; id: string }[]) {
  await act(async () => {
    latestMessageBoxProps!.onEmbedsResolved(embeds)
  })
}

/** Simulate the MessageBox firing onIsEmptyChange */
function fireIsEmptyChange(empty: boolean) {
  act(() => {
    latestMessageBoxProps!.onIsEmptyChange(empty)
  })
}

function clickSend() {
  const btn = document.querySelector('[data-test="send-message-button"]') as HTMLElement
  fireEvent.click(btn)
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('ModalNewMessageBody', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStartConversation.mockResolvedValue(makeResponse())
    mockSendMessage.mockResolvedValue({})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Initial rendering ────────────────────────────────────────────────────

  describe('initial rendering', () => {
    it('renders the heading', () => {
      renderComponent()
      expect(screen.getByText('New message')).toBeInTheDocument()
    })

    it('renders the To label', () => {
      renderComponent()
      expect(screen.getByText('To')).toBeInTheDocument()
    })

    it('renders RecipientInputBox when no prefilledRecipient', () => {
      renderComponent()
      expect(screen.getByTestId('recipient-input-box')).toBeInTheDocument()
    })

    it('renders MessageBox', () => {
      renderComponent()
      expect(screen.getByTestId('message-box')).toBeInTheDocument()
    })

    it('renders the Send button', () => {
      renderComponent()
      expect(document.querySelector('[data-test="send-message-button"]')).toBeInTheDocument()
    })

    it('Send button shows "Send" text initially', () => {
      renderComponent()
      expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
    })

    it('MessageBox receives hasError=false initially', () => {
      renderComponent()
      expect(screen.getByTestId('message-box')).toHaveAttribute('data-has-error', 'false')
    })
  })

  // ── prefilledRecipient ───────────────────────────────────────────────────

  describe('prefilledRecipient prop', () => {
    const prefilled: RecipientResult = {
      id: 'user-99',
      username: 'janedoe',
      display_name: 'Jane Doe',
      profile_picture: null,
    }

    it('shows display_name when set', () => {
      renderComponent({ prefilledRecipient: prefilled })
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })

    it('shows username as fallback when display_name is empty', () => {
      renderComponent({ prefilledRecipient: { ...prefilled, display_name: '' } })
      expect(screen.getByText('janedoe')).toBeInTheDocument()
    })

    it('does not render RecipientInputBox when prefilledRecipient is set', () => {
      renderComponent({ prefilledRecipient: prefilled })
      expect(screen.queryByTestId('recipient-input-box')).not.toBeInTheDocument()
    })

    it('uses the prefilled recipient id in startConversation', async () => {
      renderComponent({ prefilledRecipient: prefilled })
      typeMessage('Hello!')
      clickSend()
      await waitFor(() =>
        expect(mockStartConversation).toHaveBeenCalledWith({
          recipient_id: 'user-99',
          body: 'Hello!',
        })
      )
    })
  })

  // ── Validation ───────────────────────────────────────────────────────────

  describe('validation', () => {
    it('shows recipient error when no recipient is selected', async () => {
      renderComponent()
      clickSend()
      await waitFor(() =>
        expect(screen.getByTestId('recipient-input-box')).toHaveAttribute(
          'data-error',
          'Enter a recipient.'
        )
      )
    })

    it('shows message error when no message and no embeds', async () => {
      renderComponent()
      selectRecipient()
      clickSend()
      await waitFor(() =>
        expect(
          screen.getByText('Enter a message or paste a track/playlist link.')
        ).toBeInTheDocument()
      )
    })

    it('shows both errors simultaneously', async () => {
      renderComponent()
      clickSend()
      await waitFor(() => {
        expect(screen.getByTestId('recipient-input-box')).toHaveAttribute(
          'data-error',
          'Enter a recipient.'
        )
        expect(
          screen.getByText('Enter a message or paste a track/playlist link.')
        ).toBeInTheDocument()
      })
    })

    it('clears recipient error immediately when a recipient is selected', async () => {
      renderComponent()
      clickSend()
      await waitFor(() =>
        expect(screen.getByTestId('recipient-input-box')).toHaveAttribute(
          'data-error',
          'Enter a recipient.'
        )
      )
      selectRecipient()
      await waitFor(() =>
        expect(screen.getByTestId('recipient-input-box')).toHaveAttribute('data-error', '')
      )
    })

    it('clears message error when user types text', async () => {
      renderComponent()
      selectRecipient()
      clickSend()
      await waitFor(() =>
        expect(
          screen.getByText('Enter a message or paste a track/playlist link.')
        ).toBeInTheDocument()
      )
      typeMessage('hello')
      await waitFor(() =>
        expect(
          screen.queryByText('Enter a message or paste a track/playlist link.')
        ).not.toBeInTheDocument()
      )
    })

    it('passes hasError=true to MessageBox when message error is active', async () => {
      renderComponent()
      selectRecipient()
      clickSend()
      await waitFor(() =>
        expect(screen.getByTestId('message-box')).toHaveAttribute('data-has-error', 'true')
      )
    })

    it('allows send when no text but embeds are present', async () => {
      renderComponent()
      selectRecipient()
      await resolveEmbeds([{ type: 'track', id: 'track-1' }])
      clickSend()
      await waitFor(() => expect(mockStartConversation).toHaveBeenCalled())
    })
  })

  // ── onIsEmptyChange — line 161 ───────────────────────────────────────────
  //
  // Source: onIsEmptyChange={(empty) => { if (empty) setMessageError(null) }}
  // The `if (empty)` true-branch (line 161) was previously uncovered.

  describe('MessageBox onIsEmptyChange callback — line 161', () => {
    it('clears messageError when the box becomes empty (empty=true)', async () => {
      renderComponent()
      selectRecipient()
      clickSend()
      await waitFor(() =>
        expect(
          screen.getByText('Enter a message or paste a track/playlist link.')
        ).toBeInTheDocument()
      )
      // Fires the `if (empty)` true-branch → setMessageError(null)
      fireIsEmptyChange(true)
      await waitFor(() =>
        expect(
          screen.queryByText('Enter a message or paste a track/playlist link.')
        ).not.toBeInTheDocument()
      )
    })

    it('does NOT clear messageError when empty=false', async () => {
      renderComponent()
      selectRecipient()
      clickSend()
      await waitFor(() =>
        expect(
          screen.getByText('Enter a message or paste a track/playlist link.')
        ).toBeInTheDocument()
      )
      // empty=false → condition is false → no state change
      fireIsEmptyChange(false)
      expect(
        screen.getByText('Enter a message or paste a track/playlist link.')
      ).toBeInTheDocument()
    })

    it('clears send-failure error when box becomes empty', async () => {
      mockStartConversation.mockRejectedValue({ response: { status: 500 } })
      renderComponent()
      selectRecipient()
      typeMessage('hi')
      clickSend()
      await waitFor(() =>
        expect(
          screen.getByText('Failed to send message. Please try again.')
        ).toBeInTheDocument()
      )
      fireIsEmptyChange(true)
      await waitFor(() =>
        expect(
          screen.queryByText('Failed to send message. Please try again.')
        ).not.toBeInTheDocument()
      )
    })
  })

  // ── Sending – plain text (no embeds) ────────────────────────────────────

  describe('sending a plain-text message', () => {
    async function setupAndSend(text = 'Hello world') {
      renderComponent()
      selectRecipient()
      typeMessage(text)
      clickSend()
    }

    it('calls startConversation with recipient_id and trimmed body', async () => {
      await setupAndSend('  Hello world  ')
      await waitFor(() =>
        expect(mockStartConversation).toHaveBeenCalledWith({
          recipient_id: 'user-1',
          body: 'Hello world',
        })
      )
    })

    it('navigates to the conversation after send', async () => {
      await setupAndSend()
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/messages/conv-123'))
    })

    it('calls onClose after successful send', async () => {
      await setupAndSend()
      await waitFor(() => expect(mockOnClose).toHaveBeenCalled())
    })

    it('calls onConversationCreated with conversation and message', async () => {
      await setupAndSend()
      await waitFor(() =>
        expect(mockOnConversationCreated).toHaveBeenCalledWith(
          { id: 'conv-123' },
          { id: 'msg-1', conversation_id: 'conv-123' }
        )
      )
    })

    it('does not call onConversationCreated when conversation is null', async () => {
      mockStartConversation.mockResolvedValue(
        makeResponse({ conversation: null, conversation_id: 'conv-999' })
      )
      renderComponent()
      selectRecipient()
      typeMessage('hello')
      clickSend()
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/messages/conv-999'))
      expect(mockOnConversationCreated).not.toHaveBeenCalled()
    })

    it('shows 403-specific error — line 118', async () => {
      mockStartConversation.mockRejectedValue({ response: { status: 403 } })
      renderComponent()
      selectRecipient()
      typeMessage('hi')
      clickSend()
      await waitFor(() =>
        expect(screen.getByText('Unable to send message to this user.')).toBeInTheDocument()
      )
    })

    it('shows generic error for non-403 failures — line 120', async () => {
      mockStartConversation.mockRejectedValue({ response: { status: 500 } })
      renderComponent()
      selectRecipient()
      typeMessage('hi')
      clickSend()
      await waitFor(() =>
        expect(
          screen.getByText('Failed to send message. Please try again.')
        ).toBeInTheDocument()
      )
    })

    it('shows generic error when rejection has no response object', async () => {
      mockStartConversation.mockRejectedValue(new Error('Network error'))
      renderComponent()
      selectRecipient()
      typeMessage('hi')
      clickSend()
      await waitFor(() =>
        expect(
          screen.getByText('Failed to send message. Please try again.')
        ).toBeInTheDocument()
      )
    })

    it('re-enables send button after an error', async () => {
      mockStartConversation.mockRejectedValue({ response: { status: 500 } })
      renderComponent()
      selectRecipient()
      typeMessage('hi')
      clickSend()
      await waitFor(() =>
        expect(document.querySelector('[data-test="send-message-button"]')).not.toBeDisabled()
      )
    })

    it('does not navigate or close on error', async () => {
      mockStartConversation.mockRejectedValue({ response: { status: 500 } })
      renderComponent()
      selectRecipient()
      typeMessage('hi')
      clickSend()
      await waitFor(() =>
        expect(
          screen.getByText('Failed to send message. Please try again.')
        ).toBeInTheDocument()
      )
      expect(mockNavigate).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('shows Sending… while the request is in flight', async () => {
      let resolve!: (v: unknown) => void
      mockStartConversation.mockReturnValue(new Promise((r) => (resolve = r)))
      renderComponent()
      selectRecipient()
      typeMessage('hi')
      clickSend()
      expect(screen.getByRole('button', { name: 'Sending…' })).toBeInTheDocument()
      act(() => resolve(makeResponse()))
      await waitFor(() => expect(screen.queryByText('Sending…')).not.toBeInTheDocument())
    })

    it('disables send button while sending', async () => {
      let resolve!: (v: unknown) => void
      mockStartConversation.mockReturnValue(new Promise((r) => (resolve = r)))
      renderComponent()
      selectRecipient()
      typeMessage('hi')
      clickSend()
      expect(document.querySelector('[data-test="send-message-button"]')).toBeDisabled()
      act(() => resolve(makeResponse()))
      await waitFor(() =>
        expect(document.querySelector('[data-test="send-message-button"]')).not.toBeDisabled()
      )
    })

    it('ignores duplicate clicks while isSending=true', async () => {
      let resolve!: (v: unknown) => void
      mockStartConversation.mockReturnValue(new Promise((r) => (resolve = r)))
      renderComponent()
      selectRecipient()
      typeMessage('hi')
      clickSend()
      clickSend()
      act(() => resolve(makeResponse()))
      await waitFor(() => expect(mockStartConversation).toHaveBeenCalledTimes(1))
    })

    it('works without onConversationCreated prop — optional chaining', async () => {
      render(<ModalNewMessageBody onClose={mockOnClose} />)
      selectRecipient()
      typeMessage('hi')
      clickSend()
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/messages/conv-123'))
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('returns early without navigating when conversationId is missing from response', async () => {
      mockStartConversation.mockResolvedValue({ data: {} })
      renderComponent()
      selectRecipient()
      typeMessage('hi')
      clickSend()
      await waitFor(() => expect(mockStartConversation).toHaveBeenCalled())
      expect(mockNavigate).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  // ── conversationId resolution priority (plain-text branch) ──────────────

  describe('conversationId resolution – plain-text branch', () => {
    it('prefers conversation.id', async () => {
      mockStartConversation.mockResolvedValue(
        makeResponse({ conversation: { id: 'pref-conv' }, conversation_id: 'other' })
      )
      renderComponent()
      selectRecipient()
      typeMessage('hi')
      clickSend()
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/messages/pref-conv'))
    })

    it('falls back to conversation_id when conversation is null', async () => {
      mockStartConversation.mockResolvedValue(
        makeResponse({ conversation: null, conversation_id: 'fallback-field' })
      )
      renderComponent()
      selectRecipient()
      typeMessage('hi')
      clickSend()
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/messages/fallback-field')
      )
    })

    it('falls back to message.conversation_id', async () => {
      mockStartConversation.mockResolvedValue({
        data: {
          conversation: null,
          conversation_id: undefined,
          message: { id: 'msg-1', conversation_id: 'msg-conv' },
        },
      })
      renderComponent()
      selectRecipient()
      typeMessage('hi')
      clickSend()
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/messages/msg-conv'))
    })

    it('falls back to message.conversationId (camelCase)', async () => {
      mockStartConversation.mockResolvedValue({
        data: {
          conversation: null,
          conversation_id: undefined,
          message: { id: 'msg-1', conversationId: 'camel-conv' },
        },
      })
      renderComponent()
      selectRecipient()
      typeMessage('hi')
      clickSend()
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/messages/camel-conv'))
    })
  })

  // ── Sending with embeds — lines 70–87 ───────────────────────────────────
  //
  // KEY FIX: resolveEmbeds() is now `async` and uses `await act(async () => …)`
  // so the setEmbeds state update is fully committed before clickSend() runs.
  // Without the await, embeds.length === 0 inside handleSend and the else-branch
  // (lines 70–87) is never entered, leaving those lines uncovered.

  describe('sending with embeds — lines 70–87', () => {
    const single = [{ type: 'track', id: 'track-1' }]
    const multi = [
      { type: 'track', id: 'track-1' },
      { type: 'playlist', id: 'pl-1' },
      { type: 'track', id: 'track-2' },
    ]

    it('enters embed branch and calls startConversation with resource — lines 70–79', async () => {
      renderComponent()
      selectRecipient()
      await resolveEmbeds(single)
      clickSend()
      await waitFor(() =>
        expect(mockStartConversation).toHaveBeenCalledWith({
          recipient_id: 'user-1',
          resource: { type: 'track', id: 'track-1' },
        })
      )
    })

    it('includes body text when both embed and message are present', async () => {
      renderComponent()
      selectRecipient()
      await resolveEmbeds(single)
      typeMessage('Listen to this')
      clickSend()
      await waitFor(() =>
        expect(mockStartConversation).toHaveBeenCalledWith({
          recipient_id: 'user-1',
          body: 'Listen to this',
          resource: { type: 'track', id: 'track-1' },
        })
      )
    })

    it('calls sendMessage for each embed after the first — loop body lines 86–90', async () => {
      renderComponent()
      selectRecipient()
      await resolveEmbeds(multi)
      clickSend()
      await waitFor(() => expect(mockSendMessage).toHaveBeenCalledTimes(2))
      expect(mockSendMessage).toHaveBeenCalledWith('conv-123', {
        resource: { type: 'playlist', id: 'pl-1' },
      })
      expect(mockSendMessage).toHaveBeenCalledWith('conv-123', {
        resource: { type: 'track', id: 'track-2' },
      })
    })

    it('skips sendMessage loop when only one embed — false branch of line 85', async () => {
      renderComponent()
      selectRecipient()
      await resolveEmbeds(single)
      clickSend()
      await waitFor(() => expect(mockStartConversation).toHaveBeenCalled())
      expect(mockSendMessage).not.toHaveBeenCalled()
    })

    it('skips sendMessage loop when inner conversationId is null — line 85 guard=false', async () => {
      mockStartConversation.mockResolvedValue({ data: {} })
      renderComponent()
      selectRecipient()
      await resolveEmbeds(multi)
      clickSend()
      await waitFor(() => expect(mockStartConversation).toHaveBeenCalled())
      expect(mockSendMessage).not.toHaveBeenCalled()
    })

    // ── Inner conversationId resolution sub-branches (lines 80–84) ──────

    it('uses conversation.id for inner conversationId', async () => {
      mockStartConversation.mockResolvedValue(
        makeResponse({ conversation: { id: 'inner-conv' }, conversation_id: 'other' })
      )
      renderComponent()
      selectRecipient()
      await resolveEmbeds(multi)
      clickSend()
      await waitFor(() => expect(mockSendMessage).toHaveBeenCalledTimes(2))
      expect(mockSendMessage).toHaveBeenCalledWith('inner-conv', expect.any(Object))
    })

    it('falls back to typed.data.conversation_id for inner conversationId', async () => {
      mockStartConversation.mockResolvedValue(
        makeResponse({ conversation: null, conversation_id: 'inner-field' })
      )
      renderComponent()
      selectRecipient()
      await resolveEmbeds(multi)
      clickSend()
      await waitFor(() => expect(mockSendMessage).toHaveBeenCalledTimes(2))
      expect(mockSendMessage).toHaveBeenCalledWith('inner-field', expect.any(Object))
    })

    it('falls back to firstMessage.conversation_id for inner conversationId', async () => {
      mockStartConversation.mockResolvedValue({
        data: {
          conversation: null,
          conversation_id: undefined,
          message: { id: 'msg-1', conversation_id: 'inner-msg-conv' },
        },
      })
      renderComponent()
      selectRecipient()
      await resolveEmbeds(multi)
      clickSend()
      await waitFor(() => expect(mockSendMessage).toHaveBeenCalledTimes(2))
      expect(mockSendMessage).toHaveBeenCalledWith('inner-msg-conv', expect.any(Object))
    })

    it('falls back to firstMessage.conversationId (camelCase) for inner conversationId', async () => {
      mockStartConversation.mockResolvedValue({
        data: {
          conversation: null,
          conversation_id: undefined,
          message: { id: 'msg-1', conversationId: 'inner-camel' },
        },
      })
      renderComponent()
      selectRecipient()
      await resolveEmbeds(multi)
      clickSend()
      await waitFor(() => expect(mockSendMessage).toHaveBeenCalledTimes(2))
      expect(mockSendMessage).toHaveBeenCalledWith('inner-camel', expect.any(Object))
    })

    it('navigates after embed send', async () => {
      renderComponent()
      selectRecipient()
      await resolveEmbeds(single)
      clickSend()
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/messages/conv-123'))
    })

    it('calls onClose after embed send', async () => {
      renderComponent()
      selectRecipient()
      await resolveEmbeds(single)
      clickSend()
      await waitFor(() => expect(mockOnClose).toHaveBeenCalled())
    })

    it('calls onConversationCreated after embed send when conversation exists', async () => {
      renderComponent()
      selectRecipient()
      await resolveEmbeds(single)
      clickSend()
      await waitFor(() =>
        expect(mockOnConversationCreated).toHaveBeenCalledWith(
          { id: 'conv-123' },
          { id: 'msg-1', conversation_id: 'conv-123' }
        )
      )
    })

    it('does not call onConversationCreated when conversation is null in embed path', async () => {
      mockStartConversation.mockResolvedValue(
        makeResponse({ conversation: null, conversation_id: 'embed-999' })
      )
      renderComponent()
      selectRecipient()
      await resolveEmbeds(single)
      clickSend()
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/messages/embed-999'))
      expect(mockOnConversationCreated).not.toHaveBeenCalled()
    })

    it('returns early without navigating when embed conversationId is missing', async () => {
      mockStartConversation.mockResolvedValue({ data: {} })
      renderComponent()
      selectRecipient()
      await resolveEmbeds(single)
      clickSend()
      await waitFor(() => expect(mockStartConversation).toHaveBeenCalled())
      expect(mockNavigate).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('shows 403 error on embed send failure — line 118 via embed path', async () => {
      mockStartConversation.mockRejectedValue({ response: { status: 403 } })
      renderComponent()
      selectRecipient()
      await resolveEmbeds(single)
      clickSend()
      await waitFor(() =>
        expect(screen.getByText('Unable to send message to this user.')).toBeInTheDocument()
      )
    })

    it('shows generic error on embed send failure', async () => {
      mockStartConversation.mockRejectedValue({ response: { status: 500 } })
      renderComponent()
      selectRecipient()
      await resolveEmbeds(single)
      clickSend()
      await waitFor(() =>
        expect(
          screen.getByText('Failed to send message. Please try again.')
        ).toBeInTheDocument()
      )
    })
  })

  // ── Recipient clear ──────────────────────────────────────────────────────

  describe('RecipientInputBox onClear', () => {
    it('clears selected so the next send shows recipient error', async () => {
      renderComponent()
      selectRecipient()
      act(() => {
        latestRecipientProps!.onClear()
      })
      typeMessage('hello')
      clickSend()
      await waitFor(() =>
        expect(screen.getByTestId('recipient-input-box')).toHaveAttribute(
          'data-error',
          'Enter a recipient.'
        )
      )
    })
  })

  // ── MessageBox onSubmit ──────────────────────────────────────────────────

  describe('MessageBox onSubmit callback', () => {
    it('triggers handleSend from keyboard submit', async () => {
      renderComponent()
      selectRecipient()
      typeMessage('keyboard submit')
      act(() => {
        latestMessageBoxProps!.onSubmit()
      })
      await waitFor(() => expect(mockStartConversation).toHaveBeenCalled())
    })
  })
})