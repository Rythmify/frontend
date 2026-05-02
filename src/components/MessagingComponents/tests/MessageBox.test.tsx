import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockResolvePermalink = vi.fn()
const mockFetchTrack = vi.fn()
const mockFetchPlaylist = vi.fn()

vi.mock('@/services/api/messaging/conversationApi', () => ({
  resolvePermalink: (...args: unknown[]) => mockResolvePermalink(...args),
  fetchTrack: (...args: unknown[]) => mockFetchTrack(...args),
  fetchPlaylist: (...args: unknown[]) => mockFetchPlaylist(...args),
}))

vi.mock('../MiniPlayer', () => ({
  default: ({ trackName, onClose }: { trackName: string; onClose: () => void }) => (
    <div data-test="mini-player" data-track={trackName}>
      <button data-test="mini-player-close" onClick={onClose}>×</button>
    </div>
  ),
}))

import { MessageBox } from '../MessageBox'

const defaultProps = {
  onValueChange: vi.fn(),
  onIsEmptyChange: vi.fn(),
  onEmbedsResolved: vi.fn(),
  hasError: false,
}

const mockTrack = {
  id: 'track-1',
  title: 'My Track',
  artist_name: 'Artist',
  cover_image: null,
  description: null,
  genre: null,
  duration: null,
  bitrate: null,
  status: 'public',
  is_public: true,
  is_hidden: false,
  user_id: 'u1',
  play_count: 0,
  like_count: 0,
  stream_url: null,
  preview_url: null,
  waveform_url: null,
  artists: null,
  created_at: '',
  updated_at: '',
}

const mockPlaylist = {
  playlist_id: 'pl-1',
  name: 'My Playlist',
  cover_image: null,
  track_count: 3,
  tracks: [],
  owner_user_id: 'u1',
  slug: null,
  description: null,
  is_public: true,
  like_count: 0,
  repost_count: 0,
  created_at: '',
  updated_at: '',
}

