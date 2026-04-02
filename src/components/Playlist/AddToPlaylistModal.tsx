import { useEffect, useState } from "react";
import {
  getMyPlaylists,
  addTrackToPlaylist,
  createPlaylist,
  getPlaylist,
} from "@/services/api/playlist/playlist.service";
import type {
  Playlist,
  PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";
import { Modal } from "../MessagingComponents/Modal";
import PrivacyToggle from "@/components/Upload/PrivacyToggle";
import { getTracks } from "@/services/mocks/Track.service";
import type { Track } from "@/types/track";

interface AddToPlaylistModalProps {
  trackId: string | number;
  trackTitle: string;
  onClose: () => void;
}

const AddToPlaylistModal = ({
  trackId,
  trackTitle,
  onClose,
}: AddToPlaylistModalProps) => {
  const [activeTab, setActiveTab] = useState<"add" | "create">("add");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [allTracks, setAllTracks] = useState<Track[]>([]);

  // Expanded playlist tracks preview
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(
    null,
  );
  const [expandedTracks, setExpandedTracks] = useState<PlaylistTrackItem[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  // Create tab state
  const [playlistTitle, setPlaylistTitle] = useState(
    `Related tracks: ${trackTitle}`,
  );
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [creating, setCreating] = useState(false); // ← fixed

  useEffect(() => {
    getMyPlaylists()
      .then((res) => {
        const items = res.data.items;
        setPlaylists(items);
        if (items.length === 0) setActiveTab("create");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getTracks()
      .then((data) => setAllTracks(data))
      .catch(console.error);
  }, []);

  const handleAdd = async (playlistId: string) => {
    setAdding(playlistId);
    try {
      await addTrackToPlaylist(playlistId, String(trackId));
      setSuccess(playlistId);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(null);
    }
  };

  const handleCreate = async () => {
    if (!playlistTitle.trim()) return;
    setCreating(true);
    try {
      const res = await createPlaylist({
        name: playlistTitle.trim(),
        is_public: privacy === "public",
      });
      await addTrackToPlaylist(res.data.playlist_id, String(trackId));
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const getTrackTitle = (trackId: string) => {
    // Find the track in the "allTracks" list that matches the ID in the playlist
    const match = allTracks.find((t) => String(t.id) === trackId);
    return match ? match.title : `Track ${trackId}`; // Fallback to ID if not found
  };

  // Toggle expanded track list for a playlist row
  const handleToggleExpand = async (playlistId: string) => {
    if (expandedPlaylistId === playlistId) {
      setExpandedPlaylistId(null);
      setExpandedTracks([]);
      return;
    }
    setExpandedPlaylistId(playlistId);
    setLoadingTracks(true);
    try {
      const res = await getPlaylist(playlistId);
      setExpandedTracks(res.data.tracks ?? []);
    } catch {
      setExpandedTracks([]);
    } finally {
      setLoadingTracks(false);
    }
  };

  const hasPlaylists = playlists.length > 0;

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="w-[550px]">
        {/* Tabs — only show if user has existing playlists */}
        {!loading && hasPlaylists && (
          <div className="flex text-[22px] font-bold items-center border-b border-[#353535]">
            <button
              onClick={() => setActiveTab("add")}
              className={`px-2 py-2 transition-colors relative ${
                activeTab === "add"
                  ? "text-white"
                  : "text-[#8e8e8e] hover:text-white cursor-pointer"
              }`}
            >
              Add to playlist
              {activeTab === "add" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-2 py-2 transition-colors relative ${
                activeTab === "create"
                  ? "text-white"
                  : "text-[#8e8e8e] hover:text-white cursor-pointer"
              }`}
            >
              Create a playlist
              {activeTab === "create" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
              )}
            </button>
          </div>
        )}

        {/* No playlists header */}
        {!loading && !hasPlaylists && (
          <div className="border-b border-[#353535] pb-3">
            <h2 className="text-[22px] font-bold text-white px-2 py-2">
              Create a playlist
            </h2>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-[#555] border-t-white animate-spin" />
          </div>
        )}

        {/* Add to playlist tab */}
       

        {/* Create a playlist tab / only view */}
        {!loading && (!hasPlaylists || activeTab === "create") && (
          <div className="mt-6 space-y-5 pb-2">
            {/* Title input */}
            <div>
              <label className="flex items-center gap-1 text-xs text-white font-bold mb-2 tracking-wide">
                Playlist title <span className="text-[#ec5261]">*</span>
              </label>
              <input
                data-test="create-playlist-title-input"
                type="text"
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                className="text-[14px] text-white border border-transparent mr-2 py-2 pr-10 pl-4 rounded-sm 
                bg-[#303030] focus:outline-none focus:border-text-secondary transition-all w-full placeholder:text-text-secondary"
              />
            </div>

            {/* Privacy toggle */}
            <div className="flex">
              <label className="flex items-center gap-1 text-sm text-white font-bold mb-1 tracking-wide mr-2">
                Privacy :
              </label>
              <PrivacyToggle value={privacy} onChange={setPrivacy} />
            </div>

            {/* Save button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleCreate}
                disabled={creating || !playlistTitle.trim()}
                className="bg-white text-black text-sm font-bold px-6 py-2.5 rounded-sm
                  hover:text-[#a0a0a0] transition-colors disabled:opacity-40 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddToPlaylistModal;
