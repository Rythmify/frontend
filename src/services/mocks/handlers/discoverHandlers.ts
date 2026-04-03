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
} from "../../api/discover.service";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockMixes: PersonalMix[] = [
  {
    id: "mix-1",
    label: "Mixed for You",
    flavor: "listening_history",
    cover_url: "https://picsum.photos/200/200?random=301",
    track_count: 27,
    generated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "mix-2",
    label: "Based on Your Recent Listening",
    flavor: "taste_profile",
    cover_url: "https://picsum.photos/200/200?random=302",
    track_count: 19,
    generated_at: "2026-04-01T00:00:00Z",
  },
];

const mockHotTrack: FeedTrack = {
  track_id: "track-hot-1",
  title: "Blinding Lights",
  artist_id: "artist-1",
  artist_username: "theweeknd",
  artist_display_name: "The Weeknd",
  cover_url: "https://picsum.photos/200/200?random=401",
  genre: "Synthwave",
  genre_id: "genre-synthwave",
  like_count: 5678,
  repost_count: 2341,
  play_count: 45600,
  comment_count: 892,
  duration: 200,
  uploaded_at: "2026-03-01T09:15:00Z",
  audio_url: "https://example.com/audio/blinding-lights.mp3",
};

const mockHotForYou: HotForYou = {
  track: mockHotTrack,
  valid_until: "2026-04-02T00:00:00Z",
};

const mockStations: HomeStation[] = [
  {
    id: "station-1",
    name: "Based on Drake",
    seed_artist: {
      id: "artist-drake",
      display_name: "Drake",
      username: "drake",
      avatar_url: "https://picsum.photos/150/150?random=501",
    },
    cover_url: "https://picsum.photos/200/200?random=501",
    track_count: 50,
  },
  {
    id: "station-2",
    name: "Based on SZA",
    seed_artist: {
      id: "artist-sza",
      display_name: "SZA",
      username: "sza",
      avatar_url: "https://picsum.photos/150/150?random=502",
    },
    cover_url: "https://picsum.photos/200/200?random=502",
    track_count: 50,
  },
];

// "New crew for you" uses the same shape as suggested users —
// artists_to_watch will be updated to SuggestedUser[] in the service file later.
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

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const discoverHandlers = [
  // GET /home — main discover page data (all sections in one call)
  http.get("*/home", () => {
    return HttpResponse.json({
      data: {
        mixed_for_you: mockMixes,
        more_of_what_you_like: mockMixes,
        hot_for_you: mockHotForYou,
        discover_with_stations: mockStations,
        // Same shape as suggested users — service file type will be updated later
        artists_to_watch: mockSuggestedUsers,
      },
      message: "Home data fetched successfully.",
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

  // GET /users/suggested — suggested artists to follow (sidebar + new crew)
  http.get("*/users/suggested", () => {
    return HttpResponse.json({
      data: {
        items: mockSuggestedUsers,
        meta: mockSuggestedMeta,
      },
    });
  }),
];
