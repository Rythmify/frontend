// ConversationHeader.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import ConversationHeader from '../ConversationHeader'
import * as conversationApi from '@/services/api/messaging/conversationApi'

// Mock the external dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('@/components/MessagingComponents/DeleteConversationButton', () => ({
  default: ({ conversationId, participantId, onDeleted }: any) => (
    <button 
      data-test="delete-conversation-button"
      onClick={() => onDeleted?.(conversationId)}
    >
      Delete
    </button>
  )
}))

vi.mock('../UI/BlockModal', () => ({
  BlockUserModal: ({ userId, username, onClose, onBlocked }: any) => (
    <div data-test="block-modal">
      <button data-test="block-modal-close" onClick={onClose}>Close</button>
      <button 
        data-test="block-modal-block" 
        onClick={() => {
          onBlocked()
          onClose()
        }}
      >
        Block User
      </button>
    </div>
  )
}))

vi.mock('../UI/ReportModal', () => ({
  ReportModal: ({ userId, username, onClose, onSpamSelected }: any) => (
    <div data-test="report-modal">
      <button data-test="report-modal-close" onClick={onClose}>Close</button>
      <button 
        data-test="report-modal-spam" 
        onClick={() => {
          onSpamSelected()
          onClose()
        }}
      >
        Report as Spam
      </button>
    </div>
  )
}))

vi.mock('../UI/SpamModal', () => ({
  SpamModal: ({ userId, username, onClose }: any) => (
    <div data-test="spam-modal">
      <button data-test="spam-modal-close" onClick={onClose}>Close</button>
    </div>
  )
}))

vi.mock('@/components/UI/Tooltip', () => ({
  default: ({ children, text }: any) => (
    <div data-test="tooltip" data-tooltip-text={text}>
      {children}
    </div>
  )
}))

vi.mock('@/services/api/messaging/conversationApi', () => ({
  markMessageReadState: vi.fn(),
  unblockUser: vi.fn(),
  fetchFollowStatus: vi.fn()
}))

const mockNavigate = vi.fn()

