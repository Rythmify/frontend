import { createBrowserRouter, Navigate } from "react-router-dom";
import ErrorPage from "@/pages/error/ErrorPage";
import { lazy, Suspense } from "react";

// Layouts
import { LandingLayout } from "./components/layout";
import { GuestNavbarLayout } from "@/components/layout";
import { AuthMainLayout } from "@/components/layout";
import { DualViewLayout } from "@/components/layout";
import { UploadLayout } from "@/components/layout";
import { CheckoutLayout } from "@/components/layout";
import { ArtistStudioLayout } from "@/components/layout";
import { ContainedLayout } from "@/components/layout";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect } from "react";

// Guards
import { PrivateRoute, PublicOnlyRoute } from "@/components/guards";

// Lazy loading wrapper
import Spinner from "@/components/UI/Spinner";

const RELOAD_FLAG = "chunk_reload_attempted";

// Retries a failed dynamic import once. If still failing, reloads the page
// one time (fixes stale Vite HMR chunks). Uses sessionStorage to prevent
// infinite reload loops when the module is genuinely broken.
function lazyWithRetry<T extends React.ComponentType>(
  factory: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  return lazy(() =>
    factory().catch(() =>
      factory().catch((err) => {
        if (!sessionStorage.getItem(RELOAD_FLAG)) {
          sessionStorage.setItem(RELOAD_FLAG, "1");
          window.location.reload();
          return new Promise<never>(() => {});
        }
        throw err;
      }),
    ),
  );
}

const Lazy = ({
  component: Component,
}: {
  component: React.LazyExoticComponent<React.ComponentType>;
}) => (
  <Suspense fallback={<Spinner />}>
    <Component />
  </Suspense>
);

// Page imports

// Home
const HomePage = lazyWithRetry(() => import("@/pages/home/HomePage"));

// Signin — imported directly (not lazy) to avoid CJS/ESM transform issues
// with react-google-recaptcha-v3 and @react-oauth/google in Vite dev mode
import SigninPage from "@/pages/signin/SigninPage";
const ResetPasswordPage = lazyWithRetry(() => import("@/pages/signin/ResetPassword"));
const VerifyEmailPage = lazyWithRetry(() => import("@/pages/signin/VerifyEmailPage"));
const CompleteProfilePage = lazyWithRetry(
  () => import("@/pages/signin/CompleteProfilePage"),
);
const GitHubCallbackPage = lazyWithRetry(
  () => import("@/pages/signin/GitHubCallbackPage"),
);

// Download (the /download route — app download page, NOT offline downloads)
const AppDownloadPage = lazyWithRetry(() => import("@/pages/download/DownloadPage"));

// People
const PeoplePage = lazyWithRetry(() => import("@/pages/people/PeoplePage"));

// Discover
const DiscoverPage = lazyWithRetry(() => import("@/pages/feed/discover/DiscoverPage"));
const MixForYouSlugPage = lazyWithRetry(
  () => import("@/pages/you/sets/MixForYouSlugPage"),
);
const MadeForYouSlugPage = lazyWithRetry(
  () => import("@/pages/you/sets/MadeForYouSlugPage"),
);
const StationSlugPage = lazyWithRetry(
  () => import("@/pages/you/stations/StationSlugPage"),
);
const MoreOfLikeSlugPage = lazyWithRetry(
  () => import("@/pages/you/sets/MoreOfLikeSlugPage"),
);
const CuratedForYouSlugPage = lazyWithRetry(
  () => import("@/pages/you/sets/CuratedForYouSlugPage"),
);
const AlbumsForYouSlugPage = lazyWithRetry(
  () => import("@/pages/you/albums/AlbumsForYouSlugPage"),
);
const TrendingByGenreSlugPage = lazyWithRetry(
  () => import("@/pages/you/sets/TrendingByGenreSlugPage"),
);
// Feed
const FeedPage = lazyWithRetry(() => import("@/pages/feed/FeedPage"));
const ChartsPage = lazyWithRetry(() => import("@/pages/feed/charts/ChartsPage"));

