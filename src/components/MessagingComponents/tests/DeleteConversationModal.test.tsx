import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockDeleteConversation = vi.fn()
const mockSubmitReport = vi.fn()

vi.mock('@/services/api/messaging/conversationApi', () => ({
  deleteConversation: (...args: unknown[]) => mockDeleteConversation(...args),
  submitReport: (...args: unknown[]) => mockSubmitReport(...args),
}))

vi.mock('../CheckBox', () => ({
  default: ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div data-test={`checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        data-test="checkbox-toggle"
      />
      <label>{label}</label>
    </div>
  ),
}))

import DeleteConversationModal from '../DeleteConversationModal'

const defaultProps = {
  conversationId: 'conv-1',
  participantId: 'user-2',
  onClose: vi.fn(),
  onDeleted: vi.fn(),
}

describe('DeleteConversationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteConversation.mockResolvedValue({})
    mockSubmitReport.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('renders the modal container', () => {
      render(<DeleteConversationModal {...defaultProps} />)
      expect(screen.getByTestId('delete-conversation-modal')).toBeInTheDocument()
    })

    it('renders the title "Are you sure?"', () => {
      render(<DeleteConversationModal {...defaultProps} />)
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    })

    it('renders the description text', () => {
      render(<DeleteConversationModal {...defaultProps} />)
      expect(screen.getByText(/Archiving a conversation/)).toBeInTheDocument()
    })

    it('renders the CheckBox', () => {
      render(<DeleteConversationModal {...defaultProps} />)
      expect(screen.getByTestId('checkbox-also-report-conversation-as-spam')).toBeInTheDocument()
    })

    it('renders the Cancel button', () => {
      render(<DeleteConversationModal {...defaultProps} />)
      expect(screen.getByTestId('delete-conversation-cancel')).toBeInTheDocument()
    })

    it('renders the Archive button', () => {
      render(<DeleteConversationModal {...defaultProps} />)
      expect(screen.getByTestId('delete-conversation-confirm')).toHaveTextContent('Archive')
    })

    it('does not show error initially', () => {
      render(<DeleteConversationModal {...defaultProps} />)
      expect(screen.queryByTestId('delete-conversation-error')).not.toBeInTheDocument()
    })
  })

  describe('backdrop click', () => {
    it('calls onClose when backdrop is clicked directly', () => {
      const onClose = vi.fn()
      render(<DeleteConversationModal {...defaultProps} onClose={onClose} />)
      const modal = screen.getByTestId('delete-conversation-modal')
      fireEvent.click(modal)
      expect(onClose).toHaveBeenCalled()
    })

    it('does not call onClose when inner content is clicked', async () => {
      const onClose = vi.fn()
      render(<DeleteConversationModal {...defaultProps} onClose={onClose} />)
      await userEvent.click(screen.getByText('Are you sure?'))
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('cancel button', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const onClose = vi.fn()
      render(<DeleteConversationModal {...defaultProps} onClose={onClose} />)
      await userEvent.click(screen.getByTestId('delete-conversation-cancel'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('archive (delete) flow', () => {
    it('calls deleteConversation with the conversationId', async () => {
      render(<DeleteConversationModal {...defaultProps} />)
      await userEvent.click(screen.getByTestId('delete-conversation-confirm'))
      await waitFor(() => expect(mockDeleteConversation).toHaveBeenCalledWith('conv-1'))
    })

    it('calls onDeleted with conversationId after successful delete', async () => {
      const onDeleted = vi.fn()
      render(<DeleteConversationModal {...defaultProps} onDeleted={onDeleted} />)
      await userEvent.click(screen.getByTestId('delete-conversation-confirm'))
      await waitFor(() => expect(onDeleted).toHaveBeenCalledWith('conv-1'))
    })

    it('calls onClose after successful delete', async () => {
      const onClose = vi.fn()
      render(<DeleteConversationModal {...defaultProps} onClose={onClose} />)
      await userEvent.click(screen.getByTestId('delete-conversation-confirm'))
      await waitFor(() => expect(onClose).toHaveBeenCalled())
    })

    it('shows "Archiving…" text on the button while deleting', async () => {
      mockDeleteConversation.mockReturnValue(new Promise(() => {})) // never resolves
      render(<DeleteConversationModal {...defaultProps} />)
      await userEvent.click(screen.getByTestId('delete-conversation-confirm'))
      expect(screen.getByTestId('delete-conversation-confirm')).toHaveTextContent('Archiving…')
    })

    it('disables Cancel and Archive buttons while deleting', async () => {
      mockDeleteConversation.mockReturnValue(new Promise(() => {}))
      render(<DeleteConversationModal {...defaultProps} />)
      await userEvent.click(screen.getByTestId('delete-conversation-confirm'))
      expect(screen.getByTestId('delete-conversation-cancel')).toBeDisabled()
      expect(screen.getByTestId('delete-conversation-confirm')).toBeDisabled()
    })

    it('shows error message when deleteConversation throws', async () => {
      mockDeleteConversation.mockRejectedValue(new Error('fail'))
      render(<DeleteConversationModal {...defaultProps} />)
      await userEvent.click(screen.getByTestId('delete-conversation-confirm'))
      await waitFor(() => expect(screen.getByTestId('delete-conversation-error')).toBeInTheDocument())
    })
  })

  describe('spam report flow', () => {
    it('calls submitReport when spam checkbox is checked before archiving', async () => {
      render(<DeleteConversationModal {...defaultProps} />)
      const checkbox = screen.getByTestId('checkbox-toggle')
      fireEvent.change(checkbox, { target: { checked: true } })
      await userEvent.click(screen.getByTestId('delete-conversation-confirm'))
      await waitFor(() =>
        expect(mockSubmitReport).toHaveBeenCalledWith({
          resource_type: 'user',
          resource_id: 'user-2',
          reason: 'spam',
        })
      )
    })

    it('does not call submitReport when spam checkbox is not checked', async () => {
      render(<DeleteConversationModal {...defaultProps} />)
      await userEvent.click(screen.getByTestId('delete-conversation-confirm'))
      await waitFor(() => expect(mockDeleteConversation).toHaveBeenCalled())
      expect(mockSubmitReport).not.toHaveBeenCalled()
    })
  })
})
