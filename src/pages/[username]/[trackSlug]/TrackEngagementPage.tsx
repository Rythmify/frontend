import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import FollowButton from "@/components/UI/FollowButton";
import UserAvatar from "@/components/UI/UserAvatar";
import {
  getUserById,
  getFollowStatus,
  type UserSummary,
} from "@/services/user.service";
import { getTrackBySlug } from "@/services/track.service";
import { getTrackLikers, getTrackReposters } from "@/services/engagement.service";
import type { Track } from "@/types/track";
import Spinner from "@/components/UI/Spinner";

const tabs = ["Likes", "Reposts"];

interface EnrichedUser {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  followers: number;
  isVerified: boolean;
  isFollowing: boolean;
  profilePath: string;
}

async function enrich(u: any): Promise<EnrichedUser> {
  const resolvedId = u.id || u.user_id || u.userId || "";

  if (!resolvedId) {
    console.warn("enrich: received item with no id", u);
    return {
      userId: "",
      username: "",
      displayName: u.display_name || u.displayName || "User",
      avatar: u.profile_picture || u.avatar || "",
      followers: 0,
      isVerified: !!u.is_verified,
      isFollowing: false,
      profilePath: "/",
    };
  }

  try {
    const profile = await getUserById(resolvedId);
    const followStatus = await getFollowStatus(resolvedId);
    const uname = profile.username ?? resolvedId;

    return {
      userId: resolvedId,
      username: uname,
      displayName: profile.display_name || u.display_name || u.displayName || uname,
      avatar: profile.profile_picture ?? u.profile_picture ?? u.avatar ?? "",
      followers: profile.followers_count ?? 0,
      isVerified: profile.is_verified ?? u.is_verified,
      isFollowing: followStatus.is_following,
      profilePath: `/${uname}`,
    };
  } catch {
    return {
      userId: resolvedId,
      username: u.username || resolvedId,
      displayName: u.display_name || u.displayName || u.username || "User",
      avatar: u.profile_picture || u.avatar || "",
      followers: 0,
      isVerified: !!u.is_verified,
      isFollowing: false,
      profilePath: u.username ? `/${u.username}` : `/${resolvedId}`,
    };
  }
}