describe('MessageBox', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders the message-box container', () => {
      render(<MessageBox {...defaultProps} />)
      expect(screen.getByTestId('message-box')).toBeInTheDocument()
    })

    it('renders the textarea', () => {
      render(<MessageBox {...defaultProps} />)
      expect(screen.getByTestId('message-input')).toBeInTheDocument()
    })

    it('textarea starts empty', () => {
      render(<MessageBox {...defaultProps} />)
      expect(screen.getByTestId('message-input')).toHaveValue('')
    })

    it('applies error border class when hasError is true', () => {
      render(<MessageBox {...defaultProps} hasError={true} />)
      expect(screen.getByTestId('message-input')).toHaveClass('border-red-500')
    })

    it('applies normal border class when hasError is false', () => {
      render(<MessageBox {...defaultProps} hasError={false} />)
      expect(screen.getByTestId('message-input')).not.toHaveClass('border-red-500')
    })

    it('does not render MiniPlayer when no embeds', () => {
      render(<MessageBox {...defaultProps} />)
      expect(screen.queryByTestId('mini-player')).not.toBeInTheDocument()
    })

    it('renders MiniPlayer for external track embed', () => {
      const externalEmbeds = [{ type: 'track' as const, id: 't1', resource: mockTrack, sourceUrl: '' }]
      render(<MessageBox {...defaultProps} externalEmbeds={externalEmbeds} />)
      expect(screen.getByTestId('mini-player')).toBeInTheDocument()
    })

    it('renders MiniPlayer for external playlist embed', () => {
      const externalEmbeds = [{ type: 'playlist' as const, id: 'pl1', resource: mockPlaylist as any, sourceUrl: '' }]
      render(<MessageBox {...defaultProps} externalEmbeds={externalEmbeds} />)
      expect(screen.getByTestId('mini-player')).toBeInTheDocument()
    })

    it('renders multiple MiniPlayers for multiple embeds', () => {
      const externalEmbeds = [
        { type: 'track' as const, id: 't1', resource: mockTrack, sourceUrl: '' },
        { type: 'track' as const, id: 't2', resource: { ...mockTrack, id: 't2', title: 'Track 2' }, sourceUrl: '' },
      ]
      render(<MessageBox {...defaultProps} externalEmbeds={externalEmbeds} />)
      expect(screen.getAllByTestId('mini-player')).toHaveLength(2)
    })
  })

  describe('typing', () => {
    it('calls onValueChange when user types', () => {
      const onValueChange = vi.fn()
      render(<MessageBox {...defaultProps} onValueChange={onValueChange} />)
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'hello' } })
      expect(onValueChange).toHaveBeenCalledWith('hello')
    })

    it('calls onIsEmptyChange with false when text is entered', () => {
      const onIsEmptyChange = vi.fn()
      render(<MessageBox {...defaultProps} onIsEmptyChange={onIsEmptyChange} />)
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'hi' } })
      expect(onIsEmptyChange).toHaveBeenCalledWith(false)
    })

    it('calls onIsEmptyChange with true when text is cleared', () => {
      const onIsEmptyChange = vi.fn()
      render(<MessageBox {...defaultProps} onIsEmptyChange={onIsEmptyChange} />)
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'hi' } })
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: '' } })
      expect(onIsEmptyChange).toHaveBeenCalledWith(true)
    })

    it('calls onEmbedsResolved with empty array when no URL in text', () => {
      const onEmbedsResolved = vi.fn()
      render(<MessageBox {...defaultProps} onEmbedsResolved={onEmbedsResolved} />)
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'just text' } })
      expect(onEmbedsResolved).toHaveBeenCalled()
    })
  })

  describe('keyboard submit', () => {
    it('calls onSubmit when Enter is pressed without Shift', () => {
      const onSubmit = vi.fn()
      render(<MessageBox {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.keyDown(screen.getByTestId('message-input'), { key: 'Enter', shiftKey: false })
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('does not call onSubmit when Shift+Enter is pressed', () => {
      const onSubmit = vi.fn()
      render(<MessageBox {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.keyDown(screen.getByTestId('message-input'), { key: 'Enter', shiftKey: true })
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('URL resolution (debounced)', () => {
    it('calls resolvePermalink for URLs in text after debounce', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      render(<MessageBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('message-input'), {
        target: { value: 'https://soundcloud.com/artist/track' },
      })
      vi.advanceTimersByTime(600)
      await waitFor(() => expect(mockResolvePermalink).toHaveBeenCalledWith('https://soundcloud.com/artist/track'))
    })

    it('fetches track data when permalink resolves to track type', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      render(<MessageBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('message-input'), {
        target: { value: 'https://soundcloud.com/artist/track' },
      })
      vi.advanceTimersByTime(600)
      await waitFor(() => expect(mockFetchTrack).toHaveBeenCalledWith('track-1'))
    })

    it('fetches playlist data when permalink resolves to playlist type', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'playlist', id: 'pl-1' } })
      mockFetchPlaylist.mockResolvedValue({ data: mockPlaylist })

      render(<MessageBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('message-input'), {
        target: { value: 'https://soundcloud.com/artist/sets/playlist' },
      })
      vi.advanceTimersByTime(600)
      await waitFor(() => expect(mockFetchPlaylist).toHaveBeenCalledWith('pl-1'))
    })

    it('ignores user type from resolvePermalink', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'user', id: 'u1' } })
      render(<MessageBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('message-input'), {
        target: { value: 'https://soundcloud.com/artist' },
      })
      vi.advanceTimersByTime(600)
      await waitFor(() => expect(mockResolvePermalink).toHaveBeenCalled())
      expect(mockFetchTrack).not.toHaveBeenCalled()
    })

    it('handles resolvePermalink failure gracefully', async () => {
      mockResolvePermalink.mockRejectedValue(new Error('fail'))
      render(<MessageBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('message-input'), {
        target: { value: 'https://soundcloud.com/artist/track' },
      })
      vi.advanceTimersByTime(600)
      await waitFor(() => expect(mockResolvePermalink).toHaveBeenCalled())
      // no crash
    })
  })

  describe('embed removal', () => {
    it('removes MiniPlayer when close button is clicked (external embeds)', async () => {
      const onEmbedsResolved = vi.fn()
      const externalEmbeds = [{ type: 'track' as const, id: 't1', resource: mockTrack, sourceUrl: '' }]
      render(<MessageBox {...defaultProps} externalEmbeds={externalEmbeds} onEmbedsResolved={onEmbedsResolved} />)
      await userEvent.click(screen.getByTestId('mini-player-close'))
      expect(onEmbedsResolved).toHaveBeenCalledWith([])
    })

    it('removes only the clicked embed when multiple embeds exist', async () => {
      const onEmbedsResolved = vi.fn()
      const externalEmbeds = [
        { type: 'track' as const, id: 't1', resource: mockTrack, sourceUrl: '' },
        { type: 'track' as const, id: 't2', resource: { ...mockTrack, id: 't2', title: 'Track 2' }, sourceUrl: '' },
      ]
      render(<MessageBox {...defaultProps} externalEmbeds={externalEmbeds} onEmbedsResolved={onEmbedsResolved} />)
      const closeBtns = screen.getAllByTestId('mini-player-close')
      await userEvent.click(closeBtns[0])
      const lastCall = onEmbedsResolved.mock.calls[onEmbedsResolved.mock.calls.length - 1][0]
      expect(lastCall).toHaveLength(1)
      expect(lastCall[0].id).toBe('t2')
    })
  })
})
