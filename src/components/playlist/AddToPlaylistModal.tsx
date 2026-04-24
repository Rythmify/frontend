import { useEffect, useState } from "react";
import {
  getMyPlaylists,
  addTrackToPlaylist,
  createPlaylist,
  getPlaylist,
  type Playlist,
} from "@/services/api/playlist/playlist.service";
import { Modal } from "../MessagingComponents/Modal";
import { useLikesStore } from "@/stores/likes.store";
import PlaylistList from "./PlaylistList";
import CreatePlaylistTab from "./CreatePlaylistTab";

interface DisplayTrack {
  id: string;
  title: string;
  artistName?: string;
  coverUrl?: string;
}

function getPlaylistErrorMessage(err: unknown) {
  const fallback = "Failed to create playlist. Please try again.";

  if (typeof err !== "object" || err === null) {
    return fallback;
  }

  const response = (err as {
    response?: {
      data?: {
        error?: { message?: string };
        message?: string;
      };
    };
    message?: string;
  }).response;

  return (
    response?.data?.error?.message ??
    response?.data?.message ??
    (err as { message?: string }).message ??
    fallback
  );
}

interface AddToPlaylistModalProps {
  trackId?: string;
  trackTitle: string;
  trackCoverUrl?: string;
  playlistId?: string; // if adding whole playlist
  initialTracks?: DisplayTrack[];
  moreOfLike?: boolean;
  artistName?: string;
  onClose: () => void;
}

