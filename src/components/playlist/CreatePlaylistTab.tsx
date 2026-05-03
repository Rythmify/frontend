import PrivacyToggle from "@/components/Upload/PrivacyToggle";
import TracksToAddList from "./TracksToAddList";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface DisplayTrack {
  id: string;
  title: string;
  artistName?: string;
  coverUrl?: string;
}

interface CreatePlaylistTabProps {
  playlistTitle: string;
  setPlaylistTitle: (val: string) => void;
  privacy: "public" | "private";
  setPrivacy: (val: "public" | "private") => void;
  creating: boolean;
  success: boolean;
  error: string | null;
  limitReached?: boolean;
  moreOfLike: boolean;
  tracksToAdd: DisplayTrack[];
  setTracksToAdd: React.Dispatch<React.SetStateAction<DisplayTrack[]>>;
  isPlaylist: boolean;
  defaultPlaylistId: string | undefined;
  hasPlaylists: boolean;
  onAdd: (pid: string, tracks: DisplayTrack[]) => void;
  likedTracks: {
    id: string | number;
    title: string;
    artistName?: string;
    coverUrl?: string;
  }[];
  onCreate: (moreOfLike: boolean) => void;
}

const CreatePlaylistTab = ({
  playlistTitle,
  setPlaylistTitle,
  privacy,
  setPrivacy,
  creating,
  success,
  error,
  limitReached = false,
  moreOfLike,
  tracksToAdd,
  setTracksToAdd,
  isPlaylist,
  defaultPlaylistId,
  hasPlaylists,
  onAdd,
  likedTracks,
  onCreate,
}: CreatePlaylistTabProps) => {
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<string[]>([]);

  const navigate = useNavigate();

  const handleRemove = (id: string) => {
    setTracksToAdd((prev) => prev.filter((x) => x.id !== id));
  };

  const visibleLikedTracks = useMemo(() => {
    const selectedIds = new Set(tracksToAdd.map((track) => track.id));
    return likedTracks
      .filter(
        (track) =>
          !selectedIds.has(String(track.id)) ||
          recentlyAddedIds.includes(String(track.id)),
      )
      .slice(0, 3);
  }, [likedTracks, tracksToAdd, recentlyAddedIds]);

  useEffect(() => {
    if (recentlyAddedIds.length === 0) return;

    const timer = setTimeout(() => {
      setRecentlyAddedIds([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, [recentlyAddedIds]);

  const handleAddSuggestion = (track: {
    id: string | number;
    title: string;
    artistName?: string;
    coverUrl?: string;
  }) => {
    const trackId = String(track.id);
    setTracksToAdd((prev) =>
      prev.some((item) => item.id === trackId)
        ? prev
        : [
            ...prev,
            {
              id: trackId,
              title: track.title,
              artistName: track.artistName,
              coverUrl: track.coverUrl,
            },
          ],
    );
    setRecentlyAddedIds((prev) =>
      prev.includes(trackId) ? prev : [...prev, trackId],
    );
  };

  return (
    <div data-test="create-playlist-tab" className="mt-6 space-y-5 pb-2">
      <div>
        <label className="flex items-center gap-1 text-xs text-text-upload font-bold mb-2 tracking-wide">
          Playlist title <span className="text-[#ec5261]">*</span>
        </label>
        <input
          data-test="input-playlist-title"
          type="text"
          value={playlistTitle}
          onChange={(e) => setPlaylistTitle(e.target.value)}
          className="text-[14px] text-text-upload border border-transparent mr-2 py-2 pr-10 pl-4 rounded-sm bg-[#303030] focus:outline-none focus:border-text-secondary w-full"
        />
      </div>

      <div data-test="create-playlist-tab-actions" className="flex justify-between items-center">
        <div data-test="create-playlist-tab-privacy" className="flex items-center gap-2">
          <label className="text-sm text-text-upload font-bold tracking-wide mr-2">
            Privacy :
          </label>
          <PrivacyToggle value={privacy} onChange={setPrivacy} />
        </div>

        <button
          type="button"
          data-test="button-save-playlist"
          onClick={() => onCreate(moreOfLike)}
          disabled={
            creating ||
            !playlistTitle.trim() ||
            tracksToAdd.length === 0 ||
            limitReached
          }
          className="bg-bg-inverted text-bg text-sm font-bold px-3 py-1.5 rounded-sm hover:text-[#a0a0a0] transition-colors disabled:opacity-40 cursor-pointer"
        >
          {creating ? "Saving..." : success ? "Saved!" : "Save"}
        </button>
      </div>

      {limitReached && (
        <div
          data-test="playlist-limit-reached"
          className="flex items-center justify-between rounded-sm bg-[#FB2C36]/10 border border-[#FB2C36]/30 px-4 py-3"
        >
          <span className="text-sm font-bold text-[#FB2C36]">
            You've reached your 2-playlist limit.
          </span>
          <button
            type="button"
            onClick={() => navigate("/premium")}
            className="ml-4 shrink-0 rounded-full bg-[#FB2C36] px-4 py-1.5 text-xs font-bold text-white hover:opacity-90 cursor-pointer"
          >
            Upgrade to Premium
          </button>
        </div>
      )}

      {error && (
        <p
          data-test="create-playlist-error"
          className="text-[#FB2C36] text-sm font-semibold"
        >
          {error}
        </p>
      )}

      {tracksToAdd.length > 0 && (
        <div data-test="create-playlist-tracks">
          <TracksToAddList
            tracks={tracksToAdd}
            isPlaylist={isPlaylist}
            onRemove={handleRemove}
          />
        </div>
      )}

      {/* Suggestions from Likes */}
      {hasPlaylists && likedTracks.length > 0 && (
        <div className="mt-4 space-y-3 pb-2 max-h-96 overflow-y-auto">
          <div className="px-2 py-2">
            <h3 className="text-[17px] font-bold text-text-upload">
              Looking for more tracks? Add some from your likes.
            </h3>
          </div>
          {visibleLikedTracks.map((t) => (
            <div key={t.id} className="p-2 rounded-md transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={t.coverUrl}
                    className="w-12 h-12 rounded-sm object-cover"
                    alt=""
                  />
                  <div className="min-w-0">
                    <p
                      className="text-sm text-text-secondary truncate font-bold"
                      title={t.artistName}
                    >
                      {t.artistName}
                    </p>
                    <p
                      className="text-text-upload hover:text-[#717171] font-bold text-sm truncate"
                      title={t.title}
                    >
                      {t.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-test={`button-add-liked-track-${t.id}`}
                  onClick={() => handleAddSuggestion(t)}
                  disabled={tracksToAdd.some(
                    (track) => String(track.id) === String(t.id),
                  )}
                  className={`text-sm font-bold px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                    recentlyAddedIds.includes(String(t.id))
                      ? "bg-[#f50] text-white"
                      : "bg-input-bg text-text-upload hover:text-[#838383]"
                  } disabled:opacity-50`}
                >
                  {recentlyAddedIds.includes(String(t.id))
                    ? "Added"
                    : "Add to playlist"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatePlaylistTab;
