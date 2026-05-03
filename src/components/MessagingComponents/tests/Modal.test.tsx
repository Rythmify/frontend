import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '../Modal'

describe('Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders nothing when isOpen is false', () => {
      render(<Modal isOpen={false} onClose={vi.fn()}><div>Content</div></Modal>)
      expect(screen.queryByTestId('modal-backdrop')).not.toBeInTheDocument()
    })

    it('renders the backdrop when isOpen is true', () => {
      render(<Modal isOpen={true} onClose={vi.fn()}><div>Content</div></Modal>)
      expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument()
    })

    it('renders children when open', () => {
      render(<Modal isOpen={true} onClose={vi.fn()}><div data-test="child">Hello</div></Modal>)
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('renders the close button when open', () => {
      render(<Modal isOpen={true} onClose={vi.fn()}><div>Content</div></Modal>)
      expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
    })

    it('renders into document.body via portal', () => {
      render(<Modal isOpen={true} onClose={vi.fn()}><div>Content</div></Modal>)
      expect(document.body.contains(screen.getByTestId('modal-backdrop'))).toBe(true)
    })
  })

  describe('interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = vi.fn()
      render(<Modal isOpen={true} onClose={onClose}><div>Content</div></Modal>)
      await userEvent.click(screen.getByTestId('modal-close-button'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn()
      render(<Modal isOpen={true} onClose={onClose}><div>Content</div></Modal>)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose on other key presses', () => {
      const onClose = vi.fn()
      render(<Modal isOpen={true} onClose={onClose}><div>Content</div></Modal>)
      fireEvent.keyDown(document, { key: 'Enter' })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('does not attach keydown listener when isOpen is false', () => {
      const onClose = vi.fn()
      render(<Modal isOpen={false} onClose={onClose}><div>Content</div></Modal>)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('removes keydown listener when closed', () => {
      const onClose = vi.fn()
      const { rerender } = render(<Modal isOpen={true} onClose={onClose}><div>Content</div></Modal>)
      rerender(<Modal isOpen={false} onClose={onClose}><div>Content</div></Modal>)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('backdrop click stops propagation (does not bubble to parent)', () => {
      const outerClick = vi.fn()
      render(
        <div onClick={outerClick}>
          <Modal isOpen={true} onClose={vi.fn()}><div>Content</div></Modal>
        </div>
      )
      fireEvent.click(screen.getByTestId('modal-backdrop'))
      expect(outerClick).not.toHaveBeenCalled()
    })

    it('clicking the backdrop does not close the modal', () => {
      const onClose = vi.fn()
      render(<Modal isOpen={true} onClose={onClose}><div>Content</div></Modal>)
      fireEvent.click(screen.getByTestId('modal-backdrop'))
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('lifecycle', () => {
    it('re-renders correctly when isOpen changes from false to true', () => {
      const onClose = vi.fn()
      const { rerender } = render(<Modal isOpen={false} onClose={onClose}><div>Content</div></Modal>)
      expect(screen.queryByTestId('modal-backdrop')).not.toBeInTheDocument()
      rerender(<Modal isOpen={true} onClose={onClose}><div>Content</div></Modal>)
      expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument()
    })

    it('re-renders correctly when isOpen changes from true to false', () => {
      const onClose = vi.fn()
      const { rerender } = render(<Modal isOpen={true} onClose={onClose}><div>Content</div></Modal>)
      expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument()
      rerender(<Modal isOpen={false} onClose={onClose}><div>Content</div></Modal>)
      expect(screen.queryByTestId('modal-backdrop')).not.toBeInTheDocument()
    })
  })
})
