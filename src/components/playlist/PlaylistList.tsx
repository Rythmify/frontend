import type { Playlist } from "@/services/api/playlist/playlist.service";

interface DisplayTrack {
  id: string;
  title: string;
  artistName?: string;
  coverUrl?: string;
}

interface PlaylistListProps {
  playlists: Playlist[];
  tracksToAdd: DisplayTrack[];
  adding: string | null;
  success: string | null;
  onAdd: (pid: string) => void;
}

const PlaylistList = ({
  playlists,
  tracksToAdd,
  adding,
  success,
  onAdd,
}: PlaylistListProps) => {
  return (
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
              data-test={`button-add-to-playlist-${playlist.playlist_id}`}
              onClick={() => onAdd(playlist.playlist_id)}
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
  );
};

export default PlaylistList;