// Search
const SearchPage = lazyWithRetry(() => import("@/pages/search/SearchPage"));
const SoundsPage = lazyWithRetry(() => import("@/pages/search/sounds/SoundsPage"));
const PeopleSearchPage = lazyWithRetry(() => import("@/pages/search/people/PeoplePage"));
const AlbumsSearchPage = lazyWithRetry(() => import("@/pages/search/albums/AlbumsPage"));
const SetsSearchPage = lazyWithRetry(() => import("@/pages/search/sets/SetsPage"));

// User Profile
const UsernamePage = lazyWithRetry(() => import("@/pages/[username]/UsernamePage"));
const TracksPage = lazyWithRetry(() => import("@/pages/[username]/tracks/TracksPage"));
const UserAlbumsPage = lazyWithRetry(
  () => import("@/pages/[username]/albums/AlbumsPage"),
);
const UserSetsPage = lazyWithRetry(() => import("@/pages/[username]/sets/SetsPage"));
const RepostsPage = lazyWithRetry(
  () => import("@/pages/[username]/reposts/RepostsPage"),
);
const PopularTracksPage = lazyWithRetry(
  () => import("@/pages/[username]/popular-tracks/PopularTracksPage"),
);
const TrackSlugPage = lazyWithRetry(
  () => import("@/pages/[username]/[trackSlug]/TrackSlugPage"),
);
const TrackEngagementPage = lazyWithRetry(
  () => import("@/pages/[username]/[trackSlug]/TrackEngagementPage"),
);
const TrackRelatedPage = lazyWithRetry(
  () => import("@/pages/[username]/[trackSlug]/TrackRelatedPage"),
);

// Social
const NotificationsPage = lazyWithRetry(
  () => import("@/pages/social/notifications/NotificationsPage"),
);
const MessagesPage = lazyWithRetry(() => import("@/pages/social/messages/MessagesPage"));
const MessageIdPage = lazyWithRetry(
  () => import("@/pages/social/messages/[messageId]/MessageIdPage"),
);
const MessageIdPageGuest = lazy(
  () => import("@/pages/social/messages/[messageId]/MessageIdPageGuest"),
);

// You
const LibraryLayout = lazyWithRetry(() => import("@/pages/you/library/LibraryLayout"));
const LibraryPage = lazyWithRetry(() => import("@/pages/you/library/LibraryPage"));
const LikesPage = lazyWithRetry(() => import("@/pages/you/likes/LikesPage"));
const YouLikesPage = lazyWithRetry(() => import("@/pages/you/likes/YouLikesPage"));
const YouSetsPage = lazyWithRetry(() => import("@/pages/you/sets/SetsPage"));
const YouAlbumsPage = lazyWithRetry(() => import("@/pages/you/albums/AlbumsPage"));
const FollowingPage = lazyWithRetry(() => import("@/pages/you/following/FollowingPage"));
const YouFollowingPage = lazyWithRetry(
  () => import("@/pages/you/following/YouFollowingPage"),
);
const FollowerPage = lazyWithRetry(() => import("@/pages/you/follower/FollowerPage"));
const HistoryPage = lazyWithRetry(() => import("@/pages/you/history/HistoryPage"));
const StationsPage = lazyWithRetry(() => import("@/pages/you/stations/StationsPage"));
const InsightsPage = lazyWithRetry(() => import("@/pages/you/insights/InsightsPage"));
const PlaylistSlugPage = lazyWithRetry(
  () => import("@/pages/you/sets/PlaylistSlugPage"),
);
const AlbumSlugPage = lazyWithRetry(() => import("@/pages/you/albums/AlbumSlugPage"));

// ── Offline Downloads (new) ────────────────────────────────
const OfflineDownloadsPage = lazyWithRetry(
  () => import("@/pages/you/downloads/DownloadsPage"),
);