export default function TrackEngagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, trackId } = useParams<{ username: string; trackId: string }>();
  const { user: currentUser } = useAuthStore();

  const [track, setTrack] = useState<Track | null>(null);
  const [users, setUsers] = useState<any[] | null>(null);
  const [enriched, setEnriched] = useState<EnrichedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  // Determine active tab based on URL
  const activeTab = location.pathname.endsWith("/reposts") ? "Reposts" : "Likes";

  // Fetch Track first
  useEffect(() => {
    if (!username || !trackId) return;

    async function loadTrack() {
      try {
        const fetchedTrack = await getTrackBySlug(username, trackId);
        setTrack(fetchedTrack);
      } catch (err) {
        console.error("TrackEngagementPage: failed to load track", err);
      }
    }
    loadTrack();
  }, [username, trackId]);

  // Fetch Users based on tab
  useEffect(() => {
    if (!track) return;

    let cancelled = false;
    setUsersLoading(true);
    setUsers(null);
    setEnriched([]);

    async function loadUsers() {
      try {
        let res;
        if (activeTab === "Likes") {
          res = await getTrackLikers(track.id, { limit: 100, offset: 0 });
        } else {
          res = await getTrackReposters(track.id, { limit: 100, offset: 0 });
        }
        
        if (!cancelled) {
          const items = res?.data?.items || [];
          setUsers(items);
        }
      } catch (err) {
        console.error(`TrackEngagementPage: failed to load ${activeTab}`, err);
        if (!cancelled) setUsers([]);
      } finally {
        if (!cancelled) {
          setUsersLoading(false);
          setLoading(false);
        }
      }
    }

    loadUsers();
    return () => { cancelled = true; };
  }, [track, activeTab]);

  // Enrich users
  useEffect(() => {
    if (users === null) return;

    if (!users.length) {
      setEnriched([]);
      return;
    }

    let cancelled = false;
    Promise.all(users.map(enrich)).then((items) => {
      if (!cancelled) {
        setEnriched(items);
      }
    });

    return () => { cancelled = true; };
  }, [users]);

  const handleTabChange = (tab: string) => {
    const base = `/${username}/${trackId}`;
    if (tab === "Likes") navigate(`${base}/likes`);
    if (tab === "Reposts") navigate(`${base}/reposts`);
  };

  if (loading && !track) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-text-secondary">
        Track not found.
      </div>
    );
  }

  const padCount = enriched.length % 6 === 0 ? 0 : 6 - (enriched.length % 6);

  return (
    <div className="py-8 container px-4 md:px-8 lg:px-20">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <div 
          className="w-40 h-40 shrink-0 cursor-pointer shadow-lg overflow-hidden rounded-sm"
          onClick={() => navigate(`/${username}/${trackId}`)}
        >
          <img 
            src={track.coverUrl} 
            alt={track.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div>
          <h1 
            className="text-white text-3xl font-bold cursor-pointer hover:underline mb-1"
            onClick={() => navigate(`/${username}/${trackId}`)}
          >
            {track.title}
          </h1>
          <p 
            className="text-xl text-text-secondary cursor-pointer hover:text-white"
            onClick={() => navigate(`/${track.artistUsername}`)}
          >
            {track.artistName}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-[#333]">
        {tabs.map((tab) => (
          <button
            key={tab}
            data-test={`engagement-tab-${tab.toLowerCase()}`}
            onClick={() => handleTabChange(tab)}
            className={`pb-3 pt-3 px-1 text-base font-bold cursor-pointer border-b-[2px] transition-colors ${
              tab === activeTab
                ? "text-bg-inverted border-bg-inverted"
                : "text-text-secondary border-transparent hover:text-bg-inverted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {usersLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner />
        </div>
      ) : enriched.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-white text-lg font-bold">
            No {activeTab.toLowerCase()} yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {enriched.map((u) => (
            <div
              key={u.userId}
              className="flex flex-col items-center gap-3 group"
            >
              <UserAvatar
                dataTest={`engagement-avatar-${u.username}`}
                src={u.avatar}
                name={u.displayName}
                alt={u.displayName}
                wrapperClassName="w-full cursor-pointer aspect-square rounded-full overflow-hidden shadow-md"
                initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-white text-4xl font-bold"
                onClick={() => navigate(u.profilePath)}
              />

              <div className="flex flex-col items-center w-full px-1">
                <span
                  className="text-white cursor-pointer text-sm font-bold text-center truncate w-full hover:underline"
                  onClick={() => navigate(u.profilePath)}
                >
                  {u.displayName}
                </span>

                <span
                  data-test={`engagement-follower-count-${u.username}`}
                  className="text-text-secondary cursor-pointer text-xs flex items-center gap-1 mt-0.5 hover:text-white"
                  onClick={() => navigate(`${u.profilePath}/follower`)}
                >
                  <i className="fa-solid fa-user text-[10px]" />
                  {u.followers >= 1e6
                    ? `${(u.followers / 1e6).toFixed(1)}M`
                    : u.followers >= 1e3
                      ? `${(u.followers / 1e3).toFixed(1)}K`
                      : u.followers}{" "}
                  followers
                </span>
              </div>

              <div className="h-9 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <FollowButton
                    username={u.username}
                    userId={u.userId}
                    initialIsFollowing={u.isFollowing}
                  />
                </div>
              </div>
            </div>
          ))}

          {Array.from({ length: padCount }).map((_, i) => (
            <div
              key={`pad-${i}`}
              className="w-full aspect-square opacity-0 pointer-events-none"
            />
          ))}
        </div>
      )}

      {/* Footer-like spacing/content if needed */}
      <div className="mt-20 border-t border-[#333] pt-8">
          <div className="flex flex-wrap gap-x-2 text-xs text-text-secondary">
            {["Legal", "Privacy", "Cookies", "Charts"].map((link, i, arr) => (
              <span key={link} className="flex items-center gap-2">
                <button className="cursor-pointer hover:underline hover:text-white">
                  {link}
                </button>
                {i < arr.length - 1 && <span>·</span>}
              </span>
            ))}
          </div>
      </div>
    </div>
  );
}
