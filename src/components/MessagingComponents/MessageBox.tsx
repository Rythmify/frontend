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
  onEmbedResolved?: (embed: ResolvedEmbed | null) => void
  hasError?: boolean
}

const URL_REGEX = /https?:\/\/rythmify\.com\/(tracks|users|playlists)\/[^\s]+/g

export function MessageBox({ onValueChange, onIsEmptyChange, onEmbedResolved, hasError }: MessageInputProps) {
  const [value, setValue]   = useState("")
  const [embed, setEmbed]   = useState<ResolvedEmbed | null>(null)
  const debounceRef         = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearEmbed = () => {
    setEmbed(null)
    onEmbedResolved?.(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setValue(text)
    onValueChange?.(text)
    onIsEmptyChange?.(text.trim() === "")

    if (debounceRef.current) clearTimeout(debounceRef.current)

    const urls = text.match(URL_REGEX)
    if (!urls) {
      clearEmbed()
      return
    }

    debounceRef.current = setTimeout(async () => {
      const url = urls[urls.length - 1]
      try {
        const resolved = await resolvePermalink(url)
        const { type, id } = resolved.data

        if (type === "track") {
          const trackRes = await fetchTrack(id)
          const next: ResolvedEmbed = { type: "track", id, resource: trackRes.data }
          setEmbed(next)
          onEmbedResolved?.(next)
        } else if (type === "playlist") {
          const playlistRes = await fetchPlaylist(id)
          const next: ResolvedEmbed = { type: "playlist", id, resource: playlistRes.data }
          setEmbed(next)
          onEmbedResolved?.(next)
        } else {
          clearEmbed()
        }
      } catch {
        clearEmbed()
      }
    }, 600)
  }

  // Derive MiniPlayer props from the resolved embed
 const miniPlayerProps = embed
  ? embed.type === "track"
    ? {
        profilePicture: null,
        trackName:      embed.resource.title,
        artistName:     embed.resource.artists ?? "Unknown Artist",
      }
    : {
        profilePicture: null,
        trackName:      embed.resource.name,          
        artistName:     `${embed.resource.track_count} track${embed.resource.track_count !== 1 ? "s" : ""}`,
      }
  : null

  return (
    <div data-test="message-box" className="flex flex-col gap-1">
      <textarea
        data-test="message-input"
        value={value}
        onChange={handleChange}
        rows={4}
        className={`w-full resize-y bg-[#2a2a2a] border text-white text-sm px-3 py-2 rounded focus:outline-none caret-[#f50] ${hasError ? "border-red-500" : "border-[#444] focus:border-[#666]"}`}
      />
      {miniPlayerProps && (
        <MiniPlayer
          {...miniPlayerProps}
          onClose={clearEmbed}
        />
      )}
    </div>
  )
}