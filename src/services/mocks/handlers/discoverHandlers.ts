import { http, HttpResponse } from "msw";
import type {
  PersonalMix,
  FeedTrack,
  HotForYou,
  HomeStation,
  RecentlyPlayedEntry,
  ListeningHistoryEntry,
  Pagination,
  SuggestedUser,
  ListMeta,
  BuzzingPlaylist,
  ApiTrack,
} from "../../api/discover.service";
import type { PublicUser } from "../../mocks/User.service";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockMixes: PersonalMix[] = [
  {
    id: "mix-1",
    label: "MIX 1",
    flavor: "listening_history",
    cover_image: "https://picsum.photos/200/200?random=301",
    track_count: 27,
    generated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "mix-2",
    label: "MIX 2",
    flavor: "taste_profile",
    cover_image: "https://picsum.photos/200/200?random=302",
    track_count: 19,
    generated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "mix-3",
    label: "MIX 3",
    flavor: "listening_history",
    cover_image: "https://picsum.photos/200/200?random=303",
    track_count: 23,
    generated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "mix-4",
    label: "MIX 4",
    flavor: "taste_profile",
    cover_image: "https://picsum.photos/200/200?random=304",
    track_count: 31,
    generated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "mix-5",
    label: "MIX 5",
    flavor: "listening_history",
    cover_image: "https://picsum.photos/200/200?random=305",
    track_count: 15,
    generated_at: "2026-04-01T00:00:00Z",
  },
];

const mockMixTracks: FeedTrack[] = [
  {
    id: "track-m1",
    title: "Starboy",
    artist: {
      id: "artist-weeknd",
      display_name: "The Weeknd",
      username: "theweeknd",
      avatar: "https://picsum.photos/50/50?random=701",
      follower_count: 7891000,
    },
    genre: "Pop",
    duration: 230,
    play_count: 80000,
    like_count: 4000,
    cover_url: "https://picsum.photos/200/200?random=701",
    stream_url: "https://example.com/audio/starboy.mp3",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "track-m2",
    title: "Levitating",
    artist: {
      id: "artist-dua",
      display_name: "Dua Lipa",
      username: "dualipa",
      avatar: "https://picsum.photos/50/50?random=702",
      follower_count: 5200000,
    },
    genre: "Pop",
    duration: 203,
    play_count: 65000,
    like_count: 3200,
    cover_url: "https://picsum.photos/200/200?random=702",
    stream_url: "https://example.com/audio/levitating.mp3",
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "track-m3",
    title: "SICKO MODE",
    artist: {
      id: "artist-travis",
      display_name: "Travis Scott",
      username: "travisscott",
      avatar: "https://picsum.photos/50/50?random=703",
      follower_count: 6234000,
    },
    genre: "Hip-Hop",
    duration: 312,
    play_count: 92000,
    like_count: 5100,
    cover_url: "https://picsum.photos/200/200?random=703",
    stream_url: "https://example.com/audio/sicko-mode.mp3",
    created_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "track-m4",
    title: "Bad Guy",
    artist: {
      id: "artist-billie",
      display_name: "Billie Eilish",
      username: "billieeilish",
      avatar: "https://picsum.photos/50/50?random=704",
      follower_count: 4500000,
    },
    genre: "Alternative",
    duration: 194,
    play_count: 71000,
    like_count: 3800,
    cover_url: "https://picsum.photos/200/200?random=704",
    stream_url: "https://example.com/audio/bad-guy.mp3",
    created_at: "2026-02-15T00:00:00Z",
  },
];

const mockHotTrack: FeedTrack = {
  id: "track-hot-1",
  title: "Blinding Lights",
  artist: {
    id: "artist-weeknd",
    display_name: "The Weeknd",
    username: "theweeknd",
    avatar: "https://picsum.photos/150/150?random=401",
    follower_count: 7891000,
  },
  cover_url: "https://picsum.photos/200/200?random=401",
  genre: "Synthwave",
  like_count: 5678,
  play_count: 45600,
  duration: 200,
  stream_url: "https://example.com/audio/blinding-lights.mp3",
  created_at: "2026-03-01T09:15:00Z",
};