// Settings
const SettingsPage = lazyWithRetry(() => import("@/pages/settings/SettingsPage"));
const SubscriptionsPage = lazyWithRetry(
  () => import("@/pages/subscriptions/Subscriptions"),
);
const ContentPage = lazyWithRetry(() => import("@/pages/settings/content/ContentPage"));
const SettingsNotificationsPage = lazyWithRetry(
  () => import("@/pages/settings/notifications/NotificationsPage"),
);
const PrivacySettingsPage = lazyWithRetry(
  () => import("@/pages/settings/privacy/PrivacyPage"),
);
const AdvertisingPage = lazyWithRetry(
  () => import("@/pages/settings/advertising/AdvertisingPage"),
);
const TwoFactorPage = lazyWithRetry(
  () => import("@/pages/settings/two-factor/TwoFactorPage"),
);

// Creator
const UploadPage = lazyWithRetry(() => import("@/pages/creator/upload/UploadPage"));
const UploadGuestPage = lazyWithRetry(
  () => import("@/pages/creator/upload/UploadGuestPage"),
);
const ArtistPage = lazyWithRetry(() => import("@/pages/creator/artists/ArtistsPage"));
const DistributionPage = lazyWithRetry(
  () => import("@/pages/creator/artists/distribution/DistributionPage"),
);
const VinylPage = lazyWithRetry(() => import("@/pages/creator/artists/vinyl/VinylPage"));
const CommentsArtistPage = lazyWithRetry(
  () => import("@/pages/creator/artists/comments/ArtistsCommentsPage"),
);

const CheckoutPage = lazyWithRetry(
  () => import("@/pages/creator/checkout/CheckoutPage"),
);
const PaymentPage = lazyWithRetry(() => import("@/pages/creator/checkout/PaymentPage"));
const PlanPage = lazyWithRetry(() => import("@/pages/premium/PlanPage"));

// Admin
const AdminLayout = lazyWithRetry(() => import("@/pages/admin/AdminLayout"));
const AdminDashboardPage = lazyWithRetry(
  () => import("@/pages/admin/dashboard/AdminDashboardPage"),
);
const AdminReportsPage = lazyWithRetry(
  () => import("@/pages/admin/reports/AdminReportsPage"),
);
const AdminUsersPage = lazyWithRetry(() => import("@/pages/admin/users/AdminUsersPage"));
const AdminTracksPage = lazyWithRetry(
  () => import("@/pages/admin/tracks/AdminTracksPage"),
);

// Not Found
const NotFound = lazyWithRetry(() => import("@/pages/not-found/NotFound"));

// Helper components
const YouRedirect = () => {
  const { user } = useAuthStore();
  return <Navigate to={`/${user?.username}`} replace />;
};

const UploadRouter = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <UploadLayout /> : <GuestNavbarLayout />;
};

const MessageIdPageRouter = () => {
  const { isAuthenticated } = useAuthStore();
  return (
    <Lazy component={isAuthenticated ? MessageIdPage : MessageIdPageGuest} />
  );
};

const LogoutPage = () => {
  const { logout } = useAuthStore();

  useEffect(() => {
    logout();
  }, [logout]);

  // Redirect to home after logout — not to the download page
  return <Navigate to="/" replace />;
};

