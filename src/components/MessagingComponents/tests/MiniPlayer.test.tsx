import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/components/UI/CoverImage', () => ({
  default: ({ src, alt, className }: { src: string | null; alt: string; className?: string }) => (
    <img data-test="cover-image" src={src ?? ''} alt={alt} className={className} />
  ),
}))

import MiniPlayer from '../MiniPlayer'

describe('MiniPlayer', () => {
  const defaultProps = {
    coverImage: 'https://example.com/cover.jpg',
    trackName: 'My Track',
    artistName: 'My Artist',
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the mini-player container', () => {
      render(<MiniPlayer {...defaultProps} />)
      expect(screen.getByTestId('mini-player')).toBeInTheDocument()
    })

    it('renders the track name', () => {
      render(<MiniPlayer {...defaultProps} trackName="Cool Song" />)
      expect(screen.getByText('Cool Song')).toBeInTheDocument()
    })

    it('renders the artist name', () => {
      render(<MiniPlayer {...defaultProps} artistName="Cool Artist" />)
      expect(screen.getByText('Cool Artist')).toBeInTheDocument()
    })

    it('renders the close button', () => {
      render(<MiniPlayer {...defaultProps} />)
      expect(screen.getByTestId('mini-player-close')).toBeInTheDocument()
    })

    it('renders CoverImage with correct src', () => {
      render(<MiniPlayer {...defaultProps} coverImage="https://img.com/art.jpg" />)
      expect(screen.getByTestId('cover-image')).toHaveAttribute('src', 'https://img.com/art.jpg')
    })

    it('renders CoverImage without crashing when coverImage is null', () => {
      render(<MiniPlayer {...defaultProps} coverImage={null} />)
      expect(screen.getByTestId('cover-image')).toBeInTheDocument()
    })

    it('renders CoverImage with correct alt text', () => {
      render(<MiniPlayer {...defaultProps} trackName="My Song" />)
      expect(screen.getByTestId('cover-image')).toHaveAttribute('alt', 'My Song')
    })

    it('renders the dot separator between track name and artist', () => {
      render(<MiniPlayer {...defaultProps} />)
      expect(screen.getByText('·')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = vi.fn()
      render(<MiniPlayer {...defaultProps} onClose={onClose} />)
      await userEvent.click(screen.getByTestId('mini-player-close'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose exactly once per click', async () => {
      const onClose = vi.fn()
      render(<MiniPlayer {...defaultProps} onClose={onClose} />)
      await userEvent.click(screen.getByTestId('mini-player-close'))
      await userEvent.click(screen.getByTestId('mini-player-close'))
      expect(onClose).toHaveBeenCalledTimes(2)
    })
  })

  describe('edge cases', () => {
    it('renders with empty strings for track and artist names', () => {
      render(<MiniPlayer {...defaultProps} trackName="" artistName="" />)
      expect(screen.getByTestId('mini-player')).toBeInTheDocument()
    })

    it('renders long track names without crashing', () => {
      render(<MiniPlayer {...defaultProps} trackName={'A'.repeat(200)} />)
      expect(screen.getByTestId('mini-player')).toBeInTheDocument()
    })
  })
})