const AddToPlaylistModal = ({
  trackId,
  trackTitle,
  trackCoverUrl,
  onClose,
  playlistId,
  initialTracks,
  moreOfLike = false,
  artistName,
}: AddToPlaylistModalProps) => {
  const [activeTab, setActiveTab] = useState<"add" | "create">("add");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tracksToAdd, setTracksToAdd] = useState<DisplayTrack[]>([]);

  // true when the source is a whole playlist (multiple tracks), false for a single track
  const isPlaylist = !!playlistId;

  // Use store for liked tracks
  const likedTracks = useLikesStore((state) => state.likedTracks);

  // Create tab state
  const [playlistTitle, setPlaylistTitle] = useState(
    `Related tracks: ${trackTitle}`,
  );
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handlePlaylistTitleChange = (val: string) => {
    setCreateError(null);
    setCreateSuccess(false);
    setPlaylistTitle(val);
  };

  const handlePrivacyChange = (val: "public" | "private") => {
    setCreateError(null);
    setCreateSuccess(false);
    setPrivacy(val);
  };

  // Consolidated Initial Fetch
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const res = await getMyPlaylists();
        const items = res.data.items;
        setPlaylists(items);
        if (items.length === 0) setActiveTab("create");

        if (initialTracks?.length) {
          setTracksToAdd(initialTracks);
        } else if (playlistId) {
          const playlistRes = await getPlaylist(playlistId);
          const tracks: DisplayTrack[] = (playlistRes.data.tracks || []).map(
            (t) => ({
              id: t.track_id,
              title: t.title ?? "Untitled track",
              artistName: t.artist_name ?? "Unknown Artist",
              coverUrl: t.cover_image ?? undefined,
            }),
          );
          setTracksToAdd(tracks);
        } else if (trackId) {
          setTracksToAdd([
            {
              id: trackId,
              title: trackTitle,
              artistName,
              coverUrl: trackCoverUrl,
            },
          ]);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [
    initialTracks,
    trackId,
    playlistId,
    trackTitle,
    artistName,
    trackCoverUrl,
  ]);

  // Update track count helper
  const updateLocalPlaylistCount = (pid: string, countToAdd: number) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.playlist_id === pid
          ? { ...p, track_count: p.track_count + countToAdd }
          : p,
      ),
    );
  };

  const handleAdd = async (pid: string, customTracks?: DisplayTrack[]) => {
    const targets = customTracks || tracksToAdd;
    setAdding(pid);
    try {
      for (const t of targets) {
        await addTrackToPlaylist(pid, String(t.id));
      }

      updateLocalPlaylistCount(pid, targets.length);
      setSuccess(pid);

      // Clear success state after 3 seconds to allow further additions
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(null);
    }
  };

  const handleCreate = async (isMoreOfLike: boolean) => {
    if (!playlistTitle.trim()) return;
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(false);
    try {
      const slug = playlistTitle
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") 
        .replace(/\s+/g, "-") 
        .replace(/-+/g, "-"); 

      const res = await createPlaylist({
        name: playlistTitle.trim(),
        slug,
        is_public: privacy === "public",
      });

      const newPlaylistId = res.data.playlist_id;

      const tracksForNewPlaylist =
        isMoreOfLike
          ? initialTracks ?? tracksToAdd
          : playlistId
            ? tracksToAdd
            : trackId
              ? [
                  {
                    id: trackId,
                    title: trackTitle,
                    artistName,
                    coverUrl: trackCoverUrl,
                  },
                ]
              : tracksToAdd.slice(0, 1);

      for (const t of tracksForNewPlaylist) {
        await addTrackToPlaylist(newPlaylistId, String(t.id));
      }

      const newPlaylist: Playlist = {
        ...res.data,
        track_count: tracksForNewPlaylist.length,
      };

      setPlaylists((prev) => [...prev, newPlaylist]);
      setActiveTab("add");
      setSuccess(newPlaylistId);
      setCreateSuccess(true);

      // Reset Create Form
      setPlaylistTitle(`Related tracks: ${trackTitle}`);
      setPrivacy("public");
    } catch (err) {
      console.error(err);
      setCreateError(getPlaylistErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const hasPlaylists = playlists.length > 0;
  const defaultPlaylistId = playlists[0]?.playlist_id;

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="w-[550px] bg-bg">
        {!loading && !hasPlaylists && (
          <div className="flex items-center px-2 py-2 text-[22px] font-bold text-text-upload">
            Create a playlist
          </div>
        )}

        {!loading && hasPlaylists && (
          <div className="flex text-[22px] font-bold items-center">
            <button
              data-test="button-tab-add-to-playlist"
              onClick={() => setActiveTab("add")}
              className={`px-2 py-2 transition-colors relative ${
                activeTab === "add"
                  ? "text-text-upload"
                  : "text-[#8e8e8e] cursor-pointer"
              }`}
            >
              Add to playlist
              {activeTab === "add" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-bg-inverted" />
              )}
            </button>
            <button
              data-test="button-tab-create-playlist"
              onClick={() => setActiveTab("create")}
              className={`px-2 py-2 transition-colors relative ${
                activeTab === "create"
                  ? "text-text-upload"
                  : "text-[#8e8e8e] cursor-pointer"
              }`}
            >
              Create a playlist
              {activeTab === "create" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-bg-inverted" />
              )}
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-[#555] border-t-text-upload animate-spin" />
          </div>
        ) : activeTab === "add" ? (
          <PlaylistList
            playlists={playlists}
            tracksToAdd={tracksToAdd}
            adding={adding}
            success={success}
            onAdd={handleAdd}
          />
        ) : (
          <CreatePlaylistTab
            playlistTitle={playlistTitle}
            setPlaylistTitle={handlePlaylistTitleChange}
            privacy={privacy}
            setPrivacy={handlePrivacyChange}
            creating={creating}
            success={createSuccess}
            error={createError}
            moreOfLike={moreOfLike}
            tracksToAdd={tracksToAdd}
            setTracksToAdd={setTracksToAdd}
            isPlaylist={isPlaylist}
            defaultPlaylistId={defaultPlaylistId}
            onAdd={handleAdd}
            likedTracks={likedTracks}
            onCreate={handleCreate}
          />
        )}
      </div>
    </Modal>
  );
};

export default AddToPlaylistModal;
