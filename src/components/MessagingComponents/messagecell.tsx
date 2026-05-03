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
  const [track, setTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // For tracks: use preloaded data optimistically only if stream_url is present.
      // When sent via the picker, stream_url is null on the synthetic embed, so we
      // must fetch the real resource to get a playable audioUrl.
      if (preloaded && embedType === 'track' && isApiTrack(preloaded)) {
        if (preloaded.stream_url) {
          // Full data available — no network call needed
          setTrack(mapTrack(preloaded));
          setLoading(false);
          return;
        }
        // stream_url missing (picker-built synthetic embed) — fall through to fetch
      }

      // For playlists: preloaded data from the picker won't have track stream_urls
      // either, so always fetch fresh to get fully playable track data.
      // (We still use preloaded title/cover for an instant partial render below.)

      try {
        if (embedType === 'track') {
          const res = await fetchTrack(embedId);
          if (!cancelled) setTrack(mapTrack(res.data));
        } else if (embedType === 'playlist') {
          const res = await fetchPlaylist(embedId);
          const pl = mapPlaylist(res.data);

          // Fetch individual tracks so waveform + audioUrl are fully populated
          if (pl.tracks && pl.tracks.length > 0) {
            try {
              const fetchPromises = pl.tracks.map(async (t) => {
                const trackId = t.id;
                if (trackId && trackId !== 'undefined' && trackId !== '') {
                  const trackRes = await fetchTrack(trackId);
                  return mapTrack(trackRes.data);
                }
                return t;
              });
              pl.tracks = await Promise.all(fetchPromises);
            } catch (err) {
              console.error('Failed to fetch tracks for embedded playlist:', err);
            }
          }

          if (!cancelled) setPlaylist(pl);
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [embedType, embedId, preloaded]);

  // While the real data is loading, show the preloaded title/cover instantly
  // so the user sees something right away instead of a spinner.
  if (loading) {
    if (preloaded && embedType === 'track' && isApiTrack(preloaded)) {
      // Render a lightweight placeholder with the known title + cover
      return (
        <div className="mt-2 flex items-center gap-3 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2">
          {preloaded.cover_image ? (
            <img
              src={preloaded.cover_image}
              alt={preloaded.title ?? ''}
              className="w-10 h-10 rounded-sm object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-sm bg-[#2a2a2a] flex-shrink-0 animate-pulse" />
          )}
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="text-sm font-semibold text-white truncate">
              {preloaded.title ?? 'Track'}
            </span>
            <span className="text-xs text-gray-400 truncate">
              {preloaded.artist_name ?? ''}
            </span>
          </div>
          <div className="w-16 h-2 bg-[#2a2a2a] rounded animate-pulse flex-shrink-0" />
        </div>
      );
    }
    return <EmbedSkeleton />;
  }

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
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MessageCell({ message, displayName, profilePicture }: MessageCellProps) {
  const hasEmbed = !!message.embed_type && !!message.embed_id;

  return (
    <div data-test={`message-cell-${message.id}`} className="flex items-start gap-3 py-3">
      <UserAvatar
        src={profilePicture}
        name={displayName}
        alt={displayName}
        wrapperClassName="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-[#2a2a2a]"
        initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-white text-sm font-bold"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span data-test="message-cell-sender" className="text-sm font-semibold text-white">{displayName}</span>
          <span data-test="message-cell-time" className="flex-shrink-0 text-xs text-gray-500">{timeAgo(message.created_at)}</span>
        </div>

        {message.body && (
          <p data-test="message-cell-body" className="text-sm text-gray-400 mt-0.5 break-words">{message.body}</p>
        )}

        {hasEmbed && (
          <div data-test="message-cell-embed">
            <EmbedCard
              embedType={message.embed_type!}
              embedId={message.embed_id!}
              preloaded={message._embedResource}
            />
          </div>
        )}
      </div>
    </div>
  );
}