import { useState, useEffect } from 'react'
import {
  searchFollowing,
  globalSearch,
  type FollowingUser,
} from '@/services/api/messaging/conversationApi'

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

export function useRecipientSearch(query: string): UseRecipientSearchReturn {
  const [results, setResults]           = useState<RecipientResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [notFound, setNotFound]         = useState(false)
  const [foundInFollowing, setFoundInFollowing] = useState(false)
  const [foundGlobally, setFoundGlobally]       = useState(false)

  // ── Reset everything when query is cleared ───────────────────────────────
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setShowDropdown(false)
      setNotFound(false)
      setFoundInFollowing(false)
      setFoundGlobally(false)
    }
  }, [query])

  // ── Following search — controls the dropdown ─────────────────────────────
  useEffect(() => {
    if (!query.trim()) return

    const t = setTimeout(async () => {
      const res = await searchFollowing(query.trim(), 10, 0)
      const users: RecipientResult[] = res.data.items.map((u: FollowingUser) => ({
        id: u.id,
        username: u.username,
        display_name: u.display_name,
        profile_picture: u.profile_picture ?? null,
      }))
      setResults(users)
      setShowDropdown(users.length > 0)
      setFoundInFollowing(users.length > 0)
    }, 150)

    return () => clearTimeout(t)
  }, [query])

  // ── Global search — only used to determine notFound ──────────────────────
  useEffect(() => {
    if (!query.trim()) return

    const t = setTimeout(async () => {
      const res = await globalSearch(query.trim(), { type: 'users', limit: 10 })
      setFoundGlobally(res.data.users.length > 0)
    }, 150)

    return () => clearTimeout(t)
  }, [query])

  // ── notFound — true only when absent from both searches ──────────────────
  useEffect(() => {
    if (!query.trim()) {
      setNotFound(false)
      return
    }
    setNotFound(!foundInFollowing && !foundGlobally)
  }, [query, foundInFollowing, foundGlobally])

  return { results, showDropdown, notFound, setShowDropdown }
}