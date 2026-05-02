import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/components/UI/Spinner', () => ({
  default: () => <div data-test="spinner" />,
}))

vi.mock('@/components/UI/UserAvatar', () => ({
  default: ({ name }: { name: string }) => <div data-test="user-avatar" data-name={name} />,
}))

import { Chats } from '../Chats'
import type { Conversation } from '@/services/api/messaging/conversationApi'

function makeConversation(id: string): Conversation {
  return {
    id,
    participant: { id: 'u2', username: 'user', display_name: 'User', avatar: null },
    last_message: { id: 'm1', body: 'Hi', embed_type: null, embed_id: null, sender_id: 'u2', created_at: new Date().toISOString() } as any,
    unread_count: 0,
    updated_at: new Date().toISOString(),
  } as Conversation
}

const defaultProps = {
  conversations: [],
  loading: false,
  loadingMore: false,
  hasMore: false,
  error: null,
  activeConversationId: null,
  onSelect: vi.fn(),
  onLoadMore: vi.fn(),
}

describe('Chats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('renders spinner when loading is true', () => {
      render(<Chats {...defaultProps} loading={true} />)
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })

    it('does not render chat list when loading', () => {
      render(<Chats {...defaultProps} loading={true} />)
      expect(screen.queryByTestId('chat-list')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('renders error message when error is set', () => {
      render(<Chats {...defaultProps} error="Failed to load" />)
      expect(screen.getByTestId('chat-error')).toHaveTextContent('Failed to load')
    })

    it('does not render spinner in error state', () => {
      render(<Chats {...defaultProps} error="Some error" />)
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('renders empty state when conversations is empty', () => {
      render(<Chats {...defaultProps} conversations={[]} />)
      expect(screen.getByTestId('chat-empty-state')).toBeInTheDocument()
    })

    it('empty state contains "No conversations yet." text', () => {
      render(<Chats {...defaultProps} conversations={[]} />)
      expect(screen.getByTestId('chat-empty-state')).toHaveTextContent('No conversations yet.')
    })
  })

  describe('list state', () => {
    it('renders chat-list when conversations exist', () => {
      render(<Chats {...defaultProps} conversations={[makeConversation('c1')]} />)
      expect(screen.getByTestId('chat-list')).toBeInTheDocument()
    })

    it('renders a ChatProfile for each conversation', () => {
      const convs = [makeConversation('c1'), makeConversation('c2')]
      render(<Chats {...defaultProps} conversations={convs} />)
      expect(screen.getByTestId('chat-profile-c1')).toBeInTheDocument()
      expect(screen.getByTestId('chat-profile-c2')).toBeInTheDocument()
    })

    it('calls onSelect with the conversation when a profile is clicked', async () => {
      const onSelect = vi.fn()
      const conv = makeConversation('c1')
      render(<Chats {...defaultProps} conversations={[conv]} onSelect={onSelect} />)
      fireEvent.click(screen.getByTestId('chat-profile-c1'))
      expect(onSelect).toHaveBeenCalledWith(conv)
    })

    it('renders loadingMore spinner when loadingMore is true', () => {
      render(<Chats {...defaultProps} conversations={[makeConversation('c1')]} loadingMore={true} />)
      expect(screen.getByTestId('chat-loading-more')).toBeInTheDocument()
    })

    it('does not render loadingMore div when loadingMore is false', () => {
      render(<Chats {...defaultProps} conversations={[makeConversation('c1')]} loadingMore={false} />)
      expect(screen.queryByTestId('chat-loading-more')).not.toBeInTheDocument()
    })

    it('passes isActive=true to the active conversation', () => {
      const convs = [makeConversation('c1'), makeConversation('c2')]
      render(<Chats {...defaultProps} conversations={convs} activeConversationId="c1" />)
      expect(screen.getByTestId('chat-profile-c1')).toHaveClass('bg-[#303030]')
      expect(screen.getByTestId('chat-profile-c2')).not.toHaveClass('bg-[#303030]')
    })
  })

  describe('scroll / load more', () => {
    it('calls onLoadMore when scrolled near bottom and hasMore is true', () => {
      const onLoadMore = vi.fn()
      render(
        <Chats
          {...defaultProps}
          conversations={[makeConversation('c1')]}
          hasMore={true}
          loadingMore={false}
          onLoadMore={onLoadMore}
        />
      )
      const list = screen.getByTestId('chat-list')
      Object.defineProperty(list, 'scrollHeight', { value: 500, configurable: true })
      Object.defineProperty(list, 'scrollTop', { value: 390, configurable: true })
      Object.defineProperty(list, 'clientHeight', { value: 100, configurable: true })
      fireEvent.scroll(list)
      expect(onLoadMore).toHaveBeenCalled()
    })

    it('does not call onLoadMore when not near bottom', () => {
      const onLoadMore = vi.fn()
      render(
        <Chats
          {...defaultProps}
          conversations={[makeConversation('c1')]}
          hasMore={true}
          loadingMore={false}
          onLoadMore={onLoadMore}
        />
      )
      const list = screen.getByTestId('chat-list')
      Object.defineProperty(list, 'scrollHeight', { value: 1000, configurable: true })
      Object.defineProperty(list, 'scrollTop', { value: 0, configurable: true })
      Object.defineProperty(list, 'clientHeight', { value: 100, configurable: true })
      fireEvent.scroll(list)
      expect(onLoadMore).not.toHaveBeenCalled()
    })

    it('does not call onLoadMore when hasMore is false', () => {
      const onLoadMore = vi.fn()
      render(
        <Chats
          {...defaultProps}
          conversations={[makeConversation('c1')]}
          hasMore={false}
          onLoadMore={onLoadMore}
        />
      )
      const list = screen.getByTestId('chat-list')
      Object.defineProperty(list, 'scrollHeight', { value: 200, configurable: true })
      Object.defineProperty(list, 'scrollTop', { value: 100, configurable: true })
      Object.defineProperty(list, 'clientHeight', { value: 100, configurable: true })
      fireEvent.scroll(list)
      expect(onLoadMore).not.toHaveBeenCalled()
    })

    it('does not call onLoadMore when already loadingMore', () => {
      const onLoadMore = vi.fn()
      render(
        <Chats
          {...defaultProps}
          conversations={[makeConversation('c1')]}
          hasMore={true}
          loadingMore={true}
          onLoadMore={onLoadMore}
        />
      )
      const list = screen.getByTestId('chat-list')
      Object.defineProperty(list, 'scrollHeight', { value: 200, configurable: true })
      Object.defineProperty(list, 'scrollTop', { value: 100, configurable: true })
      Object.defineProperty(list, 'clientHeight', { value: 100, configurable: true })
      fireEvent.scroll(list)
      expect(onLoadMore).not.toHaveBeenCalled()
    })
  })
})
