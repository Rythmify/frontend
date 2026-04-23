import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import ShareLayout from "../../[username]/shareLayout";
import TrackCard from "@/components/track/TrackCard";
import ShareModal from "@/components/Profile/ShareModal/ShareModal";
import EditProfileModal from "@/components/Profile/EditProfileModal/EditProfileModal";
import { getMyTracks, getUserTracks } from "@/services/track.service";

import {
  getFollowers,
  getFollowing,
  getMyProfile,
  getUserByUsername,
  updateMyProfile,
  type OwnUser,
  type PublicUser,
  type UserSummary,
} from "@/services/user.service";
import type { Track } from "@/types/track";

export default function TracksPage() {
  const { username } = useParams();
  const { user: currentUser, setUser } = useAuthStore();
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<OwnUser | PublicUser | null>(
    null,
  );
  const [followers, setFollowers] = useState<UserSummary[]>([]);
  const [following, setFollowing] = useState<UserSummary[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, tracks: 0 });
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);

  if (!currentUser) return null;

  const activeUser = currentUser;
  const isOwner = !username || username === currentUser.username;

  useEffect(() => {
    let cancelled = false;
    setLoadingTracks(true);

    const load = async () => {
      try {
        if (isOwner) {
          const [profile, ownedTracks] = await Promise.all([
            getMyProfile(),
            getMyTracks(1, 100),
          ]);

          if (cancelled) return;

          setProfileData(profile);
          setTracks(ownedTracks);
          setStats({
            followers: profile.followers_count,
            following: profile.following_count,
            tracks: ownedTracks.length,
          });

          const latestUser = useAuthStore.getState().user ?? activeUser;
          setUser({
            ...latestUser,
            bio: profile.bio || "",
            avatar: profile.profile_picture ?? latestUser.avatar,
            coverUrl: profile.cover_photo ?? latestUser.coverUrl,
            location:
              [(profile as OwnUser).city, (profile as OwnUser).country]
                .filter(Boolean)
                .join(", ") || latestUser.location,
          });

          if (activeUser.id) {
            const [followersRes, followingRes] = await Promise.all([
              getFollowers(activeUser.id, { limit: 100 }),
              getFollowing(activeUser.id, { limit: 100 }),
            ]);

            if (cancelled) return;

            setFollowers(followersRes.items);
            setFollowing(followingRes.items);
            setStats((s) => ({
              ...s,
              followers: followersRes.meta.total,
              following: followingRes.meta.total,
            }));
          }
          return;
        }

        if (!username) return;

        // getUserByUsername does: GET /search?type=users&q=:username → GET /users/:id
        // No /resolve needed.
        const profile = await getUserByUsername(username);
        if (cancelled) return;

        const [userTracks, followersRes, followingRes] = await Promise.all([
          getUserTracks(profile.id, 1, 100),
          getFollowers(profile.id, { limit: 100 }),
          getFollowing(profile.id, { limit: 100 }),
        ]);

        if (cancelled) return;

        setProfileData(profile);
        setTracks(userTracks);
        setFollowers(followersRes.items);
        setFollowing(followingRes.items);
        setStats({
          followers: followersRes.meta.total,
          following: followingRes.meta.total,
          tracks: userTracks.length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoadingTracks(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [username, isOwner]);

  const handleTabChange = (tab: string) => {
    const targetUsername = isOwner ? currentUser.username : username || "";
    const tabRoutes: Record<string, string> = {
      All: `/${targetUsername}`,
      "Popular tracks": `/${targetUsername}/popular-tracks`,
      Tracks: `/${targetUsername}/tracks`,
      Albums: `/${targetUsername}/albums`,
      Playlists: `/${targetUsername}/sets`,
      Reposts: `/${targetUsername}/reposts`,
    };
    const route = tabRoutes[tab];
    if (route) navigate(route);
  };

  const user = isOwner
    ? currentUser
    : {
        ...currentUser,
        username: profileData?.username || username || currentUser.username,
        displayName:
          profileData?.display_name ||
          profileData?.username ||
          username ||
          currentUser.username,
        bio: profileData?.bio || "",
        avatar: profileData?.profile_picture ?? undefined,
        coverUrl: profileData?.cover_photo ?? undefined,
        location: (profileData as PublicUser | null)?.location || "",
      };

  const followersMapped = followers.map((u) => ({
    userId: u.id,
    username: u.username || u.id,
    displayName: u.display_name,
    avatar: u.profile_picture ?? "",
    followers: 0,
    tracks: 0,
    isVerified: u.is_verified,
  }));

  const followingMapped = following.map((u) => ({
    userId: u.id,
    username: u.username || u.id,
    displayName: u.display_name,
    avatar: u.profile_picture ?? "",
    followers: 0,
    tracks: 0,
    isVerified: u.is_verified,
  }));

  return (
    <>
      <ShareLayout
        user={user}
        isOwner={isOwner}
        selectedTab="Tracks"
        onTabChange={handleTabChange}
        onShare={() => setShowShare(true)}
        onEdit={() => setShowEdit(true)}
        followers={followersMapped}
        following={followingMapped}
        stats={stats}
      >
        <div className="flex flex-col gap-4">
          {tracks.length > 0 ? (
            tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onCopyLink={() =>
                  navigator.clipboard.writeText(
                    `${window.location.origin}/${track.artistUsername}/${track.id}`,
                  )
                }
                onEdit={() => navigate(`/${track.artistUsername}/${track.id}`)}
                onReplaceFile={() =>
                  console.log("[TrackCard] replace file:", track.id)
                }
                onDelete={() => console.log("[TrackCard] delete:", track.id)}
                onDistribute={() =>
                  console.log("[TrackCard] distribute:", track.id)
                }
                onAddToPlaylist={() => {}}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <p
                data-test="empty-state-message"
                className="text-white font-bold text-17px"
              >
                {loadingTracks ? "Loading tracks…" : "No tracks yet."}
              </p>
            </div>
          )}
        </div>
      </ShareLayout>

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
            updateMyProfile({
              display_name: data.displayName,
              first_name: data.firstName,
              last_name: data.lastName,
              bio: data.bio,
              city: data.city,
              country: data.country,
            }).catch(console.error);

            const latestUser = useAuthStore.getState().user ?? activeUser;
            setUser({
              ...latestUser,
              displayName: data.displayName,
              firstName: data.firstName,
              lastName: data.lastName,
              bio: data.bio,
              city: data.city,
              country: data.country,
              location: data.location,
              avatar: data.avatarFile
                ? URL.createObjectURL(data.avatarFile)
                : latestUser.avatar,
            });
            setShowEdit(false);
          }}
        />
      )}
    </>
  );
}