const mockHotForYou: HotForYou = {
  track: mockHotTrack,
  reason: "Trending in Synthwave · Matches your taste",
  valid_until: "2026-04-04T00:00:00Z",
};

const mockStations: HomeStation[] = [
  {
    id: "station-1",
    name: "Based on Drake",
    seed_artist: {
      user_id: "artist-drake",
      display_name: "Drake",
      role: "artist",
      is_verified: true,
    },
    cover_image: "https://picsum.photos/200/200?random=501",
    track_count: 50,
  },
  {
    id: "station-2",
    name: "Based on SZA",
    seed_artist: {
      user_id: "artist-sza",
      display_name: "SZA",
      role: "artist",
      is_verified: true,
    },
    cover_image: "https://picsum.photos/200/200?random=502",
    track_count: 50,
  },
];

const mockBuzzingPlaylists: BuzzingPlaylist[] = [
  {
    id: "bp-1",
    title: "Buzzing Hip Hop & Rap",
    genre: "Hip Hop & Rap",
    genre_id: null,
    cover_image: "https://picsum.photos/200/200?random=601",
    is_new: true,
    track_count: 20,
  },
  {
    id: "bp-2",
    title: "Buzzing Pop",
    genre: "Pop",
    genre_id: null,
    cover_image: "https://picsum.photos/200/200?random=602",
    is_new: false,
    track_count: 18,
  },
];

const mockSuggestedUsers: SuggestedUser[] = [
  {
    user_id: "user-su-1",
    email: "novapulse@example.com",
    display_name: "Nova Pulse",
    gender: null,
    role: "artist",
    is_verified: false,
  },
  {
    user_id: "user-su-2",
    email: "junoray@example.com",
    display_name: "Juno Ray",
    gender: "female",
    role: "artist",
    is_verified: true,
  },
  {
    user_id: "user-su-3",
    email: "celestialbeat@example.com",
    display_name: "Celestial Beat",
    gender: null,
    role: "artist",
    is_verified: false,
  },
];

const mockSuggestedMeta: ListMeta = {
  total: 3,
  limit: 10,
  offset: 0,
};

const mockRecentlyPlayed: RecentlyPlayedEntry[] = [
  {
    track: {
      id: "track-1",
      title: "Butterfly Effect",
      genre: "Hip-Hop",
      duration: 225,
      user_id: "artist-travis",
    },
    last_played_at: "2026-04-01T10:30:00Z",
  },
  {
    track: {
      id: "track-2",
      title: "Good As Hell",
      genre: "R&B",
      duration: 252,
      user_id: "artist-lizzo",
    },
    last_played_at: "2026-03-31T18:00:00Z",
  },
  {
    track: {
      id: "track-3",
      title: "Blinding Lights",
      genre: "Synthwave",
      duration: 200,
      user_id: "artist-weeknd",
    },
    last_played_at: "2026-03-30T09:15:00Z",
  },
];

const mockListeningHistory: ListeningHistoryEntry[] = [
  {
    id: "play-1",
    track: {
      id: "track-1",
      title: "Butterfly Effect",
      genre: "Hip-Hop",
      duration: 225,
      user_id: "artist-travis",
    },
    played_at: "2026-04-01T10:30:00Z",
  },
  {
    id: "play-2",
    track: {
      id: "track-2",
      title: "Good As Hell",
      genre: "R&B",
      duration: 252,
      user_id: "artist-lizzo",
    },
    played_at: "2026-03-31T18:00:00Z",
  },
  {
    id: "play-3",
    track: {
      id: "track-1",
      title: "Butterfly Effect",
      genre: "Hip-Hop",
      duration: 225,
      user_id: "artist-travis",
    },
    played_at: "2026-03-31T15:00:00Z",
  },
];

const mockListeningHistoryPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 3,
  total_pages: 1,
};

// Generic ApiTrack used for the /tracks/:trackId handler.
// The id is overridden per-request using params.trackId.
const mockApiTrackBase: Omit<ApiTrack, "id"> = {
  title: "Mock Track",
  user_id: "artist-mock",
  genre: "Electronic",
  duration: 210,
  play_count: 1000,
  like_count: 50,
  repost_count: 10,
  comment_count: 5,
  stream_url: "https://example.com/audio/mock.mp3",
  cover_url: "https://picsum.photos/200/200?random=999",
  waveform_url: null,
  created_at: "2026-03-01T00:00:00Z",
  is_public: true,
};

