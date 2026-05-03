import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/components/MessagingComponents/Modal', () => ({
  Modal: ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) =>
    isOpen ? (
      <div data-test="modal-backdrop">
        <button data-test="modal-close-button" onClick={onClose}>Close</button>
        {children}
      </div>
    ) : null,
}))

vi.mock('@/pages/social/messages/ModalNewMessageBody', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-test="modal-new-message-body">
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
}))

import MessagingHeader from '../MessagingHeader'

describe('MessagingHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the messaging-header container', () => {
      render(<MessagingHeader />)
      expect(screen.getByTestId('messaging-header')).toBeInTheDocument()
    })

    it('renders the Messages title', () => {
      render(<MessagingHeader />)
      expect(screen.getByText('Messages')).toBeInTheDocument()
    })

    it('renders the New button', () => {
      render(<MessagingHeader />)
      expect(screen.getByTestId('new-message-button')).toBeInTheDocument()
    })

    it('does not show modal initially', () => {
      render(<MessagingHeader />)
      expect(screen.queryByTestId('modal-backdrop')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('opens the modal when New button is clicked', async () => {
      render(<MessagingHeader />)
      await userEvent.click(screen.getByTestId('new-message-button'))
      expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument()
    })

    it('renders ModalNewMessageBody inside the modal', async () => {
      render(<MessagingHeader />)
      await userEvent.click(screen.getByTestId('new-message-button'))
      expect(screen.getByTestId('modal-new-message-body')).toBeInTheDocument()
    })

    it('closes the modal when modal close button is clicked', async () => {
      render(<MessagingHeader />)
      await userEvent.click(screen.getByTestId('new-message-button'))
      expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument()
      await userEvent.click(screen.getByTestId('modal-close-button'))
      expect(screen.queryByTestId('modal-backdrop')).not.toBeInTheDocument()
    })

    it('closes the modal when onClose is called from ModalNewMessageBody', async () => {
      render(<MessagingHeader />)
      await userEvent.click(screen.getByTestId('new-message-button'))
      await userEvent.click(screen.getByText('Close Modal'))
      expect(screen.queryByTestId('modal-backdrop')).not.toBeInTheDocument()
    })

    it('accepts optional onConversationCreated prop without crashing', () => {
      const onCreated = vi.fn()
      render(<MessagingHeader onConversationCreated={onCreated} />)
      expect(screen.getByTestId('messaging-header')).toBeInTheDocument()
    })
  })
})
