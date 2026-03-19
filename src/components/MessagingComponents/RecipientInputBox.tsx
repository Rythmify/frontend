import { useState, useEffect } from 'react'
import {
  searchFollowing,
  globalSearch,
  type FollowingUser,
} from '@/services/api/messaging/conversationApi'

// Shape used by the dropdown — only following results appear here
export interface RecipientResult {
  id: string
  username: string
  display_name: string
  profile_picture: string | null
}

interface UseRecipientSearchReturn {
  results: RecipientResult[]
  showDropdown: boolean
  notFound: boolean
  setShowDropdown: (v: boolean) => void
}

export function RecipientInputBox(query: string): UseRecipientSearchReturn {
  const [results, setResults]           = useState<RecipientResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [notFound, setNotFound]         = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setShowDropdown(false)
      setNotFound(false)
      return
    }

    const t = setTimeout(async () => {
      try {
        // Run both searches in parallel
        const [followingRes, globalRes] = await Promise.allSettled([
          searchFollowing(query.trim(), 10, 0),
          globalSearch(query.trim(), { type: 'users', limit: 10 }),
        ])

        // ── Following results — the only ones shown in the dropdown ──────────
        const followingUsers: RecipientResult[] =
          followingRes.status === 'fulfilled'
            ? followingRes.value.data.items.map((u: FollowingUser) => ({
                id: u.id,
                username: u.username,
                display_name: u.display_name,
                profile_picture: u.profile_picture ?? null,
              }))
            : []

        setResults(followingUsers)
        setShowDropdown(followingUsers.length > 0)

        // ── notFound logic ───────────────────────────────────────────────────
        // Only show "not found" if the user doesn't exist anywhere —
        // i.e. absent from following AND absent from global search.
        // If they exist globally but aren't followed, no error is shown.
        if (followingUsers.length > 0) {
          // Found in following — definitely not "not found"
          setNotFound(false)
        } else {
          const existsGlobally =
            globalRes.status === 'fulfilled' &&
            globalRes.value.data.users.length > 0
          setNotFound(!existsGlobally)
        }
      } catch {
        setResults([])
        setShowDropdown(false)
        setNotFound(true)
      }
    }, 150)

    return () => clearTimeout(t)
  }, [query])

  return { results, showDropdown, notFound, setShowDropdown }
}