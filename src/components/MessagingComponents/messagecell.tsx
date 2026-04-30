import { useEffect, useState } from 'react';
import type { Message } from '../../services/api/messaging/conversationApi';
import type {
  Track as ApiTrack,
  Playlist as ApiPlaylist,
} from '../../services/api/messaging/conversationApi';
import { fetchTrack, fetchPlaylist } from '../../services/api/messaging/conversationApi';
import { mapTrack, mapPlaylist } from '../../services/api/search/searchMappers';
import type { Track } from '@/types/track';
import type { Playlist } from '@/types/playlist';
import TrackCard from '@/components/track/TrackCard';
import PlaylistComponent from '@/components/playlist/PlaylistComponent';
import UserAvatar from '@/components/UI/UserAvatar';

// Extended Message type that may carry a pre-fetched resource (optimistic UI)
interface MessageWithEmbed extends Message {
  _embedResource?: ApiTrack | ApiPlaylist;
}

interface MessageCellProps {
  message: MessageWithEmbed;
  displayName: string;
  profilePicture?: string | null;
}

// ─── Type guard ───────────────────────────────────────────────────────────────

function isApiTrack(resource: ApiTrack | ApiPlaylist): resource is ApiTrack {
  return 'title' in resource;
}

// ─── Skeleton placeholder while lazy-loading ──────────────────────────────────

function EmbedSkeleton() {
  return (
    <div className="mt-2 flex items-center gap-3 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 animate-pulse">
      <div className="w-10 h-10 rounded-sm bg-[#2a2a2a] flex-shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="h-3 bg-[#2a2a2a] rounded w-2/3" />
        <div className="h-2.5 bg-[#2a2a2a] rounded w-1/3" />
      </div>
    </div>
  );
}

// ─── EmbedCard — handles both optimistic and lazy (history) paths ─────────────

function EmbedCard({
  embedType,
  embedId,
  preloaded,
}: {
  embedType: string;
  embedId: string;
  preloaded?: ApiTrack | ApiPlaylist;
}) {
  const [track, setTrack]       = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading]   = useState(true);
  const [failed, setFailed]     = useState(false);

  useEffect(() => {
    // Map preloaded resource (optimistic send) — no network call needed
    if (preloaded) {
      if (isApiTrack(preloaded)) {
        setTrack(mapTrack(preloaded));
      } else {
        setPlaylist(mapPlaylist(preloaded));
      }
      setLoading(false);
      return;
    }

    // Lazy-load from server (messages loaded from history)
    let cancelled = false;

    const load = async () => {
      try {
        if (embedType === 'track') {
          const res = await fetchTrack(embedId);
          if (!cancelled) setTrack(mapTrack(res.data));
        } else if (embedType === 'playlist') {
          const res = await fetchPlaylist(embedId);
          if (!cancelled) setPlaylist(mapPlaylist(res.data));
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [embedType, embedId, preloaded]);

  if (loading) return <EmbedSkeleton />;

  if (failed) {
    return (
      <div className="mt-2 text-xs text-gray-500 italic">
        {embedType === 'track' ? '🎵 Track attached' : '🎶 Playlist attached'}
      </div>
    );
  }

  if (track) {
    return (
      <div className="mt-2">
        <TrackCard track={track} />
      </div>
    );
  }

  if (playlist) {
    return (
      <div className="mt-2">
        <PlaylistComponent playlist={playlist} />
      </div>
    );
  }

  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff    = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  if (days > 0)    return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0)   return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MessageCell({ message, displayName, profilePicture }: MessageCellProps) {
  const hasEmbed = !!message.embed_type && !!message.embed_id;

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

        {hasEmbed && (
          <EmbedCard
            embedType={message.embed_type!}
            embedId={message.embed_id!}
            preloaded={message._embedResource}
          />
        )}
      </div>
    </div>
  );
}