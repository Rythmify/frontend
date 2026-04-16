import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, configure } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotificationsPage from '@/pages/social/notifications/NotificationsPage'

// Match the project-wide convention: all elements use data-test, not data-testid
configure({ testIdAttribute: 'data-test' })

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockFetchNotifications = vi.fn()
const mockFetchMyFollowing   = vi.fn()
const mockFetchUnreadCount   = vi.fn()

vi.mock('@/services/api/notifications/notificationsAPI', () => ({
  fetchNotifications: (...args: any[]) => mockFetchNotifications(...args),
  fetchMyFollowing:   (...args: any[]) => mockFetchMyFollowing(...args),
}))

vi.mock('@/stores/notification.store', () => ({
  useNotificationStore: () => ({
    fetchUnreadCount: mockFetchUnreadCount,
    unreadCount: 0,
  }),
}))

vi.mock('@/components/notificationsComponents/notificationCard', () => ({
  default: ({ notification }: any) => (
    <div data-test={`notification-card-${notification.id}`}>{notification.id}</div>
  ),
}))

vi.mock('@/components/notificationsComponents/notificationHeader', () => ({
  default: ({ selectedType, onTypeChange }: any) => (
    <div data-test="notification-header">
      <span data-test="selected-type">{selectedType}</span>
      <button data-test="filter-like"    onClick={() => onTypeChange('like')}>like</button>
      <button data-test="filter-all"     onClick={() => onTypeChange('all')}>all</button>
      <button data-test="filter-comment" onClick={() => onTypeChange('comment')}>comment</button>
    </div>
  ),
}))

vi.mock('@/components/UI/Spinner', () => ({
  default: () => <div data-test="notifications-loading" />,
}))

vi.mock('@/components/UI/ArtistListSection', () => ({
  default: ({ artists }: any) => (
    <div data-test="artist-list">
      {artists.map((a: any) => <div key={a.username}>{a.username}</div>)}
    </div>
  ),
}))

vi.mock('@/components/UI/GoMobile', () => ({
  default: () => <div data-test="go-mobile" />,
}))

// ─── Factories ────────────────────────────────────────────────────────────────

const makeNotification = (id: string) => ({
  id,
  type: 'follow',
  is_read: false,
  created_at: new Date().toISOString(),
  actor: { id: 'u1', username: 'alice', display_name: 'Alice', profile_picture: null, is_verified: false },
  resource: null,
})

const resolvedNotifications = (items: any[]) =>
  Promise.resolve({ data: { items } })

const resolvedFollowing = (items: any[]) =>
  Promise.resolve({ data: { items } })

// ─── Render helper ────────────────────────────────────────────────────────────

