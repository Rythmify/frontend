import { useState, useRef } from "react"
import { resolvePermalink, fetchTrack, fetchPlaylist } from "../../services/api/messaging/conversationApi"
import type { Track, Playlist } from "../../services/api/messaging/conversationApi"
import MiniPlayer from "./MiniPlayer"

export type ResolvedEmbed =
  | { type: "track";    id: string; resource: Track;    sourceUrl: string }
  | { type: "playlist"; id: string; resource: Playlist; sourceUrl: string }

interface MessageInputProps {
  onValueChange?: (value: string) => void
  onIsEmptyChange?: (isEmpty: boolean) => void
  onEmbedsResolved?: (embeds: ResolvedEmbed[]) => void
  hasError?: boolean
}

const URL_REGEX = /https?:\/\/[^\s"'<>]+/g

export function MessageBox({
  onValueChange,
  onIsEmptyChange,
  onEmbedsResolved,
  hasError,
}: MessageInputProps) {
  const [value, setValue]   = useState("")
  const [embeds, setEmbeds] = useState<ResolvedEmbed[]>([])
  const debounceRef         = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resolvedUrlsRef     = useRef<Map<string, ResolvedEmbed | null>>(new Map())

  const stripEmbedUrls = (text: string, activeEmbeds: ResolvedEmbed[]) => {
    let stripped = text
    // Collect all unique sourceUrls and remove each occurrence once per embed
    // (same URL twice = removed twice)
    const urlCounts = new Map<string, number>()
    for (const embed of activeEmbeds) {
      urlCounts.set(embed.sourceUrl, (urlCounts.get(embed.sourceUrl) ?? 0) + 1)
    }
    for (const [url, count] of urlCounts.entries()) {
      let removed = 0
      stripped = stripped.replace(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), (match) => {
        if (removed < count) { removed++; return "" }
        return match
      })
    }
    return stripped.replace(/\s{2,}/g, " ").trim()
  }

  // FIX 1: remove by index so duplicate URLs only remove one entry at a time
  const removeEmbedAt = (indexToRemove: number) => {
    const embedToRemove = embeds[indexToRemove]

    // Remove one occurrence of the URL from the textarea
    let removed = false
    const newValue = value.replace(
      new RegExp(embedToRemove.sourceUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      (match) => {
        if (!removed) { removed = true; return "" }
        return match
      }
    ).replace(/\s{2,}/g, " ").trim()

    setValue(newValue)

    const next = embeds.filter((_, i) => i !== indexToRemove)
    const cleanText = stripEmbedUrls(newValue, next)
    onValueChange?.(cleanText)
    onIsEmptyChange?.(cleanText.trim() === "" && next.length === 0)
    setEmbeds(next)
    onEmbedsResolved?.(next)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setValue(text)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    const matches = text.match(URL_REGEX)
    if (!matches) {
      const cleanText = text.trim()
      onValueChange?.(cleanText)
      onIsEmptyChange?.(cleanText === "")
      setEmbeds([])
      onEmbedsResolved?.([])
      return
    }

    // Pass text-without-urls upstream immediately for validation
    // (will be recalculated after resolve settles)
    const tempClean = matches.reduce((acc, url) => acc.replace(url, ""), text).replace(/\s{2,}/g, " ").trim()
    onValueChange?.(tempClean)
    onIsEmptyChange?.(tempClean === "" && embeds.length === 0)

    debounceRef.current = setTimeout(async () => {
      const results = await Promise.all(
        matches.map(async (url): Promise<ResolvedEmbed | null> => {
          if (resolvedUrlsRef.current.has(url)) {
            const cached = resolvedUrlsRef.current.get(url)
            if (!cached) return null
            return { ...cached, sourceUrl: url }
          }

          try {
            const resolved = await resolvePermalink(url)
            const { type, id } = resolved.data
            if (!type || !id || type === "user") {
              resolvedUrlsRef.current.set(url, null)
              return null
            }

            let embed: ResolvedEmbed | null = null

            if (type === "track") {
              const trackRes = await fetchTrack(id)
              embed = { type: "track", id, resource: trackRes.data, sourceUrl: url }
            } else if (type === "playlist" || type === "album") {
              const playlistRes = await fetchPlaylist(id)
              const plData = playlistRes.data;
              
              // Explicitly fetch all tracks to ensure we have full data (waveform, etc.)
              if (plData.tracks && plData.tracks.length > 0) {
                try {
                  const fetchPromises = plData.tracks.map(async (t: any) => {
                    let trackId = t.id;
                    if (!trackId && t.track_id) trackId = t.track_id;
                    if (!trackId && typeof t === 'string') trackId = t;
                    
                    if (trackId && trackId !== "undefined" && trackId !== "") {
                      const trackRes = await fetchTrack(trackId);
                      return trackRes.data;
                    }
                    return t;
                  });
                  
                  plData.tracks = await Promise.all(fetchPromises);
                } catch (err) {
                  console.error("Failed to fetch tracks for embedded playlist:", err);
                }
              }
              
              embed = { type: "playlist", id, resource: plData, sourceUrl: url }
            }

            resolvedUrlsRef.current.set(url, embed)
            return embed
          } catch {
            resolvedUrlsRef.current.set(url, null)
            return null
          }
        })
      )

      const validEmbeds = results.filter((r): r is ResolvedEmbed => r !== null)
      setEmbeds(validEmbeds)
      onEmbedsResolved?.(validEmbeds)

      const cleanText = stripEmbedUrls(text, validEmbeds)
      onValueChange?.(cleanText)
      onIsEmptyChange?.(cleanText === "" && validEmbeds.length === 0)
    }, 600)
  }

  return (
    // FIX 2: flex-col, textarea fixed, miniplayers grow downward below it
    <div data-test="message-box" className="flex flex-col">
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
        <div className="flex flex-col mt-1">
          {embeds.map((embed, index) => {
            const props =
              embed.type === "track"
                ? {
                    coverImage: embed.resource.cover_image,
                    trackName:  embed.resource.title,
                    artistName: embed.resource.artist_name ?? embed.resource.artists ?? "Unknown Artist",
                  }
                : {
                    coverImage: embed.resource.cover_image,
                    trackName:  embed.resource.name,
                    artistName: `${embed.resource.track_count} track${embed.resource.track_count !== 1 ? "s" : ""}`,
                  }

            return (
              <MiniPlayer
                key={`${embed.id}-${index}`}
                {...props}
                onClose={() => removeEmbedAt(index)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}