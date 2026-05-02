import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const mockNavigate = vi.fn()
const mockMarkMessageReadState = vi.fn()
const mockUnblockUser = vi.fn()
const mockFetchFollowStatus = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/services/api/messaging/conversationApi', () => ({
  markMessageReadState: (...args: unknown[]) => mockMarkMessageReadState(...args),
  unblockUser: (...args: unknown[]) => mockUnblockUser(...args),
  fetchFollowStatus: (...args: unknown[]) => mockFetchFollowStatus(...args),
}))

vi.mock('@/components/MessagingComponents/DeleteConversationButton', () => ({
  default: ({ onDeleted, conversationId }: { onDeleted?: (id: string) => void; conversationId: string }) => (
    <button data-test="delete-conversation-button" onClick={() => onDeleted?.(conversationId)}>Delete</button>
  ),
}))

vi.mock('../Modal', () => ({
  Modal: ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) =>
    isOpen ? <div data-test="modal">{children}<button data-test="modal-close" onClick={onClose} /></div> : null,
}))

vi.mock('@/components/UI/BlockModal', () => ({
  BlockUserModal: ({ onClose, onBlocked }: { onClose: () => void; onBlocked: () => void }) => (
    <div data-test="block-modal">
      <button data-test="block-confirm" onClick={onBlocked}>Block</button>
      <button data-test="block-close" onClick={onClose}>Cancel</button>
    </div>
  ),
}))

vi.mock('@/components/UI/ReportModal', () => ({
  ReportModal: ({ onClose, onSpamSelected }: { onClose: () => void; onSpamSelected: () => void }) => (
    <div data-test="report-modal">
      <button data-test="report-spam" onClick={onSpamSelected}>Spam</button>
      <button data-test="report-close" onClick={onClose}>Close</button>
    </div>
  ),
}))

vi.mock('@/components/UI/SpamModal', () => ({
  SpamModal: ({ onClose }: { onClose: () => void }) => (
    <div data-test="spam-modal">
      <button data-test="spam-close" onClick={onClose}>Close</button>
    </div>
  ),
}))

