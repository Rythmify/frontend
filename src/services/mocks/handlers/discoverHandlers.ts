import { http, HttpResponse } from "msw";
import type {
  PersonalMix,
  DiscoveryTrack,
  DiscoveryStation,
  EmergingArtist,
  CuratedMixSummary,
  TrackSummary,
  RecentlyPlayedEntry,
  ListeningHistoryEntry,
  SuggestedUser,
  ListMeta,
  DiscoveryAlbum,
} from "../../api/discover.service";
import type { PublicUser } from "../../mocks/User.service";

// ─── Mock Discovery Tracks ────────────────────────────────────────────────────

const mockDiscoveryTracks: DiscoveryTrack[] = [
  {
    id: "track-1",
    title: "Butterfly Effect",
    artist_name: "Travis Scott",
    user_id: "artist-travis",
    genre_name: "Hip-Hop",
    duration: 225,
    play_count: 75000,
    like_count: 3500,
    repost_count: 400,
    cover_image: "https://picsum.photos/200/200?random=501",
    stream_url: "https://example.com/audio/butterfly-effect.mp3",
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "track-2",
    title: "Blinding Lights",
    artist_name: "The Weeknd",
    user_id: "artist-weeknd",
    genre_name: "Synthwave",
    duration: 200,
    play_count: 95000,
    like_count: 5200,
    repost_count: 700,
    cover_image: "https://picsum.photos/200/200?random=401",
    stream_url: "https://example.com/audio/blinding-lights.mp3",
    created_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "track-3",
    title: "Levitating",
    artist_name: "Dua Lipa",
    user_id: "artist-dua",
    genre_name: "Pop",
    duration: 203,
    play_count: 65000,
    like_count: 3200,
    repost_count: 300,
    cover_image: "https://picsum.photos/200/200?random=702",
    stream_url: "https://example.com/audio/levitating.mp3",
    created_at: "2026-02-15T00:00:00Z",
  },
  {
    id: "track-4",
    title: "Bad Guy",
    artist_name: "Billie Eilish",
    user_id: "artist-billie",
    genre_name: "Alternative",
    duration: 194,
    play_count: 71000,
    like_count: 3800,
    repost_count: 420,
    cover_image: "https://picsum.photos/200/200?random=704",
    stream_url: "https://example.com/audio/bad-guy.mp3",
    created_at: "2026-03-01T00:00:00Z",
  },
];

// ─── Mock Personal Mixes ──────────────────────────────────────────────────────

const mockMixes: PersonalMix[] = [
  {
    id: "mix-1",
    label: "MIX 1",
    flavor: "listening_history",
    genre_name: null,
    cover_image: "https://picsum.photos/200/200?random=301",
    track_count: 27,
    generated_at: "2026-04-01T00:00:00Z",
    preview_track: null,
  },
  {
    id: "mix-2",
    label: "MIX 2",
    flavor: "listening_history",
    genre_name: "Pop",
    cover_image: "https://picsum.photos/200/200?random=302",
    track_count: 19,
    generated_at: "2026-04-01T00:00:00Z",
    preview_track: null,
  },
  {
    id: "mix-3",
    label: "MIX 3",
    flavor: "listening_history",
    genre_name: null,
    cover_image: "https://picsum.photos/200/200?random=303",
    track_count: 23,
    generated_at: "2026-04-01T00:00:00Z",
    preview_track: null,
  },
  {
    id: "mix-4",
    label: "MIX 4",
    flavor: "listening_history",
    genre_name: "Hip-Hop",
    cover_image: "https://picsum.photos/200/200?random=304",
    track_count: 31,
    generated_at: "2026-04-01T00:00:00Z",
    preview_track: null,
  },
  {
    id: "mix-5",
    label: "MIX 5",
    flavor: "listening_history",
    genre_name: null,
    cover_image: "https://picsum.photos/200/200?random=305",
    track_count: 15,
    generated_at: "2026-04-01T00:00:00Z",
    preview_track: null,
  },
];

