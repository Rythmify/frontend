import { http, HttpResponse } from "msw";
import type {
  Playlist,
  PlaylistDetails,
  PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_OWNER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const SECRET_TOKEN = "mock-secret-token-xyz";

let mockPlaylists: PlaylistDetails[] = [
  {
    playlist_id: "8d5a8f6c-7b4a-4c7a-9c25-9a9f1e3a12aa",
    owner_user_id: MOCK_OWNER_ID,
    name: "My Favorites",
    description: "A collection of my favorite tracks",
    is_public: true,
    created_at: "2026-01-10T10:00:00Z",
    track_count: 2,
    like_count: 5,
    cover_image: "https://picsum.photos/seed/my-favorites/300/300",
    tracks: [
      {
        track_id: "track-1",
        position: 1,
        added_at: "2026-01-10T10:01:00Z",
      },
    ],
  },
  {
    playlist_id: "aaaabbbb-cccc-dddd-eeee-ffffffffffff",
    owner_user_id: MOCK_OWNER_ID,
    name: "Secret Vibes",
    description: "Private playlist — shareable by token only",
    is_public: false,
    created_at: "2026-02-01T08:00:00Z",
    track_count: 1,
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
    track_count: 3,
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
    track_count: 4,
    like_count: 20,
    cover_image: "https://picsum.photos/seed/gym-hits/300/300",
    tracks: [
      {
        track_id: "track-2",
        position: 1,
        added_at: "2026-01-10T10:01:00Z",
      },
    ],
  },
];

// ─── Liked playlists (owned by OTHER users, liked by the current user) ────────

let mockLikedPlaylists: PlaylistDetails[] = [
  {
    playlist_id: "like1111-aaaa-bbbb-cccc-111111111111",
    owner_user_id: "other-user-0001",
    name: "Chill House Mix",
    description: "Deep house for Sunday mornings",
    is_public: true,
    created_at: "2026-01-20T09:00:00Z",
    track_count: 5,
    like_count: 87,
    cover_image: "https://picsum.photos/seed/chill-house/300/300",
    tracks: [
      {
        track_id: "track-1",
        position: 1,
        added_at: "2026-01-10T10:01:00Z",
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
    track_count: 8,
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
    track_count: 12,
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
    track_count: 6,
    like_count: 320,
    cover_image: "https://picsum.photos/seed/mahraganat/300/300",
    tracks: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSummary(p: PlaylistDetails): Playlist {
  const { tracks: _tracks, ...summary } = p;
  return summary;
}

function nextPosition(playlist: PlaylistDetails): number {
  if (playlist.tracks.length === 0) return 1;
  return Math.max(...playlist.tracks.map((t) => t.position)) + 1;
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const playlistHandlers = [
  // POST /playlists — create a playlist
  http.post("http://localhost:8080/api/v1/playlists", async ({ request }) => {
    let body;
    try {
      body = (await request.json()) as {
        name: string;
        description?: string;
        is_public?: boolean;
      };
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

  // GET /playlists — handles mine=true + filter=created|liked
  http.get("*/playlists", ({ request }) => {
    const url = new URL(request.url);
    const mine = url.searchParams.get("mine") === "true";
    const filter = url.searchParams.get("filter"); // "created" | "liked" | null
    const q = url.searchParams.get("q")?.toLowerCase() ?? "";
    const limit = parseInt(url.searchParams.get("limit") ?? "20");
    const offset = parseInt(url.searchParams.get("offset") ?? "0");

    let results: PlaylistDetails[];

    if (mine && filter === "liked") {
      // Return the liked playlists list
      results = [...mockLikedPlaylists];
    } else if (mine) {
      // Default: filter=created or omitted → own playlists
      results = mockPlaylists.filter((p) => p.owner_user_id === MOCK_OWNER_ID);
    } else {
      // Public browse
      results = mockPlaylists.filter((p) => p.is_public);
    }

    if (q) results = results.filter((p) => p.name.toLowerCase().includes(q));

    const total = results.length;
    const items = results.slice(offset, offset + limit).map(toSummary);

    return HttpResponse.json({
      data: { items, meta: { limit, offset, total } },
      message: "Playlists fetched successfully.",
    });
  }),

  // GET /playlists/:id — get playlist details
  http.get("*/playlists/:playlist_id", ({ request, params }) => {
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

    if (!playlist.is_public && secretToken !== SECRET_TOKEN) {
      const isOwner = playlist.owner_user_id === MOCK_OWNER_ID;
      if (!isOwner) {
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

  // PATCH /playlists/:id/tracks/reorder — must be before generic PATCH
  http.patch(
    "*/playlists/:playlist_id/tracks/reorder",
    async ({ params, request }) => {
      const { playlist_id } = params;
      let body;
      try {
        body = (await request.json()) as {
          items: { track_id: string; position: number }[];
        };
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

  // PATCH /playlists/:id — update metadata
  http.patch("*/playlists/:playlist_id", async ({ params, request }) => {
    const { playlist_id } = params;
    let body;
    try {
      body = (await request.json()) as {
        name?: string;
        description?: string | null;
        is_public?: boolean;
      };
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
          error: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found." },
        },
        { status: 404 },
      );
    }

    if (body.name !== undefined) playlist.name = body.name;
    if (body.description !== undefined) playlist.description = body.description;
    if (body.is_public !== undefined) playlist.is_public = body.is_public;

    return HttpResponse.json({
      data: toSummary(playlist),
      message: "Playlist updated successfully.",
    });
  }),

  // DELETE /playlists/:id/tracks/:track_id — must be before generic DELETE
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

  // DELETE /playlists/:id — delete a playlist
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

  // POST /playlists/:id/tracks — add a track
  http.post(
    "http://localhost:8080/api/v1/playlists/:playlist_id/tracks",
    async ({ params, request }) => {
      try {
        const { playlist_id } = params;
        let body;
        try {
          body = (await request.json()) as {
            track_id: string;
            position?: number;
          };
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
              error: {
                code: "VALIDATION_FAILED",
                message: "track_id is required",
              },
            },
            { status: 400 },
          );
        }

        const playlist = mockPlaylists.find(
          (p) => p.playlist_id === playlist_id,
        );
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
            t.position >= insertPosition
              ? { ...t, position: t.position + 1 }
              : t,
          );
        }

        playlist.tracks.push(newItem);
        playlist.tracks.sort((a, b) => a.position - b.position);
        playlist.track_count = playlist.tracks.length;

        return HttpResponse.json(
          { data: playlist, message: "Track added to playlist successfully." },
          { status: 201 },
        );
      } catch (error) {
        console.error("POST /playlists/:playlist_id/tracks exception:", error);
        return HttpResponse.json(
          {
            error: {
              code: "HANDLER_EXCEPTION",
              message: "Unexpected error in playlist track handler",
            },
          },
          { status: 500 },
        );
      }
    },
  ),

  // GET /playlists/:id/embed
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
