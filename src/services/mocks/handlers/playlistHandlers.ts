import { http, HttpResponse } from "msw";

// Minimal playlist shape matching playlist.service.ts types
interface Playlist {
  playlist_id: string;
  owner_user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  track_count: number;
  like_count: number;
  cover_image?: string | null;
}

interface PlaylistTrackItem {
  track_id: string;
  position: number;
  added_at: string;
  title?: string;
}

interface PlaylistDetails extends Playlist {
  tracks: PlaylistTrackItem[];
}

const generateId = () => `playlist-${Math.random().toString(36).slice(2, 10)}`;

// ─── Richer seeded playlists ──────────────────────────────
interface PlaylistSeed extends Playlist {
  cover_image: string | null;
}

const seedPlaylists: (PlaylistSeed & { tracks: PlaylistTrackItem[] })[] = [
  {
    playlist_id: "0001",
    owner_user_id: "12345",
    name: "أناشيد",
    description: null,
    is_public: false,
    cover_image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
    created_at: "2026-01-10T00:00:00Z",
    track_count: 0,
    like_count: 0,
    tracks: [],
  },
  {
    playlist_id: "0002",
    owner_user_id: "12345",
    name: "my songs",
    description: null,
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
    created_at: "2026-02-14T00:00:00Z",
    track_count: 0,
    like_count: 3,
    tracks: [],
  },
];

const playlists: Record<string, PlaylistDetails> = Object.fromEntries(
  seedPlaylists.map((p) => [p.playlist_id, p as unknown as PlaylistDetails]),
);

const getMyPlaylistList = () =>
  Object.values(playlists).map((p) => ({
    playlist_id: p.playlist_id,
    owner_user_id: p.owner_user_id,
    name: p.name,
    description: p.description,
    is_public: p.is_public,
    created_at: p.created_at,
    track_count: p.track_count,
    like_count: p.like_count,
    cover_image: (p as unknown as { cover_image?: string | null }).cover_image ?? null,
  }));

export const playlistHandlers = [
  // POST /playlists
  http.post("*/playlists", async ({ request }) => {
    const payload = (await request.json()) as {
      name: string;
      description?: string;
      is_public?: boolean;
    };

    const newPlaylist: PlaylistDetails = {
      playlist_id: generateId(),
      owner_user_id: "12345",
      name: payload.name,
      description: payload.description ?? null,
      is_public: payload.is_public ?? true,
      created_at: new Date().toISOString(),
      track_count: 0,
      like_count: 0,
      tracks: [],
    };

    playlists[newPlaylist.playlist_id] = newPlaylist;

    return HttpResponse.json({
      data: newPlaylist,
      message: "Playlist created successfully.",
    });
  }),

  // GET /playlists?mine=true
  http.get("*/playlists", ({ request }) => {
    const url = new URL(request.url);
    const mine = url.searchParams.get("mine");

    const items = mine === "true" ? getMyPlaylistList() : getMyPlaylistList();

    return HttpResponse.json({
      data: {
        items,
        meta: {
          limit: Number(url.searchParams.get("limit") ?? items.length),
          offset: Number(url.searchParams.get("offset") ?? 0),
          total: items.length,
        },
      },
      message: "Playlists fetched successfully.",
    });
  }),

  // GET /playlists/:id
  http.get("*/playlists/:playlistId", ({ params, request }) => {
    const playlistId = params.playlistId as string;
    const playlist = playlists[playlistId];

    if (!playlist) {
      return HttpResponse.json(
        {
          error: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found." },
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      data: playlist,
      message: "Playlist details fetched successfully.",
    });
  }),

  // POST /playlists/:id/tracks
  http.post("*/playlists/:playlistId/tracks", async ({ params, request }) => {
    const playlistId = params.playlistId as string;
    const playlist = playlists[playlistId];

    if (!playlist) {
      return HttpResponse.json(
        {
          error: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found." },
        },
        { status: 404 },
      );
    }

    const body = (await request.json()) as {
      track_id: string;
      position?: number;
    };
    const exists = playlist.tracks.find(
      (t) => t.track_id === String(body.track_id),
    );
    if (exists) {
      return HttpResponse.json({
        data: playlist,
        message: "Track already in playlist.",
      });
    }

    const added: PlaylistTrackItem = {
      track_id: String(body.track_id),
      position: body.position ?? playlist.tracks.length + 1,
      added_at: new Date().toISOString(),
      title: `Track ${String(body.track_id)}`,
    };

    playlist.tracks.push(added);
    playlist.track_count = playlist.tracks.length;

    return HttpResponse.json({
      data: playlist,
      message: "Track added to playlist successfully.",
    });
  }),

  // DELETE /playlists/:id/tracks/:trackId
  http.delete("*/playlists/:playlistId/tracks/:trackId", ({ params }) => {
    const playlistId = params.playlistId as string;
    const trackId = params.trackId as string;
    const playlist = playlists[playlistId];

    if (!playlist) {
      return HttpResponse.json(
        {
          error: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found." },
        },
        { status: 404 },
      );
    }

    playlist.tracks = playlist.tracks.filter((t) => t.track_id !== trackId);
    playlist.track_count = playlist.tracks.length;

    return HttpResponse.json({
      data: playlist,
      message: "Track removed from playlist successfully.",
    });
  }),

  // PATCH /playlists/:id/tracks/reorder
  http.patch(
    "*/playlists/:playlistId/tracks/reorder",
    async ({ params, request }) => {
      const playlistId = params.playlistId as string;
      const playlist = playlists[playlistId];

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

      const body = (await request.json()) as {
        items: { track_id: string; position: number }[];
      };
      body.items.forEach((item) => {
        const track = playlist.tracks.find((t) => t.track_id === item.track_id);
        if (track) track.position = item.position;
      });
      playlist.tracks.sort((a, b) => a.position - b.position);

      return HttpResponse.json({
        data: playlist,
        message: "Playlist tracks reordered successfully.",
      });
    },
  ),

  // PATCH /playlists/:id
  http.patch("*/playlists/:playlistId", async ({ params, request }) => {
    const playlistId = params.playlistId as string;
    const playlist = playlists[playlistId];

    if (!playlist) {
      return HttpResponse.json(
        {
          error: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found." },
        },
        { status: 404 },
      );
    }

    const body = (await request.json()) as Partial<Playlist>;
    playlist.name = body.name ?? playlist.name;
    playlist.description = body.description ?? playlist.description;
    playlist.is_public = body.is_public ?? playlist.is_public;

    return HttpResponse.json({
      data: playlist,
      message: "Playlist updated successfully.",
    });
  }),

  // DELETE /playlists/:id
  http.delete("*/playlists/:playlistId", ({ params }) => {
    const playlistId = params.playlistId as string;
    const playlist = playlists[playlistId];

    if (!playlist) {
      return HttpResponse.json(
        {
          error: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found." },
        },
        { status: 404 },
      );
    }

    delete playlists[playlistId];

    return HttpResponse.json({
      data: { success: true },
      message: "Playlist deleted successfully.",
    });
  }),
];
