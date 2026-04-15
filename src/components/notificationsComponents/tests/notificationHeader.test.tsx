import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NotificationHeader, { type FilterType } from '../notificationHeader'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const renderHeader = (selectedType: FilterType = 'all', onTypeChange = vi.fn()) =>
  render(<NotificationHeader selectedType={selectedType} onTypeChange={onTypeChange} />)

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NotificationHeader', () => {

  // ── Static rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the page title', () => {
      renderHeader()
      expect(screen.getByTestId('notification-header-title')).toHaveTextContent('Notifications')
    })

    it('renders the filter dropdown button', () => {
      renderHeader()
      expect(screen.getByTestId('notification-filter-btn')).toBeInTheDocument()
    })

    it('renders data-test attribute on root', () => {
      renderHeader()
      expect(screen.getByTestId('notification-header')).toBeInTheDocument()
    })

    it('does NOT show the filter menu by default (closed state)', () => {
      renderHeader()
      expect(screen.queryByTestId('notification-filter-menu')).not.toBeInTheDocument()
    })
  })

  // ── Button label reflects selectedType ────────────────────────────────────

  describe('selected label', () => {
    const cases: [FilterType, string][] = [
      ['all',     'All notifications'],
      ['like',    'Likes'],
      ['comment', 'Comments'],
      ['repost',  'Reposts'],
      ['follow',  'Follows'],
    ]

    it.each(cases)('shows "%s" label when selectedType is "%s"', (type, label) => {
      renderHeader(type)
      expect(screen.getByTestId('notification-filter-btn')).toHaveTextContent(label)
    })
  })

  // ── Dropdown open / close ─────────────────────────────────────────────────

  describe('dropdown toggle', () => {
    it('opens the menu when the button is clicked', () => {
      renderHeader()
      fireEvent.click(screen.getByTestId('notification-filter-btn'))
      expect(screen.getByTestId('notification-filter-menu')).toBeInTheDocument()
    })

    it('closes the menu when the button is clicked again', () => {
      renderHeader()
      const btn = screen.getByTestId('notification-filter-btn')
      fireEvent.click(btn) // open
      fireEvent.click(btn) // close
      expect(screen.queryByTestId('notification-filter-menu')).not.toBeInTheDocument()
    })

    it('renders all 5 filter options when open', () => {
      renderHeader()
      fireEvent.click(screen.getByTestId('notification-filter-btn'))

      const options: FilterType[] = ['all', 'like', 'comment', 'repost', 'follow']
      options.forEach(value => {
        expect(screen.getByTestId(`notification-filter-option-${value}`)).toBeInTheDocument()
      })
    })

    it('renders correct labels for each option', () => {
      renderHeader()
      fireEvent.click(screen.getByTestId('notification-filter-btn'))

      const expected: [FilterType, string][] = [
        ['all',     'All notifications'],
        ['like',    'Likes'],
        ['comment', 'Comments'],
        ['repost',  'Reposts'],
        ['follow',  'Follows'],
      ]
      expected.forEach(([value, label]) => {
        expect(screen.getByTestId(`notification-filter-option-${value}`)).toHaveTextContent(label)
      })
    })
  })

  // ── Option selection ──────────────────────────────────────────────────────

  describe('option selection', () => {
    it('calls onTypeChange with the selected value', () => {
      const onTypeChange = vi.fn()
      renderHeader('all', onTypeChange)
      fireEvent.click(screen.getByTestId('notification-filter-btn'))
      fireEvent.click(screen.getByTestId('notification-filter-option-like'))
      expect(onTypeChange).toHaveBeenCalledWith('like')
    })

    it('calls onTypeChange exactly once per click', () => {
      const onTypeChange = vi.fn()
      renderHeader('all', onTypeChange)
      fireEvent.click(screen.getByTestId('notification-filter-btn'))
      fireEvent.click(screen.getByTestId('notification-filter-option-comment'))
      expect(onTypeChange).toHaveBeenCalledTimes(1)
    })

    it('closes the menu after selecting an option', () => {
      renderHeader()
      fireEvent.click(screen.getByTestId('notification-filter-btn'))
      fireEvent.click(screen.getByTestId('notification-filter-option-repost'))
      expect(screen.queryByTestId('notification-filter-menu')).not.toBeInTheDocument()
    })

    it('calls onTypeChange with "follow" when follow option is clicked', () => {
      const onTypeChange = vi.fn()
      renderHeader('all', onTypeChange)
      fireEvent.click(screen.getByTestId('notification-filter-btn'))
      fireEvent.click(screen.getByTestId('notification-filter-option-follow'))
      expect(onTypeChange).toHaveBeenCalledWith('follow')
    })

    it('calls onTypeChange with "all" when all option is clicked', () => {
      const onTypeChange = vi.fn()
      renderHeader('like', onTypeChange)
      fireEvent.click(screen.getByTestId('notification-filter-btn'))
      fireEvent.click(screen.getByTestId('notification-filter-option-all'))
      expect(onTypeChange).toHaveBeenCalledWith('all')
    })
  })

  // ── Active option styling ─────────────────────────────────────────────────

  describe('active option highlight', () => {
    it('applies orange text to the currently selected option', () => {
      renderHeader('like')
      fireEvent.click(screen.getByTestId('notification-filter-btn'))
      expect(screen.getByTestId('notification-filter-option-like')).toHaveClass('text-orange-500')
    })

    it('does NOT apply orange text to unselected options', () => {
      renderHeader('like')
      fireEvent.click(screen.getByTestId('notification-filter-btn'))
      expect(screen.getByTestId('notification-filter-option-all')).not.toHaveClass('text-orange-500')
      expect(screen.getByTestId('notification-filter-option-comment')).not.toHaveClass('text-orange-500')
    })
  })
})
