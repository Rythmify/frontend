import type { Message } from '../../services/api/messaging/conversationApi';
import type { Track, Playlist } from '../../services/api/messaging/conversationApi';
import UserAvatar from '@/components/UI/UserAvatar';

// Extended Message type that may carry a pre-fetched resource (optimistic UI)
interface MessageWithEmbed extends Message {
  _embedResource?: Track | Playlist;
}

interface MessageCellProps {
  message: MessageWithEmbed;
  displayName: string;
  profilePicture?: string | null;
}

// ─── Embed Card ───────────────────────────────────────────────────────────────

function TrackEmbedCard({ track }: { track: Track }) {
  return (
    <div className="mt-2 flex items-center gap-3 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2">
      <div className="w-10 h-10 rounded-sm overflow-hidden flex-shrink-0">
        {track.cover_image ? (
          <img src={track.cover_image} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#b08a8a] to-[#6b5b6b]" />
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-white truncate">{track.title}</span>
        <span className="text-xs text-gray-400 truncate">
          {track.artist_name ?? track.artists ?? 'Unknown Artist'}
        </span>
        {track.genre && (
          <span className="text-xs text-[#f50] mt-0.5">{track.genre}</span>
        )}
      </div>
      <div className="ml-auto flex-shrink-0 text-xs text-gray-500 text-right leading-tight">
        {track.duration != null && (
          <div>{formatDuration(track.duration)}</div>
        )}
        {track.play_count != null && (
          <div>{track.play_count.toLocaleString()} plays</div>
        )}
      </div>
    </div>
  );
}

function PlaylistEmbedCard({ playlist }: { playlist: Playlist }) {
  return (
    <div className="mt-2 flex items-center gap-3 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2">
      <div className="w-10 h-10 rounded-sm overflow-hidden flex-shrink-0">
        {playlist.cover_image ? (
          <img src={playlist.cover_image} alt={playlist.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#6b5b8b] to-[#3b3b6b]" />
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-white truncate">{playlist.name}</span>
        <span className="text-xs text-gray-400">
          {playlist.track_count} track{playlist.track_count !== 1 ? 's' : ''}
        </span>
        {playlist.description && (
          <span className="text-xs text-gray-500 truncate">{playlist.description}</span>
        )}
      </div>
      <div className="ml-auto flex-shrink-0 text-xs text-gray-500 text-right leading-tight">
        <div>{playlist.like_count.toLocaleString()} likes</div>
        {playlist.repost_count != null && (
          <div>{playlist.repost_count.toLocaleString()} reposts</div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function isTrack(resource: Track | Playlist): resource is Track {
  return 'title' in resource;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MessageCell({ message, displayName, profilePicture }: MessageCellProps) {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  const embedResource = message._embedResource;

  return (
    <div className="flex items-start gap-3 py-3">
      <UserAvatar
        src={profilePicture}
        name={displayName}
        alt={displayName}
        wrapperClassName="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-[#2a2a2a]"
        initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-white text-sm font-bold"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-white">{displayName}</span>
          <span className="flex-shrink-0 text-xs text-gray-500">{timeAgo(message.created_at)}</span>
        </div>

        {message.body && (
          <p className="text-sm text-gray-400 mt-0.5 break-words">{message.body}</p>
        )}

        {/* Embed card — rendered from pre-fetched resource (optimistic) or embed_type label */}
        {embedResource ? (
          isTrack(embedResource)
            ? <TrackEmbedCard track={embedResource as Track} />
            : <PlaylistEmbedCard playlist={embedResource as Playlist} />
        ) : message.embed_type === 'track' ? (
          // Fallback: embed arrived from server without pre-fetched data
          // (e.g. messages loaded from history). You can enhance this to
          // fetch the resource lazily if needed.
          <div className="mt-2 text-xs text-gray-500 italic">🎵 Track attached</div>
        ) : message.embed_type === 'playlist' ? (
          <div className="mt-2 text-xs text-gray-500 italic">🎶 Playlist attached</div>
        ) : null}
      </div>
    </div>
  );
}
