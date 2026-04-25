import { createBrowserRouter, Navigate } from "react-router-dom";
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
const HomePage = lazy(() => import("@/pages/home/HomePage"));

// Signin
const SigninPage = lazy(() => import("@/pages/signin/SigninPage"));
const ResetPasswordPage = lazy(() => import("@/pages/signin/ResetPassword"));
const VerifyEmailPage = lazy(() => import("@/pages/signin/VerifyEmailPage"));
const CompleteProfilePage = lazy(
  () => import("@/pages/signin/CompleteProfilePage"),
);
const GitHubCallbackPage = lazy(
  () => import("@/pages/signin/GitHubCallbackPage"),
);

// Download
const DownloadPage = lazy(() => import("@/pages/download/DownloadPage"));

// People
const PeoplePage = lazy(() => import("@/pages/people/PeoplePage"));

// Discover
const DiscoverPage = lazy(() => import("@/pages/feed/discover/DiscoverPage"));
const MixForYouSlugPage = lazy(
  () => import("@/pages/you/sets/MixForYouSlugPage"),
);
const MadeForYouSlugPage = lazy(
  () => import("@/pages/you/sets/MadeForYouSlugPage"),
);
const StationSlugPage = lazy(
  () => import("@/pages/you/stations/StationSlugPage"),
);
const MoreOfLikeSlugPage = lazy(
  () => import("@/pages/you/sets/MoreOfLikeSlugPage"),
);
const CuratedForYouSlugPage = lazy(
  () => import("@/pages/you/sets/CuratedForYouSlugPage"),
);
const AlbumsForYouSlugPage = lazy(
  () => import("@/pages/you/albums/AlbumsForYouSlugPage"),
);
const TrendingByGenreSlugPage = lazy(
  () => import("@/pages/you/sets/TrendingByGenreSlugPage"),
);
// Feed
const FeedPage = lazy(() => import("@/pages/feed/FeedPage"));
const ChartsPage = lazy(() => import("@/pages/feed/charts/ChartsPage"));

// Search
const SearchPage = lazy(() => import("@/pages/search/SearchPage"));
const SoundsPage = lazy(() => import("@/pages/search/sounds/SoundsPage"));
const PeopleSearchPage = lazy(() => import("@/pages/search/people/PeoplePage"));
const AlbumsSearchPage = lazy(() => import("@/pages/search/albums/AlbumsPage"));
const SetsSearchPage = lazy(() => import("@/pages/search/sets/SetsPage"));

// User Profile
const UsernamePage = lazy(() => import("@/pages/[username]/UsernamePage"));
const TracksPage = lazy(() => import("@/pages/[username]/tracks/TracksPage"));
const UserAlbumsPage = lazy(
  () => import("@/pages/[username]/albums/AlbumsPage"),
);
const UserSetsPage = lazy(() => import("@/pages/[username]/sets/SetsPage"));
const RepostsPage = lazy(
  () => import("@/pages/[username]/reposts/RepostsPage"),
);
const PopularTracksPage = lazy(
  () => import("@/pages/[username]/popular-tracks/PopularTracksPage"),
);
const TrackSlugPage = lazy(
  () => import("@/pages/[username]/[trackSlug]/TrackSlugPage"),
);

// Social
const NotificationsPage = lazy(
  () => import("@/pages/social/notifications/NotificationsPage"),
);
const MessagesPage = lazy(() => import("@/pages/social/messages/MessagesPage"));
const MessageIdPage = lazy(
  () => import("@/pages/social/messages/[messageId]/MessageIdPage"),
);

// You
const LibraryLayout = lazy(() => import("@/pages/you/library/LibraryLayout"));
const LibraryPage = lazy(() => import("@/pages/you/library/LibraryPage"));
const LikesPage = lazy(() => import("@/pages/you/likes/LikesPage"));
const YouLikesPage = lazy(() => import("@/pages/you/likes/YouLikesPage"));
const YouSetsPage = lazy(() => import("@/pages/you/sets/SetsPage"));
const YouAlbumsPage = lazy(() => import("@/pages/you/albums/AlbumsPage"));
const FollowingPage = lazy(() => import("@/pages/you/following/FollowingPage"));
const YouFollowingPage = lazy(
  () => import("@/pages/you/following/YouFollowingPage"),
);
const FollowerPage = lazy(() => import("@/pages/you/follower/FollowerPage"));
const HistoryPage = lazy(() => import("@/pages/you/history/HistoryPage"));
const StationsPage = lazy(() => import("@/pages/you/stations/StationsPage"));
const InsightsPage = lazy(() => import("@/pages/you/insights/InsightsPage"));
const PlaylistSlugPage = lazy(
  () => import("@/pages/you/sets/PlaylistSlugPage"),
);
const AlbumSlugPage = lazy(() => import("@/pages/you/albums/AlbumSlugPage"));

