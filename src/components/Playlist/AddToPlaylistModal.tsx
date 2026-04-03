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

  // Create tab state
  const [playlistTitle, setPlaylistTitle] = useState(
    `Related tracks: ${trackTitle}`,
  );
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [creating, setCreating] = useState(false);

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

      // Add the new playlist to local state and switch to add tab
      const newPlaylist = res.data;
      setPlaylists((prev) => [
        ...prev,
        {
          playlist_id: newPlaylist.playlist_id,
          owner_user_id: newPlaylist.owner_user_id,
          name: newPlaylist.name,
          description: newPlaylist.description,
          is_public: newPlaylist.is_public,
          created_at: newPlaylist.created_at,
          track_count: 1,
          like_count: newPlaylist.like_count,
        },
      ]);
      setActiveTab("add");
      setSuccess(res.data.playlist_id);

      // Reset form
      setPlaylistTitle(`Related tracks: ${trackTitle}`);
      setPrivacy("public");
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const hasPlaylists = playlists.length > 0;

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="w-[550px] bg-bg">
        {/* Tabs — only show if user has existing playlists */}
        {!loading && hasPlaylists && (
          <div className="flex text-[22px] font-bold items-center ">
            <button
              onClick={() => setActiveTab("add")}
              className={`px-2 py-2 transition-colors relative ${
                activeTab === "add"
                  ? "text-text-upload"
                  : "text-[#8e8e8e] hover:text-text-upload cursor-pointer"
              }`}
            >
              Add to playlist
              {activeTab === "add" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-bg-inverted" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-2 py-2 transition-colors relative ${
                activeTab === "create"
                  ? "text-text-upload"
                  : "text-[#8e8e8e] hover:text-text-upload cursor-pointer"
              }`}
            >
              Create a playlist
              {activeTab === "create" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-bg-inverted" />
              )}
            </button>
          </div>
        )}

        {/* No playlists header */}
        {!loading && !hasPlaylists && (
          <div className="pb-3">
            <h2 className="text-[22px] font-bold text-text-upload px-2 py-2">
              Create a playlist
            </h2>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-[#555] border-t-text-upload animate-spin" />
          </div>
        )}

        {/* Add to playlist tab */}
        {!loading && hasPlaylists && activeTab === "add" && (
          <div className="mt-6 space-y-3 pb-2 max-h-96 overflow-y-auto font-bold">
            {playlists.map((playlist) => (
              <div key={playlist.playlist_id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-text-upload font-bold text-sm">
                      {playlist.name}
                    </h3>
                    <p className="text-text-upload text-xs">
                      {playlist.track_count}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdd(playlist.playlist_id)}
                      disabled={adding === playlist.playlist_id}
                      className=" bg-input-bg text-text-upload text-sm font-bold px-3 py-1.5 rounded-sm hover:text-[#838383] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Add to playlist
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create a playlist tab / only view */}
        {!loading && (!hasPlaylists || activeTab === "create") && (
          <div className="mt-6 space-y-5 pb-2">
            {/* Title input */}
            <div>
              <label className="flex items-center gap-1 text-xs text-text-upload font-bold mb-2 tracking-wide">
                Playlist title <span className="text-[#ec5261]">*</span>
              </label>
              <input
                data-test="create-playlist-title-input"
                type="text"
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                className="text-[14px] text-text-upload border border-transparent mr-2 py-2 pr-10 pl-4 rounded-sm 
                bg-[#303030] focus:outline-none focus:border-text-secondary transition-all w-full placeholder:text-text-secondary"
              />
            </div>

            {/* Privacy toggle */}
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-sm text-text-upload font-bold mb-1 tracking-wide mr-2">
                  Privacy :
                </label>
                <PrivacyToggle value={privacy} onChange={setPrivacy} />
              </div>
              {/* Save button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCreate}
                  disabled={creating || !playlistTitle.trim()}
                  className="bg-bg-inverted text-bg text-sm font-bold px-3 py-1.5 rounded-sm
                  hover:text-[#a0a0a0] transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddToPlaylistModal;
