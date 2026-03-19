import { useState, useRef } from "react"
import { resolvePermalink, fetchTrack, fetchPlaylist } from "../../services/api/messaging/conversationApi"
import type { Track, Playlist } from "../../services/api/messaging/conversationApi"
export type ResolvedEmbed =
  | { type: "track";    id: string; resource: Track }
  | { type: "playlist"; id: string; resource: Playlist }

interface MessageInputProps {
  onIsEmptyChange?: (isEmpty: boolean) => void
  onEmbedResolved?: (embed: ResolvedEmbed | null) => void
}
const URL_REGEX = /https?:\/\/rythmify\.com\/(tracks|users|playlists)\/[^\s]+/g

export function MessageBox({ onIsEmptyChange, onEmbedResolved }: MessageInputProps) {
  const [value, setValue]       = useState("")
  const [title, setTitle]       = useState<string | null>(null)
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setValue(text)
    onIsEmptyChange?.(text.trim() === "")
    
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const urls = text.match(URL_REGEX)
    if (!urls) {
      onEmbedResolved?.(null)
      setTitle(null)
      return
    }

    debounceRef.current = setTimeout(async () => {
      const url = urls[urls.length - 1] // use the last URL found
      try {
        const resolved = await resolvePermalink(url)
        const { type, id } = resolved.data

        if (type === "track") {
          const trackRes = await fetchTrack(id)
          setTitle(trackRes.data.title)
          onEmbedResolved?.({ type: "track", id, resource: trackRes.data })
        } else if (type === "playlist") {
          const playlistRes = await fetchPlaylist(id)
          setTitle(playlistRes.data.title)
          onEmbedResolved?.({ type: "playlist", id, resource: playlistRes.data })
        } else {
          // type === "user" — not embeddable
          setTitle(null)
          onEmbedResolved?.(null)
        }
      } catch {
        setTitle(null)
        onEmbedResolved?.(null)
      }
    }, 600)
  }

  return (
    <div className="flex flex-col gap-1">
      {title && (
        <p className="text-xs font-semibold text-[#f50] truncate">{title}</p>
      )}
      <textarea
      value={value}
      onChange={handleChange}
      rows={4}
      className="w-full resize-y bg-[#2a2a2a] border border-[#444] text-white text-sm px-3 py-2 rounded focus:outline-none focus:border-[#666] caret-[#f50]"
    />
    </div>
  )
}