import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import MainNavbar from "./MainNavbar";
import StickyPlayer from "../player/StickyPlayer";
import { useAuthStore } from "@/stores/auth.store";
import { useLikesStore } from "@/stores/likes.store";
import { getMe } from "@/services/auth.service";
import { getMySubscription } from "@/services/api/upload/subscription.service";

const AuthMainLayout = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const hydrateFromApi = useLikesStore((s) => s.hydrateFromApi);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Refresh user profile from backend on every app load so persisted
    // data (following_ids, avatar, etc.) never stays stale across sessions.
    Promise.allSettled([getMe(), getMySubscription()])
      .then(([profileResult, subResult]) => {
        if (profileResult.status !== "fulfilled") return;
        const p = profileResult.value.data;
        const isPro =
          subResult.status === "fulfilled"
            ? subResult.value.data.user_subscription_id !== null
            : p.isPro ?? false;
        setUser({
          id: p.id,
          username: p.username,
          displayName: p.display_name,
          firstName: p.first_name,
          lastName: p.last_name,
          bio: p.bio,
          email: p.email,
          role: p.role,
          isPro,
          avatar: p.profile_picture,
          coverUrl: p.cover_photo,
          city: p.city,
          country: p.country,
          following_ids: p.following_ids ?? [],
        });
      });

    hydrateFromApi();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col">
      <MainNavbar />

      {/* pb-14 reserves space so content doesn't hide behind the 56px player bar */}
      <main className="flex-1 pb-14">
        <Outlet />
      </main>

      {/* Global player - mounts once and persists across all routes */}
      <StickyPlayer />
    </div>
  );
};

export default AuthMainLayout;