import PrivacyToggle from "@/components/Upload/PrivacyToggle";
import TracksToAddList from "./TracksToAddList";

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
  moreOfLike: boolean;
  tracksToAdd: DisplayTrack[];
  setTracksToAdd: React.Dispatch<React.SetStateAction<DisplayTrack[]>>;
  isPlaylist: boolean;
  defaultPlaylistId: string | undefined;
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
  moreOfLike,
  tracksToAdd,
  setTracksToAdd,
  isPlaylist,
  defaultPlaylistId,
  onAdd,
  likedTracks,
  onCreate,
}: CreatePlaylistTabProps) => {
  const handleRemove = (id: string) => {
    setTracksToAdd((prev) => prev.filter((x) => x.id !== id));
  };

  const visibleLikedTracks = likedTracks.slice(0, 3);

  return (
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
          type="button"
          data-test="button-save-playlist"
          onClick={() => onCreate(moreOfLike)}
          disabled={
            creating || !playlistTitle.trim() || tracksToAdd.length === 0
          }
          className="bg-bg-inverted text-bg text-sm font-bold px-3 py-1.5 rounded-sm hover:text-[#a0a0a0] transition-colors disabled:opacity-40 cursor-pointer"
        >
          {creating ? "Saving..." : success ? "Saved!" : "Save"}
        </button>
      </div>

      {error && (
        <p
          data-test="create-playlist-error"
          className="text-[#FB2C36] text-sm font-semibold"
        >
          {error}
        </p>
      )}

      {tracksToAdd.length > 0 && (
        <TracksToAddList
          tracks={tracksToAdd}
          isPlaylist={isPlaylist}
          onRemove={handleRemove}
        />
      )}

      {/* Suggestions from Likes */}
      {likedTracks.length > 0 && (
        <div className="mt-4 space-y-3 pb-2 max-h-96 overflow-y-auto">
          <div className="px-2 py-2">
            <h3 className="text-[17px] font-bold text-text-upload">
              Looking for more tracks? Add some from your likes.
            </h3>
          </div>
          {visibleLikedTracks.map((t) => (
            <div key={t.id} className="p-2 rounded-md transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={t.coverUrl}
                    className="w-12 h-12 rounded-sm object-cover"
                    alt=""
                  />
                  <div>
                    <p className="text-sm text-text-secondary truncate font-bold">
                      {t.artistName}
                    </p>
                    <p className="text-text-upload hover:text-[#717171] font-bold text-sm truncate">
                      {t.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-test={`button-add-liked-track-${t.id}`}
                  onClick={() =>
                    defaultPlaylistId &&
                    onAdd(defaultPlaylistId, [
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
  );
};

export default CreatePlaylistTab;
