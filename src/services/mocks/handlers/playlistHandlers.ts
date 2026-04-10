import { http, HttpResponse } from "msw";
import type {
  Playlist,
  PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlaylistDetails extends Playlist {
  tracks: PlaylistTrackItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MOCK_OWNER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const SECRET_TOKEN = "mock-secret-token-xyz";

const TRACK_IDS = {
  t1: "11111111-1111-1111-1111-111111111111",
  t2: "22222222-2222-2222-2222-222222222222",
  t3: "33333333-3333-3333-3333-333333333333",
  t4: "44444444-4444-4444-4444-444444444444",
  t5: "55555555-5555-5555-5555-555555555555",
  t6: "66666666-6666-6666-6666-666666666666",
  t7: "77777777-7777-7777-7777-777777777777",
  t8: "88888888-8888-8888-8888-888888888888",
  t9: "99999999-9999-9999-9999-999999999999",
  t10: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
};

// ─── Discover track IDs (must match discoverHandlers TRACK_IDS) ───────────────

const DISCOVER_TRACK_IDS = {
  t1: "e5f6a7b8-c9d0-4123-8fab-567890abcdef",
  t2: "22222222-2222-4222-8222-222222222222",
  t3: "33333333-3333-4333-8333-333333333333",
  t4: "44444444-4444-4444-8444-444444444444",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSummary(p: PlaylistDetails): Playlist {
  const { tracks: _tracks, ...summary } = p;
  return summary;
}

function nextPosition(playlist: PlaylistDetails): number {
  if (playlist.tracks.length === 0) return 1;
  return Math.max(...playlist.tracks.map((t) => t.position)) + 1;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockPlaylists: PlaylistDetails[] = [
  {
    playlist_id: "8d5a8f6c-7b4a-4c7a-9c25-9a9f1e3a12aa",
    owner_user_id: MOCK_OWNER_ID,
    name: "My Favorites",
    description: "A collection of my favorite tracks",
    is_public: true,
    created_at: "2026-01-10T10:00:00Z",
    track_count: 1,
    like_count: 5,
    cover_image: "https://picsum.photos/seed/my-favorites/300/300",
    tracks: [
      {
        track_id: TRACK_IDS.t1,
        position: 1,
        added_at: "2026-01-10T10:01:00Z",
        title: "Track One",
        artist_name: "Artist A",
        cover_image: "https://picsum.photos/seed/track-one/300/300",
      },
    ],
  },
  {
    playlist_id: "aaaabbbb-cccc-dddd-eeee-ffffffffffff",
    owner_user_id: MOCK_OWNER_ID,
    name: "Secret Vibes",
    description: "Private playlist — shareable by token only",
    is_public: false,
    secret_token: SECRET_TOKEN,
    created_at: "2026-02-01T08:00:00Z",
    track_count: 0,
    like_count: 0,
    cover_image: "https://picsum.photos/seed/secret-vibes/300/300",
    tracks: [],
  },
  {
    playlist_id: "cccc1111-2222-3333-4444-aaaaaaaaaaaa",
    owner_user_id: MOCK_OWNER_ID,
    name: "Late Night Drives",
    description: "Chill beats for the road",
    is_public: true,
    created_at: "2026-03-05T22:00:00Z",
    track_count: 0,
    like_count: 12,
    cover_image: "https://picsum.photos/seed/late-night/300/300",
    tracks: [],
  },
  {
    playlist_id: "dddd2222-3333-4444-5555-bbbbbbbbbbbb",
    owner_user_id: MOCK_OWNER_ID,
    name: "Gym Hits",
    description: "High energy workout tracks",
    is_public: true,
    created_at: "2026-03-10T07:00:00Z",
    track_count: 1,
    like_count: 20,
    cover_image: "https://picsum.photos/seed/gym-hits/300/300",
    tracks: [
      {
        track_id: TRACK_IDS.t2,
        position: 1,
        added_at: "2026-01-10T10:01:00Z",
        title: "Track Two",
        artist_name: "Artist B",
        cover_image: "https://picsum.photos/seed/track-2/300/300",
      },
    ],
  },
  {
    playlist_id: "eeee3333-4444-5555-6666-cccccccccccc",
    owner_user_id: MOCK_OWNER_ID,
    name: "Summer 2026",
    description: "Beach vibes and sun-soaked anthems",
    is_public: true,
    is_album_view: true,
    created_at: "2026-04-01T12:00:00Z",
    track_count: 5,
    like_count: 45,
    cover_image: "https://picsum.photos/seed/summer-2026/300/300",
    tracks: [
      {
        track_id: TRACK_IDS.t6,
        position: 1,
        added_at: "2026-04-01T12:01:00Z",
        title: "Sahar El Leil",
        artist_name: "Artist C",
        cover_image: "https://picsum.photos/seed/track-6/300/300",
      },
      {
        track_id: TRACK_IDS.t7,
        position: 2,
        added_at: "2026-04-01T12:02:00Z",
        title: "Hayatak Maaky",
        artist_name: "Artist C",
      },
      {
        track_id: TRACK_IDS.t8,
        position: 3,
        added_at: "2026-04-01T12:03:00Z",
        title: "Nedaa El Qalb",
        artist_name: "Artist D",
      },
      {
        track_id: TRACK_IDS.t9,
        position: 4,
        added_at: "2026-04-01T12:04:00Z",
        title: "Mawgood",
        artist_name: "Artist D",
      },
      {
        track_id: TRACK_IDS.t10,
        position: 5,
        added_at: "2026-04-01T12:05:00Z",
        title: "Dawam",
        artist_name: "Artist E",
      },
    ],
  },
  {
    playlist_id: "ffff4444-5555-6666-7777-dddddddddddd",
    owner_user_id: MOCK_OWNER_ID,
    name: "Late Night Chills",
    description: "Soft evening tracks for winding down",
    is_public: true,
    created_at: "2026-04-02T21:00:00Z",
    track_count: 3,
    like_count: 18,
    cover_image: "https://picsum.photos/seed/night-chills/300/300",
    tracks: [
      {
        track_id: TRACK_IDS.t3,
        position: 1,
        added_at: "2026-04-02T21:01:00Z",
        title: "Shababek'",
        artist_name: "Artist F",
      },
      {
        track_id: TRACK_IDS.t5,
        position: 2,
        added_at: "2026-04-02T21:02:00Z",
        title: "Elwa2t Eldaye3",
        artist_name: "Artist F",
      },
      {
        track_id: TRACK_IDS.t6,
        position: 3,
        added_at: "2026-04-02T21:03:00Z",
        title: "Sahar El Leil",
        artist_name: "Artist C",
      },
    ],
  },

  // ─── Generated Mixes (IDs must match mockMixes in discoverHandlers) ──────────

  {
    playlist_id: "55555555-5555-4555-8555-555555555555",
    owner_user_id: MOCK_OWNER_ID,
    name: "MIX 1",
    description: "27 tracks · Generated mix",
    is_public: true,
    cover_image: "https://picsum.photos/200/200?random=301",
    created_at: "2026-04-01T00:00:00Z",
    track_count: 4,
    like_count: 0,
    tracks: [
      {
        track_id: DISCOVER_TRACK_IDS.t1,
        position: 1,
        added_at: "2026-04-01T00:00:00Z",
        title: "Butterfly Effect",
        artist_name: "Travis Scott",
        cover_image: "https://picsum.photos/200/200?random=501",
        duration: 225,
        is_public: true,
        deleted_at: null,
        artist_id: "a1b2c3d4-e5f6-4790-8bcd-ef1234567890",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t2,
        position: 2,
        added_at: "2026-04-01T00:00:00Z",
        title: "Blinding Lights",
        artist_name: "The Weeknd",
        cover_image: "https://picsum.photos/200/200?random=401",
        duration: 200,
        is_public: true,
        deleted_at: null,
        artist_id: "b2c3d4e5-f6a7-4891-9cde-f01234567891",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t3,
        position: 3,
        added_at: "2026-04-01T00:00:00Z",
        title: "Levitating",
        artist_name: "Dua Lipa",
        cover_image: "https://picsum.photos/200/200?random=702",
        duration: 203,
        is_public: true,
        deleted_at: null,
        artist_id: "c3d4e5f6-a7b8-4902-ad12-123456789012",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t4,
        position: 4,
        added_at: "2026-04-01T00:00:00Z",
        title: "Bad Guy",
        artist_name: "Billie Eilish",
        cover_image: "https://picsum.photos/200/200?random=704",
        duration: 194,
        is_public: true,
        deleted_at: null,
        artist_id: "d4e5f6a7-b8c9-4013-bd23-234567890123",
      },
    ],
  },
  {
    playlist_id: "66666666-6666-4666-8666-666666666666",
    owner_user_id: MOCK_OWNER_ID,
    name: "MIX 2",
    description: "19 tracks · Generated mix",
    is_public: true,
    cover_image: "https://picsum.photos/200/200?random=302",
    created_at: "2026-04-01T00:00:00Z",
    track_count: 4,
    like_count: 0,
    tracks: [
      {
        track_id: DISCOVER_TRACK_IDS.t2,
        position: 1,
        added_at: "2026-04-01T00:00:00Z",
        title: "Blinding Lights",
        artist_name: "The Weeknd",
        cover_image: "https://picsum.photos/200/200?random=401",
        duration: 200,
        is_public: true,
        deleted_at: null,
        artist_id: "b2c3d4e5-f6a7-4891-9cde-f01234567891",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t3,
        position: 2,
        added_at: "2026-04-01T00:00:00Z",
        title: "Levitating",
        artist_name: "Dua Lipa",
        cover_image: "https://picsum.photos/200/200?random=702",
        duration: 203,
        is_public: true,
        deleted_at: null,
        artist_id: "c3d4e5f6-a7b8-4902-ad12-123456789012",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t4,
        position: 3,
        added_at: "2026-04-01T00:00:00Z",
        title: "Bad Guy",
        artist_name: "Billie Eilish",
        cover_image: "https://picsum.photos/200/200?random=704",
        duration: 194,
        is_public: true,
        deleted_at: null,
        artist_id: "d4e5f6a7-b8c9-4013-bd23-234567890123",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t1,
        position: 4,
        added_at: "2026-04-01T00:00:00Z",
        title: "Butterfly Effect",
        artist_name: "Travis Scott",
        cover_image: "https://picsum.photos/200/200?random=501",
        duration: 225,
        is_public: true,
        deleted_at: null,
        artist_id: "a1b2c3d4-e5f6-4790-8bcd-ef1234567890",
      },
    ],
  },
  {
    playlist_id: "77777777-7777-4777-8777-777777777777",
    owner_user_id: MOCK_OWNER_ID,
    name: "MIX 3",
    description: "23 tracks · Generated mix",
    is_public: true,
    cover_image: "https://picsum.photos/200/200?random=303",
    created_at: "2026-04-01T00:00:00Z",
    track_count: 4,
    like_count: 0,
    tracks: [
      {
        track_id: DISCOVER_TRACK_IDS.t3,
        position: 1,
        added_at: "2026-04-01T00:00:00Z",
        title: "Levitating",
        artist_name: "Dua Lipa",
        cover_image: "https://picsum.photos/200/200?random=702",
        duration: 203,
        is_public: true,
        deleted_at: null,
        artist_id: "c3d4e5f6-a7b8-4902-ad12-123456789012",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t4,
        position: 2,
        added_at: "2026-04-01T00:00:00Z",
        title: "Bad Guy",
        artist_name: "Billie Eilish",
        cover_image: "https://picsum.photos/200/200?random=704",
        duration: 194,
        is_public: true,
        deleted_at: null,
        artist_id: "d4e5f6a7-b8c9-4013-bd23-234567890123",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t1,
        position: 3,
        added_at: "2026-04-01T00:00:00Z",
        title: "Butterfly Effect",
        artist_name: "Travis Scott",
        cover_image: "https://picsum.photos/200/200?random=501",
        duration: 225,
        is_public: true,
        deleted_at: null,
        artist_id: "a1b2c3d4-e5f6-4790-8bcd-ef1234567890",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t2,
        position: 4,
        added_at: "2026-04-01T00:00:00Z",
        title: "Blinding Lights",
        artist_name: "The Weeknd",
        cover_image: "https://picsum.photos/200/200?random=401",
        duration: 200,
        is_public: true,
        deleted_at: null,
        artist_id: "b2c3d4e5-f6a7-4891-9cde-f01234567891",
      },
    ],
  },
  {
    playlist_id: "88888888-8888-4888-8888-888888888888",
    owner_user_id: MOCK_OWNER_ID,
    name: "MIX 4",
    description: "31 tracks · Generated mix",
    is_public: true,
    cover_image: "https://picsum.photos/200/200?random=304",
    created_at: "2026-04-01T00:00:00Z",
    track_count: 4,
    like_count: 0,
    tracks: [
      {
        track_id: DISCOVER_TRACK_IDS.t4,
        position: 1,
        added_at: "2026-04-01T00:00:00Z",
        title: "Bad Guy",
        artist_name: "Billie Eilish",
        cover_image: "https://picsum.photos/200/200?random=704",
        duration: 194,
        is_public: true,
        deleted_at: null,
        artist_id: "d4e5f6a7-b8c9-4013-bd23-234567890123",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t1,
        position: 2,
        added_at: "2026-04-01T00:00:00Z",
        title: "Butterfly Effect",
        artist_name: "Travis Scott",
        cover_image: "https://picsum.photos/200/200?random=501",
        duration: 225,
        is_public: true,
        deleted_at: null,
        artist_id: "a1b2c3d4-e5f6-4790-8bcd-ef1234567890",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t2,
        position: 3,
        added_at: "2026-04-01T00:00:00Z",
        title: "Blinding Lights",
        artist_name: "The Weeknd",
        cover_image: "https://picsum.photos/200/200?random=401",
        duration: 200,
        is_public: true,
        deleted_at: null,
        artist_id: "b2c3d4e5-f6a7-4891-9cde-f01234567891",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t3,
        position: 4,
        added_at: "2026-04-01T00:00:00Z",
        title: "Levitating",
        artist_name: "Dua Lipa",
        cover_image: "https://picsum.photos/200/200?random=702",
        duration: 203,
        is_public: true,
        deleted_at: null,
        artist_id: "c3d4e5f6-a7b8-4902-ad12-123456789012",
      },
    ],
  },
  {
    playlist_id: "99999999-9999-4999-8999-999999999999",
    owner_user_id: MOCK_OWNER_ID,
    name: "MIX 5",
    description: "15 tracks · Generated mix",
    is_public: true,
    cover_image: "https://picsum.photos/200/200?random=305",
    created_at: "2026-04-01T00:00:00Z",
    track_count: 4,
    like_count: 0,
    tracks: [
      {
        track_id: DISCOVER_TRACK_IDS.t1,
        position: 1,
        added_at: "2026-04-01T00:00:00Z",
        title: "Butterfly Effect",
        artist_name: "Travis Scott",
        cover_image: "https://picsum.photos/200/200?random=501",
        duration: 225,
        is_public: true,
        deleted_at: null,
        artist_id: "a1b2c3d4-e5f6-4790-8bcd-ef1234567890",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t3,
        position: 2,
        added_at: "2026-04-01T00:00:00Z",
        title: "Levitating",
        artist_name: "Dua Lipa",
        cover_image: "https://picsum.photos/200/200?random=702",
        duration: 203,
        is_public: true,
        deleted_at: null,
        artist_id: "c3d4e5f6-a7b8-4902-ad12-123456789012",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t4,
        position: 3,
        added_at: "2026-04-01T00:00:00Z",
        title: "Bad Guy",
        artist_name: "Billie Eilish",
        cover_image: "https://picsum.photos/200/200?random=704",
        duration: 194,
        is_public: true,
        deleted_at: null,
        artist_id: "d4e5f6a7-b8c9-4013-bd23-234567890123",
      },
      {
        track_id: DISCOVER_TRACK_IDS.t2,
        position: 4,
        added_at: "2026-04-01T00:00:00Z",
        title: "Blinding Lights",
        artist_name: "The Weeknd",
        cover_image: "https://picsum.photos/200/200?random=401",
        duration: 200,
        is_public: true,
        deleted_at: null,
        artist_id: "b2c3d4e5-f6a7-4891-9cde-f01234567891",
      },
    ],
  },
];

// ─── Liked playlists (owned by OTHER users, liked by current user) ─────────────

const mockLikedPlaylists: PlaylistDetails[] = [
  {
    playlist_id: "like1111-aaaa-bbbb-cccc-111111111111",
    owner_user_id: "other-user-0001",
    name: "Chill House Mix",
    description: "Deep house for Sunday mornings",
    is_public: true,
    created_at: "2026-01-20T09:00:00Z",
    track_count: 1,
    like_count: 87,
    cover_image: "https://picsum.photos/seed/chill-house/300/300",
    tracks: [
      {
        track_id: TRACK_IDS.t1,
        position: 1,
        added_at: "2026-01-10T10:01:00Z",
        title: "Track One",
        artist_name: "Artist A",
      },
    ],
  },
  {
    playlist_id: "like2222-bbbb-cccc-dddd-222222222222",
    owner_user_id: "other-user-0002",
    name: "Arabic Classics",
    description: "Timeless Arabic songs",
    is_public: true,
    created_at: "2026-02-14T12:00:00Z",
    track_count: 0,
    like_count: 210,
    cover_image: "https://picsum.photos/seed/arabic-classics/300/300",
    tracks: [],
  },
  {
    playlist_id: "like3333-cccc-dddd-eeee-333333333333",
    owner_user_id: "other-user-0003",
    name: "Lo-Fi Study",
    description: "Focus beats for long sessions",
    is_public: true,
    created_at: "2026-03-01T14:00:00Z",
    track_count: 0,
    like_count: 445,
    cover_image: "https://picsum.photos/seed/lofi-study/300/300",
    tracks: [],
  },
  {
    playlist_id: "like4444-dddd-eeee-ffff-444444444444",
    owner_user_id: "other-user-0004",
    name: "Mahraganat Bangers",
    description: "The best mahraganat tracks",
    is_public: true,
    created_at: "2026-03-15T18:00:00Z",
    track_count: 0,
    like_count: 320,
    cover_image: "https://picsum.photos/seed/mahraganat/300/300",
    tracks: [],
  },
  {
    playlist_id: "like5555-ffff-0000-1111-555555555555",
    owner_user_id: "other-user-0005",
    name: "Electronic Dance",
    description: "EDM hits from top DJs",
    is_public: true,
    is_album_view: true,
    created_at: "2026-01-05T20:00:00Z",
    track_count: 4,
    like_count: 1250,
    cover_image: "https://picsum.photos/seed/edm-hits/300/300",
    tracks: [
      {
        track_id: TRACK_IDS.t2,
        position: 1,
        added_at: "2026-01-05T20:01:00Z",
        title: "Seneen",
        artist_name: "Artist G",
      },
      {
        track_id: TRACK_IDS.t6,
        position: 2,
        added_at: "2026-01-05T20:02:00Z",
        title: "Sahar El Leil",
        artist_name: "Artist C",
      },
      {
        track_id: TRACK_IDS.t8,
        position: 3,
        added_at: "2026-01-05T20:03:00Z",
        title: "Nedaa El Qalb",
        artist_name: "Artist D",
      },
      {
        track_id: TRACK_IDS.t9,
        position: 4,
        added_at: "2026-01-05T20:04:00Z",
        title: "Mawgood",
        artist_name: "Artist D",
      },
    ],
  },
  {
    playlist_id: "like6666-0000-1111-2222-666666666666",
    owner_user_id: "other-user-0006",
    name: "Jazz Café",
    description: "Smooth jazz for coffee shops",
    is_public: true,
    created_at: "2026-02-20T11:00:00Z",
    track_count: 3,
    like_count: 89,
    cover_image: "https://picsum.photos/seed/jazz-cafe/300/300",
    tracks: [
      {
        track_id: TRACK_IDS.t3,
        position: 1,
        added_at: "2026-02-20T11:01:00Z",
        title: "Shababek'",
        artist_name: "Artist F",
      },
      {
        track_id: TRACK_IDS.t5,
        position: 2,
        added_at: "2026-02-20T11:02:00Z",
        title: "Elwa2t Eldaye3",
        artist_name: "Artist F",
      },
      {
        track_id: TRACK_IDS.t8,
        position: 3,
        added_at: "2026-02-20T11:03:00Z",
        title: "Nedaa El Qalb",
        artist_name: "Artist D",
      },
    ],
  },
];

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const playlistHandlers = [
  // ── POST /playlists — create a playlist ──────────────────────────────────────
  http.post("*/playlists", async ({ request }) => {
    let body: { name?: string; description?: string; is_public?: boolean };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return HttpResponse.json(
        {
          error: {
            code: "INVALID_JSON",
            message: "Failed to parse request body",
          },
        },
        { status: 400 },
      );
    }

    if (!body.name?.trim()) {
      return HttpResponse.json(
        { error: { code: "VALIDATION_FAILED", message: "name is required" } },
        { status: 400 },
      );
    }

    const newPlaylist: PlaylistDetails = {
      playlist_id: crypto.randomUUID(),
      owner_user_id: MOCK_OWNER_ID,
      name: body.name.trim(),
      description: body.description ?? null,
      is_public: body.is_public ?? true,
      created_at: new Date().toISOString(),
      track_count: 0,
      like_count: 0,
      cover_image: `https://picsum.photos/seed/${encodeURIComponent(body.name)}/300/300`,
      tracks: [],
    };

    mockPlaylists.push(newPlaylist);
    return HttpResponse.json(
      {
        data: toSummary(newPlaylist),
        message: "Playlist created successfully.",
      },
      { status: 201 },
    );
  }),

  // ── GET /playlists — mine=true + optional filter=liked ───────────────────────
  http.get("*/playlists", ({ request }) => {
    const url = new URL(request.url);
    const mine = url.searchParams.get("mine") === "true";
    const filter = url.searchParams.get("filter");
    const q = url.searchParams.get("q")?.toLowerCase() ?? "";
    const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
    const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
    const subtypeFilter = url.searchParams.get("subtype");

    let results: PlaylistDetails[];

    if (mine && filter === "liked") {
      results = [...mockLikedPlaylists];
    } else if (mine) {
      results = mockPlaylists.filter((p) => p.owner_user_id === MOCK_OWNER_ID);
    } else {
      results = mockPlaylists.filter((p) => p.is_public);
    }

    if (q) results = results.filter((p) => p.name.toLowerCase().includes(q));
    if (subtypeFilter)
      results = results.filter((p) => p.subtype === subtypeFilter);

    const total = results.length;
    const items = results.slice(offset, offset + limit).map(toSummary);

    return HttpResponse.json({
      data: { items, meta: { limit, offset, total } },
      message: "Playlists fetched successfully.",
    });
  }),

  // ── GET /playlists/:id/tracks — paginated track listing ──────────────────────
  http.get("*/playlists/:playlist_id/tracks", ({ params, request }) => {
    const { playlist_id } = params;
    const url = new URL(request.url);
    const secretToken = url.searchParams.get("secret_token");
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const perPage = parseInt(url.searchParams.get("limit") ?? "20", 10);

    const playlist =
      mockPlaylists.find((p) => p.playlist_id === playlist_id) ??
      mockLikedPlaylists.find((p) => p.playlist_id === playlist_id);

    if (!playlist) {
      return HttpResponse.json(
        {
          error: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found." },
        },
        { status: 404 },
      );
    }

    if (!playlist.is_public) {
      const isOwner = playlist.owner_user_id === MOCK_OWNER_ID;
      if (!isOwner && secretToken !== SECRET_TOKEN) {
        return HttpResponse.json(
          {
            error: {
              code: "PLAYLIST_ACCESS_DENIED",
              message: "You do not have access to this playlist.",
            },
          },
          { status: 403 },
        );
      }
    }

    const totalItems = playlist.tracks.length;
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    const start = (page - 1) * perPage;
    const tracks = playlist.tracks.slice(start, start + perPage);

    return HttpResponse.json({
      data: {
        playlist_id,
        tracks,
        pagination: {
          page,
          per_page: perPage,
          total_items: totalItems,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      },
      message: "Playlist tracks fetched successfully.",
    });
  }),

  // ── GET /playlists/:id — playlist details ────────────────────────────────────
  http.get("*/playlists/:playlist_id", ({ params, request }) => {
    const { playlist_id } = params;
    const url = new URL(request.url);
    const secretToken = url.searchParams.get("secret_token");
    const includeTracks = url.searchParams.get("include_tracks") !== "false";

    const playlist =
      mockPlaylists.find((p) => p.playlist_id === playlist_id) ??
      mockLikedPlaylists.find((p) => p.playlist_id === playlist_id);

    if (!playlist) {
      return HttpResponse.json(
        {
          error: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found." },
        },
        { status: 404 },
      );
    }

    if (!playlist.is_public) {
      const isOwner = playlist.owner_user_id === MOCK_OWNER_ID;
      if (!isOwner && secretToken !== SECRET_TOKEN) {
        return HttpResponse.json(
          {
            error: {
              code: "PLAYLIST_ACCESS_DENIED",
              message: "You do not have access to this playlist.",
            },
          },
          { status: 403 },
        );
      }
    }

    return HttpResponse.json({
      data: includeTracks ? playlist : toSummary(playlist),
      message: "Playlist fetched successfully.",
    });
  }),

  // ── PATCH /playlists/:id/tracks/reorder — must precede generic PATCH ─────────
  http.patch(
    "*/playlists/:playlist_id/tracks/reorder",
    async ({ params, request }) => {
      const { playlist_id } = params;

      let body: { items: { track_id: string; position: number }[] };
      try {
        body = (await request.json()) as typeof body;
      } catch {
        return HttpResponse.json(
          {
            error: {
              code: "INVALID_JSON",
              message: "Failed to parse request body",
            },
          },
          { status: 400 },
        );
      }

      const playlist = mockPlaylists.find((p) => p.playlist_id === playlist_id);
      if (!playlist) {
        return HttpResponse.json(
          {
            error: {
              code: "PLAYLIST_NOT_FOUND",
              message: "Playlist not found.",
            },
          },
          { status: 404 },
        );
      }

      const incomingIds = body.items.map((i) => i.track_id).sort();
      const existingIds = playlist.tracks.map((t) => t.track_id).sort();
      if (JSON.stringify(incomingIds) !== JSON.stringify(existingIds)) {
        return HttpResponse.json(
          {
            error: {
              code: "PLAYLIST_REORDER_REQUIRES_FULL_LIST",
              message: "Reorder requires a full list of playlist tracks.",
            },
          },
          { status: 422 },
        );
      }

      playlist.tracks = body.items.map((item) => ({
        track_id: item.track_id,
        position: item.position,
        added_at:
          playlist.tracks.find((t) => t.track_id === item.track_id)?.added_at ??
          new Date().toISOString(),
      }));
      playlist.tracks.sort((a, b) => a.position - b.position);

      return HttpResponse.json({
        data: playlist,
        message: "Playlist tracks reordered successfully.",
      });
    },
  ),

  // ── PATCH /playlists/:id — update metadata (multipart/form-data) ─────────────
  http.patch("*/playlists/:playlist_id", async ({ params, request }) => {
    const { playlist_id } = params;

    const playlist = mockPlaylists.find((p) => p.playlist_id === playlist_id);
    if (!playlist) {
      return HttpResponse.json(
        {
          error: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found." },
        },
        { status: 404 },
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return HttpResponse.json(
        {
          error: {
            code: "INVALID_FORM_DATA",
            message: "Failed to parse form data",
          },
        },
        { status: 400 },
      );
    }

    const name = formData.get("name");
    const description = formData.get("description");
    const isPublic = formData.get("is_public");
    const subtype = formData.get("subtype");
    const slug = formData.get("slug");
    const releaseDate = formData.get("release_date");
    const genreId = formData.get("genre_id");
    const removeCoverImage = formData.get("remove_cover_image");
    const coverImage = formData.get("cover_image");
    const tags = formData.getAll("tags[]") as string[];

    if (name !== null) playlist.name = name as string;
    if (description !== null)
      playlist.description = (description as string) || null;
    if (isPublic !== null) playlist.is_public = isPublic === "true";
    if (subtype !== null) playlist.subtype = subtype as Playlist["subtype"];
    if (slug !== null) playlist.slug = slug as string;
    if (releaseDate !== null)
      playlist.release_date = (releaseDate as string) || null;
    if (genreId !== null) playlist.genre_id = (genreId as string) || null;
    if (tags.length > 0) playlist.tags = tags.map((id) => ({ id, name: id }));
    if (removeCoverImage === "true") playlist.cover_image = null;
    else if (coverImage instanceof File) {
      playlist.cover_image = URL.createObjectURL(coverImage);
    }

    return HttpResponse.json({
      data: toSummary(playlist),
      message: "Playlist updated successfully.",
    });
  }),

  // ── DELETE /playlists/:id/tracks/:track_id — must precede generic DELETE ──────
  http.delete("*/playlists/:playlist_id/tracks/:track_id", ({ params }) => {
    const { playlist_id, track_id } = params;

    const playlist = mockPlaylists.find((p) => p.playlist_id === playlist_id);
    if (!playlist) {
      return HttpResponse.json(
        {
          error: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found." },
        },
        { status: 404 },
      );
    }

    const trackIndex = playlist.tracks.findIndex(
      (t) => t.track_id === track_id,
    );
    if (trackIndex === -1) {
      return HttpResponse.json(
        {
          error: {
            code: "PLAYLIST_TRACK_NOT_FOUND",
            message: "Track not found in this playlist.",
          },
        },
        { status: 404 },
      );
    }

    playlist.tracks.splice(trackIndex, 1);
    playlist.tracks = playlist.tracks.map((t, idx) => ({
      ...t,
      position: idx + 1,
    }));
    playlist.track_count = playlist.tracks.length;

    return HttpResponse.json({
      data: playlist,
      message: "Track removed from playlist successfully.",
    });
  }),

  // ── DELETE /playlists/:id — delete a playlist ─────────────────────────────────
  http.delete("*/playlists/:playlist_id", ({ params }) => {
    const { playlist_id } = params;
    const index = mockPlaylists.findIndex((p) => p.playlist_id === playlist_id);

    if (index === -1) {
      return HttpResponse.json(
        {
          error: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found." },
        },
        { status: 404 },
      );
    }

    mockPlaylists.splice(index, 1);
    return HttpResponse.json({
      data: { success: true },
      message: "Playlist deleted successfully.",
    });
  }),

  // ── POST /playlists/:id/tracks — add a track ──────────────────────────────────
  http.post("*/playlists/:playlist_id/tracks", async ({ params, request }) => {
    const { playlist_id } = params;

    let body: { track_id: string; position?: number };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return HttpResponse.json(
        {
          error: {
            code: "INVALID_JSON",
            message: "Failed to parse request body",
          },
        },
        { status: 400 },
      );
    }

    if (!body.track_id) {
      return HttpResponse.json(
        {
          error: { code: "VALIDATION_FAILED", message: "track_id is required" },
        },
        { status: 400 },
      );
    }

    const playlist = mockPlaylists.find((p) => p.playlist_id === playlist_id);
    if (!playlist) {
      return HttpResponse.json(
        {
          error: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found." },
        },
        { status: 404 },
      );
    }

    if (playlist.tracks.some((t) => t.track_id === body.track_id)) {
      return HttpResponse.json(
        {
          error: {
            code: "PLAYLIST_TRACK_ALREADY_EXISTS",
            message: "Track already exists in this playlist.",
          },
        },
        { status: 409 },
      );
    }

    const insertPosition = body.position ?? nextPosition(playlist);
    const newItem: PlaylistTrackItem = {
      track_id: body.track_id,
      position: insertPosition,
      added_at: new Date().toISOString(),
    };

    if (body.position !== undefined) {
      playlist.tracks = playlist.tracks.map((t) =>
        t.position >= insertPosition ? { ...t, position: t.position + 1 } : t,
      );
    }

    playlist.tracks.push(newItem);
    playlist.tracks.sort((a, b) => a.position - b.position);
    playlist.track_count = playlist.tracks.length;

    return HttpResponse.json(
      { data: playlist, message: "Track added to playlist successfully." },
      { status: 201 },
    );
  }),

  // ── GET /playlists/:id/embed ───────────────────────────────────────────────────
  http.get("*/playlists/:playlist_id/embed", ({ params, request }) => {
    const { playlist_id } = params;
    const url = new URL(request.url);
    const width = url.searchParams.get("width") ?? "600";
    const height = url.searchParams.get("height") ?? "200";
    const theme = url.searchParams.get("theme") ?? "light";
    const autoplay = url.searchParams.get("autoplay") === "true";

    const playlist =
      mockPlaylists.find((p) => p.playlist_id === playlist_id) ??
      mockLikedPlaylists.find((p) => p.playlist_id === playlist_id);

    if (!playlist) {
      return HttpResponse.json(
        {
          error: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found." },
        },
        { status: 404 },
      );
    }

    const embedBase = `https://api.rythmify.com/embed/playlists/${playlist_id}`;
    const embedUrl = `${embedBase}?theme=${theme}&autoplay=${autoplay}`;
    const iframeHtml = `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" allow="autoplay"></iframe>`;

    return HttpResponse.json({
      data: { embed_url: embedUrl, iframe_html: iframeHtml },
      message: "Playlist embed code generated successfully.",
    });
  }),
];