vi.mock('@/components/UI/Tooltip', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import ConversationHeader from '../ConversationHeader'

const defaultProps = {
  reciepiantId: 'user-2',
  conversationId: 'conv-1',
  recipientName: 'John',
  lastMessageId: 'msg-1',
  onReadStateChange: vi.fn(),
  onDeleted: vi.fn(),
  onBack: vi.fn(),
}

function renderHeader(props = {}) {
  return render(
    <MemoryRouter>
      <ConversationHeader {...defaultProps} {...props} />
    </MemoryRouter>
  )
}

describe('ConversationHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchFollowStatus.mockResolvedValue({ data: { is_blocking: false } })
    mockMarkMessageReadState.mockResolvedValue({})
    mockUnblockUser.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('renders the header container', async () => {
      renderHeader()
      expect(screen.getByTestId('conversation-header')).toBeInTheDocument()
    })

    it('renders the recipient name button', async () => {
      renderHeader()
      expect(screen.getByTestId('conversation-profile-button')).toHaveTextContent('John')
    })

    it('renders the back button when onBack is provided', async () => {
      renderHeader()
      expect(screen.getByTestId('conversation-back-button')).toBeInTheDocument()
    })

    it('does not render back button when onBack is not provided', async () => {
      renderHeader({ onBack: undefined })
      expect(screen.queryByTestId('conversation-back-button')).not.toBeInTheDocument()
    })

    it('renders the delete button', async () => {
      renderHeader()
      expect(screen.getByTestId('delete-conversation-button')).toBeInTheDocument()
    })

    it('renders mobile menu button', async () => {
      renderHeader()
      expect(screen.getByTestId('conversation-mobile-menu-btn')).toBeInTheDocument()
    })

    it('initially shows "Mark as unread" on desktop button', async () => {
      renderHeader()
      expect(screen.getByTestId('conversation-toggle-read-button')).toHaveTextContent('Mark as unread')
    })

    it('loads block status on mount', async () => {
      renderHeader()
      await waitFor(() => expect(mockFetchFollowStatus).toHaveBeenCalledWith('user-2'))
    })

    it('shows Block button when user is not blocked', async () => {
      mockFetchFollowStatus.mockResolvedValue({ data: { is_blocking: false } })
      renderHeader()
      await waitFor(() => expect(screen.getByTestId('conversation-block-button')).toHaveTextContent('Block'))
    })

    it('shows Unblock button when user is blocked', async () => {
      mockFetchFollowStatus.mockResolvedValue({ data: { is_blocking: true } })
      renderHeader()
      await waitFor(() => expect(screen.getByTestId('conversation-block-button')).toHaveTextContent('Unblock'))
    })
  })

  describe('navigation', () => {
    it('navigates to recipient profile on name click', async () => {
      renderHeader({ recipientName: 'John' })
      await userEvent.click(screen.getByTestId('conversation-profile-button'))
      expect(mockNavigate).toHaveBeenCalledWith('/John')
    })

    it('calls onBack when back button is clicked', async () => {
      const onBack = vi.fn()
      renderHeader({ onBack })
      await userEvent.click(screen.getByTestId('conversation-back-button'))
      expect(onBack).toHaveBeenCalled()
    })
  })

  describe('read state toggle', () => {
    it('calls markMessageReadState when toggle read button is clicked', async () => {
      renderHeader()
      await userEvent.click(screen.getByTestId('conversation-toggle-read-button'))
      await waitFor(() => expect(mockMarkMessageReadState).toHaveBeenCalledWith('conv-1', 'msg-1', false))
    })

    it('toggles button text to "Mark as read" after marking unread', async () => {
      renderHeader()
      await userEvent.click(screen.getByTestId('conversation-toggle-read-button'))
      await waitFor(() => expect(screen.getByTestId('conversation-toggle-read-button')).toHaveTextContent('Mark as read'))
    })

    it('calls onReadStateChange after toggling', async () => {
      const onReadStateChange = vi.fn()
      renderHeader({ onReadStateChange })
      await userEvent.click(screen.getByTestId('conversation-toggle-read-button'))
      await waitFor(() => expect(onReadStateChange).toHaveBeenCalledWith(true))
    })

    it('disables toggle read button when lastMessageId is null', async () => {
      renderHeader({ lastMessageId: null })
      expect(screen.getByTestId('conversation-toggle-read-button')).toBeDisabled()
    })

    it('resets isUnread to false when conversationId changes', async () => {
      const { rerender } = renderHeader()
      await userEvent.click(screen.getByTestId('conversation-toggle-read-button'))
      await waitFor(() => expect(screen.getByTestId('conversation-toggle-read-button')).toHaveTextContent('Mark as read'))
      rerender(
        <MemoryRouter>
          <ConversationHeader {...defaultProps} conversationId="conv-2" />
        </MemoryRouter>
      )
      await waitFor(() => expect(screen.getByTestId('conversation-toggle-read-button')).toHaveTextContent('Mark as unread'))
    })
  })

  describe('block flow', () => {
    it('opens block modal when Block button is clicked (not blocked)', async () => {
      mockFetchFollowStatus.mockResolvedValue({ data: { is_blocking: false } })
      renderHeader()
      await waitFor(() => screen.getByTestId('conversation-block-button'))
      await userEvent.click(screen.getByTestId('conversation-block-button'))
      expect(screen.getByTestId('block-modal')).toBeInTheDocument()
    })

    it('calls unblockUser when Unblock is clicked', async () => {
      mockFetchFollowStatus.mockResolvedValue({ data: { is_blocking: true } })
      renderHeader()
      await waitFor(() => expect(screen.getByTestId('conversation-block-button')).toHaveTextContent('Unblock'))
      await userEvent.click(screen.getByTestId('conversation-block-button'))
      await waitFor(() => expect(mockUnblockUser).toHaveBeenCalledWith('user-2'))
    })

    it('sets isBlocked to true after onBlocked callback from BlockUserModal', async () => {
      mockFetchFollowStatus.mockResolvedValue({ data: { is_blocking: false } })
      renderHeader()
      await waitFor(() => screen.getByTestId('conversation-block-button'))
      await userEvent.click(screen.getByTestId('conversation-block-button'))
      await userEvent.click(screen.getByTestId('block-confirm'))
      await waitFor(() => expect(screen.getByTestId('conversation-block-button')).toHaveTextContent('Unblock'))
    })
  })

  describe('report flow', () => {
    it('opens report modal when Report button is clicked', async () => {
      renderHeader()
      await userEvent.click(screen.getByTestId('conversation-report-button'))
      expect(screen.getByTestId('report-modal')).toBeInTheDocument()
    })

    it('opens spam modal when spam is selected in report modal', async () => {
      renderHeader()
      await userEvent.click(screen.getByTestId('conversation-report-button'))
      await userEvent.click(screen.getByTestId('report-spam'))
      await waitFor(() => expect(screen.getByTestId('spam-modal')).toBeInTheDocument())
    })
  })

  describe('mobile menu', () => {
    it('opens mobile menu when ... button is clicked', async () => {
      renderHeader()
      await userEvent.click(screen.getByTestId('conversation-mobile-menu-btn'))
      expect(screen.getByTestId('conversation-block-button-mobile')).toBeInTheDocument()
    })

    it('closes mobile menu after clicking block in mobile menu', async () => {
      mockFetchFollowStatus.mockResolvedValue({ data: { is_blocking: false } })
      renderHeader()
      await waitFor(() => screen.getByTestId('conversation-mobile-menu-btn'))
      await userEvent.click(screen.getByTestId('conversation-mobile-menu-btn'))
      await userEvent.click(screen.getByTestId('conversation-block-button-mobile'))
      expect(screen.queryByTestId('conversation-block-button-mobile')).not.toBeInTheDocument()
    })

    it('opens report modal from mobile menu', async () => {
      renderHeader()
      await userEvent.click(screen.getByTestId('conversation-mobile-menu-btn'))
      await userEvent.click(screen.getByTestId('conversation-report-button-mobile'))
      expect(screen.getByTestId('report-modal')).toBeInTheDocument()
    })

    it('calls markMessageReadState from mobile menu toggle', async () => {
      renderHeader()
      await userEvent.click(screen.getByTestId('conversation-mobile-menu-btn'))
      await userEvent.click(screen.getByTestId('conversation-toggle-read-button-mobile'))
      await waitFor(() => expect(mockMarkMessageReadState).toHaveBeenCalled())
    })

    it('calls unblockUser when Unblock clicked in mobile menu', async () => {
      mockFetchFollowStatus.mockResolvedValue({ data: { is_blocking: true } })
      renderHeader()
      await waitFor(() => screen.getByTestId('conversation-mobile-menu-btn'))
      await userEvent.click(screen.getByTestId('conversation-mobile-menu-btn'))
      await userEvent.click(screen.getByTestId('conversation-block-button-mobile'))
      await waitFor(() => expect(mockUnblockUser).toHaveBeenCalled())
    })
  })

  describe('delete', () => {
    it('calls onDeleted when delete button fires', async () => {
      const onDeleted = vi.fn()
      renderHeader({ onDeleted })
      await userEvent.click(screen.getByTestId('delete-conversation-button'))
      expect(onDeleted).toHaveBeenCalledWith('conv-1')
    })
  })

  describe('error handling', () => {
    it('falls back to isBlocked=false when fetchFollowStatus throws', async () => {
      mockFetchFollowStatus.mockRejectedValue(new Error('Network error'))
      renderHeader()
      await waitFor(() => expect(screen.getByTestId('conversation-block-button')).toHaveTextContent('Block'))
    })

    it('silently handles unblockUser failure', async () => {
      mockFetchFollowStatus.mockResolvedValue({ data: { is_blocking: true } })
      mockUnblockUser.mockRejectedValue(new Error('fail'))
      renderHeader()
      await waitFor(() => expect(screen.getByTestId('conversation-block-button')).toHaveTextContent('Unblock'))
      await userEvent.click(screen.getByTestId('conversation-block-button'))
      await waitFor(() => expect(mockUnblockUser).toHaveBeenCalled())
      // no crash
    })
  })
})