// Settings
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
const ContentPage = lazy(() => import("@/pages/settings/content/ContentPage"));
const SettingsNotificationsPage = lazy(
  () => import("@/pages/settings/notifications/NotificationsPage"),
);
const PrivacySettingsPage = lazy(
  () => import("@/pages/settings/privacy/PrivacyPage"),
);
const AdvertisingPage = lazy(
  () => import("@/pages/settings/advertising/AdvertisingPage"),
);
const TwoFactorPage = lazy(
  () => import("@/pages/settings/two-factor/TwoFactorPage"),
);

// Creator
const UploadPage = lazy(() => import("@/pages/creator/upload/UploadPage"));
const UploadGuestPage = lazy(
  () => import("@/pages/creator/upload/UploadGuestPage"),
);
const ArtistPage = lazy(() => import("@/pages/creator/artists/ArtistsPage"));
const DistributionPage = lazy(
  () => import("@/pages/creator/artists/distribution/DistributionPage"),
);
const VinylPage = lazy(() => import("@/pages/creator/artists/vinyl/VinylPage"));
const CommentsArtistPage = lazy(
  () => import("@/pages/creator/artists/comments/ArtistsCommentsPage"),
);
const CheckoutPage = lazy(() => import("@/pages/creator/checkout/CheckoutPage"));
const PaymentPage = lazy(() => import("@/pages/creator/checkout/PaymentPage"));
const PlanPage = lazy(() => import("@/pages/premium/PlanPage"));

// Not Found
const NotFound = lazy(() => import("@/pages/not-found/NotFound"));

// Helper components
const YouRedirect = () => {
  const { user } = useAuthStore();
  return <Navigate to={`/${user?.username}`} replace />;
};

const UploadRouter = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <UploadLayout /> : <GuestNavbarLayout />;
};

const LogoutPage = () => {
  const { logout } = useAuthStore();

  useEffect(() => {
    logout();
  }, [logout]);

  return <Lazy component={DownloadPage} />;
};

// Router
export const router = createBrowserRouter([
  // 1. Landing
  {
    element: <LandingLayout />,
    children: [{ path: "/", element: <Lazy component={HomePage} /> }],
  },

  // 1b. Premium plans
  {
    path: "premium",
    element: <Lazy component={PlanPage} />,
  },

  // 2. Guest-only
  {
    element: <GuestNavbarLayout />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: "signin", element: <Lazy component={SigninPage} /> },
        ],
      },
    ],
  },

  // 3. Dual-view
  {
    element: <DualViewLayout />,
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
      { path: "download", element: <Lazy component={DownloadPage} /> },
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
    children: [
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
          {
            path: "messages/:messageId",
            element: <Lazy component={MessageIdPage} />,
          },

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
                ],
              },
              { path: "follower", element: <Lazy component={FollowerPage} /> },
              { path: "insights", element: <Lazy component={InsightsPage} /> },

              // Track Slug / Playlist Slug/ Album view
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
        ],
      },
    ],
  },

  // 5. Upload
  {
    path: "upload",
    element: <UploadRouter />,
    children: [{ index: true, element: <Lazy component={UploadPage} /> }],
  },

  // 6. Checkout
  {
    element: <CheckoutLayout />,
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
  },

  // 9. Verify Email
  {
    path: "verify-email",
    element: <Lazy component={VerifyEmailPage} />,
  },

  // 10. Complete Profile (Google OAuth new users)
  {
    path: "complete-profile",
    element: <Lazy component={CompleteProfilePage} />,
  },

  {
    path: "auth/callback",
    element: <Lazy component={GitHubCallbackPage} />,
  },

  // 9. Not Found
  {
    path: "*",
    element: <Lazy component={NotFound} />,
  },
]);