// ─── Mock Made For You ────────────────────────────────────────────────────────

const mockDailyMix: CuratedMixSummary = {
  id: "daily-mix-1",
  label: "Daily Drops",
  description: "New releases based on your taste",
  track_count: 20,
  refreshes_at: "2026-04-09T00:00:00Z",
  preview_track: null,
};

const mockWeeklyMix: CuratedMixSummary = {
  id: "weekly-mix-1",
  label: "Weekly Wave",
  description: "The best of Rythmify this week",
  track_count: 30,
  refreshes_at: "2026-04-15T00:00:00Z",
  preview_track: null,
};

// ─── Mock Stations ────────────────────────────────────────────────────────────

const mockStations: DiscoveryStation[] = [
  {
    id: "station-1",
    name: "Based on Drake",
    artist_id: "artist-drake",
    artist_name: "Drake",
    cover_image: "https://picsum.photos/200/200?random=501",
    track_count: 50,
    follower_count: 5000000,
  },
  {
    id: "station-2",
    name: "Based on SZA",
    artist_id: "artist-sza",
    artist_name: "SZA",
    cover_image: "https://picsum.photos/200/200?random=502",
    track_count: 50,
    follower_count: 3200000,
  },
];

// ─── Mock Emerging Artists ────────────────────────────────────────────────────

const mockEmergingArtists: EmergingArtist[] = [
  {
    id: "artist-ea-1",
    display_name: "Nova Pulse",
    profile_picture: "https://picsum.photos/150/150?random=901",
    top_genre: "Electronic",
    play_velocity: 1250,
    track_count: 8,
  },
  {
    id: "artist-ea-2",
    display_name: "Juno Ray",
    profile_picture: "https://picsum.photos/150/150?random=902",
    top_genre: "R&B",
    play_velocity: 980,
    track_count: 5,
  },
  {
    id: "artist-ea-3",
    display_name: "Celestial Beat",
    profile_picture: "https://picsum.photos/150/150?random=903",
    top_genre: "Pop",
    play_velocity: 760,
    track_count: 12,
  },
];

// ─── Mock Albums ──────────────────────────────────────────────────────────────

const mockAlbums: DiscoveryAlbum[] = [
  {
    id: "album-1",
    name: "Astroworld",
    cover_image: "https://picsum.photos/200/200?random=801",
    owner_id: "artist-travis",
    owner_name: "Travis Scott",
    track_count: 17,
    like_count: 42000,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "album-2",
    name: "Future Nostalgia",
    cover_image: "https://picsum.photos/200/200?random=802",
    owner_id: "artist-dua",
    owner_name: "Dua Lipa",
    track_count: 11,
    like_count: 38000,
    created_at: "2026-01-15T00:00:00Z",
  },
];

// ─── Mock Track Summaries ─────────────────────────────────────────────────────

const mockTrackSummaries: TrackSummary[] = [
  {
    id: "track-1",
    title: "Butterfly Effect",
    genre: "Hip-Hop",
    duration: 225,
    cover_image: "https://picsum.photos/200/200?random=501",
    user_id: "artist-travis",
    play_count: 75000,
    like_count: 3500,
    stream_url: "https://example.com/audio/butterfly-effect.mp3",
  },
  {
    id: "track-2",
    title: "Good As Hell",
    genre: "R&B",
    duration: 252,
    cover_image: "https://picsum.photos/200/200?random=502",
    user_id: "artist-lizzo",
    play_count: 60000,
    like_count: 2900,
    stream_url: "https://example.com/audio/good-as-hell.mp3",
  },
  {
    id: "track-3-summary",
    title: "Blinding Lights",
    genre: "Synthwave",
    duration: 200,
    cover_image: "https://picsum.photos/200/200?random=401",
    user_id: "artist-weeknd",
    play_count: 95000,
    like_count: 5200,
    stream_url: "https://example.com/audio/blinding-lights.mp3",
  },
];

// ─── Mock Recently Played ─────────────────────────────────────────────────────

