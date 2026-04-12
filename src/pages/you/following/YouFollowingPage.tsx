import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import FollowButton from "@/components/Profile/FollowButton/FollowButton";
import {
  getFollowing,
  resolveUsername,
  type UserSummary,
} from "@/services/mocks/User.service";
import {
  mockFollowers,
  mockFollowing,
} from "@/components/Profile/MockData/mock";

export default function YouFollowingPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [apiFollowing, setApiFollowing] = useState<UserSummary[] | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!currentUser?.username) return;
    resolveUsername(currentUser.username)
      .then((userId) => getFollowing(userId, { limit: 50, offset: 0 }))
      .then((res) => setApiFollowing(res.items))
      .catch((err) => console.error("Failed to load following:", err));
  }, [currentUser?.username]);

  const allMockUsers = Array.from(
    new Map(
      [...mockFollowing, ...mockFollowers].map((u) => [u.username, u]),
    ).values(),
  );

  const all = useMemo(() => {
    const followingIds = new Set(currentUser?.following_ids ?? []);

    const fromApi = apiFollowing
      ? apiFollowing
          .filter((u) => followingIds.has(u.user_id))
          .map((u) => ({
            username: u.user_id,
            displayName: u.display_name,
            avatar: "",
            isVerified: u.is_verified,
            followers: 0,
          }))
      : allMockUsers
          .filter((u) => followingIds.has(u.username))
          .map((u) => ({ ...u, followers: u.followers ?? 0 }));

    const coveredUsernames = new Set(fromApi.map((u) => u.username));
    const extraUsers = (currentUser?.following_ids ?? [])
      .filter((id) => !coveredUsernames.has(id))
      .map((id) => ({
        username: id,
        displayName: id,
        avatar: "",
        isVerified: false,
        followers: 0,
      }));

    return [...fromApi, ...extraUsers];
  }, [apiFollowing, currentUser?.following_ids, allMockUsers]);

  const displayed = filter.trim()
    ? all.filter(
        (u) =>
          u.username.toLowerCase().includes(filter.toLowerCase()) ||
          u.displayName.toLowerCase().includes(filter.toLowerCase()),
      )
    : all;

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
            <div key={u.username} className="flex flex-col items-center gap-2 group">
              <div
                data-test={`you-following-avatar-${u.username}`}
                className="w-full cursor-pointer aspect-square rounded-full overflow-hidden bg-text-muted"
                onClick={() =>
                  navigate(`/${u.username.toLowerCase().replace(/\s+/g, "-")}`)
                }
              >
                {u.avatar ? (
                  <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-text-muted" />
                )}
              </div>
              <span className="text-white cursor-pointer text-sm font-bold text-center">
                {u.displayName || u.username}{" "}
                {u.isVerified && (
                  <i className="fa-solid fa-circle-check text-[#2196F3] text-xs" />
                )}
              </span>
              <span
                data-test={`you-following-count-${u.username}`}
                className="text-text-secondary cursor-pointer text-xs flex items-center gap-1"
                onClick={() =>
                  navigate(
                    `/${u.username.toLowerCase().replace(/\s+/g, "-")}/follower`,
                  )
                }
              >
                <i className="fa-solid fa-user text-[10px]" />
                {u.followers >= 1e6
                  ? `${(u.followers / 1e6).toFixed(2)}M`
                  : u.followers}{" "}
                followers
              </span>
              <div className="h-8 flex items-center justify-center">
                <div className="hidden group-hover:block">
                  <FollowButton username={u.username} />
                </div>
              </div>
            </div>
          ))}
          {Array.from({
            length: displayed.length % 6 === 0 ? 0 : 6 - (displayed.length % 6),
          }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-full aspect-square rounded-sm bg-input-bg"
            />
          ))}
        </div>
      )}
    </div>
  );
}
