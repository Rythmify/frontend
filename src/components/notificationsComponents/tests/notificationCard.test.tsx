import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, configure } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotificationCard from '../notificationCard'
import type { Notification, NotificationResource } from '@/services/api/notifications/notificationsAPI'

// Match the project-wide convention: all elements use data-test, not data-testid
configure({ testIdAttribute: 'data-test' })

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/components/UI/FollowButton', () => ({
  default: ({ username }: { username: string }) => (
    <button data-test={`follow-btn-${username}`}>Follow</button>
  ),
}))

// Modal mock exposes onClose via a data-test button so tests can trigger it directly
vi.mock('@/components/UI/Modal', () => ({
  Modal: ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
  }) =>
    isOpen ? (
      <div data-test="modal">
        <button data-test="modal-backdrop-close" onClick={onClose}>
          backdrop
        </button>
        {children}
      </div>
    ) : null,
}))

vi.mock('@/components/UI/BlockModal', () => ({
  BlockUserModal: ({ username, onClose, onBlocked }: any) => (
    <div data-test="block-modal">
      <span>{username}</span>
      <button onClick={onClose}>close</button>
      <button onClick={onBlocked}>blocked</button>
    </div>
  ),
}))

vi.mock('@/components/UI/ReportModal', () => ({
  ReportModal: ({ username, onClose, onSpamSelected }: any) => (
    <div data-test="report-modal">
      <span>{username}</span>
      <button onClick={onClose}>close</button>
      <button onClick={onSpamSelected}>spam</button>
    </div>
  ),
}))

// ─── Factories ────────────────────────────────────────────────────────────────

const NOW = new Date().toISOString()

// NotificationActor has no is_verified — match the exact interface
const defaultActor = {
  id: 'user-1',
  username: 'johndoe',
  display_name: 'John Doe',
  profile_picture: null as string | null,
}

// Helper to build a typed NotificationResource — 'type' is required
const makeResource = (overrides: Partial<NotificationResource> = {}): NotificationResource => ({
  type: 'track',
  id: 'track-1',
  ...overrides,
})

const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'notif-1',
  type: 'follow',
  is_read: false,
  created_at: NOW,
  actor: defaultActor,
  resource: null,
  ...overrides,
})

