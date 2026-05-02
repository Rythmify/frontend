import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

const mockFetchTrack = vi.fn()
const mockFetchPlaylist = vi.fn()
const mockMapTrack = vi.fn()
const mockMapPlaylist = vi.fn()

vi.mock('../../services/api/messaging/conversationApi', () => ({
  fetchTrack: (...args: unknown[]) => mockFetchTrack(...args),
  fetchPlaylist: (...args: unknown[]) => mockFetchPlaylist(...args),
}))

vi.mock('../../services/api/search/searchMappers', () => ({
  mapTrack: (...args: unknown[]) => mockMapTrack(...args),
  mapPlaylist: (...args: unknown[]) => mockMapPlaylist(...args),
}))

vi.mock('@/components/UI/UserAvatar', () => ({
  default: ({ name }: { name: string }) => <div data-test="user-avatar" data-name={name} />,
}))

vi.mock('@/components/track/TrackCard', () => ({
  default: ({ track }: { track: { title: string } }) => <div data-test="track-card" data-title={track.title} />,
}))

vi.mock('@/components/playlist/PlaylistComponent', () => ({
  default: ({ playlist }: { playlist: { name: string } }) => <div data-test="playlist-component" data-name={playlist.name} />,
}))

import MessageCell from '../messagecell'
import type { Message } from '@/services/api/messaging/conversationApi'

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'msg-1',
    body: 'Hello world',
    embed_type: null,
    embed_id: null,
    sender_id: 'user-1',
    created_at: new Date().toISOString(),
    conversation_id: 'conv-1',
    is_read: false,
    ...overrides,
  } as Message
}

const mockTrackData = { id: 't1', title: 'My Track', artist_name: 'Artist', cover_image: null }
const mockPlaylistData = { playlist_id: 'pl1', name: 'My Playlist', track_count: 2, tracks: [], cover_image: null }
const mappedTrack = { id: 't1', title: 'My Track', artistName: 'Artist' }
const mappedPlaylist = { id: 'pl1', name: 'My Playlist', tracks: [] }