const mockRecentlyPlayed: RecentlyPlayedEntry[] = [
  { track: mockTrackSummaries[0], last_played_at: "2026-04-01T10:30:00Z" },
  { track: mockTrackSummaries[1], last_played_at: "2026-03-31T18:00:00Z" },
  { track: mockTrackSummaries[2], last_played_at: "2026-03-30T09:15:00Z" },
];

// ─── Mock Listening History ───────────────────────────────────────────────────

const mockListeningHistory: ListeningHistoryEntry[] = [
  {
    id: "play-1",
    track: mockTrackSummaries[0],
    played_at: "2026-04-01T10:30:00Z",
  },
  {
    id: "play-2",
    track: mockTrackSummaries[1],
    played_at: "2026-03-31T18:00:00Z",
  },
  {
    id: "play-3",
    track: mockTrackSummaries[0],
    played_at: "2026-03-31T15:00:00Z",
  },
];

const mockListeningHistoryMeta: ListMeta = {
  total: 3,
  limit: 20,
  offset: 0,
};

// ─── Mock Suggested Users ─────────────────────────────────────────────────────

const mockSuggestedUsers: SuggestedUser[] = [
  {
    id: "user-su-1",
    display_name: "Nova Pulse",
    username: "novapulse",
    profile_picture: "https://picsum.photos/150/150?random=901",
    is_verified: false,
    follower_count: 1200,
    mutual_count: null,
    suggestion_source: "popular",
    is_following: false,
  },
  {
    id: "user-su-2",
    display_name: "Juno Ray",
    username: "junoray",
    profile_picture: "https://picsum.photos/150/150?random=902",
    is_verified: true,
    follower_count: 8500,
    mutual_count: 3,
    suggestion_source: "mutual",
    is_following: false,
  },
  {
    id: "user-su-3",
    display_name: "Celestial Beat",
    username: "celestialbeat",
    profile_picture: "https://picsum.photos/150/150?random=903",
    is_verified: false,
    follower_count: 640,
    mutual_count: null,
    suggestion_source: "popular",
    is_following: false,
  },
];

const mockSuggestedMeta: ListMeta = {
  total: 3,
  limit: 10,
  offset: 0,
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

// ─── Mock Public User ─────────────────────────────────────────────────────────

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

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const discoverHandlers = [
  // GET /home — main discover page data
  http.get("*/home", () => {
    return HttpResponse.json({
      data: {
        more_of_what_you_like: {
          tracks: mockDiscoveryTracks,
          source: "personalized",
        },
        mixed_for_you: mockMixes,
        made_for_you: {
          daily_mix: mockDailyMix,
          weekly_mix: mockWeeklyMix,
        },
        discover_with_stations: mockStations,
        artists_to_watch: mockEmergingArtists,
      },
      message: "Home data fetched successfully.",
    });
  }),

  // GET /home/mixes/:mixId/tracks — tracks for a personal mix
  http.get("*/home/mixes/:mixId/tracks", ({ params }) => {
    const mix = mockMixes.find((m) => m.id === params.mixId) ?? mockMixes[0];
    return HttpResponse.json({
      data: { mix, tracks: mockDiscoveryTracks },
    });
  }),

  // GET /home/albums-for-you — albums curated for the user
  http.get("*/home/albums-for-you", () => {
    return HttpResponse.json({
      data: mockAlbums,
      source: "followed_artists",
      pagination: { total: mockAlbums.length, limit: 20, offset: 0 },
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
      pagination: mockListeningHistoryMeta,
    });
  }),

  // GET /users/suggested — suggested users for "New Crew For You"
  http.get("*/users/suggested", () => {
    return HttpResponse.json({
      data: mockSuggestedUsers,
      pagination: mockSuggestedMeta,
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

  // GET /users/:userId — full public user profile
  http.get("*/users/:userId", ({ params }) => {
    return HttpResponse.json({
      data: {
        ...mockPublicUserBase,
        id: params.userId as string,
        username: `artist-${params.userId}`,
      } satisfies PublicUser,
    });
  }),
];
