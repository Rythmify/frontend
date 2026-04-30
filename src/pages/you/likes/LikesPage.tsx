import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useLikesStore } from "@/stores/likes.store";
import { useNavigate, useParams } from "react-router-dom";
import NotFound from "@/pages/not-found/NotFound";
import ShareModal from "@/components/Profile/ShareModal/ShareModal";
import LikesContent from "@/components/UI/LikesContent/LikesContent";
import UserAvatar from "@/components/UI/UserAvatar";
import PlaylistCard from "@/components/UI/PlaylistCard/PlaylistCard";
import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import {
  getMyLikedTracks,
  getUserByUsername,
  getUserLikedTracks,
  type TrackSummary,
} from "@/services/user.service";
import type { Playlist } from "@/services/api/playlist/playlist.service";
import type { Track } from "@/types/track";

const tabs = ["Likes", "Following", "Followers"];
const CARD_WIDTH = "w-[180px] sm:w-[200px] md:w-[220px] lg:w-[230px]";

function mapAlbumToCardData(album: Playlist): PlaylistCardData {
  return {
    id: album.playlist_id,
    title: album.name,
    owner: album.owner_user_id,
    ownerUsername: album.owner_user_id,
    coverUrl: album.cover_image ?? null,
    isPrivate: !album.is_public,
    isLiked: true,
    isAlbumView: true,
  };
}

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
  const likedPlaylists = useLikesStore((state) => state.likedPlaylists);
  const likedAlbums = useLikesStore((state) => state.likedAlbums);
  const [showShare, setShowShare] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileUsername, setProfileUsername] = useState("");
  const [profileId, setProfileId] = useState("");
  const [publicLikedTracks, setPublicLikedTracks] = useState<Track[]>([]);
  const [profileNotFound, setProfileNotFound] = useState(false);

  const isOwner = !username || username === currentUser?.username;

  // Resolve profile info
  useEffect(() => {
    if (isOwner) {
      setProfileNotFound(false);
      setProfileDisplayName(
        currentUser?.displayName ?? currentUser?.username ?? "",
      );
      setProfileAvatar(currentUser?.avatar ?? "");
      setProfileUsername(currentUser?.username ?? "");
      setProfileId(currentUser?.id ?? "");
      return;
    }

    if (!username) return;
    setProfileNotFound(false);

    getUserByUsername(username)
      .then((profile) => {
        setProfileDisplayName(profile.display_name);
        setProfileAvatar(profile.profile_picture ?? "");
        setProfileUsername(profile.username ?? username);
        setProfileId(profile.id);
      })
      .catch((error) => {
        console.error(error);
        setProfileNotFound(true);
      });
  }, [username, isOwner, currentUser]);

  // Fetch liked tracks.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        if (isOwner) {
          const res = await getMyLikedTracks({ limit: 100 });
          if (cancelled) return;
          const fetchedTracks = res.items.map(mapToTrack);
          useLikesStore.setState((state) => {
            const merged = new Map(
              [...fetchedTracks, ...state.likedTracks].map((track) => [
                track.id,
                track,
              ]),
            );
            return { likedTracks: Array.from(merged.values()) };
          });
          return;
        }

        if (!profileId) {
          if (!cancelled) setPublicLikedTracks([]);
          return;
        }

        const res = await getUserLikedTracks(profileId, { limit: 100 });
        if (cancelled) return;
        setPublicLikedTracks(res.items.map(mapToTrack));
      } catch (error) {
        console.error(error);
        if (!cancelled) setPublicLikedTracks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOwner, profileId]);

  const displayedTracks = isOwner ? localLikedTracks : publicLikedTracks;
  const displayedPlaylists = isOwner ? likedPlaylists : [];
  const displayedAlbums = isOwner ? likedAlbums : [];
  const showLoading = loading && displayedTracks.length === 0;
  const hasAnyLikedContent =
    displayedTracks.length > 0 ||
    displayedPlaylists.length > 0 ||
    displayedAlbums.length > 0;

  const handleTabChange = (tab: string) => {
    const base = profileUsername ? `/${profileUsername}` : "/you";
    if (tab === "Likes") navigate(`${base}/likes`);
    if (tab === "Following") navigate(`${base}/following`);
    if (tab === "Followers") navigate(`${base}/follower`);
  };

  if (!currentUser && isOwner) return null;
  if (!isOwner && profileNotFound) return <NotFound />;

  return (
    <div className="py-8 container px-4 md:px-8 lg:px-20">
      <div className="flex items-center gap-4 mb-3">
        <UserAvatar
          dataTest="likes-user-avatar"
          src={profileAvatar}
          name={profileDisplayName || profileUsername}
          alt={profileDisplayName || profileUsername}
          wrapperClassName="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
          initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-white text-4xl font-bold"
          onClick={() => navigate(`/${profileUsername}`)}
        />
        <h1
          data-test="likes-page-title"
          className="text-white text-2xl font-bold"
        >
          Likes by {profileDisplayName || profileUsername}
        </h1>
      </div>

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

      <div className="flex items-center justify-between mb-6">
        <p
          data-test="likes-description"
          className="text-text-secondary text-sm"
        >
          {isOwner
            ? "Hear the tracks, playlists, and albums you've liked"
            : `Hear the tracks, playlists, and albums ${profileDisplayName || profileUsername} has liked`}
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

      {showLoading ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      ) : hasAnyLikedContent ? (
        <div className="flex flex-col gap-10">
          {displayedTracks.length > 0 && (
            <LikesContent tracks={displayedTracks} showControls={true} />
          )}

          {displayedPlaylists.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-white text-lg font-semibold">
                Liked playlists
              </h2>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-1 scrollbar-hide">
                {displayedPlaylists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    item={playlist}
                    widthClassName={CARD_WIDTH}
                  />
                ))}
              </div>
            </section>
          )}

          {displayedAlbums.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-white text-lg font-semibold">
                Liked albums
              </h2>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-1 scrollbar-hide">
                {displayedAlbums.map((album) => (
                  <PlaylistCard
                    key={album.playlist_id}
                    item={mapAlbumToCardData(album)}
                    widthClassName={CARD_WIDTH}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-24">
          <p className="text-white font-bold text-lg sm:text-2xl">
            {isOwner
              ? "You have no likes yet."
              : `${profileDisplayName || profileUsername} hasn't liked anything yet.`}
          </p>
        </div>
      )}

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
