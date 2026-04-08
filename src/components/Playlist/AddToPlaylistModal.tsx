import { useEffect, useState } from "react";
import {
  getMyPlaylists,
  addTrackToPlaylist,
  createPlaylist,
  getPlaylist,
  type Playlist,
} from "@/services/api/playlist/playlist.service";
import { Modal } from "../MessagingComponents/Modal";
import PrivacyToggle from "@/components/Upload/PrivacyToggle";
import { getRelatedTracks } from "@/services/mocks/Track.service";
import type { Track } from "@/types/track";
import { useLikesStore } from "@/stores/likes.store";

interface DisplayTrack {
  id: string;
  title: string;
  artistName?: string;
  coverUrl?: string;
}

interface AddToPlaylistModalProps {
  trackId: string;
  trackTitle: string;
  playlistId?: string; // if adding whole playlist
  artistName?: string;
  onClose: () => void;
}

const AddToPlaylistModal = ({
  trackId,
  trackTitle,
  onClose,
  playlistId,
  artistName,
}: AddToPlaylistModalProps) => {
  const [activeTab, setActiveTab] = useState<"add" | "create">("add");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tracksToAdd, setTracksToAdd] = useState<DisplayTrack[]>([]);
  const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);

  // Use store correctly for liked tracks
  const likedTracks = useLikesStore((state) => state.likedTracks);

  // Create tab state
  const [playlistTitle, setPlaylistTitle] = useState(
    `Related tracks: ${trackTitle}`,
  );
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [creating, setCreating] = useState(false);

  // Consolidated Initial Fetch
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // 1. Fetch User Playlists
        const res = await getMyPlaylists();
        const items = res.data.items;
        setPlaylists(items);
        if (items.length === 0) setActiveTab("create");

        // 2. Determine tracks to be added
        if (playlistId) {
          const playlistRes = await getPlaylist(playlistId);
          const tracks: DisplayTrack[] = (playlistRes.data.tracks || []).map(
            (t) => ({
              id: t.track_id,
              title: t.title ?? "Untitled track",
              artistName: t.artist_name ?? "Unknown Artist",
            }),
          );
          setTracksToAdd(tracks);
        } else if (trackId) {
          setTracksToAdd([{ id: trackId, title: trackTitle, artistName }]);
          // Fetch suggestions
          const related = await getRelatedTracks(Number(trackId));
          setRelatedTracks(related || []);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [trackId, playlistId, trackTitle, artistName]);

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

  const handleCreate = async () => {
    if (!playlistTitle.trim()) return;
    setCreating(true);
    try {
      // 1. Create Playlist
      const res = await createPlaylist({
        name: playlistTitle.trim(),
        is_public: privacy === "public",
      });

      const newPlaylistId = res.data.playlist_id;

      // 2. Add Tracks to new playlist
      for (const t of tracksToAdd) {
        await addTrackToPlaylist(newPlaylistId, String(t.id));
      }

      // 3. Update local state with new playlist
      const newPlaylist: Playlist = {
        ...res.data,
        track_count: tracksToAdd.length,
      };

      setPlaylists((prev) => [...prev, newPlaylist]);
      setActiveTab("add");
      setSuccess(newPlaylistId);

      // Reset Create Form
      setPlaylistTitle(`Related tracks: ${trackTitle}`);
      setPrivacy("public");
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const hasPlaylists = playlists.length > 0;
  const defaultPlaylistId = playlists[0]?.playlist_id;

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="w-[550px] bg-bg">
        {!loading && hasPlaylists && (
          <div className="flex text-[22px] font-bold items-center">
            <button
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
          <div className="mt-6 space-y-3 pb-2 max-h-96 overflow-y-auto font-bold">
            {playlists.map((playlist) => (
              <div key={playlist.playlist_id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={
                        playlist.cover_image ||
                        tracksToAdd[0]?.coverUrl ||
                        "https://via.placeholder.com/150"
                      }
                      alt={`${playlist.name} cover`}
                      className="w-12 h-12 rounded-sm object-cover"
                    />
                    <div>
                      <h3 className="text-text-upload font-bold text-sm">
                        {playlist.name}
                      </h3>
                      <p className="text-text-upload text-xs">
                        {playlist.track_count} tracks
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAdd(playlist.playlist_id)}
                    disabled={adding === playlist.playlist_id}
                    className="bg-input-bg text-text-upload text-sm font-bold px-3 py-1.5 rounded-sm hover:text-[#838383] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {success === playlist.playlist_id ? (
                      <span className="text-accent">Added</span>
                    ) : (
                      "Add to playlist"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-5 pb-2">
            <div>
              <label className="flex items-center gap-1 text-xs text-text-upload font-bold mb-2 tracking-wide">
                Playlist title <span className="text-[#ec5261]">*</span>
              </label>
              <input
                type="text"
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                className="text-[14px] text-text-upload border border-transparent mr-2 py-2 pr-10 pl-4 rounded-sm bg-[#303030] focus:outline-none focus:border-text-secondary w-full"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-text-upload font-bold tracking-wide mr-2">
                  Privacy :
                </label>
                <PrivacyToggle value={privacy} onChange={setPrivacy} />
              </div>
              <button
                onClick={handleCreate}
                disabled={creating || !playlistTitle.trim()}
                className="bg-bg-inverted text-bg text-sm font-bold px-3 py-1.5 rounded-sm hover:text-[#a0a0a0] transition-colors disabled:opacity-40 cursor-pointer"
              >
                {creating ? "Saving..." : "Save"}
              </button>
            </div>

            {/* Selection List */}
            {tracksToAdd.length > 0 && (
              <div className="pt-3 px-3 space-y-1">
                {tracksToAdd.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-text-upload text-sm truncate">
                      {t.artistName} - {t.title}
                    </span>
                    <button
                      onClick={() =>
                        setTracksToAdd((prev) =>
                          prev.filter((x) => x.id !== t.id),
                        )
                      }
                      className="text-[#aaa] hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions from Likes */}
            {likedTracks.length > 0 && (
              <div className="mt-4 space-y-3 pb-2 max-h-96 overflow-y-auto">
                <div className="px-2 py-2">
                  <h3 className="text-[17px] font-bold text-text-upload">
                    Looking for more tracks?
                  </h3>
                </div>
                {likedTracks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 hover:bg-[#252525] rounded-md transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={t.coverUrl}
                          className="w-12 h-12 rounded-sm object-cover"
                          alt=""
                        />
                        <div>
                          <h3 className="text-text-upload font-bold text-sm truncate">
                            {t.title}
                          </h3>
                          <p className="text-text-upload text-xs truncate">
                            {t.artistName}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          defaultPlaylistId &&
                          handleAdd(defaultPlaylistId, [
                            {
                              id: String(t.id),
                              title: t.title,
                              artistName: t.artistName,
                            },
                          ])
                        }
                        disabled={!defaultPlaylistId}
                        className="bg-input-bg text-text-upload text-sm font-bold px-3 py-1.5 rounded-sm hover:text-[#838383] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Add to Playlist
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddToPlaylistModal;
