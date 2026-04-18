import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useLikesStore } from "@/stores/likes.store";
import { useNavigate, useParams } from "react-router-dom";
import ShareModal from "@/components/Profile/ShareModal/ShareModal";
import LikesContent from "@/components/UI/LikesContent/LikesContent";
import {
  getMyLikedTracks,
  resolveUsername,
  getUserById,
  type TrackSummary,
} from "@/services/user.service";
import type { Track } from "@/types/track";

const tabs = ["Likes", "Following", "Followers"];

function mapToTrack(t: TrackSummary): Track {
  return {
    id: t.id,
    title: t.title,
    artistName: t.artist_name,
    artistUsername: "",
    trackSlug: "",
    coverUrl: t.cover_image ?? "",
    audioUrl: t.stream_url ?? "",
    duration: String(t.duration ?? 0),
    playCount: t.play_count,
    likeCount: t.like_count,
    repostCount: 0,
    commentCount: 0,
    genre: t.genre ?? "",
    waveformData: [],
    postedAt: "",
  };
}

export default function LikesPage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const localLikedTracks = useLikesStore((state) => state.likedTracks);
  const [showShare, setShowShare] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileUsername, setProfileUsername] = useState("");

  const isOwner = !username || username === currentUser?.username;

  useEffect(() => {
    if (isOwner) {
      setProfileDisplayName(
        currentUser?.displayName ?? currentUser?.username ?? "",
      );
      setProfileAvatar(currentUser?.avatar ?? "");
      setProfileUsername(currentUser?.username ?? "");
    } else if (username) {
      resolveUsername(username)
        .then((id) => getUserById(id))
        .then((profile) => {
          setProfileDisplayName(profile.display_name);
          setProfileAvatar(profile.profile_picture ?? "");
          setProfileUsername(profile.username ?? username);
        })
        .catch(console.error);
    }
  }, [username, isOwner, currentUser]);

  useEffect(() => {
    if (!isOwner) {
      // Public liked tracks per user not in API spec, show empty
      setTracks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getMyLikedTracks({ limit: 100 })
      .then((res) => setTracks(res.items.map(mapToTrack)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOwner]);

  const displayedTracks = isOwner
    ? Array.from(
        new Map(
          [...localLikedTracks, ...tracks].map((track) => [track.id, track]),
        ).values(),
      )
    : tracks;
  const showLoading = loading && displayedTracks.length === 0;

  const handleTabChange = (tab: string) => {
    const base = profileUsername ? `/${profileUsername}` : "/you";
    if (tab === "Likes") navigate(`${base}/likes`);
    if (tab === "Following") navigate(`${base}/following`);
    if (tab === "Followers") navigate(`${base}/follower`);
  };

  if (!currentUser && isOwner) return null;

  return (
    <div className="py-8 container px-4 md:px-8 lg:px-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-3">
        <div
          data-test="likes-user-avatar"
          className="w-24 h-24 rounded-full overflow-hidden bg-text-muted flex-shrink-0 cursor-pointer"
          onClick={() => navigate(`/${profileUsername}`)}
        >
          {profileAvatar ? (
            <img
              src={profileAvatar}
              alt={profileUsername}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-text-muted" />
          )}
        </div>
        <h1
          data-test="likes-page-title"
          className="text-white text-2xl font-bold"
        >
          Likes by {profileDisplayName || profileUsername}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            data-test={`likes-tab-${tab.toLowerCase()}`}
            onClick={() => handleTabChange(tab)}
            className={`pb-2 pt-3 px-1 text-sm font-bold cursor-pointer border-b-2 ${
              tab === "Likes"
                ? "text-bg-inverted border-bg-inverted"
                : "text-text-secondary border-transparent hover:text-bg-inverted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Description + Share */}
      <div className="flex items-center justify-between mb-6">
        <p
          data-test="likes-description"
          className="text-text-secondary text-sm"
        >
          {isOwner
            ? "Hear the tracks you've liked"
            : `Hear the tracks ${profileDisplayName || profileUsername} has liked`}
        </p>
        <button
          data-test="likes-share-button"
          onClick={() => setShowShare(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-input-bg text-white text-sm font-bold rounded hover:opacity-70"
        >
          <i className="fa-solid fa-arrow-up-from-bracket text-xs" />
          Share
        </button>
      </div>

      {/* Content */}
      {showLoading ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      ) : (
        <LikesContent tracks={displayedTracks} showControls={true} />
      )}

      {/* Footer */}
      <div className="mt-16 flex flex-col gap-8">
        <div className="flex flex-wrap gap-x-1 text-xs text-text-secondary">
          {[
            "Legal",
            "Privacy",
            "Cookie Policy",
            "Cookie Manager",
            "Imprint",
            "Artist Resources",
            "Newsroom",
            "Charts",
            "Transparency Reports",
          ].map((link, i, arr) => (
            <span key={link} className="flex items-center gap-1">
              <button
                data-test={`footer-link-${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="cursor-pointer hover:underline hover:text-text"
              >
                {link}
              </button>
              {i < arr.length - 1 && <span>·</span>}
            </span>
          ))}
        </div>
        <div className="text-xs text-left text-bg-inverted">
          Language:{" "}
          <button
            data-test="language-selector"
            className="text-[#2196F3] cursor-pointer hover:underline"
          >
            English (US)
          </button>
        </div>
      </div>

      {showShare && (
        <ShareModal
          url={`https://rythmify.com/${profileUsername}/likes`}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