const renderCard = (notification: Notification, showActions = true) =>
  render(
    <MemoryRouter>
      <NotificationCard notification={notification} showActions={showActions} />
    </MemoryRouter>,
  )

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NotificationCard', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ── Static rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the notification card root', () => {
      renderCard(makeNotification())
      expect(screen.getByTestId('notification-card-notif-1')).toBeInTheDocument()
    })

    it('renders the actor display name', () => {
      renderCard(makeNotification())
      expect(screen.getByTestId('notification-username-notif-1')).toHaveTextContent('John Doe')
    })

    it('renders the time element', () => {
      renderCard(makeNotification())
      expect(screen.getByTestId('notification-time-notif-1')).toBeInTheDocument()
    })

    it('renders avatar wrapper', () => {
      renderCard(makeNotification())
      expect(screen.getByTestId('notification-avatar-notif-1')).toBeInTheDocument()
    })
  })

  // ── Avatar ────────────────────────────────────────────────────────────────

  describe('avatar', () => {
    it('renders avatar image when profile_picture is provided', () => {
      const n = makeNotification({
        actor: { ...defaultActor, profile_picture: 'https://example.com/pic.jpg' },
      })
      renderCard(n)
      expect(screen.getByTestId('notification-avatar-img-notif-1')).toHaveAttribute(
        'src',
        'https://example.com/pic.jpg',
      )
    })

    it('renders fallback icon when profile_picture is null', () => {
      renderCard(makeNotification())
      expect(screen.getByTestId('notification-avatar-fallback-notif-1')).toBeInTheDocument()
    })

    it('shows unread dot overlay when is_read is false', () => {
      renderCard(makeNotification({ is_read: false }))
      const avatar = screen.getByTestId('notification-avatar-notif-1')
      expect(avatar.querySelector('.bg-red-500')).toBeInTheDocument()
    })

    it('does NOT show unread dot when is_read is true', () => {
      renderCard(makeNotification({ is_read: true }))
      const avatar = screen.getByTestId('notification-avatar-notif-1')
      expect(avatar.querySelector('.bg-red-500')).not.toBeInTheDocument()
    })
  })

  // ── Action text ───────────────────────────────────────────────────────────

  describe('buildActionText', () => {
    it('renders "started following you" for follow type', () => {
      renderCard(makeNotification({ type: 'follow' }))
      expect(screen.getByTestId('notification-action-text-notif-1')).toHaveTextContent(
        'started following you',
      )
    })

    it('renders liked text with track title for like type', () => {
      renderCard(
        makeNotification({ type: 'like', resource: makeResource({ title: 'My Song' }) }),
      )
      expect(screen.getByTestId('notification-action-text-notif-1')).toHaveTextContent(
        'liked your track "My Song"',
      )
    })

    it('falls back to resource id when title is undefined for like type', () => {
      renderCard(
        makeNotification({ type: 'like', resource: makeResource({ id: 'track-42', title: undefined }) }),
      )
      expect(screen.getByTestId('notification-action-text-notif-1')).toHaveTextContent(
        'liked your track "track-42"',
      )
    })

    it('renders reposted text with track title for repost type', () => {
      renderCard(
        makeNotification({ type: 'repost', resource: makeResource({ title: 'My Song' }) }),
      )
      expect(screen.getByTestId('notification-action-text-notif-1')).toHaveTextContent(
        'reposted your track "My Song"',
      )
    })

    it('falls back to resource id when title is undefined for repost type', () => {
      renderCard(
        makeNotification({ type: 'repost', resource: makeResource({ id: 'track-7', title: undefined }) }),
      )
      expect(screen.getByTestId('notification-action-text-notif-1')).toHaveTextContent(
        'reposted your track "track-7"',
      )
    })

    it('renders comment text with body for comment type', () => {
      renderCard(
        makeNotification({ type: 'comment', resource: makeResource({ body: 'Great track!' }) }),
      )
      expect(screen.getByTestId('notification-action-text-notif-1')).toHaveTextContent(
        'commented "Great track!" on your track',
      )
    })

    // ── ?? '' fallback branches ───────────────────────────────────────────

    it('falls back to empty string when resource is null for like type', () => {
      renderCard(makeNotification({ type: 'like', resource: null }))
      expect(screen.getByTestId('notification-action-text-notif-1')).toHaveTextContent(
        'liked your track ""',
      )
    })

    it('falls back to empty string when resource is null for repost type', () => {
      renderCard(makeNotification({ type: 'repost', resource: null }))
      expect(screen.getByTestId('notification-action-text-notif-1')).toHaveTextContent(
        'reposted your track ""',
      )
    })

    it('falls back to empty string when body is undefined for comment type', () => {
      renderCard(
        makeNotification({ type: 'comment', resource: makeResource({ body: undefined }) }),
      )
      expect(screen.getByTestId('notification-action-text-notif-1')).toHaveTextContent(
        'commented "" on your track',
      )
    })

    it('falls back to empty string when resource is null for comment type', () => {
      renderCard(makeNotification({ type: 'comment', resource: null }))
      expect(screen.getByTestId('notification-action-text-notif-1')).toHaveTextContent(
        'commented "" on your track',
      )
    })

    it('renders empty string for unknown type', () => {
      renderCard(makeNotification({ type: 'unknown' as any }))
      expect(screen.getByTestId('notification-action-text-notif-1')).toHaveTextContent('')
    })
  })

  // ── Relative time ─────────────────────────────────────────────────────────

  describe('formatRelativeTime', () => {
    it('shows minutes ago for recent notifications', () => {
      const createdAt = new Date('2024-01-01T11:45:00Z').toISOString()
      renderCard(makeNotification({ created_at: createdAt }))
      expect(screen.getByTestId('notification-time-notif-1')).toHaveTextContent('15 minutes ago')
    })

    it('shows singular hour for exactly 1 hour ago', () => {
      const createdAt = new Date('2024-01-01T11:00:00Z').toISOString()
      renderCard(makeNotification({ created_at: createdAt }))
      expect(screen.getByTestId('notification-time-notif-1')).toHaveTextContent('1 hour ago')
    })

    it('shows plural hours for 2+ hours ago', () => {
      const createdAt = new Date('2024-01-01T10:00:00Z').toISOString()
      renderCard(makeNotification({ created_at: createdAt }))
      expect(screen.getByTestId('notification-time-notif-1')).toHaveTextContent('2 hours ago')
    })

    it('shows singular day for exactly 1 day ago', () => {
      const createdAt = new Date('2023-12-31T12:00:00Z').toISOString()
      renderCard(makeNotification({ created_at: createdAt }))
      expect(screen.getByTestId('notification-time-notif-1')).toHaveTextContent('1 day ago')
    })

    it('shows plural days for 2+ days ago', () => {
      const createdAt = new Date('2023-12-30T12:00:00Z').toISOString()
      renderCard(makeNotification({ created_at: createdAt }))
      expect(screen.getByTestId('notification-time-notif-1')).toHaveTextContent('2 days ago')
    })
  })

  // ── Navigation ────────────────────────────────────────────────────────────

  describe('navigation', () => {
    it('navigates to user profile on click for follow notifications', () => {
      renderCard(makeNotification({ type: 'follow' }))
      fireEvent.click(screen.getByTestId('notification-card-notif-1'))
      expect(mockNavigate).toHaveBeenCalledWith('/johndoe')
    })

    it('navigates to track page on click for like notifications', () => {
      renderCard(makeNotification({ type: 'like', resource: makeResource({ id: 'track-99' }) }))
      fireEvent.click(screen.getByTestId('notification-card-notif-1'))
      expect(mockNavigate).toHaveBeenCalledWith('/tracks/track-99')
    })

    it('navigates to track page on click for comment notifications', () => {
      renderCard(makeNotification({ type: 'comment', resource: makeResource({ id: 'track-5' }) }))
      fireEvent.click(screen.getByTestId('notification-card-notif-1'))
      expect(mockNavigate).toHaveBeenCalledWith('/tracks/track-5')
    })

    it('navigates to track page on click for repost notifications', () => {
      renderCard(makeNotification({ type: 'repost', resource: makeResource({ id: 'track-8', title: 'Remix' }) }))
      fireEvent.click(screen.getByTestId('notification-card-notif-1'))
      expect(mockNavigate).toHaveBeenCalledWith('/tracks/track-8')
    })
  })

  // ── Follow button ─────────────────────────────────────────────────────────

  describe('FollowButton', () => {
    it('renders FollowButton for follow type', () => {
      renderCard(makeNotification({ type: 'follow' }))
      expect(screen.getByTestId('follow-btn-johndoe')).toBeInTheDocument()
    })

    it('does NOT render FollowButton for like type', () => {
      renderCard(makeNotification({ type: 'like', resource: makeResource({ title: 'S' }) }))
      expect(screen.queryByTestId('follow-btn-johndoe')).not.toBeInTheDocument()
    })
  })

  // ── 3-dots menu ───────────────────────────────────────────────────────────

  describe('3-dots dropdown menu', () => {
    it('renders the 3-dots menu button when showActions is true', () => {
      renderCard(makeNotification())
      expect(screen.getByTestId('notification-menu-btn-notif-1')).toBeInTheDocument()
    })

    it('does NOT render the 3-dots button when showActions is false', () => {
      renderCard(makeNotification(), false)
      expect(screen.queryByTestId('notification-menu-btn-notif-1')).not.toBeInTheDocument()
    })

    it('menu is hidden by default', () => {
      renderCard(makeNotification())
      expect(screen.queryByTestId('notification-menu-notif-1')).not.toBeInTheDocument()
    })

    it('opens the dropdown when 3-dots button is clicked', () => {
      renderCard(makeNotification())
      fireEvent.click(screen.getByTestId('notification-menu-btn-notif-1'))
      expect(screen.getByTestId('notification-menu-notif-1')).toBeInTheDocument()
    })

    it('toggles the dropdown closed on second click', () => {
      renderCard(makeNotification())
      const btn = screen.getByTestId('notification-menu-btn-notif-1')
      fireEvent.click(btn)
      fireEvent.click(btn)
      expect(screen.queryByTestId('notification-menu-notif-1')).not.toBeInTheDocument()
    })

    it('shows block and report buttons in the dropdown', () => {
      renderCard(makeNotification())
      fireEvent.click(screen.getByTestId('notification-menu-btn-notif-1'))
      expect(screen.getByTestId('notification-block-btn-notif-1')).toBeInTheDocument()
      expect(screen.getByTestId('notification-report-btn-notif-1')).toBeInTheDocument()
    })

    it('clicking the actions area does NOT propagate to the card row (no navigation)', () => {
      renderCard(makeNotification({ type: 'follow' }))
      fireEvent.click(screen.getByTestId('notification-actions-notif-1'))
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  // ── Block modal ───────────────────────────────────────────────────────────

  describe('Block modal', () => {
    it('opens block modal when block button is clicked', () => {
      renderCard(makeNotification())
      fireEvent.click(screen.getByTestId('notification-menu-btn-notif-1'))
      fireEvent.click(screen.getByTestId('notification-block-btn-notif-1'))
      expect(screen.getByTestId('block-modal')).toBeInTheDocument()
    })

    it('closes menu when block button is clicked', () => {
      renderCard(makeNotification())
      fireEvent.click(screen.getByTestId('notification-menu-btn-notif-1'))
      fireEvent.click(screen.getByTestId('notification-block-btn-notif-1'))
      expect(screen.queryByTestId('notification-menu-notif-1')).not.toBeInTheDocument()
    })

    it('closes block modal via onClose callback', () => {
      renderCard(makeNotification())
      fireEvent.click(screen.getByTestId('notification-menu-btn-notif-1'))
      fireEvent.click(screen.getByTestId('notification-block-btn-notif-1'))
      fireEvent.click(screen.getByText('close'))
      expect(screen.queryByTestId('block-modal')).not.toBeInTheDocument()
    })

    it('closes block modal via onBlocked callback', () => {
      renderCard(makeNotification())
      fireEvent.click(screen.getByTestId('notification-menu-btn-notif-1'))
      fireEvent.click(screen.getByTestId('notification-block-btn-notif-1'))
      fireEvent.click(screen.getByText('blocked'))
      expect(screen.queryByTestId('block-modal')).not.toBeInTheDocument()
    })

    // ── Covers line 169: Modal onClose={() => setIsBlockOpen(false)} ──────
    it('closes block modal via Modal backdrop onClose (covers line 169)', () => {
      renderCard(makeNotification())
      fireEvent.click(screen.getByTestId('notification-menu-btn-notif-1'))
      fireEvent.click(screen.getByTestId('notification-block-btn-notif-1'))
      expect(screen.getByTestId('block-modal')).toBeInTheDocument()
      // Trigger the onClose prop passed to <Modal> directly (the backdrop close)
      fireEvent.click(screen.getByTestId('modal-backdrop-close'))
      expect(screen.queryByTestId('block-modal')).not.toBeInTheDocument()
    })
  })

  // ── Report modal ──────────────────────────────────────────────────────────

  describe('Report modal', () => {
    it('opens report modal when report button is clicked', () => {
      renderCard(makeNotification())
      fireEvent.click(screen.getByTestId('notification-menu-btn-notif-1'))
      fireEvent.click(screen.getByTestId('notification-report-btn-notif-1'))
      expect(screen.getByTestId('report-modal')).toBeInTheDocument()
    })

    it('closes menu when report button is clicked', () => {
      renderCard(makeNotification())
      fireEvent.click(screen.getByTestId('notification-menu-btn-notif-1'))
      fireEvent.click(screen.getByTestId('notification-report-btn-notif-1'))
      expect(screen.queryByTestId('notification-menu-notif-1')).not.toBeInTheDocument()
    })

    it('closes report modal via onClose callback', () => {
      renderCard(makeNotification())
      fireEvent.click(screen.getByTestId('notification-menu-btn-notif-1'))
      fireEvent.click(screen.getByTestId('notification-report-btn-notif-1'))
      fireEvent.click(screen.getByText('close'))
      expect(screen.queryByTestId('report-modal')).not.toBeInTheDocument()
    })

    it('closes report modal via onSpamSelected callback', () => {
      renderCard(makeNotification())
      fireEvent.click(screen.getByTestId('notification-menu-btn-notif-1'))
      fireEvent.click(screen.getByTestId('notification-report-btn-notif-1'))
      fireEvent.click(screen.getByText('spam'))
      expect(screen.queryByTestId('report-modal')).not.toBeInTheDocument()
    })

    // ── Covers line 179: Modal onClose={() => setIsReportOpen(false)} ─────
    it('closes report modal via Modal backdrop onClose (covers line 179)', () => {
      renderCard(makeNotification())
      fireEvent.click(screen.getByTestId('notification-menu-btn-notif-1'))
      fireEvent.click(screen.getByTestId('notification-report-btn-notif-1'))
      expect(screen.getByTestId('report-modal')).toBeInTheDocument()
      // Trigger the onClose prop passed to <Modal> directly (the backdrop close)
      fireEvent.click(screen.getByTestId('modal-backdrop-close'))
      expect(screen.queryByTestId('report-modal')).not.toBeInTheDocument()
    })
  })
})