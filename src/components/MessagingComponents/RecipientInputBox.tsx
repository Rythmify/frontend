import { useState, useEffect, useRef } from 'react'
import { globalSearch } from '@/services/api/messaging/conversationApi'
import { getSuggestions } from '@/services/api/messaging/conversationApi'
import UserAvatar from '@/components/UI/UserAvatar'

export interface RecipientResult {
  id: string
  username: string
  display_name: string
  profile_picture: string | null
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RecipientInputBoxProps {
  onSelect: (user: RecipientResult) => void
  onClear: () => void
  error?: string | null
}

export function RecipientInputBox({ onSelect, onClear, error: externalError }: RecipientInputBoxProps) {
  const [query, setQuery]             = useState('')
  const [suggestions, setSuggestions] = useState<RecipientResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  // Tracks whether a user was explicitly selected (click or auto-validate)
  // so we suppress the validation error while a selection is active
  const [isSelected, setIsSelected]   = useState(false)

  const inputRef         = useRef<HTMLInputElement>(null)
  const suggestAbortRef  = useRef<AbortController | null>(null)
  const validateAbortRef = useRef<AbortController | null>(null)
  const debounceRef      = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const q = query.trim()

    if (!q) {
      setSuggestions([])
      setShowDropdown(false)
      setValidationError(null)
      suggestAbortRef.current?.abort()
      validateAbortRef.current?.abort()
      if (debounceRef.current) clearTimeout(debounceRef.current)
      return
    }

    // Don't re-search if a user is already selected and query hasn't changed
    if (isSelected) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      // ── 1. Suggestions (followed users) ──────────────────────────────────
      suggestAbortRef.current?.abort()
      const suggestController = new AbortController()
      suggestAbortRef.current = suggestController

      getSuggestions(q, suggestController.signal)
        .then(({ users }) => {
          const mapped: RecipientResult[] = (users ?? []).map((u) => ({
            id:              u.id,
            username:        u.username,
            display_name:    u.display_name,
            profile_picture: u.profile_picture,
          }))
          setSuggestions(mapped)
          setShowDropdown(mapped.length > 0)
        })
        .catch(() => {})

      // ── 2. Validation via search (must return exactly 1 user) ─────────────
      validateAbortRef.current?.abort()
      const validateController = new AbortController()
      validateAbortRef.current = validateController

      try {
        const res = await globalSearch(q, { type: 'users', limit: 10 })
        const users = res.data?.users ?? []

        if (users.length === 1) {
          const found: RecipientResult = {
            id:              users[0].id,
            username:        users[0].username,
            display_name:    users[0].display_name,
            profile_picture: users[0].profile_picture,
          }
          setValidationError(null)
          setIsSelected(true)
          setShowDropdown(false)
          onSelect(found)
        } else {
          setValidationError('SoundCloud user not found.')
          onClear()
        }
      } catch {
        setValidationError('SoundCloud user not found.')
        onClear()
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, isSelected])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSelect = (user: RecipientResult) => {
    // Set query to display name FIRST, then mark selected
    // This prevents the query change from triggering a new search
    setIsSelected(true)
    setQuery(user.display_name)
    setShowDropdown(false)
    setValidationError(null)
    onSelect(user)
    inputRef.current?.blur()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSelected(false)   // user is typing again — clear selection
    setQuery(e.target.value)
    setValidationError(null)
    onClear()
  }

  const displayError = externalError ?? (query.trim() && !isSelected ? validationError : null)
  const borderClass = displayError ? 'border-red-500' : 'border-[#3a3a3a] focus:border-white'

  return (
    <div data-test="recipient-input-box" className="relative">
      <input
        data-test="recipient-input"
        ref={inputRef}
        autoFocus
        value={query}
        onChange={handleChange}
        onFocus={() => { if (suggestions.length > 0 && !isSelected) setShowDropdown(true) }}
        placeholder="Search for a user..."
        className={`w-full bg-[#2a2a2a] border rounded px-3 py-2 text-white caret-[#ff5500] focus:outline-none transition-colors duration-150 ${borderClass}`}
      />

      {/* Dropdown — absolutely positioned directly under input, above everything else */}
      {showDropdown && suggestions.length > 0 && (
        <div
          data-test="recipient-dropdown"
          className="absolute left-0 right-0 top-full z-50 mt-1 bg-[#1a1a1a] border border-[#3a3a3a] rounded shadow-lg max-h-52 overflow-y-auto"
        >
          {suggestions.map((user) => (
            <button
              data-test={`recipient-dropdown-item-${user.id}`}
              key={user.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(user)}
              className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-[#2a2a2a] transition-colors"
            >
              <UserAvatar
                src={user.profile_picture}
                name={user.display_name}
                alt={user.display_name}
                wrapperClassName="flex-shrink-0 w-8 h-8 overflow-hidden rounded-full bg-neutral-600"
                initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-white text-xs font-bold"
              />
              <span className="text-sm font-bold text-gray-300 hover:text-white">
                {user.display_name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Error — rendered below dropdown so dropdown always covers it */}
      {displayError && (
        <p className="mt-1 text-sm text-red-500">{displayError}</p>
      )}
    </div>
  )
}