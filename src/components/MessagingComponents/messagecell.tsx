import type { Message } from '../../services/api/messaging/conversationApi';
import type { Track, Playlist } from '../../services/api/messaging/conversationApi';
import UserAvatar from '@/components/UI/UserAvatar';

interface MessageWithEmbed extends Message {
  _embedResources?: Array<ApiTrack | ApiPlaylist>;
  _embedResource?: ApiTrack | ApiPlaylist;
}

interface MessageCellProps {
  message: MessageWithEmbed;
  displayName: string;
  profilePicture?: string | null;
}

// ─── Type guard ───────────────────────────────────────────────────────────────

function isApiTrack(r: ApiTrack | ApiPlaylist): r is ApiTrack {
  // Tracks have `title`; playlists have `name`
  return 'title' in r;
}

// ─── Duration formatter ───────────────────────────────────────────────────────

function secondsToDisplay(sec: number | null): string {
  if (!sec) return '0:00';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Date formatter ───────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs  / 24);
  if (days  > 0) return `${days} day${days  > 1 ? 's' : ''} ago`;
  if (hrs   > 0) return `${hrs} hour${hrs   > 1 ? 's' : ''} ago`;
  if (mins  > 0) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  return 'just now';
}

// ─── Shape adapters ───────────────────────────────────────────────────────────
// Convert the API (snake_case) types from conversationApi.ts into the
// camelCase frontend types consumed by TrackCard and PlaylistComponent.
// Every field maps 1-to-1 from the enriched interfaces — no `as unknown` needed.

function apiTrackToFrontend(t: ApiTrack): Track {
  return {
    id:             t.id,
    title:          t.title,
    artistName:     t.artist_name ?? t.artists ?? 'Unknown Artist',
    artistUsername: t.artist_username ?? '',
    artistId:       t.user_id,
    coverUrl:       t.cover_image ?? '',
    audioUrl:       t.stream_url  ?? '',
    duration:       secondsToDisplay(t.duration),
    waveformData:   [],                  // waveform peaks are fetched lazily by TrackCard itself
    playCount:      t.play_count,
    likeCount:      t.like_count,
    repostCount:    t.repost_count,
    genre:          t.genre ?? '',
    trackSlug:      t.slug ?? t.id,
    postedAt:       t.created_at,
    isLiked:        t.is_liked,
    isReposted:     t.is_reposted,
    commentCount:   t.comment_count,
  } as Track;
}

function apiPlaylistToFrontend(p: ApiPlaylist): Playlist {
  const tracks = (p.tracks ?? []).map(apiTrackToFrontend);

  return {
    id:               p.playlist_id,
    title:            p.name,
    creatorName:      p.creator_name      ?? '',
    creatorUsername:  p.creator_username  ?? '',
    coverUrl:         p.cover_image       ?? tracks[0]?.coverUrl ?? '',
    playlistSlug:     p.slug              ?? p.playlist_id,
    trackCount:       p.track_count,
    tracks,
    likeCount:        p.like_count,
    repostCount:      p.repost_count,
    isPrivate:        p.is_private,
    postedAt:         p.created_at,
    description:      p.description ?? '',
  } as Playlist;
}

// ─── Per-embed renderer ───────────────────────────────────────────────────────

function EmbedRenderer({ resource }: { resource: ApiTrack | ApiPlaylist }) {
  if (isApiTrack(resource)) {
    const track = apiTrackToFrontend(resource);
    return (
      <div className="mt-3">
        <TrackCard
          track={track}
          disableComments
          onCopyLink={() => {}}
          onAddToPlaylist={() => {}}
        />
      </div>
    );
  }

  const playlist = apiPlaylistToFrontend(resource);
  return (
    <div className="mt-3">
      <PlaylistComponent
        playlist={playlist}
        onCopyLink={() => {}}
      />
    </div>
  );
}

// ─── Fallback pill ────────────────────────────────────────────────────────────
// Shown for messages loaded from history that have no pre-fetched resource.
// You can enhance this later to lazy-fetch the resource by embed_id.

function EmbedFallback({ type }: { type: string }) {
  return (
    <div className="mt-2 text-xs text-gray-500 italic">
      {type === 'track' ? '🎵 Track attached' : '🎶 Playlist attached'}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MessageCell({ message, displayName, profilePicture }: MessageCellProps) {
  // Normalise both the array form (_embedResources) and the legacy scalar
  // (_embedResource) into a single array for uniform rendering.
  const embedResources: Array<ApiTrack | ApiPlaylist> =
    message._embedResources ??
    (message._embedResource ? [message._embedResource] : []);

  return (
    <div className="flex items-start gap-3 py-3">
      <UserAvatar
        src={profilePicture}
        name={displayName}
        alt={displayName}
        wrapperClassName="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-[#2a2a2a]"
        initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-white text-sm font-bold"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name + timestamp */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-white">{displayName}</span>
          <span className="flex-shrink-0 text-xs text-gray-500">
            {relativeTime(message.created_at)}
          </span>
        </div>

        {/* Text body */}
        {message.body && (
          <p className="text-sm text-gray-400 mt-0.5 break-words">{message.body}</p>
        )}

        {/* Embeds */}
        {embedResources.length > 0
          ? embedResources.map((resource, idx) => (
              <EmbedRenderer key={idx} resource={resource} />
            ))
          : // Fallback: message came from history without pre-fetched data
            message.embed_type
              ? <EmbedFallback type={message.embed_type} />
              : null
        }
      </div>
    </div>
  );
}
