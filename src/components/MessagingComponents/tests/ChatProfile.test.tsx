import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/components/UI/UserAvatar', () => ({
  default: ({ src, name, alt }: { src?: string | null; name: string; alt: string }) => (
    <div data-test="user-avatar" data-src={src ?? 'null'} data-name={name} data-alt={alt} />
  ),
}))

import { ChatProfile } from '../ChatProfile'
import type { Conversation } from '@/services/api/messaging/conversationApi'

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 'conv-1',
    participant: {
      id: 'user-2',
      username: 'testuser',
      display_name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
    },
    last_message: {
      id: 'msg-1',
      body: 'Hello there',
      embed_type: null,
      embed_id: null,
      sender_id: 'user-2',
      created_at: new Date().toISOString(),
    },
    unread_count: 0,
    updated_at: new Date().toISOString(),
    ...overrides,
  } as Conversation
}

describe('ChatProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the chat profile container with correct data-test id', () => {
      render(<ChatProfile conversation={makeConversation({ id: 'conv-42' })} />)
      expect(screen.getByTestId('chat-profile-conv-42')).toBeInTheDocument()
    })

    it('renders the participant display name', () => {
      render(<ChatProfile conversation={makeConversation()} />)
      expect(screen.getByTestId('chat-profile-name')).toHaveTextContent('Test User')
    })

    it('renders the last message body as preview', () => {
      render(<ChatProfile conversation={makeConversation()} />)
      expect(screen.getByTestId('chat-profile-preview')).toHaveTextContent('Hello there')
    })

    it('renders "·" when last_message is undefined', () => {
      render(<ChatProfile conversation={makeConversation({ last_message: undefined })} />)
      expect(screen.getByTestId('chat-profile-preview')).toHaveTextContent('·')
    })

    it('renders "·" when last_message has no body and no embed_type', () => {
      render(<ChatProfile conversation={makeConversation({ last_message: { id: 'm1', body: '', embed_type: null, embed_id: null, sender_id: 'u2', created_at: '' } as any })} />)
      expect(screen.getByTestId('chat-profile-preview')).toHaveTextContent('·')
    })

    it('renders track embed fallback when body is empty and embed_type is track', () => {
      render(<ChatProfile conversation={makeConversation({ last_message: { id: 'm1', body: '', embed_type: 'track', embed_id: 't1', sender_id: 'u2', created_at: '' } as any })} />)
      expect(screen.getByTestId('chat-profile-preview')).toHaveTextContent('🎵 Shared a track')
    })

    it('renders playlist embed fallback when body is empty and embed_type is playlist', () => {
      render(<ChatProfile conversation={makeConversation({ last_message: { id: 'm1', body: '', embed_type: 'playlist', embed_id: 'p1', sender_id: 'u2', created_at: '' } as any })} />)
      expect(screen.getByTestId('chat-profile-preview')).toHaveTextContent('🎶 Shared a playlist')
    })

    it('renders text body over embed type', () => {
      render(<ChatProfile conversation={makeConversation({ last_message: { id: 'm1', body: 'Check this out', embed_type: 'track', embed_id: 't1', sender_id: 'u2', created_at: '' } as any })} />)
      expect(screen.getByTestId('chat-profile-preview')).toHaveTextContent('Check this out')
    })

    it('renders unread dot when unread_count > 0', () => {
      render(<ChatProfile conversation={makeConversation({ unread_count: 3 })} />)
      expect(screen.getByTestId('chat-profile-unread-dot')).toBeInTheDocument()
    })

    it('does not render unread dot when unread_count is 0', () => {
      render(<ChatProfile conversation={makeConversation({ unread_count: 0 })} />)
      expect(screen.queryByTestId('chat-profile-unread-dot')).not.toBeInTheDocument()
    })

    it('renders UserAvatar with correct props', () => {
      render(<ChatProfile conversation={makeConversation()} />)
      const avatar = screen.getByTestId('user-avatar')
      expect(avatar).toHaveAttribute('data-src', 'https://example.com/avatar.jpg')
      expect(avatar).toHaveAttribute('data-name', 'Test User')
    })

    it('renders a time string', () => {
      render(<ChatProfile conversation={makeConversation()} />)
      expect(screen.getByTestId('chat-profile-time')).toBeInTheDocument()
    })

    it('applies active bg class when isActive is true', () => {
      render(<ChatProfile conversation={makeConversation()} isActive={true} />)
      expect(screen.getByTestId('chat-profile-conv-1')).toHaveClass('bg-[#303030]')
    })

    it('applies hover class when isActive is false', () => {
      render(<ChatProfile conversation={makeConversation()} isActive={false} />)
      expect(screen.getByTestId('chat-profile-conv-1')).toHaveClass('hover:bg-[#303030]')
    })
  })

  describe('time display', () => {
    it('shows "just now" for very recent timestamps', () => {
      const recentDate = new Date(Date.now() - 30000).toISOString()
      render(<ChatProfile conversation={makeConversation({ updated_at: recentDate })} />)
      expect(screen.getByTestId('chat-profile-time')).toHaveTextContent('just now')
    })

    it('shows minutes ago for timestamps a few minutes old', () => {
      const date = new Date(Date.now() - 3 * 60 * 1000).toISOString()
      render(<ChatProfile conversation={makeConversation({ updated_at: date })} />)
      expect(screen.getByTestId('chat-profile-time')).toHaveTextContent('3 minutes ago')
    })

    it('shows hours ago for timestamps hours old', () => {
      const date = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      render(<ChatProfile conversation={makeConversation({ updated_at: date })} />)
      expect(screen.getByTestId('chat-profile-time')).toHaveTextContent('2 hours ago')
    })

    it('shows singular "1 hour ago" correctly', () => {
      const date = new Date(Date.now() - 1 * 60 * 60 * 1000 - 1000).toISOString()
      render(<ChatProfile conversation={makeConversation({ updated_at: date })} />)
      expect(screen.getByTestId('chat-profile-time')).toHaveTextContent('1 hour ago')
    })

    it('shows days ago for timestamps days old', () => {
      const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      render(<ChatProfile conversation={makeConversation({ updated_at: date })} />)
      expect(screen.getByTestId('chat-profile-time')).toHaveTextContent('3 days ago')
    })

    it('shows weeks ago for timestamps weeks old', () => {
      const date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      render(<ChatProfile conversation={makeConversation({ updated_at: date })} />)
      expect(screen.getByTestId('chat-profile-time')).toHaveTextContent('2 weeks ago')
    })

    it('shows months ago for timestamps months old', () => {
      const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      render(<ChatProfile conversation={makeConversation({ updated_at: date })} />)
      expect(screen.getByTestId('chat-profile-time')).toHaveTextContent('2 months ago')
    })

    it('shows years ago for timestamps years old', () => {
      const date = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString()
      render(<ChatProfile conversation={makeConversation({ updated_at: date })} />)
      expect(screen.getByTestId('chat-profile-time')).toHaveTextContent('1 year ago')
    })
  })

  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const onClick = vi.fn()
      render(<ChatProfile conversation={makeConversation()} onClick={onClick} />)
      await userEvent.click(screen.getByTestId('chat-profile-conv-1'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('does not throw when onClick is not provided', async () => {
      render(<ChatProfile conversation={makeConversation()} />)
      await userEvent.click(screen.getByTestId('chat-profile-conv-1'))
    })
  })
})
