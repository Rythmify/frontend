import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'

const mockFetchTrack = vi.fn()
const mockFetchPlaylist = vi.fn()
const mockMapTrack = vi.fn()
const mockMapPlaylist = vi.fn()

vi.mock('../../../services/api/messaging/conversationApi', () => ({
  fetchTrack: (...args: unknown[]) => mockFetchTrack(...args),
  fetchPlaylist: (...args: unknown[]) => mockFetchPlaylist(...args),
}))

vi.mock('../../../services/api/search/searchMappers', () => ({
  mapTrack: (...args: unknown[]) => mockMapTrack(...args),
  mapPlaylist: (...args: unknown[]) => mockMapPlaylist(...args),
}))

vi.mock('@/components/UI/UserAvatar', () => ({
  default: ({ name, src }: { name: string; src?: string | null }) => (
    <div data-test="user-avatar" data-name={name} data-src={src ?? ''} />
  ),
}))

vi.mock('@/components/track/TrackCard', () => ({
  default: ({ track }: { track: { title: string } }) => (
    <div data-test="track-card" data-title={track.title} />
  ),
}))

vi.mock('@/components/playlist/PlaylistComponent', () => ({
  default: ({ playlist }: { playlist: { name: string } }) => (
    <div data-test="playlist-component" data-name={playlist.name} />
  ),
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

const mockTrackData = {
  id: 't1',
  title: 'My Track',
  artist_name: 'Artist',
  cover_image: null,
  stream_url: 'https://example.com/track.mp3',
}
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

  // ─── Rendering ────────────────────────────────────────────────────────────

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

    it('passes profilePicture src to UserAvatar', () => {
      render(
        <MessageCell
          message={makeMessage()}
          displayName="Alice"
          profilePicture="https://example.com/pic.jpg"
        />
      )
      expect(screen.getByTestId('user-avatar')).toHaveAttribute(
        'data-src',
        'https://example.com/pic.jpg'
      )
    })

    it('passes null profilePicture to UserAvatar when omitted', () => {
      render(<MessageCell message={makeMessage()} displayName="Alice" />)
      expect(screen.getByTestId('user-avatar')).toHaveAttribute('data-src', '')
    })

    it('does not render embed area when no embed', () => {
      render(<MessageCell message={makeMessage()} displayName="Alice" />)
      expect(screen.queryByTestId('message-cell-embed')).not.toBeInTheDocument()
    })

    it('does not render embed area when embed_type is set but embed_id is null', () => {
      render(
        <MessageCell
          message={makeMessage({ embed_type: 'track', embed_id: null })}
          displayName="Alice"
        />
      )
      expect(screen.queryByTestId('message-cell-embed')).not.toBeInTheDocument()
    })

    it('does not render embed area when embed_id is set but embed_type is null', () => {
      render(
        <MessageCell
          message={makeMessage({ embed_type: null, embed_id: 't1' })}
          displayName="Alice"
        />
      )
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

  // ─── Time display ─────────────────────────────────────────────────────────

  describe('time display', () => {
    it('shows "just now" for very recent messages', () => {
      const date = new Date(Date.now() - 30000).toISOString()
      render(<MessageCell message={makeMessage({ created_at: date })} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-time')).toHaveTextContent('just now')
    })

    it('shows singular "1 minute ago"', () => {
      const date = new Date(Date.now() - 1 * 60 * 1000 - 500).toISOString()
      render(<MessageCell message={makeMessage({ created_at: date })} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-time')).toHaveTextContent('1 minute ago')
    })

    it('shows minutes ago', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      render(<MessageCell message={makeMessage({ created_at: date })} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-time')).toHaveTextContent('5 minutes ago')
    })

    it('shows singular "1 hour ago"', () => {
      const date = new Date(Date.now() - 1 * 60 * 60 * 1000 - 1000).toISOString()
      render(<MessageCell message={makeMessage({ created_at: date })} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-time')).toHaveTextContent('1 hour ago')
    })

    it('shows hours ago', () => {
      const date = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      render(<MessageCell message={makeMessage({ created_at: date })} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-time')).toHaveTextContent('2 hours ago')
    })

    it('shows singular "1 day ago"', () => {
      const date = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 1000).toISOString()
      render(<MessageCell message={makeMessage({ created_at: date })} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-time')).toHaveTextContent('1 day ago')
    })

    it('shows days ago', () => {
      const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      render(<MessageCell message={makeMessage({ created_at: date })} displayName="Alice" />)
      expect(screen.getByTestId('message-cell-time')).toHaveTextContent('3 days ago')
    })
  })

  // ─── Embed card — preloaded (optimistic) ─────────────────────────────────

  describe('embed card — preloaded (optimistic)', () => {
    it('renders TrackCard immediately when preloaded track has a stream url', async () => {
      render(
        <MessageCell
          message={{ ...makeMessage({ embed_type: 'track', embed_id: 't1' }), _embedResource: mockTrackData } as any}
          displayName="Alice"
        />
      )
      await waitFor(() => expect(screen.getByTestId('track-card')).toBeInTheDocument())
      expect(mockFetchTrack).not.toHaveBeenCalled()
    })

    it('fetches fresh data when a preloaded playlist is provided', async () => {
      render(
        <MessageCell
          message={{ ...makeMessage({ embed_type: 'playlist', embed_id: 'pl1' }), _embedResource: mockPlaylistData } as any}
          displayName="Alice"
        />
      )
      await waitFor(() => expect(screen.getByTestId('playlist-component')).toBeInTheDocument())
      expect(mockFetchPlaylist).toHaveBeenCalledWith('pl1')
      expect(mockMapPlaylist).toHaveBeenCalledWith(mockPlaylistData)
      expect(screen.getByTestId('playlist-component')).toHaveAttribute('data-name', 'My Playlist')
    })

    it('shows skeleton while preloaded playlist is loading (no preloaded track fast-path)', () => {
      // A playlist preload does NOT trigger the optimistic track preview —
      // it falls through to fetch, so the generic EmbedSkeleton should show.
      mockFetchPlaylist.mockReturnValue(new Promise(() => {}))
      render(
        <MessageCell
          message={{ ...makeMessage({ embed_type: 'playlist', embed_id: 'pl1' }), _embedResource: mockPlaylistData } as any}
          displayName="Alice"
        />
      )
      expect(
        screen.getByTestId('message-cell-embed').querySelector('.animate-pulse')
      ).toBeInTheDocument()
    })

    it('shows preloaded track title, artist, and cover while fetching missing stream url', () => {
      mockFetchTrack.mockReturnValue(new Promise(() => {}))
      const preloadedTrack = {
        ...mockTrackData,
        id: 't2',
        title: 'Picker Track',
        artist_name: 'Picker Artist',
        cover_image: 'https://example.com/cover.jpg',
        stream_url: null,
      }

      render(
        <MessageCell
          message={{ ...makeMessage({ embed_type: 'track', embed_id: 't2' }), _embedResource: preloadedTrack } as any}
          displayName="Alice"
        />
      )

      expect(screen.getByText('Picker Track')).toBeInTheDocument()
      expect(screen.getByText('Picker Artist')).toBeInTheDocument()
      expect(screen.getByAltText('Picker Track')).toHaveAttribute('src', 'https://example.com/cover.jpg')
      expect(mockFetchTrack).toHaveBeenCalledWith('t2')
      expect(screen.queryByTestId('track-card')).not.toBeInTheDocument()
    })

    it('uses fallback title and placeholder cover for partial preloaded tracks', () => {
      mockFetchTrack.mockReturnValue(new Promise(() => {}))
      const partialTrack = {
        id: 't3',
        title: undefined,
        artist_name: undefined,
        cover_image: null,
        stream_url: null,
      }

      render(
        <MessageCell
          message={{ ...makeMessage({ embed_type: 'track', embed_id: 't3' }), _embedResource: partialTrack } as any}
          displayName="Alice"
        />
      )

      expect(screen.getByText('Track')).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
      expect(screen.getByTestId('message-cell-embed').querySelector('.animate-pulse')).toBeInTheDocument()
      const placeholderText = screen.getByTestId('message-cell-embed').querySelectorAll('span')
      expect(placeholderText[0]).toHaveTextContent('Track')
      expect(placeholderText[1]).toHaveTextContent('')
    })

    it('uses an empty image alt when a loading preloaded track has no title', () => {
      mockFetchTrack.mockReturnValue(new Promise(() => {}))
      const untitledTrack = {
        id: 't4',
        title: undefined,
        artist_name: 'Known Artist',
        cover_image: 'https://example.com/untitled.jpg',
        stream_url: null,
      }

      render(
        <MessageCell
          message={{ ...makeMessage({ embed_type: 'track', embed_id: 't4' }), _embedResource: untitledTrack } as any}
          displayName="Alice"
        />
      )

      expect(screen.getByText('Track')).toBeInTheDocument()
      expect(screen.getByText('Known Artist')).toBeInTheDocument()
      expect(screen.getByTestId('message-cell-embed').querySelector('img')).toHaveAttribute('alt', '')
    })

    it('shows generic skeleton (not optimistic preview) when preloaded resource is not a track', () => {
      // isApiTrack returns false for a playlist-shaped resource on a playlist embed —
      // the loading branch should fall through to <EmbedSkeleton />.
      mockFetchPlaylist.mockReturnValue(new Promise(() => {}))
      const playlistResource = { playlist_id: 'pl1', name: 'My Playlist', track_count: 0, tracks: [], cover_image: null }

      render(
        <MessageCell
          message={{ ...makeMessage({ embed_type: 'playlist', embed_id: 'pl1' }), _embedResource: playlistResource } as any}
          displayName="Alice"
        />
      )

      // The optimistic track preview (with title spans) must NOT appear.
      expect(screen.queryByText('Track')).not.toBeInTheDocument()
      // The generic skeleton must appear instead.
      expect(
        screen.getByTestId('message-cell-embed').querySelector('.animate-pulse')
      ).toBeInTheDocument()
    })
  })

  // ─── Embed card — lazy load (from history) ───────────────────────────────

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

    it('renders PlaylistComponent after fetching playlist data (empty tracks)', async () => {
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
      expect(
        screen.getByTestId('message-cell-embed').querySelector('.animate-pulse')
      ).toBeInTheDocument()
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

    it('renders nothing (null) for an unknown embed_type after loading', async () => {
      // embed_type "audio" hits neither the track nor playlist branch inside load()
      // so after resolving: loading=false, failed=false, track=null, playlist=null → null render
      render(
        <MessageCell
          message={makeMessage({ embed_type: 'audio', embed_id: 'x1' })}
          displayName="Alice"
        />
      )
      await waitFor(() =>
        expect(
          screen.getByTestId('message-cell-embed').querySelector('.animate-pulse')
        ).not.toBeInTheDocument()
      )
      expect(mockFetchTrack).not.toHaveBeenCalled()
      expect(mockFetchPlaylist).not.toHaveBeenCalled()
      // embed wrapper is present but EmbedCard returned null
      expect(screen.getByTestId('message-cell-embed')).toBeEmptyDOMElement()
    })

    it('shows skeleton (not optimistic preview) when no preloaded resource and loading a track', () => {
      mockFetchTrack.mockReturnValue(new Promise(() => {}))
      render(
        <MessageCell
          message={makeMessage({ embed_type: 'track', embed_id: 't1' })}
          displayName="Alice"
        />
      )
      // No optimistic preview spans since there is no _embedResource.
      expect(screen.queryByText('Track')).not.toBeInTheDocument()
      expect(
        screen.getByTestId('message-cell-embed').querySelector('.animate-pulse')
      ).toBeInTheDocument()
    })
  })

  // ─── Embed card — playlist with non-empty tracks ─────────────────────────

  describe('embed card — playlist with non-empty tracks', () => {
    const trackInPlaylist = { id: 'track-inside', title: 'Inside Track', artist_name: 'DJ', cover_image: null }
    const mappedInner = { id: 'track-inside', title: 'Inside Track', artistName: 'DJ' }

    it('fetches each track inside the playlist when tracks have valid ids', async () => {
      const mappedWithTracks = {
        id: 'pl1',
        name: 'My Playlist',
        tracks: [{ id: 'track-inside' }],
      }
      mockMapPlaylist.mockReturnValue(mappedWithTracks)
      mockFetchTrack.mockResolvedValue({ data: trackInPlaylist })
      mockMapTrack.mockReturnValue(mappedInner)

      render(
        <MessageCell
          message={makeMessage({ embed_type: 'playlist', embed_id: 'pl1' })}
          displayName="Alice"
        />
      )

      await waitFor(() => expect(screen.getByTestId('playlist-component')).toBeInTheDocument())
      expect(mockFetchPlaylist).toHaveBeenCalledWith('pl1')
      expect(mockFetchTrack).toHaveBeenCalledWith('track-inside')
      expect(mockMapTrack).toHaveBeenCalledWith(trackInPlaylist)
      expect(mappedWithTracks.tracks).toEqual([mappedInner])
    })

    it('hydrates multiple playlist tracks through the fetch and map pipeline', async () => {
      const firstTrack = { id: 'track-one', title: 'Track One', artist_name: 'DJ One', cover_image: null }
      const secondTrack = { id: 'track-two', title: 'Track Two', artist_name: 'DJ Two', cover_image: null }
      const firstMapped = { id: 'track-one', title: 'Track One', artistName: 'DJ One' }
      const secondMapped = { id: 'track-two', title: 'Track Two', artistName: 'DJ Two' }
      const playlistWithTracks = {
        id: 'pl1',
        name: 'My Playlist',
        tracks: [{ id: 'track-one' }, { id: 'track-two' }],
      }
      mockMapPlaylist.mockReturnValue(playlistWithTracks)
      mockFetchTrack
        .mockResolvedValueOnce({ data: firstTrack })
        .mockResolvedValueOnce({ data: secondTrack })
      mockMapTrack
        .mockReturnValueOnce(firstMapped)
        .mockReturnValueOnce(secondMapped)

      render(
        <MessageCell
          message={makeMessage({ embed_type: 'playlist', embed_id: 'pl1' })}
          displayName="Alice"
        />
      )

      await waitFor(() => expect(screen.getByTestId('playlist-component')).toBeInTheDocument())
      expect(mockFetchPlaylist).toHaveBeenCalledWith('pl1')
      expect(mockFetchTrack).toHaveBeenNthCalledWith(1, 'track-one')
      expect(mockFetchTrack).toHaveBeenNthCalledWith(2, 'track-two')
      expect(mockMapTrack).toHaveBeenNthCalledWith(1, firstTrack)
      expect(mockMapTrack).toHaveBeenNthCalledWith(2, secondTrack)
      expect(playlistWithTracks.tracks).toEqual([firstMapped, secondMapped])
    })

    it('skips fetchTrack for tracks with empty string id', async () => {
      const mappedWithBadId = { id: 'pl1', name: 'My Playlist', tracks: [{ id: '' }] }
      mockMapPlaylist.mockReturnValue(mappedWithBadId)

      render(
        <MessageCell
          message={makeMessage({ embed_type: 'playlist', embed_id: 'pl1' })}
          displayName="Alice"
        />
      )

      await waitFor(() => expect(screen.getByTestId('playlist-component')).toBeInTheDocument())
      expect(mockFetchTrack).not.toHaveBeenCalled()
    })

    it('skips fetchTrack for tracks with id equal to the string "undefined"', async () => {
      const mappedWithUndefinedId = {
        id: 'pl1',
        name: 'My Playlist',
        tracks: [{ id: 'undefined' }],
      }
      mockMapPlaylist.mockReturnValue(mappedWithUndefinedId)

      render(
        <MessageCell
          message={makeMessage({ embed_type: 'playlist', embed_id: 'pl1' })}
          displayName="Alice"
        />
      )

      await waitFor(() => expect(screen.getByTestId('playlist-component')).toBeInTheDocument())
      expect(mockFetchTrack).not.toHaveBeenCalled()
    })

    it('skips fetchTrack for tracks with no id property (falsy)', async () => {
      const mappedWithNoId = { id: 'pl1', name: 'My Playlist', tracks: [{}] }
      mockMapPlaylist.mockReturnValue(mappedWithNoId)

      render(
        <MessageCell
          message={makeMessage({ embed_type: 'playlist', embed_id: 'pl1' })}
          displayName="Alice"
        />
      )

      await waitFor(() => expect(screen.getByTestId('playlist-component')).toBeInTheDocument())
      expect(mockFetchTrack).not.toHaveBeenCalled()
    })

    it('skips playlist track hydration when tracks is undefined', async () => {
      const mappedWithoutTracks = { id: 'pl1', name: 'My Playlist', tracks: undefined }
      mockMapPlaylist.mockReturnValue(mappedWithoutTracks)

      render(
        <MessageCell
          message={makeMessage({ embed_type: 'playlist', embed_id: 'pl1' })}
          displayName="Alice"
        />
      )

      await waitFor(() => expect(screen.getByTestId('playlist-component')).toBeInTheDocument())
      expect(mockFetchTrack).not.toHaveBeenCalled()
    })

    it('hydrates valid playlist tracks and leaves invalid track ids unchanged', async () => {
      const mappedValidTrack = { id: 'valid-track', title: 'Hydrated Track', artistName: 'DJ' }
      const playlistWithMixedTracks = {
        id: 'pl1',
        name: 'My Playlist',
        tracks: [{ id: 'valid-track' }, { id: '' }, { id: 'undefined' }, {}],
      }
      mockMapPlaylist.mockReturnValue(playlistWithMixedTracks)
      mockFetchTrack.mockResolvedValue({ data: trackInPlaylist })
      mockMapTrack.mockReturnValue(mappedValidTrack)

      render(
        <MessageCell
          message={makeMessage({ embed_type: 'playlist', embed_id: 'pl1' })}
          displayName="Alice"
        />
      )

      await waitFor(() => expect(screen.getByTestId('playlist-component')).toBeInTheDocument())
      expect(mockFetchTrack).toHaveBeenCalledTimes(1)
      expect(mockFetchTrack).toHaveBeenCalledWith('valid-track')
      expect(playlistWithMixedTracks.tracks).toEqual([
        mappedValidTrack,
        { id: '' },
        { id: 'undefined' },
        {},
      ])
    })

    it('still renders PlaylistComponent when inner track fetch throws (logs error)', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mappedWithTracks = {
        id: 'pl1',
        name: 'My Playlist',
        tracks: [{ id: 'bad-track' }],
      }
      mockMapPlaylist.mockReturnValue(mappedWithTracks)
      // fetchPlaylist succeeds, but fetchTrack for the inner track throws
      mockFetchTrack.mockRejectedValue(new Error('track fetch failed'))

      render(
        <MessageCell
          message={makeMessage({ embed_type: 'playlist', embed_id: 'pl1' })}
          displayName="Alice"
        />
      )

      await waitFor(() => expect(screen.getByTestId('playlist-component')).toBeInTheDocument())
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to fetch tracks for embedded playlist:',
        expect.any(Error)
      )

      consoleError.mockRestore()
    })

    it('skips hydration when playlist tracks array is empty', async () => {
      // tracks.length === 0 → the if-branch is skipped entirely
      const mappedEmptyTracks = { id: 'pl1', name: 'My Playlist', tracks: [] }
      mockMapPlaylist.mockReturnValue(mappedEmptyTracks)

      render(
        <MessageCell
          message={makeMessage({ embed_type: 'playlist', embed_id: 'pl1' })}
          displayName="Alice"
        />
      )

      await waitFor(() => expect(screen.getByTestId('playlist-component')).toBeInTheDocument())
      expect(mockFetchTrack).not.toHaveBeenCalled()
    })
  })

  // ─── Effect cleanup ───────────────────────────────────────────────────────

  describe('effect cleanup on unmount', () => {
    it('does not update state after the component unmounts (cancelled flag) — track', async () => {
      let resolveFetch!: (value: { data: typeof mockTrackData }) => void
      const deferred = new Promise<{ data: typeof mockTrackData }>((res) => {
        resolveFetch = res
      })
      mockFetchTrack.mockReturnValue(deferred)

      const { unmount } = render(
        <MessageCell
          message={makeMessage({ embed_type: 'track', embed_id: 't1' })}
          displayName="Alice"
        />
      )

      // Unmount before the fetch resolves → cancelled = true
      unmount()

      // Resolve the promise after unmount — must not trigger state updates or throw
      await act(async () => {
        resolveFetch({ data: mockTrackData })
      })
      // Test passes as long as no "Can't perform a React state update on unmounted component" warning fires
    })

    it('does not update state after the component unmounts (cancelled flag) — playlist', async () => {
      let resolvePlaylist!: (value: { data: typeof mockPlaylistData }) => void
      const deferred = new Promise<{ data: typeof mockPlaylistData }>((res) => {
        resolvePlaylist = res
      })
      mockFetchPlaylist.mockReturnValue(deferred)

      const { unmount } = render(
        <MessageCell
          message={makeMessage({ embed_type: 'playlist', embed_id: 'pl1' })}
          displayName="Alice"
        />
      )

      unmount()

      await act(async () => {
        resolvePlaylist({ data: mockPlaylistData })
      })
      // No state-update-on-unmounted-component warning should fire
    })

    it('does not update failed state after unmount when fetch rejects', async () => {
      let rejectFetch!: (err: Error) => void
      const deferred = new Promise<never>((_, rej) => {
        rejectFetch = rej
      })
      deferred.catch(() => {})
      mockFetchTrack.mockReturnValue(deferred)

      const { unmount } = render(
        <MessageCell
          message={makeMessage({ embed_type: 'track', embed_id: 't1' })}
          displayName="Alice"
        />
      )

      unmount()

      await act(async () => {
        rejectFetch(new Error('network error'))
      })
      // No warning should fire because cancelled=true guards the setFailed call
    })
  })
})
