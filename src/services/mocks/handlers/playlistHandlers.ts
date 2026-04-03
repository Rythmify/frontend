import { http, HttpResponse } from "msw";
import type {
  Playlist,
  PlaylistDetails,
  PlaylistTrackItem,
} from "@/services/api/playlist/playlist.service";

// ─── Mock Data ────────────────────────────────────────────────────────────────

let mockPlaylists: PlaylistDetails[] = [
  {
    playlist_id: "8d5a8f6c-7b4a-4c7a-9c25-9a9f1e3a12aa",
    owner_user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "My Favorites",
    description: "A collection of my favorite tracks",
    is_public: true,
    created_at: "2026-01-10T10:00:00Z",
    track_count: 2,
    like_count: 5,
    tracks: [
      {
        track_id: "e5f6a7b8-c9d0-1234-efab-567890abcdef",
        position: 1,
        added_at: "2026-01-10T10:01:00Z",
      },
      {
        track_id: "11111111-2222-3333-4444-555555555555",
        position: 2,
        added_at: "2026-01-10T10:02:00Z",
      },
    ],
  },
  {
    playlist_id: "aaaabbbb-cccc-dddd-eeee-ffffffffffff",
    owner_user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Secret Vibes",
    description: "Private playlist — shareable by token only",
    is_public: false,
    created_at: "2026-02-01T08:00:00Z",
    track_count: 1,
    like_count: 0,
    tracks: [
      {
        track_id: "99999999-aaaa-bbbb-cccc-dddddddddddd",
        position: 1,
        added_at: "2026-02-01T08:01:00Z",
      },
    ],
  },
];

const SECRET_TOKEN = "mock-secret-token-xyz";

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
    } catch (e) {
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
      owner_user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      name: body.name.trim(),
      description: body.description ?? null,
      is_public: body.is_public ?? true,
      created_at: new Date().toISOString(),
      track_count: 0,
      like_count: 0,
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

  // GET /playlists — list playlists (mine=true → own, else public)
  http.get("*/playlists", ({ request }) => {
    const url = new URL(request.url);
    const mine = url.searchParams.get("mine") === "true";
    const q = url.searchParams.get("q")?.toLowerCase() ?? "";
    const ownerId = url.searchParams.get("owner_user_id");
    const limit = parseInt(url.searchParams.get("limit") ?? "20");
    const offset = parseInt(url.searchParams.get("offset") ?? "0");

    let results = mine
      ? mockPlaylists.filter(
          (p) => p.owner_user_id === "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        )
      : mockPlaylists.filter((p) => p.is_public);

    if (ownerId) results = results.filter((p) => p.owner_user_id === ownerId);
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

    const playlist = mockPlaylists.find((p) => p.playlist_id === playlist_id);

    if (!playlist) {
      return HttpResponse.json(
        {
          error: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found." },
        },
        { status: 404 },
      );
    }

    // Private playlists require the secret token (or owner auth, mocked as always owner)
    if (!playlist.is_public && secretToken !== SECRET_TOKEN) {
      // In mock, we allow owner access — for non-owner without token, deny
      // Here we just check the token since auth is mocked
      const isOwner =
        playlist.owner_user_id === "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
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

    const responseData = includeTracks ? playlist : toSummary(playlist);

    return HttpResponse.json({
      data: responseData,
      message: "Playlist fetched successfully.",
    });
  }),

  // PATCH /playlists/:id — update playlist metadata
  http.patch(
    "*/playlists/:playlist_id/tracks/reorder",
    async ({ params, request }) => {
      // This must be matched BEFORE the generic PATCH /playlists/:id below
      const { playlist_id } = params;
      let body;
      try {
        body = (await request.json()) as {
          items: { track_id: string; position: number }[];
        };
      } catch (e) {
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

  http.patch("*/playlists/:playlist_id", async ({ params, request }) => {
    const { playlist_id } = params;
    let body;
    try {
      body = (await request.json()) as {
        name?: string;
        description?: string | null;
        is_public?: boolean;
      };
    } catch (e) {
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

  // DELETE /playlists/:id — delete a playlist
  http.delete("*/playlists/:playlist_id/tracks/:track_id", ({ params }) => {
    // Must match before the generic DELETE /playlists/:id below
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
    // Re-normalize positions
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
        } catch (e) {
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

        console.debug("POST /playlists/:playlist_id/tracks mock call", {
          playlist_id,
          body,
          playlists: mockPlaylists.map((p) => ({
            playlist_id: p.playlist_id,
            track_count: p.track_count,
          })),
        });

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

        // Shift existing tracks at or after the insert position
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
        console.error(
          "playlistHandlers POST /playlists/:playlist_id/tracks exception:",
          error,
        );
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

  // GET /playlists/:id/embed — generate embed code
  http.get("*/playlists/:playlist_id/embed", ({ params, request }) => {
    const { playlist_id } = params;
    const url = new URL(request.url);
    const width = url.searchParams.get("width") ?? "600";
    const height = url.searchParams.get("height") ?? "200";
    const theme = url.searchParams.get("theme") ?? "light";
    const autoplay = url.searchParams.get("autoplay") === "true";

    const playlist = mockPlaylists.find((p) => p.playlist_id === playlist_id);
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
