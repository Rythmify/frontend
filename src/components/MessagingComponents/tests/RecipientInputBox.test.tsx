import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, fireEvent } from '@testing-library/react'

const mockGlobalSearch = vi.fn()
const mockGetSuggestions = vi.fn()

vi.mock('@/services/api/messaging/conversationApi', () => ({
  globalSearch: (...args: unknown[]) => mockGlobalSearch(...args),
  getSuggestions: (...args: unknown[]) => mockGetSuggestions(...args),
}))

vi.mock('@/components/UI/UserAvatar', () => ({
  default: ({ name }: { name: string }) => <div data-test="user-avatar" data-name={name} />,
}))

import { RecipientInputBox } from '../RecipientInputBox'

const defaultProps = {
  onSelect: vi.fn(),
  onClear: vi.fn(),
  error: null,
}

function makeUser(id = 'u1', display_name = 'Alice') {
  return { id, username: display_name.toLowerCase(), display_name, profile_picture: null }
}

async function runDebounce() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(400)
  })
}

describe('RecipientInputBox', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockGetSuggestions.mockResolvedValue({ users: [] })
    mockGlobalSearch.mockResolvedValue({ data: { users: [] } })
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders the container', () => {
      render(<RecipientInputBox {...defaultProps} />)
      expect(screen.getByTestId('recipient-input-box')).toBeInTheDocument()
    })

    it('renders the input field', () => {
      render(<RecipientInputBox {...defaultProps} />)
      expect(screen.getByTestId('recipient-input')).toBeInTheDocument()
    })

    it('has autofocus on the input', () => {
      render(<RecipientInputBox {...defaultProps} />)
      expect(screen.getByTestId('recipient-input')).toHaveFocus()
    })

    it('has placeholder text', () => {
      render(<RecipientInputBox {...defaultProps} />)
      expect(screen.getByTestId('recipient-input')).toHaveAttribute('placeholder', 'Search for a user...')
    })

    it('shows external error when provided', () => {
      render(<RecipientInputBox {...defaultProps} error="User not found" />)
      expect(screen.getByText('User not found')).toBeInTheDocument()
    })

    it('does not show dropdown initially', () => {
      render(<RecipientInputBox {...defaultProps} />)
      expect(screen.queryByTestId('recipient-dropdown')).not.toBeInTheDocument()
    })
  })

  describe('typing and debounce', () => {
    it('does not call globalSearch before debounce completes', async () => {
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'ali' } })
      expect(mockGlobalSearch).not.toHaveBeenCalled()
    })

    it('calls globalSearch after debounce (400ms)', async () => {
      mockGlobalSearch.mockResolvedValue({ data: { users: [] } })
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'alice' } })
      await runDebounce()
      expect(mockGlobalSearch).toHaveBeenCalledWith('alice', { type: 'users', limit: 10 })
    })

    it('calls getSuggestions after debounce', async () => {
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'alice' } })
      await runDebounce()
      expect(mockGetSuggestions).toHaveBeenCalled()
    })

    it('clears state when input is cleared', async () => {
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'alice' } })
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: '' } })
      await runDebounce()
      expect(screen.queryByTestId('recipient-dropdown')).not.toBeInTheDocument()
    })

    it('calls onClear when user types after a selection', async () => {
      const onClear = vi.fn()
      render(<RecipientInputBox {...defaultProps} onClear={onClear} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'a' } })
      expect(onClear).toHaveBeenCalled()
    })

    it('does not search when input is only whitespace', async () => {
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: '   ' } })
      await runDebounce()
      expect(mockGetSuggestions).not.toHaveBeenCalled()
      expect(mockGlobalSearch).not.toHaveBeenCalled()
      expect(screen.queryByTestId('recipient-dropdown')).not.toBeInTheDocument()
    })
  })

  describe('suggestions dropdown', () => {
    it('shows dropdown when suggestions are returned', async () => {
      mockGetSuggestions.mockResolvedValue({ users: [makeUser()] })
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'ali' } })
      await runDebounce()
      expect(screen.getByTestId('recipient-dropdown')).toBeInTheDocument()
    })

    it('renders a dropdown item for each suggestion', async () => {
      mockGetSuggestions.mockResolvedValue({ users: [makeUser('u1', 'Alice'), makeUser('u2', 'Bob')] })
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'ali' } })
      await runDebounce()
      expect(screen.getByTestId('recipient-dropdown-item-u1')).toBeInTheDocument()
      expect(screen.getByTestId('recipient-dropdown-item-u2')).toBeInTheDocument()
    })

    it('shows dropdown on focus when suggestions exist', async () => {
      mockGetSuggestions.mockResolvedValue({ users: [makeUser()] })
      render(<RecipientInputBox {...defaultProps} />)
      const input = screen.getByTestId('recipient-input')
      fireEvent.change(input, { target: { value: 'ali' } })
      await runDebounce()
      screen.getByTestId('recipient-dropdown')
      fireEvent.blur(input)
      fireEvent.focus(input)
      expect(screen.getByTestId('recipient-dropdown')).toBeInTheDocument()
    })

    it('prevents input blur when pressing a suggestion', async () => {
      mockGetSuggestions.mockResolvedValue({ users: [makeUser('u1', 'Alice')] })
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'ali' } })
      await runDebounce()

      const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
      fireEvent(screen.getByTestId('recipient-dropdown-item-u1'), mouseDownEvent)

      expect(mouseDownEvent.defaultPrevented).toBe(true)
    })

    it('ignores suggestion lookup failures and keeps the dropdown hidden', async () => {
      mockGetSuggestions.mockRejectedValue(new Error('suggestions failed'))
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'ali' } })
      await runDebounce()

      expect(mockGetSuggestions).toHaveBeenCalled()
      expect(screen.queryByTestId('recipient-dropdown')).not.toBeInTheDocument()
    })
  })

  describe('user selection', () => {
    it('selects a user from dropdown and calls onSelect', async () => {
      const onSelect = vi.fn()
      mockGetSuggestions.mockResolvedValue({ users: [makeUser('u1', 'Alice')] })
      render(<RecipientInputBox {...defaultProps} onSelect={onSelect} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'ali' } })
      await runDebounce()
      screen.getByTestId('recipient-dropdown-item-u1')
      fireEvent.click(screen.getByTestId('recipient-dropdown-item-u1'))
      expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1', display_name: 'Alice' }))
    })

    it('sets input value to display_name after selection', async () => {
      mockGetSuggestions.mockResolvedValue({ users: [makeUser('u1', 'Alice')] })
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'ali' } })
      await runDebounce()
      screen.getByTestId('recipient-dropdown-item-u1')
      fireEvent.click(screen.getByTestId('recipient-dropdown-item-u1'))
      expect(screen.getByTestId('recipient-input')).toHaveValue('Alice')
    })

    it('hides dropdown after selection', async () => {
      mockGetSuggestions.mockResolvedValue({ users: [makeUser('u1', 'Alice')] })
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'ali' } })
      await runDebounce()
      screen.getByTestId('recipient-dropdown-item-u1')
      fireEvent.click(screen.getByTestId('recipient-dropdown-item-u1'))
      expect(screen.queryByTestId('recipient-dropdown')).not.toBeInTheDocument()
    })

    it('passes the full selected suggestion payload to onSelect', async () => {
      const onSelect = vi.fn()
      const suggestion = {
        id: 'u7',
        username: 'casey',
        display_name: 'Casey',
        profile_picture: 'https://example.com/casey.jpg',
      }
      mockGetSuggestions.mockResolvedValue({ users: [suggestion] })
      render(<RecipientInputBox {...defaultProps} onSelect={onSelect} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'case' } })
      await runDebounce()
      fireEvent.click(screen.getByTestId('recipient-dropdown-item-u7'))
      expect(onSelect).toHaveBeenCalledWith(suggestion)
    })

    it('auto-selects when globalSearch returns exactly 1 user', async () => {
      const onSelect = vi.fn()
      mockGlobalSearch.mockResolvedValue({ data: { users: [makeUser('u1', 'Alice')] } })
      render(<RecipientInputBox {...defaultProps} onSelect={onSelect} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'alice' } })
      await runDebounce()
      expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1' }))
    })
  })

  describe('validation errors', () => {
    it('keeps external error visible even when validation would clear', async () => {
      mockGlobalSearch.mockResolvedValue({ data: { users: [makeUser('u1', 'Alice')] } })
      render(<RecipientInputBox {...defaultProps} error="Pick someone first" />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'alice' } })
      await runDebounce()
      expect(screen.getByText('Pick someone first')).toBeInTheDocument()
      expect(screen.queryByText('SoundCloud user not found.')).not.toBeInTheDocument()
    })

    it('shows "SoundCloud user not found." when globalSearch returns 0 users', async () => {
      mockGlobalSearch.mockResolvedValue({ data: { users: [] } })
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'nobody' } })
      await runDebounce()
      expect(screen.getByText('SoundCloud user not found.')).toBeInTheDocument()
    })

    it('shows "SoundCloud user not found." when globalSearch returns multiple users', async () => {
      mockGlobalSearch.mockResolvedValue({ data: { users: [makeUser('u1'), makeUser('u2')] } })
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'a' } })
      await runDebounce()
      expect(screen.getByText('SoundCloud user not found.')).toBeInTheDocument()
    })

    it('shows "SoundCloud user not found." when globalSearch throws', async () => {
      mockGlobalSearch.mockRejectedValue(new Error('Network error'))
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'fail' } })
      await runDebounce()
      expect(screen.getByText('SoundCloud user not found.')).toBeInTheDocument()
    })

    it('hides validation error after a user is explicitly selected', async () => {
      mockGetSuggestions.mockResolvedValue({ users: [makeUser('u1', 'Alice')] })
      mockGlobalSearch.mockResolvedValue({ data: { users: [] } })
      render(<RecipientInputBox {...defaultProps} />)
      fireEvent.change(screen.getByTestId('recipient-input'), { target: { value: 'ali' } })
      await runDebounce()
      screen.getByTestId('recipient-dropdown-item-u1')
      fireEvent.click(screen.getByTestId('recipient-dropdown-item-u1'))
      expect(screen.queryByText('SoundCloud user not found.')).not.toBeInTheDocument()
    })
  })
})