// Generic PublicUser used for the /users/:userId handler.
const mockPublicUserBase: Omit<PublicUser, "id"> = {
  username: "mock-artist",
  display_name: "Mock Artist",
  bio: null,
  location: null,
  gender: null,
  role: "artist",
  profile_picture: "https://picsum.photos/150/150?random=800",
  cover_photo: null,
  is_private: false,
  is_verified: false,
  followers_count: 1200,
  following_count: 50,
  created_at: "2025-01-01T00:00:00Z",
};

// ─── Mock Following ───────────────────────────────────────────────────────────

const mockFollowingUsers = [
  {
    id: "user-f1",
    display_name: "Travis Scott",
    username: "travisscott",
    profile_picture: "https://picsum.photos/150/150?random=101",
    is_verified: true,
  },
  {
    id: "user-f2",
    display_name: "Dua Lipa",
    username: "dualipa",
    profile_picture: "https://picsum.photos/150/150?random=102",
    is_verified: true,
  },
  {
    id: "user-f3",
    display_name: "Billie Eilish",
    username: "billieeilish",
    profile_picture: "https://picsum.photos/150/150?random=103",
    is_verified: true,
  },
  {
    id: "user-f4",
    display_name: "Drake",
    username: "drake",
    profile_picture: "https://picsum.photos/150/150?random=104",
    is_verified: true,
  },
  {
    id: "user-f5",
    display_name: "SZA",
    username: "sza",
    profile_picture: "https://picsum.photos/150/150?random=105",
    is_verified: false,
  },
];

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const discoverHandlers = [
  // GET /home — main discover page data
  http.get("*/home", () => {
    return HttpResponse.json({
      data: {
        mixed_for_you: mockMixes,
        more_of_what_you_like: mockMixes,
        hot_for_you: mockHotForYou,
        discover_with_stations: mockStations,
        artists_to_watch: mockBuzzingPlaylists,
      },
      message: "Home data fetched successfully.",
    });
  }),

  // GET /home/mixes/:mixId/tracks — tracks for a personal mix
  http.get("*/home/mixes/:mixId/tracks", ({ params }) => {
    const mix = mockMixes.find((m) => m.id === params.mixId) ?? mockMixes[0];
    return HttpResponse.json({
      data: { mix, tracks: mockMixTracks },
    });
  }),

  // GET /me/history — recently played (deduplicated, max 20)
  http.get("*/me/history", () => {
    return HttpResponse.json({
      data: mockRecentlyPlayed,
    });
  }),

  // GET /me/listening-history — full paginated play history
  http.get("*/me/listening-history", () => {
    return HttpResponse.json({
      data: mockListeningHistory,
      pagination: mockListeningHistoryPagination,
    });
  }),

  // GET /users/suggested — suggested artists (UserSummary only — no avatar/followers)
  http.get("*/users/suggested", () => {
    return HttpResponse.json({
      data: {
        items: mockSuggestedUsers,
        meta: mockSuggestedMeta,
      },
    });
  }),

  // GET /users/me/following — list of users the current user follows
  http.get("*/users/me/following", () => {
    return HttpResponse.json({
      data: {
        items: mockFollowingUsers,
        total: mockFollowingUsers.length,
        query: null,
      },
    });
  }),

  // GET /users/:userId — full public user profile (used in two-step artist fetch)
  http.get("*/users/:userId", ({ params }) => {
    return HttpResponse.json({
      data: {
        ...mockPublicUserBase,
        id: params.userId as string,
        username: `artist-${params.userId}`,
      } satisfies PublicUser,
    });
  }),

  // GET /tracks/:trackId — full track data (used in two-step fetch for history/recently-played)
  http.get("*/tracks/:trackId", ({ params }) => {
    return HttpResponse.json({
      data: {
        ...mockApiTrackBase,
        id: params.trackId as string,
      } satisfies ApiTrack,
    });
  }),
];