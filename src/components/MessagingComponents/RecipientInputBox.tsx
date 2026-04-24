import { useState, useEffect, useRef } from 'react'
import { searchFollowing, globalSearch } from '@/services/api/messaging/conversationApi'
import UserAvatar from '@/components/UI/UserAvatar'

export interface RecipientResult {
  id: string
  username: string
  display_name: string
  profile_picture: string | null
}

export function useRecipientSearch(query: string) {
  const [results, setResults]           = useState<RecipientResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [notFound, setNotFound]         = useState(false)
  const debounceRef                     = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const q = query.trim()

    if (!q) {
      setResults([])
      setShowDropdown(false)
      setNotFound(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const [followingRes, globalRes] = await Promise.all([
          searchFollowing(q, 10, 0),
          globalSearch(q, { type: 'users', limit: 10 }),
        ])

        const followingItems: RecipientResult[] = followingRes.data.items.map(u => ({
          id: u.id,
          username: u.username,
          display_name: u.display_name,
          profile_picture: u.profile_picture,
        }))

        const globalItems: RecipientResult[] = globalRes.data.users.map(u => ({
          id: u.id,
          username: u.username,
          display_name: u.display_name,
          profile_picture: u.profile_picture,
        }))

        const followingIds = new Set(followingItems.map(u => u.id))
        const merged = [
          ...followingItems,
          ...globalItems.filter(u => !followingIds.has(u.id)),
        ]

        setResults(merged)
        setShowDropdown(merged.length > 0)
        setNotFound(merged.length === 0)
      } catch {
        setResults([])
        setShowDropdown(false)
        setNotFound(true)
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  return { results, showDropdown, notFound, setShowDropdown }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RecipientInputBoxProps {
  onSelect: (user: RecipientResult) => void
  onClear: () => void
  error?: string | null
}

export function RecipientInputBox({ onSelect, onClear, error }: RecipientInputBoxProps) {
  const [query, setQuery] = useState('')
  const inputRef          = useRef<HTMLInputElement>(null)

  const { results, showDropdown, notFound, setShowDropdown } = useRecipientSearch(query)

  const handleSelect = (user: RecipientResult) => {
    setQuery(user.display_name)
    setShowDropdown(false)
    onSelect(user)
    inputRef.current?.blur()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    onClear()
  }

  const borderClass = error || (notFound && query.trim())
    ? 'border-red-500'
    : 'border-[#3a3a3a] focus:border-white'

  return (
    <div data-test="recipient-input-box" className="relative">
      <input
        data-test="recipient-input"
        ref={inputRef}
        autoFocus
        value={query}
        onChange={handleChange}
        onFocus={() => { if (results.length > 0) setShowDropdown(true) }}
        className={`w-full bg-[#2a2a2a] border rounded px-3 py-2 text-white caret-[#ff5500] focus:outline-none transition-colors duration-150 ${borderClass}`}
      />

      {notFound && query.trim() && (
        <p className="mt-1 text-sm text-red-500">SoundCloud user not found.</p>
      )}
      {error && !notFound && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {showDropdown && (
        <div data-test="recipient-dropdown" className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-[#3a3a3a] rounded shadow-lg max-h-52 overflow-y-auto">
          {results.map((user) => (
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
    </div>
  )
}