describe('ConversationHeader', () => {
  const defaultProps = {
    reciepiantId: 'user123',
    conversationId: 'conv456',
    recipientName: 'john_doe',
    lastMessageId: 'msg789',
    onReadStateChange: vi.fn(),
    onDeleted: vi.fn(),
    onBack: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(conversationApi.fetchFollowStatus).mockResolvedValue({ 
      data: { is_blocking: false } 
    } as any)
    vi.mocked(conversationApi.markMessageReadState).mockResolvedValue({} as any)
    vi.mocked(conversationApi.unblockUser).mockResolvedValue({} as any)
  })

  const renderWithRouter = (props = {}) => {
    return render(
      <BrowserRouter>
        <ConversationHeader {...defaultProps} {...props} />
      </BrowserRouter>
    )
  }

  describe('Rendering', () => {
    it('should render recipient name', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        expect(screen.getByTestId('conversation-profile-button')).toBeInTheDocument()
        expect(screen.getByText('john_doe')).toBeInTheDocument()
      })
    })

    it('should render back button when onBack is provided', async () => {
      renderWithRouter({ onBack: vi.fn() })
      
      await waitFor(() => {
        expect(screen.getByTestId('conversation-back-button')).toBeInTheDocument()
      })
    })

    it('should not render back button when onBack is not provided', async () => {
      renderWithRouter({ onBack: undefined })
      
      await waitFor(() => {
        expect(screen.queryByTestId('conversation-back-button')).not.toBeInTheDocument()
      })
    })

    it('should render delete conversation button', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        expect(screen.getByTestId('delete-conversation-button')).toBeInTheDocument()
      })
    })

    it('should render block button on desktop', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        expect(screen.getByTestId('conversation-block-button')).toBeInTheDocument()
      })
    })

    it('should render report button on desktop', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        expect(screen.getByTestId('conversation-report-button')).toBeInTheDocument()
      })
    })

    it('should render mark as read button on desktop', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        expect(screen.getByTestId('conversation-toggle-read-button')).toBeInTheDocument()
      })
    })

    it('should render mobile menu button', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        expect(screen.getByTestId('conversation-mobile-menu-btn')).toBeInTheDocument()
      })
    })

    it('should show loading state while fetching block status', async () => {
      vi.mocked(conversationApi.fetchFollowStatus).mockImplementation(
        () => new Promise(() => {})
      )
      
      renderWithRouter()
      
      await waitFor(() => {
        expect(screen.getByText('...')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('should navigate to user profile when clicking profile button', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        const profileButton = screen.getByTestId('conversation-profile-button')
        fireEvent.click(profileButton)
        expect(mockNavigate).toHaveBeenCalledWith('/john_doe')
      })
    })

    it('should call onBack when back button is clicked', async () => {
      const onBack = vi.fn()
      renderWithRouter({ onBack })
      
      await waitFor(() => {
        const backButton = screen.getByTestId('conversation-back-button')
        fireEvent.click(backButton)
        expect(onBack).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Block functionality', () => {
    it('should open block modal when block button is clicked', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        const blockButton = screen.getByTestId('conversation-block-button')
        fireEvent.click(blockButton)
        expect(screen.getByTestId('block-modal')).toBeInTheDocument()
      })
    })

    it('should show unblock button when user is blocked', async () => {
      vi.mocked(conversationApi.fetchFollowStatus).mockResolvedValue({ 
        data: { is_blocking: true } 
      } as any)
      
      renderWithRouter()
      
      await waitFor(() => {
        expect(screen.getByText('Unblock')).toBeInTheDocument()
      })
    })

    it('should call unblockUser when unblock button is clicked', async () => {
      vi.mocked(conversationApi.fetchFollowStatus).mockResolvedValue({ 
        data: { is_blocking: true } 
      } as any)
      
      renderWithRouter()
      
      await waitFor(async () => {
        const unblockButton = screen.getByTestId('conversation-block-button')
        fireEvent.click(unblockButton)
        
        await waitFor(() => {
          expect(conversationApi.unblockUser).toHaveBeenCalledWith('user123')
        })
      })
    })

    it('should handle unblock error gracefully', async () => {
      vi.mocked(conversationApi.fetchFollowStatus).mockResolvedValue({ 
        data: { is_blocking: true } 
      } as any)
      vi.mocked(conversationApi.unblockUser).mockRejectedValue(new Error('Unblock failed'))
      
      renderWithRouter()
      
      await waitFor(async () => {
        const unblockButton = screen.getByTestId('conversation-block-button')
        fireEvent.click(unblockButton)
        
        await waitFor(() => {
          expect(conversationApi.unblockUser).toHaveBeenCalled()
        })
      })
    })

    it('should update block status after blocking', async () => {
      renderWithRouter()
      
      await waitFor(async () => {
        const blockButton = screen.getByTestId('conversation-block-button')
        fireEvent.click(blockButton)
        
        const blockModalBlockButton = screen.getByTestId('block-modal-block')
        fireEvent.click(blockModalBlockButton)
        
        await waitFor(() => {
          expect(screen.queryByTestId('block-modal')).not.toBeInTheDocument()
        })
      })
    })
  })

  describe('Report functionality', () => {
    it('should open report modal when report button is clicked', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        const reportButton = screen.getByTestId('conversation-report-button')
        fireEvent.click(reportButton)
        expect(screen.getByTestId('report-modal')).toBeInTheDocument()
      })
    })

    it('should open spam modal when spam is selected from report modal', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        const reportButton = screen.getByTestId('conversation-report-button')
        fireEvent.click(reportButton)
        
        const spamButton = screen.getByTestId('report-modal-spam')
        fireEvent.click(spamButton)
        
        expect(screen.getByTestId('spam-modal')).toBeInTheDocument()
      })
    })

    it('should close modals properly', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        const reportButton = screen.getByTestId('conversation-report-button')
        fireEvent.click(reportButton)
        
        const closeButton = screen.getByTestId('report-modal-close')
        fireEvent.click(closeButton)
        
        expect(screen.queryByTestId('report-modal')).not.toBeInTheDocument()
      })
    })
  })

  describe('Read/Unread functionality', () => {
    it('should call markMessageReadState when mark as read button is clicked', async () => {
      renderWithRouter()
      
      await waitFor(async () => {
        const toggleReadButton = screen.getByTestId('conversation-toggle-read-button')
        fireEvent.click(toggleReadButton)
        
        await waitFor(() => {
          expect(conversationApi.markMessageReadState).toHaveBeenCalledWith(
            'conv456',
            'msg789',
            false
          )
        })
      })
    })

    it('should disable toggle read button when no lastMessageId', async () => {
      renderWithRouter({ lastMessageId: null })
      
      await waitFor(() => {
        const toggleReadButton = screen.getByTestId('conversation-toggle-read-button')
        expect(toggleReadButton).toBeDisabled()
      })
    })

    it('should update isUnread state after toggling', async () => {
      renderWithRouter()
      
      await waitFor(async () => {
        const toggleReadButton = screen.getByTestId('conversation-toggle-read-button')
        expect(toggleReadButton).toHaveTextContent('Mark as unread')
        
        fireEvent.click(toggleReadButton)
        
        await waitFor(() => {
          expect(toggleReadButton).toHaveTextContent('Mark as read')
        })
      })
    })

    it('should call onReadStateChange when read state toggles', async () => {
      renderWithRouter()
      
      await waitFor(async () => {
        const toggleReadButton = screen.getByTestId('conversation-toggle-read-button')
        fireEvent.click(toggleReadButton)
        
        await waitFor(() => {
          expect(defaultProps.onReadStateChange).toHaveBeenCalledWith(true)
        })
      })
    })

    it('should handle errors in markMessageReadState', async () => {
      vi.mocked(conversationApi.markMessageReadState).mockRejectedValue(new Error('API Error'))
      
      renderWithRouter()
      
      await waitFor(async () => {
        const toggleReadButton = screen.getByTestId('conversation-toggle-read-button')
        fireEvent.click(toggleReadButton)
        
        await waitFor(() => {
          expect(conversationApi.markMessageReadState).toHaveBeenCalled()
        })
      })
    })
  })

  describe('Mobile menu', () => {
    it('should open mobile menu when menu button is clicked', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        const menuButton = screen.getByTestId('conversation-mobile-menu-btn')
        fireEvent.click(menuButton)
        
        expect(screen.getByTestId('conversation-block-button-mobile')).toBeInTheDocument()
        expect(screen.getByTestId('conversation-report-button-mobile')).toBeInTheDocument()
        expect(screen.getByTestId('conversation-toggle-read-button-mobile')).toBeInTheDocument()
      })
    })

    it('should close mobile menu after action', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        const menuButton = screen.getByTestId('conversation-mobile-menu-btn')
        fireEvent.click(menuButton)
        
        const blockButton = screen.getByTestId('conversation-block-button-mobile')
        fireEvent.click(blockButton)
        
        expect(screen.queryByTestId('conversation-block-button-mobile')).not.toBeInTheDocument()
      })
    })

    it('should open block modal from mobile menu', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        const menuButton = screen.getByTestId('conversation-mobile-menu-btn')
        fireEvent.click(menuButton)
        
        const blockButton = screen.getByTestId('conversation-block-button-mobile')
        fireEvent.click(blockButton)
        
        expect(screen.getByTestId('block-modal')).toBeInTheDocument()
      })
    })

    it('should open report modal from mobile menu', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        const menuButton = screen.getByTestId('conversation-mobile-menu-btn')
        fireEvent.click(menuButton)
        
        const reportButton = screen.getByTestId('conversation-report-button-mobile')
        fireEvent.click(reportButton)
        
        expect(screen.getByTestId('report-modal')).toBeInTheDocument()
      })
    })

    it('should toggle read state from mobile menu', async () => {
      renderWithRouter()
      
      await waitFor(async () => {
        const menuButton = screen.getByTestId('conversation-mobile-menu-btn')
        fireEvent.click(menuButton)
        
        const toggleReadButton = screen.getByTestId('conversation-toggle-read-button-mobile')
        fireEvent.click(toggleReadButton)
        
        await waitFor(() => {
          expect(conversationApi.markMessageReadState).toHaveBeenCalled()
        })
      })
    })

    it('should show unblock option in mobile menu when blocked', async () => {
      vi.mocked(conversationApi.fetchFollowStatus).mockResolvedValue({ 
        data: { is_blocking: true } 
      } as any)
      
      renderWithRouter()
      
      await waitFor(() => {
        const menuButton = screen.getByTestId('conversation-mobile-menu-btn')
        fireEvent.click(menuButton)
        
        const blockButton = screen.getByTestId('conversation-block-button-mobile')
        expect(blockButton).toHaveTextContent('Unblock john_doe')
      })
    })

    it('should disable mobile toggle read button when no lastMessageId', async () => {
      renderWithRouter({ lastMessageId: null })
      
      await waitFor(() => {
        const menuButton = screen.getByTestId('conversation-mobile-menu-btn')
        fireEvent.click(menuButton)
        
        const toggleReadButton = screen.getByTestId('conversation-toggle-read-button-mobile')
        expect(toggleReadButton).toBeDisabled()
      })
    })
  })

  describe('Tooltips', () => {
    it('should render tooltips for desktop buttons', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        const tooltips = screen.getAllByTestId('tooltip')
        expect(tooltips.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Delete conversation', () => {
    it('should call onDeleted when delete button is clicked', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        const deleteButton = screen.getByTestId('delete-conversation-button')
        fireEvent.click(deleteButton)
        
        expect(defaultProps.onDeleted).toHaveBeenCalledWith('conv456')
      })
    })
  })

  describe('Error handling', () => {
    it('should handle fetchFollowStatus error', async () => {
      vi.mocked(conversationApi.fetchFollowStatus).mockRejectedValue(new Error('Network error'))
      
      renderWithRouter()
      
      await waitFor(() => {
        const blockButton = screen.getByTestId('conversation-block-button')
        expect(blockButton).toHaveTextContent('Block')
      })
    })

    it('should handle missing reciepiantId', async () => {
      renderWithRouter({ reciepiantId: '' })
      
      await waitFor(() => {
        expect(conversationApi.fetchFollowStatus).not.toHaveBeenCalled()
      })
    })
  })

  describe('Cleanup and effects', () => {
    it('should reset unread state when conversationId changes', async () => {
      const { rerender } = renderWithRouter()
      
      await waitFor(() => {
        const toggleReadButton = screen.getByTestId('conversation-toggle-read-button')
        expect(toggleReadButton).toHaveTextContent('Mark as unread')
      })
      
      rerender(
        <BrowserRouter>
          <ConversationHeader {...defaultProps} conversationId="newConvId" />
        </BrowserRouter>
      )
      
      await waitFor(() => {
        const toggleReadButton = screen.getByTestId('conversation-toggle-read-button')
        expect(toggleReadButton).toHaveTextContent('Mark as unread')
      })
    })
  })

  describe('Responsive behavior', () => {
    it('should show desktop buttons on large screens', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        expect(screen.getByTestId('conversation-block-button')).toBeVisible()
        expect(screen.getByTestId('conversation-report-button')).toBeVisible()
        expect(screen.getByTestId('conversation-toggle-read-button')).toBeVisible()
      })
    })

    it('should show mobile menu on small screens', async () => {
      renderWithRouter()
      
      await waitFor(() => {
        expect(screen.getByTestId('conversation-mobile-menu-btn')).toBeVisible()
      })
    })
  })
})