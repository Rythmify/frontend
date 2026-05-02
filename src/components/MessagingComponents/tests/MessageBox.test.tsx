import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, fireEvent } from '@testing-library/react'

const mockResolvePermalink = vi.fn()
const mockFetchTrack = vi.fn()
const mockFetchPlaylist = vi.fn()

vi.mock('../../../services/api/messaging/conversationApi', () => ({
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

// Helpers that query by data-test instead of data-testid
const getByTest = (container: HTMLElement, value: string) => {
  const el = container.querySelector(`[data-test="${value}"]`)
  if (!el) throw new Error(`Unable to find element with data-test="${value}"`)
  return el as HTMLElement
}
const getAllByTest = (container: HTMLElement, value: string) => {
  const els = container.querySelectorAll(`[data-test="${value}"]`)
  if (!els.length) throw new Error(`Unable to find any element with data-test="${value}"`)
  return Array.from(els) as HTMLElement[]
}
const queryByTest = (container: HTMLElement, value: string) =>
  container.querySelector(`[data-test="${value}"]`) as HTMLElement | null

const runDebounce = async () => {
  await act(async () => {
    vi.advanceTimersByTime(600)
    for (let i = 0; i < 5; i += 1) {
      await Promise.resolve()
    }
  })
}

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

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('MessageBox', () => {
  describe('rendering', () => {
    it('renders the message-box container', () => {
      const { container } = render(<MessageBox {...defaultProps} />)
      expect(getByTest(container, 'message-box')).toBeInTheDocument()
    })

    it('renders the textarea', () => {
      const { container } = render(<MessageBox {...defaultProps} />)
      expect(getByTest(container, 'message-input')).toBeInTheDocument()
    })

    it('textarea starts empty', () => {
      const { container } = render(<MessageBox {...defaultProps} />)
      expect(getByTest(container, 'message-input')).toHaveValue('')
    })

    it('applies error border class when hasError is true', () => {
      const { container } = render(<MessageBox {...defaultProps} hasError={true} />)
      expect(getByTest(container, 'message-input')).toHaveClass('border-red-500')
    })

    it('applies normal border class when hasError is false', () => {
      const { container } = render(<MessageBox {...defaultProps} hasError={false} />)
      expect(getByTest(container, 'message-input')).not.toHaveClass('border-red-500')
    })

    it('does not render MiniPlayer when no embeds', () => {
      const { container } = render(<MessageBox {...defaultProps} />)
      expect(queryByTest(container, 'mini-player')).not.toBeInTheDocument()
    })

    it('renders MiniPlayer for external track embed', () => {
      const externalEmbeds = [{ type: 'track' as const, id: 't1', resource: mockTrack, sourceUrl: '' }]
      const { container } = render(<MessageBox {...defaultProps} externalEmbeds={externalEmbeds} />)
      expect(getByTest(container, 'mini-player')).toBeInTheDocument()
    })

    it('renders MiniPlayer for external playlist embed', () => {
      const externalEmbeds = [{ type: 'playlist' as const, id: 'pl1', resource: mockPlaylist as any, sourceUrl: '' }]
      const { container } = render(<MessageBox {...defaultProps} externalEmbeds={externalEmbeds} />)
      expect(getByTest(container, 'mini-player')).toBeInTheDocument()
    })

    it('renders multiple MiniPlayers for multiple embeds', () => {
      const externalEmbeds = [
        { type: 'track' as const, id: 't1', resource: mockTrack, sourceUrl: '' },
        { type: 'track' as const, id: 't2', resource: { ...mockTrack, id: 't2', title: 'Track 2' }, sourceUrl: '' },
      ]
      const { container } = render(<MessageBox {...defaultProps} externalEmbeds={externalEmbeds} />)
      expect(getAllByTest(container, 'mini-player')).toHaveLength(2)
    })
  })

  describe('typing', () => {
    it('calls onValueChange when user types', () => {
      const onValueChange = vi.fn()
      const { container } = render(<MessageBox {...defaultProps} onValueChange={onValueChange} />)
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: 'hello' } })
      expect(onValueChange).toHaveBeenCalledWith('hello')
    })

    it('calls onIsEmptyChange with false when text is entered', () => {
      const onIsEmptyChange = vi.fn()
      const { container } = render(<MessageBox {...defaultProps} onIsEmptyChange={onIsEmptyChange} />)
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: 'hi' } })
      expect(onIsEmptyChange).toHaveBeenCalledWith(false)
    })

    it('calls onIsEmptyChange with true when text is cleared', () => {
      const onIsEmptyChange = vi.fn()
      const { container } = render(<MessageBox {...defaultProps} onIsEmptyChange={onIsEmptyChange} />)
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: 'hi' } })
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: '' } })
      expect(onIsEmptyChange).toHaveBeenCalledWith(true)
    })

    it('calls onEmbedsResolved with empty array when no URL in text', () => {
      const onEmbedsResolved = vi.fn()
      const { container } = render(<MessageBox {...defaultProps} onEmbedsResolved={onEmbedsResolved} />)
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: 'just text' } })
      expect(onEmbedsResolved).toHaveBeenCalled()
    })
  })

  describe('keyboard submit', () => {
    it('calls onSubmit when Enter is pressed without Shift', () => {
      const onSubmit = vi.fn()
      const { container } = render(<MessageBox {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.keyDown(getByTest(container, 'message-input'), { key: 'Enter', shiftKey: false })
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('does not call onSubmit when Shift+Enter is pressed', () => {
      const onSubmit = vi.fn()
      const { container } = render(<MessageBox {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.keyDown(getByTest(container, 'message-input'), { key: 'Enter', shiftKey: true })
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('URL resolution (debounced)', () => {
    it('calls resolvePermalink for URLs in text after debounce', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/track' },
      })
      await runDebounce()
      expect(mockResolvePermalink).toHaveBeenCalledWith('https://soundcloud.com/artist/track')
    })

    it('fetches track data when permalink resolves to track type', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/track' },
      })
      await runDebounce()
      expect(mockFetchTrack).toHaveBeenCalledWith('track-1')
    })

    it('fetches playlist data when permalink resolves to playlist type', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'playlist', id: 'pl-1' } })
      mockFetchPlaylist.mockResolvedValue({ data: mockPlaylist })

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/sets/playlist' },
      })
      await runDebounce()
      expect(mockFetchPlaylist).toHaveBeenCalledWith('pl-1')
    })

    it('ignores user type from resolvePermalink', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'user', id: 'u1' } })

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist' },
      })
      await runDebounce()
      expect(mockResolvePermalink).toHaveBeenCalled()
      expect(mockFetchTrack).not.toHaveBeenCalled()
    })

    it('handles resolvePermalink failure gracefully', async () => {
      mockResolvePermalink.mockRejectedValue(new Error('fail'))

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/track' },
      })
      await runDebounce()
      expect(mockResolvePermalink).toHaveBeenCalled()
      // no crash; test passes if we get here
    })
  })

  describe('embed removal', () => {
    it('removes MiniPlayer when close button is clicked (external embeds)', async () => {
      const onEmbedsResolved = vi.fn()
      const externalEmbeds = [{ type: 'track' as const, id: 't1', resource: mockTrack, sourceUrl: '' }]
      const { container } = render(<MessageBox {...defaultProps} externalEmbeds={externalEmbeds} onEmbedsResolved={onEmbedsResolved} />)
      fireEvent.click(getByTest(container, 'mini-player-close'))
      expect(onEmbedsResolved).toHaveBeenCalledWith([])
    })

    it('removes only the clicked embed when multiple embeds exist', async () => {
      const onEmbedsResolved = vi.fn()
      const externalEmbeds = [
        { type: 'track' as const, id: 't1', resource: mockTrack, sourceUrl: '' },
        { type: 'track' as const, id: 't2', resource: { ...mockTrack, id: 't2', title: 'Track 2' }, sourceUrl: '' },
      ]
      const { container } = render(<MessageBox {...defaultProps} externalEmbeds={externalEmbeds} onEmbedsResolved={onEmbedsResolved} />)
      const closeBtns = getAllByTest(container, 'mini-player-close')
      fireEvent.click(closeBtns[0])
      const lastCall = onEmbedsResolved.mock.calls[onEmbedsResolved.mock.calls.length - 1][0]
      expect(lastCall).toHaveLength(1)
      expect(lastCall[0].id).toBe('t2')
    })
  })
})
describe('mergeEmbeds (controlled mode deduplication)', () => {
    it('merges new resolved embeds with existing external embeds without duplicates', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const onEmbedsResolved = vi.fn()
      // Start with 'track-1' already present as an external embed
      const externalEmbeds = [
        { type: 'track' as const, id: 'track-1', resource: mockTrack, sourceUrl: 'https://soundcloud.com/artist/track' },
      ]
      const { container } = render(
        <MessageBox {...defaultProps} externalEmbeds={externalEmbeds} onEmbedsResolved={onEmbedsResolved} />
      )

      // Type the same URL — resolves to the same embed id
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/track' },
      })
      await runDebounce()

      // onEmbedsResolved should be called with exactly 1 embed (no duplicate)
      const lastCall = onEmbedsResolved.mock.calls[onEmbedsResolved.mock.calls.length - 1][0]
      expect(lastCall).toHaveLength(1)
      expect(lastCall[0].id).toBe('track-1')
    })
  })

  describe('stripEmbedUrls duplicate URL handling', () => {
    it('keeps surplus duplicate URLs when there are fewer active embeds', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const url = 'https://soundcloud.com/artist/track'
      const onValueChange = vi.fn()
      const externalEmbeds = [
        { type: 'track' as const, id: 'track-1', resource: mockTrack, sourceUrl: url },
      ]
      const { container } = render(
        <MessageBox
          {...defaultProps}
          externalEmbeds={externalEmbeds}
          onValueChange={onValueChange}
        />
      )
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: `${url} hello ${url}` },
      })
      await runDebounce()

      // One active embed removes one URL occurrence; the surplus duplicate remains.
      const lastClean = onValueChange.mock.calls[onValueChange.mock.calls.length - 1][0]
      expect(lastClean).toBe(`hello ${url}`)
    })
  })

  describe('removeEmbedAt with sourceUrl', () => {
    it('removes the embed URL from the textarea value when closing', async () => {
      // Pre-wire a URL resolve so the embed has a sourceUrl
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const url = 'https://soundcloud.com/artist/track'
      const onValueChange = vi.fn()
      const externalEmbeds = [
        { type: 'track' as const, id: 'track-1', resource: mockTrack, sourceUrl: url },
      ]
      const { container } = render(
        <MessageBox
          {...defaultProps}
          externalEmbeds={externalEmbeds}
          onValueChange={onValueChange}
        />
      )
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: url } })
      await runDebounce()

      // Now close the mini-player
      fireEvent.click(getByTest(container, 'mini-player-close'))

      // The URL should no longer appear in the value passed upstream
      const lastClean = onValueChange.mock.calls[onValueChange.mock.calls.length - 1][0]
      expect(lastClean).not.toContain(url)
    })

    it('calls onIsEmptyChange(true) when last embed is removed and text is empty', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const onIsEmptyChange = vi.fn()
      const { container } = render(<MessageBox {...defaultProps} onIsEmptyChange={onIsEmptyChange} />)

      const url = 'https://soundcloud.com/artist/track'
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: url } })
      await runDebounce()

      fireEvent.click(getByTest(container, 'mini-player-close'))

      // After removing the only embed with no other text, isEmpty should be true
      const calls = onIsEmptyChange.mock.calls
      expect(calls[calls.length - 1][0]).toBe(true)
    })
  })

  describe('resolvedUrlsRef cache hit', () => {
    it('calls resolvePermalink only once when the same URL is typed twice', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const { container } = render(<MessageBox {...defaultProps} />)
      const url = 'https://soundcloud.com/artist/track'

      // First type
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: url } })
      await runDebounce()

      const firstCallCount = mockResolvePermalink.mock.calls.length

      // Second type with same URL — should hit cache
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: url } })
      await runDebounce()

      expect(mockResolvePermalink.mock.calls.length).toBe(firstCallCount)
    })

    it('returns null from cache when a previously failed URL is typed again', async () => {
      mockResolvePermalink.mockRejectedValue(new Error('fail'))

      const onEmbedsResolved = vi.fn()
      const { container } = render(<MessageBox {...defaultProps} onEmbedsResolved={onEmbedsResolved} />)
      const url = 'https://soundcloud.com/artist/track'

      // First attempt — fails and caches null
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: url } })
      await runDebounce()

      const firstCallCount = mockResolvePermalink.mock.calls.length

      // Second attempt — should hit the null cache, not call resolvePermalink again
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: url } })
      await runDebounce()

      expect(mockResolvePermalink.mock.calls.length).toBe(firstCallCount)
      const lastResolved = onEmbedsResolved.mock.calls[onEmbedsResolved.mock.calls.length - 1][0]
      expect(lastResolved).toEqual([])
    })
  })

  describe('playlist track hydration (lines 147–162)', () => {
    it('calls fetchTrack for each track in a playlist when tracks have an id field', async () => {
      const playlistWithTracks = {
        ...mockPlaylist,
        track_count: 2,
        tracks: [
          { id: 'tr-a', title: 'Track A' },
          { id: 'tr-b', title: 'Track B' },
        ],
      }

      mockResolvePermalink.mockResolvedValue({ data: { type: 'playlist', id: 'pl-1' } })
      mockFetchPlaylist.mockResolvedValue({ data: playlistWithTracks })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/sets/playlist' },
      })
      await runDebounce()

      expect(mockFetchTrack).toHaveBeenCalledWith('tr-a')
      expect(mockFetchTrack).toHaveBeenCalledWith('tr-b')
    })

    it('calls fetchTrack using track_id field when id is absent', async () => {
      const playlistWithTracks = {
        ...mockPlaylist,
        tracks: [{ track_id: 'tr-c' }],
      }

      mockResolvePermalink.mockResolvedValue({ data: { type: 'playlist', id: 'pl-1' } })
      mockFetchPlaylist.mockResolvedValue({ data: playlistWithTracks })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/sets/playlist' },
      })
      await runDebounce()

      expect(mockFetchTrack).toHaveBeenCalledWith('tr-c')
    })

    it('skips fetchTrack for tracks with undefined or empty id', async () => {
      const playlistWithTracks = {
        ...mockPlaylist,
        tracks: [{ id: 'undefined' }, { id: '' }, { id: undefined }],
      }

      mockResolvePermalink.mockResolvedValue({ data: { type: 'playlist', id: 'pl-1' } })
      mockFetchPlaylist.mockResolvedValue({ data: playlistWithTracks })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/sets/playlist' },
      })
      await runDebounce()

      expect(mockFetchTrack).not.toHaveBeenCalled()
    })

    it('handles fetchTrack failure inside playlist hydration gracefully', async () => {
      const playlistWithTracks = {
        ...mockPlaylist,
        tracks: [{ id: 'tr-d' }],
      }

      mockResolvePermalink.mockResolvedValue({ data: { type: 'playlist', id: 'pl-1' } })
      mockFetchPlaylist.mockResolvedValue({ data: playlistWithTracks })
      mockFetchTrack.mockRejectedValue(new Error('track fetch failed'))

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/sets/playlist' },
      })
      await runDebounce()

      // Should not crash; playlist embed still resolves (with original track stubs)
      expect(getByTest(container, 'message-box')).toBeInTheDocument()
    })

    it('handles string track entries in a playlist', async () => {
      const playlistWithTracks = {
        ...mockPlaylist,
        tracks: ['tr-e'],
      }

      mockResolvePermalink.mockResolvedValue({ data: { type: 'playlist', id: 'pl-1' } })
      mockFetchPlaylist.mockResolvedValue({ data: playlistWithTracks })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/sets/playlist' },
      })
      await runDebounce()

      expect(mockFetchTrack).toHaveBeenCalledWith('tr-e')
    })
  })
