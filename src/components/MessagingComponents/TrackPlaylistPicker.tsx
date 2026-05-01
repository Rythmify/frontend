import { useEffect, useMemo, useRef, useState } from "react";
import { AudioWaveform, Lock, ListMusic, Music } from "lucide-react";
import {
  fetchMyTracks,
  fetchMyRepostedTracks,
  fetchMyRepostedPlaylists,
  fetchUserPlaylists,
  type MyTrack,
  type RepostedTrack,
  type RepostedPlaylist,
  type UserPlaylist,
} from "../../services/api/messaging/conversationApi";
import { useAuthStore } from "@/stores/auth.store";

export type PickedItem =
  | { type: "track"; id: string; title: string; artistName: string; coverImage: string | null }
  | { type: "playlist"; id: string; title: string; trackCount: number; coverImage: string | null };

interface TrackPlaylistPickerProps {
  onPick: (item: PickedItem) => void;
  onClose: () => void;
}

type PickerItem =
  | {
      type: "track";
      id: string;
      title: string;
      artistName: string;
      coverImage: string | null;
      isPrivate?: boolean;
    }
  | {
      type: "playlist";
      id: string;
      title: string;
      trackCount: number;
      coverImage: string | null;
      isPrivate?: boolean;
    };

const RESULT_LIMIT = 50;

function getResponseItems<T>(response: unknown, fallbackKey: string): T[] {
  if (Array.isArray(response)) return response as T[];

  const payload = response as Record<string, unknown> | null;
  if (!payload) return [];

  if (Array.isArray(payload.data)) return payload.data as T[];
  if (Array.isArray(payload[fallbackKey])) return payload[fallbackKey] as T[];

  return [];
}

function normalizeTrack(track: MyTrack | RepostedTrack): PickerItem {
  return {
    type: "track",
    id: track.id,
    title: track.title,
    artistName: track.artist_name ?? "",
    coverImage: track.cover_image,
  };
}

function normalizePlaylist(playlist: RepostedPlaylist | UserPlaylist): PickerItem {
  const id = (playlist as UserPlaylist).playlist_id ?? (playlist as RepostedPlaylist).id;
  const title = (playlist as UserPlaylist).name ?? (playlist as RepostedPlaylist).title ?? "Playlist";

  return {
    type: "playlist",
    id,
    title,
    trackCount: playlist.track_count ?? 0,
    coverImage: playlist.cover_image ?? null,
    isPrivate: "is_public" in playlist ? !playlist.is_public : false,
  };
}

function CoverImage({ item }: { item: PickerItem }) {
  return (
    <div className="w-10 h-10 shrink-0 overflow-hidden bg-[#6a4f5b] flex items-center justify-center">
      {item.coverImage ? (
        <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
      ) : (
        <Music className="w-5 h-5 text-white/55" aria-hidden="true" />
      )}
    </div>
  );
}

function PickerRow({ item, onPick }: { item: PickerItem; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="group grid w-full grid-cols-[40px_minmax(0,1fr)_44px] items-center gap-5 px-5 py-2.5 text-left transition-colors odd:bg-black even:bg-[#2f2f2f] hover:bg-[#3a3a3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <CoverImage item={item} />
      <span className="min-w-0 truncate text-base font-bold text-white">
        {item.title}
      </span>
      <span className="flex items-center justify-end gap-3 text-[#a8a8a8]">
        {item.isPrivate && <Lock className="h-4 w-4" aria-label="Private" />}
        {item.type === "track" ? (
          <AudioWaveform className="h-4 w-4" aria-label="Track" />
        ) : (
          <ListMusic className="h-4 w-4" aria-label="Playlist" />
        )}
      </span>
    </button>
  );
}

function EmptyState({ loading }: { loading: boolean }) {
  return (
    <div className="px-5 py-6 text-center text-sm text-[#999]">
      {loading ? "Loading tracks and playlists..." : "No tracks or playlists found."}
    </div>
  );
}

export default function TrackPlaylistPicker({ onPick, onClose }: TrackPlaylistPickerProps) {
  const user = useAuthStore((state) => state.user);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    const loadItems = async () => {
      setLoading(true);

      const requests = [
        fetchMyTracks(RESULT_LIMIT, 0),
        fetchMyRepostedTracks(RESULT_LIMIT, 0),
        user?.id ? fetchUserPlaylists(user.id, RESULT_LIMIT, 0) : Promise.resolve({ data: [] }),
        fetchMyRepostedPlaylists(RESULT_LIMIT, 0),
      ] as const;

      const [myTracks, repostedTracks, playlists, repostedPlaylists] =
        await Promise.allSettled(requests);

      if (cancelled) return;

      const nextItems: PickerItem[] = [];

      if (myTracks.status === "fulfilled") {
        nextItems.push(...getResponseItems<MyTrack>(myTracks.value, "tracks").map(normalizeTrack));
      }
      if (repostedTracks.status === "fulfilled") {
        nextItems.push(
          ...getResponseItems<RepostedTrack>(repostedTracks.value, "tracks").map(normalizeTrack),
        );
      }
      if (playlists.status === "fulfilled") {
        nextItems.push(
          ...getResponseItems<UserPlaylist>(playlists.value, "playlists").map(normalizePlaylist),
        );
      }
      if (repostedPlaylists.status === "fulfilled") {
        nextItems.push(
          ...getResponseItems<RepostedPlaylist>(repostedPlaylists.value, "playlists").map(
            normalizePlaylist,
          ),
        );
      }

      const seen = new Set<string>();
      setItems(
        nextItems.filter((item) => {
          const key = `${item.type}:${item.id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }),
      );
      setLoading(false);
    };

    loadItems().catch(() => {
      if (!cancelled) {
        setItems([]);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;

    return items.filter((item) => {
      const searchable =
        item.type === "track"
          ? `${item.title} ${item.artistName}`
          : `${item.title} ${item.trackCount}`;

      return searchable.toLowerCase().includes(normalizedQuery);
    });
  }, [items, query]);

  const pickItem = (item: PickerItem) => {
    if (item.type === "track") {
      onPick({
        type: "track",
        id: item.id,
        title: item.title,
        artistName: item.artistName,
        coverImage: item.coverImage,
      });
    } else {
      onPick({
        type: "playlist",
        id: item.id,
        title: item.title,
        trackCount: item.trackCount,
        coverImage: item.coverImage,
      });
    }

    onClose();
  };

  return (
    <div
      ref={ref}
      data-test="track-playlist-picker"
      className="relative z-50 flex max-h-[360px] w-full flex-col overflow-hidden rounded border border-[#5d5d5d] bg-[#0f0f0f] shadow-2xl"
    >
      <div className="border-b border-[#5d5d5d] bg-[#2e2e2e] px-5 py-3">
        <input
          autoFocus
          type="text"
          placeholder="Select a track or playlist from your profile"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full bg-transparent text-base text-white placeholder:text-[#a8adb4] outline-none"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <PickerRow key={`${item.type}:${item.id}`} item={item} onPick={() => pickItem(item)} />
          ))
        ) : (
          <EmptyState loading={loading} />
        )}
      </div>
    </div>
  );
}
