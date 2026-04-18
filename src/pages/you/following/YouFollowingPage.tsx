import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import FollowButton from "@/components/Profile/FollowButton/FollowButton";
import { getFollowing, getUserById, type UserSummary } from "@/services/user.service";

interface EnrichedUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isVerified: boolean;
  followers: number;
}

async function enrich(u: UserSummary): Promise<EnrichedUser> {
  const uname = u.username ?? u.id;
  try {
    const profile = await getUserById(u.id);
    return {
      id: u.id,
      username: uname,
      displayName: profile.display_name || u.display_name,
      avatar: profile.profile_picture ?? "",
      isVerified: profile.is_verified ?? u.is_verified,
      followers: profile.followers_count ?? 0,
    };
  } catch {
    return {
      id: u.id,
      username: uname,
      displayName: u.display_name,
      avatar: u.profile_picture ?? "",
      isVerified: u.is_verified,
      followers: 0,
    };
  }
}

export default function YouFollowingPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [following, setFollowing] = useState<EnrichedUser[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!currentUser?.id) return;
    getFollowing(currentUser.id, { limit: 50, offset: 0 })
      .then((res) => Promise.all(res.items.map(enrich)))
      .then(setFollowing)
      .catch((err) => console.error("Failed to load following:", err));
  }, [currentUser?.id]);

  const displayed = filter.trim()
    ? following.filter(
        (u) =>
          u.username.toLowerCase().includes(filter.toLowerCase()) ||
          u.displayName.toLowerCase().includes(filter.toLowerCase()),
      )
    : following;

  const formatFollowers = (n: number) =>
    n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(n);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <p className="text-white text-lg font-semibold">
          Hear what the people you follow have posted:
        </p>
        <input
          type="text"
          data-test="you-following-filter"
          placeholder="Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-input-bg text-white text-sm placeholder-gray-500 rounded px-3 py-2 w-80 focus:outline-none focus:ring-1 focus:ring-gray-600"
        />
      </div>

      {displayed.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-white font-bold text-2xl">
            {filter ? "No results found." : "You are not following anyone yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-6">
          {displayed.map((u) => (
            <div key={u.id} className="flex flex-col items-center gap-2 group">
              <div
                data-test={`you-following-avatar-${u.username}`}
                className="w-full cursor-pointer aspect-square rounded-full overflow-hidden bg-text-muted"
                onClick={() => navigate(`/${u.username}`)}
              >
                {u.avatar ? (
                  <img src={u.avatar} alt={u.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white text-4xl font-bold">
                    {u.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-white cursor-pointer text-sm font-bold text-center truncate w-full px-1">
                {u.displayName}{" "}
                {u.isVerified && (
                  <i className="fa-solid fa-circle-check text-[#2196F3] text-xs" />
                )}
              </span>
              <span
                data-test={`you-following-count-${u.username}`}
                className="text-text-secondary cursor-pointer text-xs flex items-center gap-1"
                onClick={() => navigate(`/${u.username}/follower`)}
              >
                <i className="fa-solid fa-user text-[10px]" />
                {formatFollowers(u.followers)} followers
              </span>
              <div className="h-8 flex items-center justify-center">
                <div className="hidden group-hover:block">
                  <FollowButton username={u.username} userId={u.id} isFollowingOverride={true} />
                </div>
              </div>
            </div>
          ))}
          {Array.from({
            length: displayed.length % 6 === 0 ? 0 : 6 - (displayed.length % 6),
          }).map((_, i) => (
            <div key={`empty-${i}`} className="w-full aspect-square rounded-sm bg-input-bg" />
          ))}
        </div>
      )}
    </div>
  );
}
