import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../DeleteConversationModal', () => ({
  default: ({
    conversationId,
    participantId,
    onClose,
    onDeleted,
  }: {
    conversationId: string
    participantId: string
    onClose: () => void
    onDeleted?: (id: string) => void
  }) => (
    <div data-test="delete-modal" data-conv-id={conversationId} data-part-id={participantId}>
      <button data-test="modal-close" onClick={onClose}>Close</button>
      <button data-test="modal-confirm" onClick={() => onDeleted?.(conversationId)}>Confirm</button>
    </div>
  ),
}))

import DeleteConversationButton from '../DeleteConversationButton'

describe('DeleteConversationButton', () => {
  const defaultProps = {
    conversationId: 'conv-1',
    participantId: 'user-2',
    onDeleted: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the delete button', () => {
      render(<DeleteConversationButton {...defaultProps} />)
      expect(screen.getByTestId('delete-conversation-button')).toBeInTheDocument()
    })

    it('renders the trash SVG icon', () => {
      render(<DeleteConversationButton {...defaultProps} />)
      expect(screen.getByTestId('delete-conversation-button').querySelector('svg')).toBeInTheDocument()
    })

    it('does not render modal initially', () => {
      render(<DeleteConversationButton {...defaultProps} />)
      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument()
    })

    it('has aria-label "Delete conversation"', () => {
      render(<DeleteConversationButton {...defaultProps} />)
      expect(screen.getByTestId('delete-conversation-button')).toHaveAttribute('aria-label', 'Delete conversation')
    })
  })

  describe('interactions', () => {
    it('shows modal when delete button is clicked', async () => {
      render(<DeleteConversationButton {...defaultProps} />)
      await userEvent.click(screen.getByTestId('delete-conversation-button'))
      expect(screen.getByTestId('delete-modal')).toBeInTheDocument()
    })

    it('passes correct conversationId to modal', async () => {
      render(<DeleteConversationButton {...defaultProps} conversationId="conv-99" />)
      await userEvent.click(screen.getByTestId('delete-conversation-button'))
      expect(screen.getByTestId('delete-modal')).toHaveAttribute('data-conv-id', 'conv-99')
    })

    it('passes correct participantId to modal', async () => {
      render(<DeleteConversationButton {...defaultProps} participantId="user-77" />)
      await userEvent.click(screen.getByTestId('delete-conversation-button'))
      expect(screen.getByTestId('delete-modal')).toHaveAttribute('data-part-id', 'user-77')
    })

    it('hides modal when modal onClose is called', async () => {
      render(<DeleteConversationButton {...defaultProps} />)
      await userEvent.click(screen.getByTestId('delete-conversation-button'))
      expect(screen.getByTestId('delete-modal')).toBeInTheDocument()
      await userEvent.click(screen.getByTestId('modal-close'))
      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument()
    })

    it('calls onDeleted when modal confirms deletion', async () => {
      const onDeleted = vi.fn()
      render(<DeleteConversationButton {...defaultProps} onDeleted={onDeleted} />)
      await userEvent.click(screen.getByTestId('delete-conversation-button'))
      await userEvent.click(screen.getByTestId('modal-confirm'))
      expect(onDeleted).toHaveBeenCalledWith('conv-1')
    })

    it('works without onDeleted prop', async () => {
      render(<DeleteConversationButton conversationId="c1" participantId="u1" />)
      await userEvent.click(screen.getByTestId('delete-conversation-button'))
      await userEvent.click(screen.getByTestId('modal-confirm'))
      // no error
    })
  })
})
