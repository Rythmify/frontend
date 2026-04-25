import { useState, useRef } from "react"
import { resolvePermalink, fetchTrack, fetchPlaylist } from "../../services/api/messaging/conversationApi"
import type { Track, Playlist } from "../../services/api/messaging/conversationApi"
import MiniPlayer from "./MiniPlayer"

export type ResolvedEmbed =
  | { type: "track";    id: string; resource: Track }
  | { type: "playlist"; id: string; resource: Playlist }

interface MessageInputProps {
  onValueChange?: (value: string) => void
  onIsEmptyChange?: (isEmpty: boolean) => void
  onEmbedsResolved?: (embeds: ResolvedEmbed[]) => void
  hasError?: boolean
}


const URL_REGEX =
  /https?:\/\/(?:[\w-]+\.azurestaticapps\.net|rythmify\.com)\/[^\s"'<>]+/g

export function MessageBox({
  onValueChange,
  onIsEmptyChange,
  onEmbedsResolved,
  hasError,
}: MessageInputProps) {
  const [value, setValue]     = useState("")
  const [embeds, setEmbeds]   = useState<ResolvedEmbed[]>([])
  const debounceRef           = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track which URLs we've already resolved so we don't re-fetch on every keystroke
  const resolvedUrlsRef       = useRef<Map<string, ResolvedEmbed | null>>(new Map())

  const removeEmbed = (id: string) => {
    const next = embeds.filter(e => e.id !== id)
    setEmbeds(next)
    onEmbedsResolved?.(next)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setValue(text)
    onValueChange?.(text)
    onIsEmptyChange?.(text.trim() === "")

    if (debounceRef.current) clearTimeout(debounceRef.current)

    const matches = text.match(URL_REGEX)
    if (!matches) {
      setEmbeds([])
      onEmbedsResolved?.([])
      return
    }

    // Deduplicate URLs found in text
    const uniqueUrls = [...new Set(matches)]

    debounceRef.current = setTimeout(async () => {
      const results = await Promise.all(
        uniqueUrls.map(async (url): Promise<ResolvedEmbed | null> => {
          // Return cached result if we already resolved this URL
          if (resolvedUrlsRef.current.has(url)) {
            return resolvedUrlsRef.current.get(url) ?? null
          }

          try {
            const resolved = await resolvePermalink(url)
            const { type, id } = resolved.data

            let embed: ResolvedEmbed | null = null

            if (type === "track") {
              const trackRes = await fetchTrack(id)
              embed = { type: "track", id, resource: trackRes.data }
            } else if (type === "playlist") {
              const playlistRes = await fetchPlaylist(id)
              embed = { type: "playlist", id, resource: playlistRes.data }
            }
            // "user" type — we don't embed users, ignore

            resolvedUrlsRef.current.set(url, embed)
            return embed
          } catch {
            resolvedUrlsRef.current.set(url, null)
            return null
          }
        })
      )

      const validEmbeds = results.filter((r): r is ResolvedEmbed => r !== null)
      // Deduplicate by id (same track/playlist linked twice)
      const seen = new Set<string>()
      const deduped = validEmbeds.filter(e => {
        if (seen.has(e.id)) return false
        seen.add(e.id)
        return true
      })

      setEmbeds(deduped)
      onEmbedsResolved?.(deduped)
    }, 600)
  }

  return (
    <div data-test="message-box" className="flex flex-col gap-1">
      <textarea
        data-test="message-input"
        value={value}
        onChange={handleChange}
        rows={4}
        className={`w-full resize-y bg-[#2a2a2a] border text-white text-sm px-3 py-2 rounded focus:outline-none caret-[#f50] ${
          hasError ? "border-red-500" : "border-[#444] focus:border-[#666]"
        }`}
      />

      {embeds.length > 0 && (
        <div className="flex flex-col">
          {embeds.map(embed => {
            const props =
              embed.type === "track"
                ? {
                    coverImage:  embed.resource.cover_image,
                    trackName:   embed.resource.title,
                    artistName:  embed.resource.artist_name ?? embed.resource.artists ?? "Unknown Artist",
                  }
                : {
                    coverImage:  embed.resource.cover_image,
                    trackName:   embed.resource.name,
                    artistName:  `${embed.resource.track_count} track${embed.resource.track_count !== 1 ? "s" : ""}`,
                  }

            return (
              <MiniPlayer
                key={embed.id}
                {...props}
                onClose={() => removeEmbed(embed.id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}