// ─── Additional tests to close the remaining coverage gaps ───────────────────
//
// Drop these describe blocks inside the existing  describe('MessageBox', ...)
// in MessageBox.test.tsx, after the existing 'embed removal' block.
//
// Gaps targeted:
//   Lines 37-44  → mergeEmbeds  (controlled mode + URL resolves)
//   Line  60     → stripEmbedUrls "return match" branch (more occurrences than embeds)
//   Lines 72-77  → removeEmbedAt sourceUrl branch
//   Line  90     → setInternalEmbeds inside removeEmbedAt (uncontrolled mode)
//   Lines 123-125 → cache hit returning a non-null cached embed
//   Lines 147-162 → playlist track hydration (tracks array, track_id, string, skip, error)
// ─────────────────────────────────────────────────────────────────────────────

  // ── Lines 37-44: mergeEmbeds ─────────────────────────────────────────────
  // mergeEmbeds is only called when controlled===true (externalEmbeds prop is
  // provided) AND a URL resolves successfully after debounce.
  describe('mergeEmbeds — controlled mode', () => {
    it('deduplicates when the resolved embed id already exists in externalEmbeds', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const onEmbedsResolved = vi.fn()
      // Provide the same embed id that the URL will resolve to
      const externalEmbeds = [
        { type: 'track' as const, id: 'track-1', resource: mockTrack, sourceUrl: '' },
      ]
      const { container } = render(
        <MessageBox
          {...defaultProps}
          externalEmbeds={externalEmbeds}
          onEmbedsResolved={onEmbedsResolved}
        />
      )

      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/track' },
      })
      await runDebounce()

      // mergeEmbeds should deduplicate — still only one embed with id 'track-1'
      const lastCall = onEmbedsResolved.mock.calls[onEmbedsResolved.mock.calls.length - 1][0]
      expect(lastCall).toHaveLength(1)
      expect(lastCall[0].id).toBe('track-1')
    })

    it('adds a newly resolved embed to existing externalEmbeds without losing originals', async () => {
      const track2 = { ...mockTrack, id: 'track-2', title: 'Second Track' }
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-2' } })
      mockFetchTrack.mockResolvedValue({ data: track2 })

      const onEmbedsResolved = vi.fn()
      const externalEmbeds = [
        { type: 'track' as const, id: 'track-1', resource: mockTrack, sourceUrl: '' },
      ]
      const { container } = render(
        <MessageBox
          {...defaultProps}
          externalEmbeds={externalEmbeds}
          onEmbedsResolved={onEmbedsResolved}
        />
      )

      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/track2' },
      })
      await runDebounce()

      // mergeEmbeds should produce both embeds
      const lastCall = onEmbedsResolved.mock.calls[onEmbedsResolved.mock.calls.length - 1][0]
      expect(lastCall).toHaveLength(2)
      const ids = lastCall.map((e: any) => e.id)
      expect(ids).toContain('track-1')
      expect(ids).toContain('track-2')
    })
  })

  // ── Line 60: stripEmbedUrls "return match" branch ────────────────────────
  // This branch executes when the URL appears MORE times in the text than
  // there are embeds for it. The regex callback fires for every occurrence;
  // once `removed >= count` the surplus occurrences are returned unchanged.
  describe('stripEmbedUrls surplus-occurrence branch (line 60)', () => {
    it('leaves extra URL occurrences in the clean text when they exceed embed count', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const url = 'https://soundcloud.com/artist/track'
      const onValueChange = vi.fn()
      const externalEmbeds = [
        { type: 'track' as const, id: 'track-1', resource: mockTrack, sourceUrl: url },
      ]
      const { container } = render(
        <MessageBox
          {...defaultProps}
          externalEmbeds={externalEmbeds}
          onValueChange={onValueChange}
        />
      )
      // Three occurrences of the URL but only one embed will be created,
      // so stripEmbedUrls removes 1 occurrence and keeps the other 2 →
      // the "return match" branch on line 60 fires for occurrences 2 and 3.
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: `${url} ${url} ${url}` },
      })
      await runDebounce()

      const lastClean: string =
        onValueChange.mock.calls[onValueChange.mock.calls.length - 1][0]
      // One occurrence stripped, two kept → url still present in output
      expect(lastClean).toContain(url)
    })
  })

  // ── Lines 72-77: removeEmbedAt sourceUrl branch ──────────────────────────
  // Existing remove tests pass externalEmbeds with sourceUrl:'', so the
  // `if (embedToRemove.sourceUrl)` guard is never truthy. We need to close
  // an embed that actually has a sourceUrl so the regex replacement runs.
  describe('removeEmbedAt — sourceUrl branch (lines 72-77)', () => {
    it('strips the embed sourceUrl from the textarea value when closing', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const onValueChange = vi.fn()
      // Uncontrolled mode so the embed is stored internally with the real sourceUrl
      const { container } = render(<MessageBox {...defaultProps} onValueChange={onValueChange} />)

      const url = 'https://soundcloud.com/artist/track'
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: url } })
      await runDebounce()

      // The mini-player close button is now rendered
      fireEvent.click(getByTest(container, 'mini-player-close'))

      // After closing, the URL must have been removed from the value passed upstream
      const lastClean: string =
        onValueChange.mock.calls[onValueChange.mock.calls.length - 1][0]
      expect(lastClean).not.toContain(url)
    })

    it('keeps a second occurrence of the URL when only one embed is removed', async () => {
      // Two resolves with different ids so we get two embeds, same URL base
      const url = 'https://soundcloud.com/artist/track'
      const onValueChange = vi.fn()
      const externalEmbeds = [
        { type: 'track' as const, id: 'track-1', resource: mockTrack, sourceUrl: url },
      ]
      const { container } = render(
        <MessageBox
          {...defaultProps}
          externalEmbeds={externalEmbeds}
          onValueChange={onValueChange}
        />
      )
      // Two copies of the same URL in the text → one embed resolved (cache hit for second)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: `${url} ${url}` },
      })
      // Close the single embed; line 76 ("return match" inside removeEmbedAt)
      // fires for the second occurrence and keeps it
      fireEvent.click(getByTest(container, 'mini-player-close'))

      const lastClean: string =
        onValueChange.mock.calls[onValueChange.mock.calls.length - 1][0]
      // Second occurrence should survive
      expect(lastClean).toContain(url)
    })
  })

  // ── Line 90: setInternalEmbeds inside removeEmbedAt (uncontrolled) ────────
  // Existing remove tests always pass externalEmbeds (controlled mode), so
  // `if (!controlled)` is always false there. We need an uncontrolled removal.
  describe('removeEmbedAt — uncontrolled mode (line 90)', () => {
    it('removes the mini-player from the DOM when closed in uncontrolled mode', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      // No externalEmbeds prop → uncontrolled
      const { container } = render(<MessageBox {...defaultProps} />)

      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/track' },
      })
      await runDebounce()

      expect(queryByTest(container, 'mini-player')).toBeInTheDocument()

      fireEvent.click(getByTest(container, 'mini-player-close'))

      // setInternalEmbeds([]) causes a re-render with no embeds → no mini-player
      expect(queryByTest(container, 'mini-player')).not.toBeInTheDocument()
    })

    it('calls onEmbedsResolved with empty array after closing last embed in uncontrolled mode', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const onEmbedsResolved = vi.fn()
      const { container } = render(
        <MessageBox {...defaultProps} onEmbedsResolved={onEmbedsResolved} />
      )

      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/track' },
      })
      await runDebounce()

      fireEvent.click(getByTest(container, 'mini-player-close'))

      const lastCall =
        onEmbedsResolved.mock.calls[onEmbedsResolved.mock.calls.length - 1][0]
      expect(lastCall).toEqual([])
    })
  })

  // ── Lines 123-125: cache hit returning a non-null cached embed ────────────
  // resolvedUrlsRef stores the result after the first resolve. On a second
  // change event with the same URL the `has()` check is true and the cached
  // embed (non-null) is spread and returned — lines 124-125.
  describe('resolvedUrlsRef cache hit (lines 123-125)', () => {
    it('returns the cached embed without calling resolvePermalink again', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const onEmbedsResolved = vi.fn()
      const { container } = render(
        <MessageBox {...defaultProps} onEmbedsResolved={onEmbedsResolved} />
      )

      const url = 'https://soundcloud.com/artist/track'

      // First type — populates cache
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: url } })
      await runDebounce()

      const callsAfterFirst = mockResolvePermalink.mock.calls.length
      expect(callsAfterFirst).toBe(1)

      // Second type with the same URL — must hit cache, not call API again
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: `${url} ` } })
      await runDebounce()

      expect(mockResolvePermalink.mock.calls.length).toBe(callsAfterFirst)

      // The embed is still resolved and reported
      const lastCall =
        onEmbedsResolved.mock.calls[onEmbedsResolved.mock.calls.length - 1][0]
      expect(lastCall[0].id).toBe('track-1')
    })

    it('does not call fetchTrack again when cache returns a previously resolved track', async () => {
      mockResolvePermalink.mockResolvedValue({ data: { type: 'track', id: 'track-1' } })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const { container } = render(<MessageBox {...defaultProps} />)
      const url = 'https://soundcloud.com/artist/track'

      fireEvent.change(getByTest(container, 'message-input'), { target: { value: url } })
      await runDebounce()

      const fetchCallsAfterFirst = mockFetchTrack.mock.calls.length

      // Same URL again — full cache hit, no fetchTrack
      fireEvent.change(getByTest(container, 'message-input'), { target: { value: `${url} ` } })
      await runDebounce()

      expect(mockFetchTrack.mock.calls.length).toBe(fetchCallsAfterFirst)
    })
  })

  // ── Lines 147-162: playlist track hydration ───────────────────────────────
  describe('playlist track hydration (lines 147-162)', () => {
    it('calls fetchTrack for each track object that has an id field', async () => {
      const playlistWithTracks = {
        ...mockPlaylist,
        tracks: [
          { id: 'tr-a', title: 'Track A' },
          { id: 'tr-b', title: 'Track B' },
        ],
      }
      mockResolvePermalink.mockResolvedValue({ data: { type: 'playlist', id: 'pl-1' } })
      mockFetchPlaylist.mockResolvedValue({ data: playlistWithTracks })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/sets/my-playlist' },
      })
      await runDebounce()

      expect(mockFetchTrack).toHaveBeenCalledWith('tr-a')
      expect(mockFetchTrack).toHaveBeenCalledWith('tr-b')
    })

    it('falls back to track_id when the id field is absent', async () => {
      const playlistWithTracks = {
        ...mockPlaylist,
        tracks: [{ track_id: 'tr-c' }],
      }
      mockResolvePermalink.mockResolvedValue({ data: { type: 'playlist', id: 'pl-1' } })
      mockFetchPlaylist.mockResolvedValue({ data: playlistWithTracks })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/sets/my-playlist' },
      })
      await runDebounce()

      expect(mockFetchTrack).toHaveBeenCalledWith('tr-c')
    })

    it('uses the string itself as trackId when the track entry is a plain string', async () => {
      const playlistWithTracks = {
        ...mockPlaylist,
        tracks: ['tr-d'],
      }
      mockResolvePermalink.mockResolvedValue({ data: { type: 'playlist', id: 'pl-1' } })
      mockFetchPlaylist.mockResolvedValue({ data: playlistWithTracks })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/sets/my-playlist' },
      })
      await runDebounce()

      expect(mockFetchTrack).toHaveBeenCalledWith('tr-d')
    })

    it('skips fetchTrack when trackId is the literal string "undefined"', async () => {
      const playlistWithTracks = {
        ...mockPlaylist,
        tracks: [{ id: 'undefined' }],
      }
      mockResolvePermalink.mockResolvedValue({ data: { type: 'playlist', id: 'pl-1' } })
      mockFetchPlaylist.mockResolvedValue({ data: playlistWithTracks })

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/sets/my-playlist' },
      })
      await runDebounce()

      expect(mockFetchTrack).not.toHaveBeenCalled()
    })

    it('skips fetchTrack when trackId is an empty string', async () => {
      const playlistWithTracks = {
        ...mockPlaylist,
        tracks: [{ id: '' }],
      }
      mockResolvePermalink.mockResolvedValue({ data: { type: 'playlist', id: 'pl-1' } })
      mockFetchPlaylist.mockResolvedValue({ data: playlistWithTracks })

      const { container } = render(<MessageBox {...defaultProps} />)
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/sets/my-playlist' },
      })
      await runDebounce()

      expect(mockFetchTrack).not.toHaveBeenCalled()
    })

    it('still resolves the playlist embed when fetchTrack throws for a track', async () => {
      const playlistWithTracks = {
        ...mockPlaylist,
        tracks: [{ id: 'tr-e' }],
      }
      mockResolvePermalink.mockResolvedValue({ data: { type: 'playlist', id: 'pl-1' } })
      mockFetchPlaylist.mockResolvedValue({ data: playlistWithTracks })
      mockFetchTrack.mockRejectedValue(new Error('track fetch failed'))

      const onEmbedsResolved = vi.fn()
      const { container } = render(
        <MessageBox {...defaultProps} onEmbedsResolved={onEmbedsResolved} />
      )
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/sets/my-playlist' },
      })
      await runDebounce()

      // The catch on line 162 swallows the error; playlist embed is still emitted
      const lastCall =
        onEmbedsResolved.mock.calls[onEmbedsResolved.mock.calls.length - 1][0]
      expect(lastCall).toHaveLength(1)
      expect(lastCall[0].type).toBe('playlist')
    })

    it('resolves album type the same way as playlist type', async () => {
      const playlistWithTracks = { ...mockPlaylist, tracks: [{ id: 'tr-f' }] }
      mockResolvePermalink.mockResolvedValue({ data: { type: 'album', id: 'pl-1' } })
      mockFetchPlaylist.mockResolvedValue({ data: playlistWithTracks })
      mockFetchTrack.mockResolvedValue({ data: mockTrack })

      const onEmbedsResolved = vi.fn()
      const { container } = render(
        <MessageBox {...defaultProps} onEmbedsResolved={onEmbedsResolved} />
      )
      fireEvent.change(getByTest(container, 'message-input'), {
        target: { value: 'https://soundcloud.com/artist/sets/my-album' },
      })
      await runDebounce()

      const lastCall =
        onEmbedsResolved.mock.calls[onEmbedsResolved.mock.calls.length - 1][0]
      expect(lastCall[0].type).toBe('playlist')
      expect(mockFetchTrack).toHaveBeenCalledWith('tr-f')
    })
  })
