import { useState, useEffect } from "react";
import ProfileHeader from "../../components/Profile/ProfileHeader/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs/ProfileTabs";
import ProfileSidebar from "../../components/Profile/ProfileSideBar/ProfileSideBar";
import { useLikesStore } from "@/stores/likes.store";
import ShareModal from "../../components/Profile/ShareModal/ShareModal";
import EditProfileModal from "../../components/Profile/EditProfileModal/EditProfileModal";
import { Modal } from "@/components/UI/Modal";
import { BlockUserModal } from "@/components/UI/BlockModal";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { TrackCard } from "../../components/track";
import type { Track } from "../../types/track";
import { getMyLikedTracks, getUserLikedTracks } from "@/services/user.service";
import { useProfileData } from "@/services/hooks/useProfileData";
import type { TrackSummary } from "@/services/user.service";
import { getMyTracks, getUserTracks } from "@/services/track.service";
import PlaylistCard, {
  type PlaylistCardData,
} from "@/components/UI/PlaylistCard/PlaylistCard";
import {
  getPlaylistsByUser,
  type Playlist,
} from "@/services/api/playlist/playlist.service";

export default function UsernamePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showBlock, setShowBlock] = useState(false);

  // Use the profile data hook
  const {
    user,
    profileData,
    stats,
    followers,
    following,
    isOwner,
    activeUser,
    isLoadingProfile,
    handleTabChange,
    handleSave,
  } = useProfileData(username);

  // Get likes store for owner fallback count
  const likedTracksStoreCount = useLikesStore((s) => s.likedTracks.length);

  // ── Liked tracks ──────────────────────────────────────────────
  const [likedTracks, setLikedTracks] = useState<TrackSummary[]>([]);
  const [likedTracksCount, setLikedTracksCount] = useState(0);
  const [profileTracks, setProfileTracks] = useState<Track[]>([]);
  const [profileAlbums, setProfileAlbums] = useState<PlaylistCardData[]>([]);

  // Load liked tracks
  useEffect(() => {
    let cancelled = false;

    const loadLikedTracks = async () => {
      try {
        if (isOwner) {
          const countData = await getMyLikedTracks({ limit: 100 });
          const data = await getMyLikedTracks({ limit: 3 });
          const items = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
              ? data
              : [];
          const total =
            typeof countData?.meta?.total === "number" &&
            countData.meta.total > 0
              ? countData.meta.total
              : items.length;
          if (!cancelled) {
            setLikedTracks(items);
            setLikedTracksCount(total);
          }
        } else if (username && profileData) {
          const countData = await getUserLikedTracks(profileData.id, {
            limit: 100,
          });
          const data = await getUserLikedTracks(profileData.id, { limit: 3 });
          const items = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
              ? data
              : [];
          const total =
            typeof countData?.meta?.total === "number" &&
            countData.meta.total > 0
              ? countData.meta.total
              : items.length;
          if (!cancelled) {
            setLikedTracks(items);
            setLikedTracksCount(total);
          }
        }
      } catch {
        if (!cancelled) {
          setLikedTracks([]);
          setLikedTracksCount(0);
        }
      }
    };

    loadLikedTracks();
    return () => {
      cancelled = true;
    };
  }, [isOwner, username, profileData?.id]);

  useEffect(() => {
    let cancelled = false;

    const loadTracks = async () => {
      try {
        if (isOwner) {
          const ownedTracks = await getMyTracks(1, 100);
          if (cancelled) return;
          setProfileTracks(ownedTracks.tracks);
          return;
        }

        if (!profileData?.id) return;
        const publicTracks = await getUserTracks(profileData.id, 1, 100);
        if (cancelled) return;
        setProfileTracks(publicTracks.tracks);
      } catch (error) {
        console.error(error);
        if (!cancelled) setProfileTracks([]);
      }
    };

    loadTracks();
    return () => {
      cancelled = true;
    };
  }, [isOwner, profileData?.id]);

  useEffect(() => {
    let cancelled = false;

    const mapPlaylistToCard = (playlist: Playlist): PlaylistCardData => ({
      id: playlist.playlist_id,
      title: playlist.name,
      owner: profileData?.display_name || user.displayName,
      ownerUsername: profileData?.username || user.username,
      slug: playlist.slug ?? undefined,
      coverUrl: playlist.cover_image ?? null,
      isPrivate: !playlist.is_public,
      isLiked: playlist.like_count > 0,
      isAlbumView: true,
    });

    const loadAlbums = async () => {
      try {
        const ownerId = isOwner ? activeUser.id : profileData?.id;
        if (!ownerId) return;

        const res = await getPlaylistsByUser(ownerId, activeUser.id, {
          limit: 100,
        });
        if (cancelled) return;

        const albumItems = (res.data.items ?? []).filter(
          (playlist) => playlist.is_album_view || playlist.subtype === "album",
        );
        setProfileAlbums(albumItems.map(mapPlaylistToCard));
      } catch (error) {
        console.error(error);
        if (!cancelled) setProfileAlbums([]);
      }
    };

    loadAlbums();
    return () => {
      cancelled = true;
    };
  }, [
    isOwner,
    activeUser.id,
    profileData?.id,
    profileData?.display_name,
    profileData?.username,
    user.displayName,
    user.username,
  ]);

  // Map liked tracks for sidebar
  const likedTracksMapped = (Array.isArray(likedTracks) ? likedTracks : []).map(
    (t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist_name,
      coverUrl: t.cover_image ?? undefined,
      plays: t.play_count,
      likes: t.like_count,
    }),
  );

  // Map followers/following for sidebar
  const followingMapped = following.map((u) => ({
    userId: u.id,
    username: u.username ?? u.id,
    displayName: u.display_name,
    avatar: u.profile_picture ?? "",
    followers: u.followers_count,
    tracks: 0,
    isVerified: u.is_verified,
  }));

  const followersMapped = followers.map((u) => ({
    userId: u.id,
    username: u.username ?? u.id,
    avatar: u.profile_picture ?? "",
    displayName: u.display_name,
    followers: 0,
    tracks: 0,
    isVerified: u.is_verified,
  }));

  // Get active tab
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith("/tracks")) return "Tracks";
    if (path.endsWith("/popular-tracks")) return "Popular tracks";
    if (path.endsWith("/albums")) return "Albums";
    if (path.endsWith("/sets")) return "Playlists";
    if (path.endsWith("/reposts")) return "Reposts";
    return "All";
  };

  const selectedTab = getActiveTab();

  const handleTabChangeWrapper = (tab: string) => {
    handleTabChange(tab, navigate);
  };

  // Loading state
  if (isLoadingProfile && !isOwner && !profileData) {
    return (
      <div className="container px-4 md:px-8 lg:px-20 flex items-center justify-center py-32">
        <p className="text-white text-sm">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-8 lg:px-20">
      <ProfileHeader user={user} isOwner={isOwner} />
      <ProfileTabs
        isOwner={isOwner}
        selectedTab={selectedTab}
        onTabChange={handleTabChangeWrapper}
        onShare={() => setShowShare(true)}
        onEdit={() => setShowEdit(true)}
        username={user.username}
        displayName={user.displayName}
        tracks={stats.tracks ?? 0}
        onBlock={!isOwner && profileData ? () => setShowBlock(true) : undefined}
        blockDisabled={!profileData}
        userId={isOwner ? activeUser.id : (profileData?.id ?? "")}
        profilePicture={
          isOwner
            ? (activeUser.avatar ?? null)
            : (profileData?.profile_picture ?? null)
        }
      />

      <div className="flex gap-6 py-6 items-start">
        <div className="flex-1 min-w-0">
          {profileTracks.length > 0 || profileAlbums.length > 0 ? (
            <div className="flex flex-col gap-8">
              {profileTracks.length > 0 && (
                <section className="flex flex-col gap-3">
                  <h2
                    style={{
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    Tracks
                  </h2>
                  <div className="flex flex-col gap-4">
                    {profileTracks.map((t) => (
                      <TrackCard
                        key={t.id}
                        track={t}
                        onCopyLink={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/${t.artistUsername}/${t.trackSlug ?? ""}`,
                          );
                        }}
                        onEdit={() =>
                          navigate(`/${t.artistUsername}/${t.trackSlug ?? ""}`)
                        }
                        onReplaceFile={() =>
                          console.log("[TrackCard] replace file:", t.id)
                        }
                        onDelete={() =>
                          console.log("[TrackCard] delete:", t.id)
                        }
                        onDistribute={() =>
                          console.log("[TrackCard] distribute:", t.id)
                        }
                        onAddToPlaylist={() => {}}
                      />
                    ))}
                  </div>
                </section>
              )}

              {profileAlbums.length > 0 && (
                <section className="flex flex-col gap-3">
                  <h2
                    style={{
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    Albums
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-1">
                    {profileAlbums.map((album) => (
                      <PlaylistCard
                        key={album.id}
                        item={album}
                        widthClassName="w-[180px] sm:w-[200px] md:w-[220px]"
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
              <p
                data-test="empty-state-message"
                className="text-white font-bold text-17px"
              >
                Seems a little quiet over here
              </p>
              {isOwner &&
                selectedTab !== "Playlists" &&
                selectedTab !== "Reposts" && (
                  <button
                    data-test="upload-now-button"
                    onClick={() => navigate("/upload")}
                    className="cursor-pointer px-3.5 py-1.5 text-md bg-white text-black hover:text-[#737272] font-bold rounded"
                  >
                    Upload now
                  </button>
                )}
            </div>
          )}
        </div>

        <div
          className="sticky top-24 self-start min-w-0 overflow-hidden"
          style={{ maxWidth: "min-content" }}
        >
          <ProfileSidebar
            user={user}
            isOwner={isOwner}
            likedTracks={likedTracksMapped}
            likedTracksCount={
              isOwner
                ? Math.max(likedTracksCount, likedTracksStoreCount)
                : likedTracksCount
            }
            followers={followersMapped}
            following={followingMapped}
            stats={stats}
            onTabChange={handleTabChangeWrapper}
          />
        </div>
      </div>

      {showShare && (
        <ShareModal
          url={`https://rythmify.com/${user.username}`}
          onClose={() => setShowShare(false)}
        />
      )}

      {showEdit && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSave={(data) => {
            handleSave(data, () => setShowEdit(false));
          }}
        />
      )}

      {showBlock && profileData && (
        <Modal isOpen={showBlock} onClose={() => setShowBlock(false)}>
          <BlockUserModal
            username={
              profileData.display_name ??
              profileData.username ??
              user.displayName
            }
            userId={profileData.id}
            onClose={() => setShowBlock(false)}
            onBlocked={() => {
              setShowBlock(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
