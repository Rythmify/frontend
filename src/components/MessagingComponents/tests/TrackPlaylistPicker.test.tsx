import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockFetchMyTracks = vi.fn()
const mockFetchMyRepostedTracks = vi.fn()
const mockFetchMyRepostedPlaylists = vi.fn()
const mockFetchUserPlaylists = vi.fn()
const mockUseAuthStore = vi.fn()

vi.mock('@/services/api/messaging/conversationApi', () => ({
  fetchMyTracks: (...args: unknown[]) => mockFetchMyTracks(...args),
  fetchMyRepostedTracks: (...args: unknown[]) => mockFetchMyRepostedTracks(...args),
  fetchMyRepostedPlaylists: (...args: unknown[]) => mockFetchMyRepostedPlaylists(...args),
  fetchUserPlaylists: (...args: unknown[]) => mockFetchUserPlaylists(...args),
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: (selector: (state: { user: { id: string; role: string } | null }) => unknown) =>
    mockUseAuthStore(selector),
}))

import TrackPlaylistPicker from '../TrackPlaylistPicker'

const mockTrack = (id: string, title = `Track ${id}`) => ({
  id,
  title,
  artist_name: 'Artist',
  cover_image: null,
})

const mockPlaylist = (id: string, title = `Playlist ${id}`) => ({
  playlist_id: id,
  name: title,
  track_count: 2,
  cover_image: null,
  is_public: true,
})

const mockRepostedPlaylist = (id: string, title = `Reposted Playlist ${id}`) => ({
  id,
  title,
  track_count: 12,
  cover_image: null,
})

const defaultProps = {
  onPick: vi.fn(),
  onClose: vi.fn(),
}