describe('MessageCell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchTrack.mockResolvedValue({ data: mockTrackData })
    mockFetchPlaylist.mockResolvedValue({ data: mockPlaylistData })
    mockMapTrack.mockReturnValue(mappedTrack)
    mockMapPlaylist.mockReturnValue(mappedPlaylist)
  })

  describe('rendering', () => {
    it('renders the message cell with correct data-test id', () => {
      render(<MessageCell message={makeMessage({ id: 'msg-42' })} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-msg-42')).toBeInTheDocument()
    })

    it('renders the sender display name', () => {
      render(<MessageCell message={makeMessage()} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-sender')).toHaveTextContent('Alice')
    })

    it('renders the message body', () => {
      render(<MessageCell message={makeMessage({ body: 'Hello there' })} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-body')).toHaveTextContent('Hello there')
    })

    it('does not render body element when body is empty', () => {
      render(<MessageCell message={makeMessage({ body: '' })} displayName="Alice" />)
      expect(screen.queryByTestId('message-cell-body')).not.toBeInTheDocument()
    })

    it('does not render body element when body is null', () => {
      render(<MessageCell message={makeMessage({ body: null as any })} displayName="Alice" />)
      expect(screen.queryByTestId('message-cell-body')).not.toBeInTheDocument()
    })

    it('renders the timestamp', () => {
      render(<MessageCell message={makeMessage()} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-time')).toBeInTheDocument()
    })

    it('renders UserAvatar with displayName', () => {
      render(<MessageCell message={makeMessage()} displayName="Alice" />)
      expect(screen.getByTestId('user-avatar')).toHaveAttribute('data-name', 'Alice')
    })

    it('does not render embed area when no embed', () => {
      render(<MessageCell message={makeMessage()} displayName="Alice" />)
      expect(screen.queryByTestId('message-cell-embed')).not.toBeInTheDocument()
    })

    it('renders embed area when embed_type and embed_id are present', () => {
      render(
        <MessageCell
          message={makeMessage({ embed_type: 'track', embed_id: 't1' })}
          displayName="Alice"
        />
      )
      expect(screen.getByTestId('message-cell-embed')).toBeInTheDocument()
    })
  })

  describe('time display', () => {
    it('shows "just now" for very recent messages', () => {
      const date = new Date(Date.now() - 30000).toISOString()
      render(<MessageCell message={makeMessage({ created_at: date })} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-time')).toHaveTextContent('just now')
    })

    it('shows minutes ago', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      render(<MessageCell message={makeMessage({ created_at: date })} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-time')).toHaveTextContent('5 minutes ago')
    })

    it('shows hours ago', () => {
      const date = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      render(<MessageCell message={makeMessage({ created_at: date })} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-time')).toHaveTextContent('2 hours ago')
    })

    it('shows days ago', () => {
      const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      render(<MessageCell message={makeMessage({ created_at: date })} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-time')).toHaveTextContent('3 days ago')
    })

    it('shows singular "1 day ago"', () => {
      const date = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 1000).toISOString()
      render(<MessageCell message={makeMessage({ created_at: date })} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-time')).toHaveTextContent('1 day ago')
    })
  })

  describe('embed card — preloaded (optimistic)', () => {
    it('renders TrackCard immediately when preloaded track is provided', async () => {
      render(
        <MessageCell
          message={{ ...makeMessage({ embed_type: 'track', embed_id: 't1' }), _embedResource: mockTrackData } as any}
          displayName="Alice"
        />
      )
      await waitFor(() => expect(screen.getByTestId('track-card')).toBeInTheDocument())
      expect(mockFetchTrack).not.toHaveBeenCalled()
    })

    it('renders PlaylistComponent immediately when preloaded playlist is provided', async () => {
      render(
        <MessageCell
          message={{ ...makeMessage({ embed_type: 'playlist', embed_id: 'pl1' }), _embedResource: mockPlaylistData } as any}
          displayName="Alice"
        />
      )
      await waitFor(() => expect(screen.getByTestId('playlist-component')).toBeInTheDocument())
      expect(mockFetchPlaylist).not.toHaveBeenCalled()
    })
  })

  describe('embed card — lazy load (from history)', () => {
    it('renders TrackCard after fetching track data', async () => {
      render(
        <MessageCell
          message={makeMessage({ embed_type: 'track', embed_id: 't1' })}
          displayName="Alice"
        />
      )
      await waitFor(() => expect(screen.getByTestId('track-card')).toBeInTheDocument())
      expect(mockFetchTrack).toHaveBeenCalledWith('t1')
    })

    it('renders PlaylistComponent after fetching playlist data', async () => {
      render(
        <MessageCell
          message={makeMessage({ embed_type: 'playlist', embed_id: 'pl1' })}
          displayName="Alice"
        />
      )
      await waitFor(() => expect(screen.getByTestId('playlist-component')).toBeInTheDocument())
      expect(mockFetchPlaylist).toHaveBeenCalledWith('pl1')
    })

    it('shows skeleton while loading', () => {
      mockFetchTrack.mockReturnValue(new Promise(() => {}))
      render(
        <MessageCell
          message={makeMessage({ embed_type: 'track', embed_id: 't1' })}
          displayName="Alice"
        />
      )
      // skeleton is an animate-pulse div
      expect(screen.getByTestId('message-cell-embed').querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('shows fallback text when track fetch fails', async () => {
      mockFetchTrack.mockRejectedValue(new Error('fail'))
      render(
        <MessageCell
          message={makeMessage({ embed_type: 'track', embed_id: 't1' })}
          displayName="Alice"
        />
      )
      await waitFor(() => expect(screen.getByText('🎵 Track attached')).toBeInTheDocument())
    })

    it('shows fallback text when playlist fetch fails', async () => {
      mockFetchPlaylist.mockRejectedValue(new Error('fail'))
      render(
        <MessageCell
          message={makeMessage({ embed_type: 'playlist', embed_id: 'pl1' })}
          displayName="Alice"
        />
      )
      await waitFor(() => expect(screen.getByText('🎶 Playlist attached')).toBeInTheDocument())
    })
  })
})
