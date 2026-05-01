import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import MainNavbar from "./MainNavbar";
import StickyPlayer from "../player/StickyPlayer";
import { useAuthStore } from "@/stores/auth.store";
import { useLikesStore } from "@/stores/likes.store";
import { getMe, normalizeDateOfBirth } from "@/services/auth.service";
import { getMySubscription } from "@/services/api/upload/subscription.service";
import PremiumPromoModal from "@/components/Premium/PremiumPromoModal";
import { usePromoModal } from "@/hooks/usePromoModal";
import { getMyWebProfiles } from "@/services/user.service";

const formatProfileTitle = (platform: string) => {
  if (platform === "other") return "Support";
  return platform.charAt(0).toUpperCase() + platform.slice(1);
};

const AuthMainLayout = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const hydrateFromApi = useLikesStore((s) => s.hydrateFromApi);
  const { showPromo, closePromo } = usePromoModal();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Refresh user profile from backend on every app load so persisted
    // data (following_ids, avatar, etc.) never stays stale across sessions.
    Promise.allSettled([getMe(), getMySubscription(), getMyWebProfiles({ limit: 100, offset: 0 })])
      .then(([profileResult, subResult, webProfilesResult]) => {
        if (profileResult.status !== "fulfilled") return;
        const p = profileResult.value.data;
        const currentLinks = currentUser?.links ?? [];
        const mergedLinks =
          webProfilesResult.status === "fulfilled"
            ? webProfilesResult.value.map((profile) => {
                const fallback = currentLinks.find(
                  (link) =>
                    link.id === profile.id ||
                    link.url.trim() === profile.url.trim(),
                );
                return {
                  id: profile.id,
                  url: profile.url,
                  title: fallback?.title || formatProfileTitle(profile.platform),
                  isSupport: fallback?.isSupport ?? profile.platform === "other",
                };
              })
            : currentLinks;
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
          avatar: p.profile_picture ?? currentUser?.avatar,
          coverUrl: p.cover_photo ?? currentUser?.coverUrl,
          city: p.city ?? currentUser?.city,
          country: p.country ?? currentUser?.country,
          location:
            [p.city ?? currentUser?.city, p.country ?? currentUser?.country]
              .filter(Boolean)
              .join(", ") || currentUser?.location,
          links: mergedLinks,
          following_ids: p.following_ids ?? currentUser?.following_ids ?? [],
          followers_ids: p.followers_ids ?? currentUser?.followers_ids ?? [],
          date_of_birth:
            normalizeDateOfBirth(p.date_of_birth) ??
            currentUser?.date_of_birth ??
            null,
          gender: p.gender ?? currentUser?.gender ?? null,
        });
    });

    hydrateFromApi();
  }, [hydrateFromApi, isAuthenticated, setUser]);


  return (
    <div className="min-h-screen flex flex-col">
      {showPromo && <PremiumPromoModal onClose={closePromo} />}
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