// Router
export const router = createBrowserRouter([
  // 1. Landing
  {
    element: <LandingLayout />,
    errorElement: <ErrorPage />,
    children: [{ path: "/", element: <Lazy component={HomePage} /> }],
  },

  // 1b. Premium plans
  {
    path: "premium",
    element: <Lazy component={PlanPage} />,
    errorElement: <ErrorPage />,
  },

  // 2. Guest-only
  {
    element: <GuestNavbarLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: "signin", element: <SigninPage /> },
        ],
      },
    ],
  },

  // 3. Dual-view
  {
    element: <DualViewLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "discover", element: <Lazy component={DiscoverPage} /> },
      {
        path: "discover/sets/:mixSlug",
        element: <Lazy component={MixForYouSlugPage} />,
      },
      {
        path: "discover/sets/new-for-you/:kind/:mixId",
        element: <Lazy component={MadeForYouSlugPage} />,
      },
      {
        path: "discover/stations/:stationSlug",
        element: <Lazy component={StationSlugPage} />,
      },
      {
        path: "discover/personalised/:playlistSlug",
        element: <Lazy component={MoreOfLikeSlugPage} />,
      },
      {
        path: "rythmify/sets/:mixSlug",
        element: <Lazy component={CuratedForYouSlugPage} />,
      },
      {
        path: "discover/albums/:albumSlug",
        element: <Lazy component={AlbumsForYouSlugPage} />,
      },
      {
        path: "discover/genres/:playlistSlug",
        element: <Lazy component={TrendingByGenreSlugPage} />,
      },
      { path: "people", element: <Lazy component={PeoplePage} /> },
      { path: "download", element: <Lazy component={AppDownloadPage} /> },
      { path: "logout", element: <LogoutPage /> },

      // Search
      {
        path: "search",
        element: <Lazy component={SearchPage} />,
        children: [
          { path: "sounds", element: <Lazy component={SoundsPage} /> },
          { path: "people", element: <Lazy component={PeopleSearchPage} /> },
          { path: "albums", element: <Lazy component={AlbumsSearchPage} /> },
          { path: "sets", element: <Lazy component={SetsSearchPage} /> },
        ],
      },

      // User Profile
      {
        path: ":username",
        children: [
          { index: true, element: <Lazy component={UsernamePage} /> },
          { path: "tracks", element: <Lazy component={TracksPage} /> },
          { path: "albums", element: <Lazy component={UserAlbumsPage} /> },
          { path: "sets", element: <Lazy component={UserSetsPage} /> },
          { path: "reposts", element: <Lazy component={RepostsPage} /> },
          { path: "follower", element: <Lazy component={FollowerPage} /> },
          { path: "following", element: <Lazy component={FollowingPage} /> },
          { path: "likes", element: <Lazy component={LikesPage} /> },
          {
            path: "popular-tracks",
            element: <Lazy component={PopularTracksPage} />,
          },
          { path: ":trackId", element: <Lazy component={TrackSlugPage} /> },
          { path: ":trackId/likes", element: <Lazy component={TrackEngagementPage} /> },
          { path: ":trackId/reposts", element: <Lazy component={TrackEngagementPage} /> },
          { path: ":trackId/related", element: <Lazy component={TrackRelatedPage} /> },
          {
            path: "sets/:playlistSlug",
            element: <Lazy component={PlaylistSlugPage} />,
          },
          {
            path: "album/:albumSlug",
            element: <Lazy component={AlbumSlugPage} />,
          },
        ],
      },
    ],
  },

  // 4. Auth-only
  {
    element: <AuthMainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "messages/:messageId",
        element: <MessageIdPageRouter />,
      },
      {
        element: <PrivateRoute />,
        children: [
          // Feed
          { path: "feed", element: <Lazy component={FeedPage} /> },
          { path: "feed/charts", element: <Lazy component={ChartsPage} /> },

          // Social
          {
            path: "notifications",
            element: <Lazy component={NotificationsPage} />,
          },
          { path: "messages", element: <Lazy component={MessagesPage} /> },

          // You
          {
            path: "you",
            children: [
              { index: true, element: <YouRedirect /> },
              {
                element: <Lazy component={LibraryLayout} />,
                children: [
                  {
                    path: "library",
                    element: <Lazy component={LibraryPage} />,
                  },
                  { path: "likes", element: <Lazy component={YouLikesPage} /> },
                  { path: "sets", element: <Lazy component={YouSetsPage} /> },
                  {
                    path: "albums",
                    element: <Lazy component={YouAlbumsPage} />,
                  },
                  {
                    path: "stations",
                    element: <Lazy component={StationsPage} />,
                  },
                  {
                    path: "history",
                    element: <Lazy component={HistoryPage} />,
                  },
                  {
                    path: "following",
                    element: <Lazy component={YouFollowingPage} />,
                  },
                  // ── Offline Downloads tab ──────────────────
                  {
                    path: "downloads",
                    element: <Lazy component={OfflineDownloadsPage} />,
                  },
                ],
              },
              { path: "follower", element: <Lazy component={FollowerPage} /> },
              { path: "insights", element: <Lazy component={InsightsPage} /> },

              // Track Slug / Playlist Slug / Album view
              {
                path: "sets/:playlistSlug",
                element: <Lazy component={PlaylistSlugPage} />,
              },
              {
                path: "album/:albumSlug",
                element: <Lazy component={AlbumSlugPage} />,
              },
            ],
          },

          // Settings
          {
            path: "settings",
            element: <Lazy component={SettingsPage} />,
            children: [
              { index: true, element: <Navigate to="content" replace /> },
              { path: "content", element: <Lazy component={ContentPage} /> },
              {
                path: "notifications",
                element: <Lazy component={SettingsNotificationsPage} />,
              },
              {
                path: "privacy",
                element: <Lazy component={PrivacySettingsPage} />,
              },
              {
                path: "advertising",
                element: <Lazy component={AdvertisingPage} />,
              },
              {
                path: "two-factor",
                element: <Lazy component={TwoFactorPage} />,
              },
            ],
          },

          // Subscriptions
          {
            path: "subscriptions",
            element: <Lazy component={SubscriptionsPage} />,
          },
        ],
      },
    ],
  },

  // 5. Upload
  {
    path: "upload",
    element: <UploadRouter />,
    errorElement: <ErrorPage />,
    children: [{ index: true, element: <Lazy component={UploadPage} /> }],
  },

  // 6. Checkout
  {
    element: <CheckoutLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <PrivateRoute />,
        children: [
          {
            path: "creator/checkout",
            element: <Lazy component={CheckoutPage} />,
          },
          {
            path: "creator/payment",
            element: <Lazy component={PaymentPage} />,
          },
        ],
      },
    ],
  },

  // 7. Artist Studio
  {
    element: <ArtistStudioLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <PrivateRoute />,
        children: [
          { path: "artists", element: <Lazy component={ArtistPage} /> },
          {
            path: "artists/distribution",
            element: <Lazy component={DistributionPage} />,
          },
          { path: "artists/vinyl", element: <Lazy component={VinylPage} /> },
          {
            path: "artists/comments",
            element: <Lazy component={CommentsArtistPage} />,
          },
          
        ],
      },
    ],
  },

  // 8. Reset Password
  {
    path: "reset-password",
    element: <Lazy component={ResetPasswordPage} />,
    errorElement: <ErrorPage />,
  },

  // 9. Verify Email
  {
    path: "verify-email",
    element: <Lazy component={VerifyEmailPage} />,
    errorElement: <ErrorPage />,
  },

  // 10. Complete Profile (Google OAuth new users)
  {
    path: "complete-profile",
    element: <Lazy component={CompleteProfilePage} />,
    errorElement: <ErrorPage />,
  },

  {
    path: "auth/callback",
    element: <Lazy component={GitHubCallbackPage} />,
    errorElement: <ErrorPage />,
  },

  // 11. Admin
  {
    path: "admin",
    element: <Lazy component={AdminLayout} />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Lazy component={AdminDashboardPage} /> },
      { path: "reports", element: <Lazy component={AdminReportsPage} /> },
      { path: "users", element: <Lazy component={AdminUsersPage} /> },
      { path: "tracks", element: <Lazy component={AdminTracksPage} /> },
    ],
  },

  // 12. Not Found
  {
    path: "*",
    element: <Lazy component={NotFound} />,
    errorElement: <ErrorPage />,
  },
]);