describe('TrackPlaylistPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({ user: { id: 'user-1', role: 'artist' } })
    )
    mockFetchMyTracks.mockResolvedValue({ data: [mockTrack('t1', 'My Track')] })
    mockFetchMyRepostedTracks.mockResolvedValue({ data: [] })
    mockFetchUserPlaylists.mockResolvedValue({ data: [mockPlaylist('pl1', 'My Playlist')] })
    mockFetchMyRepostedPlaylists.mockResolvedValue({ data: [] })
  })

  describe('rendering', () => {
    it('renders the picker container', async () => {
      render(<TrackPlaylistPicker {...defaultProps} />)
      expect(screen.getByTestId('track-playlist-picker')).toBeInTheDocument()
    })

    it('renders the search input', async () => {
      render(<TrackPlaylistPicker {...defaultProps} />)
      expect(screen.getByPlaceholderText('Select a track or playlist from your profile')).toBeInTheDocument()
    })

    it('shows loading state initially', () => {
      mockFetchMyTracks.mockReturnValue(new Promise(() => {}))
      render(<TrackPlaylistPicker {...defaultProps} />)
      expect(screen.getByText('Loading tracks and playlists...')).toBeInTheDocument()
    })

    it('renders tracks after loading', async () => {
      render(<TrackPlaylistPicker {...defaultProps} />)
      await waitFor(() => expect(screen.getByText('My Track')).toBeInTheDocument())
    })

    it('renders playlists after loading', async () => {
      render(<TrackPlaylistPicker {...defaultProps} />)
      await waitFor(() => expect(screen.getByText('My Playlist')).toBeInTheDocument())
    })

    it('shows "No tracks or playlists found." when all lists are empty', async () => {
      mockFetchMyTracks.mockResolvedValue({ data: [] })
      mockFetchUserPlaylists.mockResolvedValue({ data: [] })
      render(<TrackPlaylistPicker {...defaultProps} />)
      await waitFor(() => expect(screen.getByText('No tracks or playlists found.')).toBeInTheDocument())
    })

    it('deduplicates items with same type:id', async () => {
      mockFetchMyTracks.mockResolvedValue({ data: [mockTrack('t1', 'My Track')] })
      mockFetchMyRepostedTracks.mockResolvedValue({ data: [mockTrack('t1', 'My Track')] })
      render(<TrackPlaylistPicker {...defaultProps} />)
      await waitFor(() => screen.getByText('My Track'))
      expect(screen.getAllByText('My Track')).toHaveLength(1)
    })

    it('renders private playlists with cover art and private indicator', async () => {
      mockFetchMyTracks.mockResolvedValue({ data: [] })
      mockFetchUserPlaylists.mockResolvedValue({
        data: [
          {
            ...mockPlaylist('pl-private', 'Private Mix'),
            cover_image: 'https://example.com/private.jpg',
            is_public: false,
          },
        ],
      })

      render(<TrackPlaylistPicker {...defaultProps} />)

      await waitFor(() => expect(screen.getByText('Private Mix')).toBeInTheDocument())
      const privateRow = screen.getByRole('button', { name: /Private Mix/ })
      expect(privateRow.querySelector('img')).toHaveAttribute('src', 'https://example.com/private.jpg')
      expect(screen.getByLabelText('Private')).toBeInTheDocument()
    })
  })

  describe('search/filter', () => {
    it('filters tracks by search query', async () => {
      mockFetchMyTracks.mockResolvedValue({ data: [mockTrack('t1', 'Jazzy Blues'), mockTrack('t2', 'Rock Anthem')] })
      render(<TrackPlaylistPicker {...defaultProps} />)
      await waitFor(() => screen.getByText('Jazzy Blues'))
      fireEvent.change(screen.getByPlaceholderText('Select a track or playlist from your profile'), {
        target: { value: 'jazz' },
      })
      expect(screen.getByText('Jazzy Blues')).toBeInTheDocument()
      expect(screen.queryByText('Rock Anthem')).not.toBeInTheDocument()
    })

    it('shows all items when query is cleared', async () => {
      mockFetchMyTracks.mockResolvedValue({ data: [mockTrack('t1', 'Jazzy Blues'), mockTrack('t2', 'Rock Anthem')] })
      render(<TrackPlaylistPicker {...defaultProps} />)
      await waitFor(() => screen.getByText('Jazzy Blues'))
      const input = screen.getByPlaceholderText('Select a track or playlist from your profile')
      fireEvent.change(input, { target: { value: 'jazz' } })
      fireEvent.change(input, { target: { value: '' } })
      expect(screen.getByText('Jazzy Blues')).toBeInTheDocument()
      expect(screen.getByText('Rock Anthem')).toBeInTheDocument()
    })

    it('shows empty state when query matches nothing', async () => {
      render(<TrackPlaylistPicker {...defaultProps} />)
      await waitFor(() => screen.getByText('My Track'))
      fireEvent.change(screen.getByPlaceholderText('Select a track or playlist from your profile'), {
        target: { value: 'xyz-does-not-exist' },
      })
      expect(screen.getByText('No tracks or playlists found.')).toBeInTheDocument()
    })

    it('filters playlists by track count text', async () => {
      mockFetchMyTracks.mockResolvedValue({ data: [] })
      mockFetchUserPlaylists.mockResolvedValue({ data: [mockPlaylist('pl12', 'Dozen Songs')] })
      render(<TrackPlaylistPicker {...defaultProps} />)
      await waitFor(() => screen.getByText('Dozen Songs'))

      fireEvent.change(screen.getByPlaceholderText('Select a track or playlist from your profile'), {
        target: { value: '2' },
      })

      expect(screen.getByText('Dozen Songs')).toBeInTheDocument()
    })
  })

  describe('picking items', () => {
    it('calls onPick with track info when a track row is clicked', async () => {
      const onPick = vi.fn()
      render(<TrackPlaylistPicker {...defaultProps} onPick={onPick} />)
      await waitFor(() => screen.getByText('My Track'))
      await userEvent.click(screen.getByText('My Track'))
      expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ type: 'track', id: 't1', title: 'My Track' }))
    })

    it('calls onPick with playlist info when a playlist row is clicked', async () => {
      const onPick = vi.fn()
      render(<TrackPlaylistPicker {...defaultProps} onPick={onPick} />)
      await waitFor(() => screen.getByText('My Playlist'))
      await userEvent.click(screen.getByText('My Playlist'))
      expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ type: 'playlist', id: 'pl1', title: 'My Playlist' }))
    })

    it('calls onClose after picking a track', async () => {
      const onClose = vi.fn()
      render(<TrackPlaylistPicker {...defaultProps} onClose={onClose} />)
      await waitFor(() => screen.getByText('My Track'))
      await userEvent.click(screen.getByText('My Track'))
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('outside click to close', () => {
    it('calls onClose when clicking outside the picker', async () => {
      const onClose = vi.fn()
      render(
        <div>
          <div data-test="outside">Outside</div>
          <TrackPlaylistPicker {...defaultProps} onClose={onClose} />
        </div>
      )
      await waitFor(() => screen.getByTestId('track-playlist-picker'))
      fireEvent.mouseDown(screen.getByTestId('outside'))
      expect(onClose).toHaveBeenCalled()
    })

    it('does not call onClose when clicking inside the picker', async () => {
      const onClose = vi.fn()
      render(<TrackPlaylistPicker {...defaultProps} onClose={onClose} />)
      const picker = await waitFor(() => screen.getByTestId('track-playlist-picker'))
      fireEvent.mouseDown(picker)
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('shows empty state and does not crash when all fetches fail', async () => {
      mockFetchMyTracks.mockRejectedValue(new Error('fail'))
      mockFetchMyRepostedTracks.mockRejectedValue(new Error('fail'))
      mockFetchUserPlaylists.mockRejectedValue(new Error('fail'))
      mockFetchMyRepostedPlaylists.mockRejectedValue(new Error('fail'))
      render(<TrackPlaylistPicker {...defaultProps} />)
      await waitFor(() => expect(screen.getByText('No tracks or playlists found.')).toBeInTheDocument())
    })

    it('renders available items when some fetches succeed and others fail', async () => {
      mockFetchMyTracks.mockResolvedValue({ data: [mockTrack('t1', 'My Track')] })
      mockFetchMyRepostedTracks.mockRejectedValue(new Error('fail'))
      mockFetchUserPlaylists.mockRejectedValue(new Error('fail'))
      mockFetchMyRepostedPlaylists.mockRejectedValue(new Error('fail'))
      render(<TrackPlaylistPicker {...defaultProps} />)
      await waitFor(() => expect(screen.getByText('My Track')).toBeInTheDocument())
    })

    it('handles null user gracefully (no user.id)', async () => {
      mockUseAuthStore.mockImplementation((selector: any) => selector({ user: null }))
      render(<TrackPlaylistPicker {...defaultProps} />)
      await waitFor(() => screen.getByTestId('track-playlist-picker'))
      // should not crash
    })

    it('falls back to empty state when request setup throws', async () => {
      mockFetchMyTracks.mockImplementation(() => {
        throw new Error('boom')
      })
      render(<TrackPlaylistPicker {...defaultProps} />)
      await waitFor(() => expect(screen.getByText('No tracks or playlists found.')).toBeInTheDocument())
    })
  })

  describe('reposted tracks from array response', () => {
    it('handles array responses (not wrapped in data key)', async () => {
      mockFetchMyRepostedTracks.mockResolvedValue([mockTrack('t2', 'Reposted Track')])
      render(<TrackPlaylistPicker {...defaultProps} />)
      await waitFor(() => expect(screen.getByText('Reposted Track')).toBeInTheDocument())
    })

    it('handles fallback tracks and playlists response keys', async () => {
      mockFetchMyTracks.mockResolvedValue({ tracks: [mockTrack('t3', 'Fallback Track')] })
      mockFetchUserPlaylists.mockResolvedValue({ playlists: [mockPlaylist('pl3', 'Fallback Playlist')] })
      mockFetchMyRepostedPlaylists.mockResolvedValue({
        playlists: [mockRepostedPlaylist('rp1', 'Fallback Repost')],
      })

      render(<TrackPlaylistPicker {...defaultProps} />)

      await waitFor(() => expect(screen.getByText('Fallback Track')).toBeInTheDocument())
      expect(screen.getByText('Fallback Playlist')).toBeInTheDocument()
      expect(screen.getByText('Fallback Repost')).toBeInTheDocument()
    })
  })
})
