import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MessagesPage from './MessagesPage'

// Mock child components
vi.mock('@/components/MessagingComponents/Modal', () => ({
  Modal: ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) =>
    isOpen ? (
      <div data-testid="modal">
        <button onClick={onClose} data-testid="modal-close">Close</button>
        {children}
      </div>
    ) : null,
}))

vi.mock('@/components/MessagingComponents/MessagingHeader', () => ({
  default: () => <div data-testid="messaging-header" />,
}))

vi.mock('./ModalNewMessageBody', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="modal-new-message-body">
      <button onClick={onClose} data-testid="modal-body-close">Close Body</button>
    </div>
  ),
}))

describe('MessagesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<MessagesPage />)
      expect(screen.getByTestId('empty-messages-page')).toBeInTheDocument()
    })

    it('renders the MessagingHeader', () => {
      render(<MessagesPage />)
      expect(screen.getByTestId('messaging-header')).toBeInTheDocument()
    })

    it('renders the empty state container', () => {
      render(<MessagesPage />)
      expect(screen.getByTestId('empty-messages-page')).toBeInTheDocument()
    })

    it('renders the empty messages title', () => {
      render(<MessagesPage />)
      expect(screen.getByTestId('empty-messages-title')).toBeInTheDocument()
      expect(screen.getByTestId('empty-messages-title')).toHaveTextContent('You have no messages')
    })

    it('renders the write button', () => {
      render(<MessagesPage />)
      expect(screen.getByTestId('empty-messages-write-button')).toBeInTheDocument()
      expect(screen.getByTestId('empty-messages-write-button')).toHaveTextContent('Write one')
    })

    it('renders the descriptive message text', () => {
      render(<MessagesPage />)
      expect(screen.getByText(/Send someone a message and make their day/i)).toBeInTheDocument()
    })
  })

  describe('Modal initial state', () => {
    it('does not show the modal by default', () => {
      render(<MessagesPage />)
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('does not render ModalNewMessageBody when modal is closed', () => {
      render(<MessagesPage />)
      expect(screen.queryByTestId('modal-new-message-body')).not.toBeInTheDocument()
    })
  })

  describe('Modal open behavior', () => {
    it('opens the modal when "Write one" button is clicked', () => {
      render(<MessagesPage />)
      fireEvent.click(screen.getByTestId('empty-messages-write-button'))
      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    it('renders ModalNewMessageBody inside the modal when open', () => {
      render(<MessagesPage />)
      fireEvent.click(screen.getByTestId('empty-messages-write-button'))
      expect(screen.getByTestId('modal-new-message-body')).toBeInTheDocument()
    })
  })

  describe('Modal close behavior', () => {
    it('closes the modal when onClose is called via Modal close button', () => {
      render(<MessagesPage />)
      fireEvent.click(screen.getByTestId('empty-messages-write-button'))
      expect(screen.getByTestId('modal')).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('modal-close'))
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('closes the modal when onClose is called via ModalNewMessageBody', () => {
      render(<MessagesPage />)
      fireEvent.click(screen.getByTestId('empty-messages-write-button'))
      expect(screen.getByTestId('modal')).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('modal-body-close'))
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('can reopen the modal after closing', () => {
      render(<MessagesPage />)

      fireEvent.click(screen.getByTestId('empty-messages-write-button'))
      expect(screen.getByTestId('modal')).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('modal-close'))
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()

      fireEvent.click(screen.getByTestId('empty-messages-write-button'))
      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })
  })
})
