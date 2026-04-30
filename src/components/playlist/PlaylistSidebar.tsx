import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { FaMusic, FaUserFriends } from "react-icons/fa";
import type {
  PlaylistDetails,
  Playlist,
} from "@/services/api/playlist/playlist.service";
import { getPlaylistsByUser } from "@/services/api/playlist/playlist.service";
import { getUserById } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth.store";
import GoMobileSection from "../UI/GoMobile";

interface PlaylistSidebarProps {
  playlist: PlaylistDetails;
}

export default function PlaylistSidebar({ playlist }: PlaylistSidebarProps) {
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerUsername, setOwnerUsername] = useState<string>(playlist.owner_user_id);
  const [ownerDisplayName, setOwnerDisplayName] = useState<string>(playlist.owner_user_id);
  const { user } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const owner = await getUserById(playlist.owner_user_id);
        if (!isMounted) return;

        setOwnerUsername(owner.username ?? playlist.owner_user_id);
        setOwnerDisplayName(owner.display_name ?? owner.username ?? playlist.owner_user_id);
      } catch {
        if (!isMounted) return;
        setOwnerUsername(playlist.owner_user_id);
        setOwnerDisplayName(playlist.owner_user_id);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [playlist.owner_user_id]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPlaylistsByUser(playlist.owner_user_id, user?.id, {
          limit: 4,
        });
        setUserPlaylists(
          res.data.items
            .filter((p) => p.playlist_id !== playlist.playlist_id)
            .slice(0, 3),
        );
      } catch (err) {
        console.error("Failed to load user playlists:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [playlist.owner_user_id, playlist.playlist_id]);

  return (
    <Tooltip.Provider delayDuration={400} skipDelayDuration={100}>
      <aside
        data-test="playlist-sidebar"
        className="flex flex-col w-full gap-3"
      >
        <div className=" flex items-center justify-between">
          <p className="text-white text-[12px] font-bold uppercase  flex items-center gap-2">
            Playlists from this user
          </p>
          <Link
            to={`/${ownerUsername}`}
            data-test="playlist-sidebar-view-all"
            className="text-[12px] text-[#757575] hover:underline transition-colors"
          >
            View all
          </Link>
        </div>

        <div data-test="sidebar-user-playlists" className="px-1">
          {loading ? (
            <div data-test="playlist-sidebar-loading" className="py-4 flex justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-[#555] border-t-white animate-spin" />
            </div>
          ) : userPlaylists.length === 0 ? (
            <p data-test="playlist-sidebar-empty" className="text-[var(--color-text-muted)] text-xs ">
              No other playlists.
            </p>
          ) : (
            <div className="space-y-1">
              {userPlaylists.map((p) => (
                <Link
                  key={p.playlist_id}
                  to={`/${ownerUsername}`}
                  className="flex items-center gap-3 py-2 rounded-md transition-colors group"
                >
                  <img
                    src={p.cover_image || "https://via.placeholder.com/40"}
                    alt={p.name}
                    className="w-10 h-10 rounded-sm object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[14px] text-[var(--color-text-muted)] font-bold">
                      {ownerDisplayName} tracks
                    </p>
                    <p className="text-sm font-semibold text-white group-hover:text-white transition-colors truncate">
                      {p.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div data-test="go-mobile-section-playlist">
          <GoMobileSection showFooter={false} />
        </div>
      </aside>
    </Tooltip.Provider>
  );
}
