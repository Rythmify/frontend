import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CheckBox from '../CheckBox'

describe('CheckBox', () => {
  const defaultProps = {
    label: 'My Label',
    checked: false,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders with correct data-test attribute based on label', () => {
      render(<CheckBox {...defaultProps} label="My Label" />)
      expect(screen.getByTestId('checkbox-my-label')).toBeInTheDocument()
    })

    it('converts label to lowercase kebab-case for data-test', () => {
      render(<CheckBox {...defaultProps} label="Also Report Spam" />)
      expect(screen.getByTestId('checkbox-also-report-spam')).toBeInTheDocument()
    })

    it('renders the label text', () => {
      render(<CheckBox {...defaultProps} label="My Label" />)
      expect(screen.getByTestId('checkbox-label')).toHaveTextContent('My Label')
    })

    it('renders the toggle div', () => {
      render(<CheckBox {...defaultProps} />)
      expect(screen.getByTestId('checkbox-toggle')).toBeInTheDocument()
    })

    it('does not show checkmark svg when unchecked and not hovering', () => {
      render(<CheckBox {...defaultProps} checked={false} />)
      expect(screen.getByTestId('checkbox-toggle').querySelector('svg')).not.toBeInTheDocument()
    })

    it('shows checkmark svg when checked', () => {
      render(<CheckBox {...defaultProps} checked={true} />)
      expect(screen.getByTestId('checkbox-toggle').querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onChange with true when unchecked toggle is clicked', async () => {
      const onChange = vi.fn()
      render(<CheckBox {...defaultProps} checked={false} onChange={onChange} />)
      await userEvent.click(screen.getByTestId('checkbox-toggle'))
      expect(onChange).toHaveBeenCalledWith(true)
    })

    it('calls onChange with false when checked toggle is clicked', async () => {
      const onChange = vi.fn()
      render(<CheckBox {...defaultProps} checked={true} onChange={onChange} />)
      await userEvent.click(screen.getByTestId('checkbox-toggle'))
      expect(onChange).toHaveBeenCalledWith(false)
    })

    it('shows svg on hover even when unchecked', async () => {
      render(<CheckBox {...defaultProps} checked={false} />)
      fireEvent.mouseEnter(screen.getByTestId('checkbox-toggle'))
      expect(screen.getByTestId('checkbox-toggle').querySelector('svg')).toBeInTheDocument()
    })

    it('hides svg after mouse leaves when unchecked', async () => {
      render(<CheckBox {...defaultProps} checked={false} />)
      const toggle = screen.getByTestId('checkbox-toggle')
      fireEvent.mouseEnter(toggle)
      fireEvent.mouseLeave(toggle)
      expect(toggle.querySelector('svg')).not.toBeInTheDocument()
    })

    it('svg color is gray when hovering but unchecked', async () => {
      render(<CheckBox {...defaultProps} checked={false} />)
      fireEvent.mouseEnter(screen.getByTestId('checkbox-toggle'))
      const svg = screen.getByTestId('checkbox-toggle').querySelector('svg')
      expect(svg).toHaveClass('text-gray-300')
    })

    it('svg color is black when checked', () => {
      render(<CheckBox {...defaultProps} checked={true} />)
      const svg = screen.getByTestId('checkbox-toggle').querySelector('svg')
      expect(svg).toHaveClass('text-black')
    })

    it('calls onChange exactly once per click', async () => {
      const onChange = vi.fn()
      render(<CheckBox {...defaultProps} onChange={onChange} />)
      await userEvent.click(screen.getByTestId('checkbox-toggle'))
      expect(onChange).toHaveBeenCalledTimes(1)
    })
  })
})