const renderPage = () =>
  render(
    <MemoryRouter>
      <NotificationsPage />
    </MemoryRouter>,
  )

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchMyFollowing.mockResolvedValue(resolvedFollowing([]))
    mockFetchUnreadCount.mockResolvedValue(undefined)
  })

  // ── Loading state ─────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows spinner while notifications are loading', async () => {
      mockFetchNotifications.mockReturnValue(new Promise(() => {}))
      renderPage()
      expect(screen.getByTestId('notifications-loading')).toBeInTheDocument()
    })

    it('hides spinner after data loads', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([makeNotification('n1')]))
      renderPage()
      await waitFor(() =>
        expect(screen.queryByTestId('notifications-loading')).not.toBeInTheDocument(),
      )
    })
  })

  // ── Success state ─────────────────────────────────────────────────────────

  describe('success state', () => {
    it('renders notification list on success', async () => {
      mockFetchNotifications.mockResolvedValue(
        resolvedNotifications([makeNotification('n1'), makeNotification('n2')]),
      )
      renderPage()
      await waitFor(() => {
        expect(screen.getByTestId('notifications-list')).toBeInTheDocument()
      })
    })

    it('renders a card for each notification', async () => {
      mockFetchNotifications.mockResolvedValue(
        resolvedNotifications([makeNotification('n1'), makeNotification('n2'), makeNotification('n3')]),
      )
      renderPage()
      await waitFor(() => {
        expect(screen.getByTestId('notification-card-n1')).toBeInTheDocument()
        expect(screen.getByTestId('notification-card-n2')).toBeInTheDocument()
        expect(screen.getByTestId('notification-card-n3')).toBeInTheDocument()
      })
    })
  })

  // ── Empty state ───────────────────────────────────────────────────────────

  describe('empty state', () => {
    it('shows empty message when API returns no items', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      renderPage()
      await waitFor(() => {
        expect(screen.getByTestId('notifications-empty')).toBeInTheDocument()
      })
    })

    it('shows correct empty message text', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      renderPage()
      await waitFor(() => {
        expect(screen.getByTestId('notifications-empty')).toHaveTextContent(
          "You don't have any notifications",
        )
      })
    })
  })

  // ── Error state ───────────────────────────────────────────────────────────

  describe('error state', () => {
    it('shows error message when API throws', async () => {
      mockFetchNotifications.mockRejectedValue(new Error('network error'))
      renderPage()
      await waitFor(() => {
        expect(screen.getByTestId('notifications-error')).toBeInTheDocument()
      })
    })

    it('shows correct error message text', async () => {
      mockFetchNotifications.mockRejectedValue(new Error('500'))
      renderPage()
      await waitFor(() => {
        expect(screen.getByTestId('notifications-error')).toHaveTextContent('Something went wrong.')
      })
    })
  })

  // ── Filter / type change ──────────────────────────────────────────────────

  describe('filter type change', () => {
    it('starts with "all" selected', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      renderPage()
      await waitFor(() =>
        expect(screen.getByTestId('selected-type')).toHaveTextContent('all'),
      )
    })

    it('calls fetchNotifications without type param for "all"', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      renderPage()
      await waitFor(() => {
        expect(mockFetchNotifications).toHaveBeenCalledWith(1, 50, false, undefined)
      })
    })

    it('re-fetches with type param when filter changes', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      renderPage()
      await waitFor(() => screen.getByTestId('notifications-empty'))

      fireEvent.click(screen.getByTestId('filter-like'))

      await waitFor(() => {
        expect(mockFetchNotifications).toHaveBeenCalledWith(1, 50, false, 'like')
      })
    })

    it('does NOT re-fetch when the same filter is selected again', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      renderPage()
      await waitFor(() => screen.getByTestId('notifications-empty'))

      const callsBefore = mockFetchNotifications.mock.calls.length

      fireEvent.click(screen.getByTestId('filter-all'))

      await new Promise(r => setTimeout(r, 50))

      expect(mockFetchNotifications.mock.calls.length).toBe(callsBefore)
    })

    it('updates selectedType in header when filter changes', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      renderPage()
      await waitFor(() => screen.getByTestId('notifications-empty'))

      fireEvent.click(screen.getByTestId('filter-comment'))

      await waitFor(() => {
        expect(screen.getByTestId('selected-type')).toHaveTextContent('comment')
      })
    })
  })

  // ── Sidebar ───────────────────────────────────────────────────────────────

  describe('sidebar', () => {
    it('renders ArtistListSection', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      renderPage()
      await waitFor(() => expect(screen.getByTestId('artist-list')).toBeInTheDocument())
    })

    it('renders GoMobileSection', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      renderPage()
      await waitFor(() => expect(screen.getByTestId('go-mobile')).toBeInTheDocument())
    })

    it('calls fetchMyFollowing on mount', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      renderPage()
      await waitFor(() => expect(mockFetchMyFollowing).toHaveBeenCalled())
    })

    it('populates ArtistListSection with fetched followers', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      mockFetchMyFollowing.mockResolvedValue(
        resolvedFollowing([
          { username: 'bob', profile_picture: null, is_verified: true },
          { username: 'carol', profile_picture: 'https://x.com/img.jpg', is_verified: false },
        ]),
      )
      renderPage()
      await waitFor(() => {
        expect(screen.getByText('bob')).toBeInTheDocument()
        expect(screen.getByText('carol')).toBeInTheDocument()
      })
    })

    it('silently ignores fetchMyFollowing errors', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      mockFetchMyFollowing.mockRejectedValue(new Error('network'))
      renderPage()
      await waitFor(() => expect(screen.getByTestId('artist-list')).toBeInTheDocument())
    })
  })

  // ── Unread count ──────────────────────────────────────────────────────────

  describe('unread count', () => {
    it('calls fetchUnreadCount on mount', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      renderPage()
      await waitFor(() => expect(mockFetchUnreadCount).toHaveBeenCalledTimes(1))
    })
  })

  // ── Page structure ────────────────────────────────────────────────────────

  describe('page structure', () => {
    it('renders the root page element', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      renderPage()
      await waitFor(() =>
        expect(screen.getByTestId('notifications-page')).toBeInTheDocument(),
      )
    })

    it('renders NotificationHeader', async () => {
      mockFetchNotifications.mockResolvedValue(resolvedNotifications([]))
      renderPage()
      await waitFor(() =>
        expect(screen.getByTestId('notification-header')).toBeInTheDocument(),
      )
    })
  })
})