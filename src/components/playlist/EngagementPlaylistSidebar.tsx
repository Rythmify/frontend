import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { PlaylistDetails } from "@/services/api/playlist/playlist.service";
import {
  getPlaylistLikers,
  getPlaylistReposters,
} from "@/services/api/playlist/playlist.service";

interface SocialUser {
  user_id: string;
  display_name: string;
  profile_picture: string | null;
  username?: string | null;
}

function normalizeSocialUsers(payload: unknown): SocialUser[] {
  if (Array.isArray(payload)) {
    return payload.map((u: any) => ({
      user_id: String(u.user_id ?? u.id ?? ""),
      display_name: String(
        u.display_name ?? u.displayName ?? u.username ?? "Unknown",
      ),
      profile_picture: u.profile_picture ?? u.profilePicture ?? null,
      username: u.username ?? null,
    }));
  }

  if (!payload || typeof payload !== "object") return [];

  const record = payload as {
    data?: unknown;
    items?: unknown;
    users?: unknown;
  };

  const raw = record.data ?? record.items ?? record.users ?? [];
  return normalizeSocialUsers(raw);
}

function AvatarStrip({
  title,
  count,
  users,
  dataTest,
  viewAllHref,
}: {
  title: string;
  count: number;
  users: SocialUser[];
  dataTest: string;
  viewAllHref?: string;
}) {
  const navigate = useNavigate();
  const visible = users.slice(0, 9);
  const remaining = Math.max(0, users.length - visible.length);

  if (count === 0) return null;

  return (
    <div data-test={dataTest} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-white text-[12px] font-bold uppercase tracking-widest">
          {count.toLocaleString()} {title}
        </span>
        {viewAllHref && (
          <button
            onClick={() => navigate(viewAllHref)}
            className="text-[12px] text-[#757575] hover:underline transition-colors cursor-pointer"
          >
            View all
          </button>
        )}
      </div>

      <div className="flex items-center overflow-hidden pl-1">
        {visible.map((u, index) => {
          const slug = u.username ?? u.user_id;
          const initials = (u.display_name || "?").charAt(0).toUpperCase();
          return (
            <Link
              key={u.user_id}
              to={`/${slug}`}
              style={{ marginLeft: index === 0 ? 0 : -10, zIndex: 20 - index }}
              className="shrink-0 hover:opacity-80 transition-opacity"
              title={u.display_name}
            >
              {u.profile_picture ? (
                <img
                  src={u.profile_picture}
                  alt={u.display_name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#111]"
                />
              ) : (
                <div className="w-11 h-11 rounded-full border-2 border-[#111] bg-zinc-700 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              )}
            </Link>
          );
        })}
        {remaining > 0 && (
          <div
            className="w-11 h-11 rounded-full bg-[#2b2b2b] border-2 border-[#111] flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ marginLeft: -10, zIndex: 1 }}
          >
            +{remaining}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EngagementPlaylistSidebar({
  playlist,
}: {
  playlist: PlaylistDetails;
}) {
  const [likers, setLikers] = useState<SocialUser[]>([]);
  const [reposters, setReposters] = useState<SocialUser[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [likersRes, repostersRes] = await Promise.allSettled([
          getPlaylistLikers(playlist.playlist_id, { limit: 9 }),
          getPlaylistReposters(playlist.playlist_id, { limit: 9 }),
        ]);

        if (cancelled) return;

        if (likersRes.status === "fulfilled") {
          setLikers(normalizeSocialUsers(likersRes.value));
        }

        if (repostersRes.status === "fulfilled") {
          setReposters(normalizeSocialUsers(repostersRes.value));
        }
      } catch (err) {
        console.error("Failed to load engagement sidebar data:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [playlist.playlist_id]);

  return (
    <>
      <AvatarStrip
        title="Likes"
        count={playlist.like_count ?? likers.length}
        users={likers}
        dataTest="sidebar-liked-by"
      />

      <AvatarStrip
        title="Reposts"
        count={playlist.repost_count ?? reposters.length}
        users={reposters}
        dataTest="sidebar-reposted-by"
      />
    </>
  );
}
