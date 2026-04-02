import { useEffect, useState } from "react";
import {
  getMyPlaylists,
  addTrackToPlaylist,
  createPlaylist,
} from "@/services/api/playlist/playlist.service";
import type { Playlist } from "@/services/api/playlist/playlist.service";
import { Modal } from "../MessagingComponents/Modal";
interface AddToPlaylistModalProps {
  trackId: string | number;
  onClose: () => void;
}

const AddToPlaylistModal = ({ trackId, onClose }: AddToPlaylistModalProps) => {
  const [activeTab, setActiveTab] = useState<"add" | "create">("add");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create tab state
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getMyPlaylists()
      .then((res) => setPlaylists(res.data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
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
      // after creating, add the track to the new playlist
      await addTrackToPlaylist(res.data.playlist_id, String(trackId));
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      {/* Tabs */}
      <div className="flex text-[22px] rounded-md font-bold items-center border-b border-[#353535] w-[550px]">
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
    </Modal>
  );
};
export default AddToPlaylistModal;
