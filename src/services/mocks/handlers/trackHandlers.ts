import { http, HttpResponse } from "msw";
import type { Track, TrackSummary } from "@/services/api/upload/track.service";
import { createRadioPlaylist, deleteRadioPlaylistBySeedTrack } from "./radioPlaylists";
import type { DiscoveryTrack } from "@/services/api/discover.service";

// Mock Data 

const mockTrack: Track = {
  id: "e5f6a7b8-c9d0-1234-efab-567890abcdef",
  title: "Summer Vibes",
  description: "A chill electronic track",
  genre: "Electronic",
  tags: [],
  duration: null,
  file_size: 8388608,
  bitrate: null,
  status: "processing",
  is_public: true,
  is_hidden: false,
  user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  play_count: 0,
  like_count: 0,
  comment_count: 0,
  repost_count: 0,
  audio_url: "https://cdn.rythmify.com/tracks/e5f6a7b8/original.mp3",
  stream_url: null,
  preview_url: null,
  waveform_url: null,
  created_at: new Date().toISOString(),
  updated_at: null,
  artists: null,
};

const mockReadyTrack: Track = {
  ...mockTrack,
  status: "ready",
  duration: 210,
  bitrate: 320,
  stream_url: "https://cdn.rythmify.com/tracks/e5f6a7b8/stream.mp3",
  preview_url: "https://cdn.rythmify.com/tracks/e5f6a7b8/preview.mp3",
  waveform_url: "https://cdn.rythmify.com/tracks/e5f6a7b8/waveform.json",
};

const mockTrackSummary: TrackSummary = {
  id: mockTrack.id,
  title: mockTrack.title,
  genre: mockTrack.genre,
  duration: null,
  user_id: mockTrack.user_id,
};

const toDiscoveryTrack = (track: Track): DiscoveryTrack => ({
  id: track.id,
  title: track.title,
  cover_image: null,
  duration: track.duration,
  genre_name: track.genre,
  play_count: track.play_count,
  like_count: track.like_count,
  repost_count: track.repost_count,
  user_id: track.user_id,
  artist_name: "Mock Artist",
  stream_url: track.stream_url,
  created_at: track.created_at,
  is_liked_by_me: false,
});

// Handlers 

export const trackHandlers = [
  // POST /tracks — upload a new track
  http.post("*/tracks", async ({ request }) => {
    await new Promise((r) => setTimeout(r, 4000));
    const formData = await request.formData();
    const title = formData.get("title") as string | null;

    return HttpResponse.json(
      {
        data: {
          ...mockTrack,
          title: title ?? mockTrack.title,
        },
        message: "Track uploaded successfully.",
      },
      { status: 201 },
    );
  }),

  // GET /tracks/me — list authenticated user's own tracks
  http.get("*/tracks/me", () => {
    return HttpResponse.json({
      data: [mockTrackSummary],
      pagination: { page: 1, limit: 1, total: 1 },
    });
  }),

  // GET /tracks/:id — get a single track
  http.get("*/tracks/:track_id", ({ params }) => {
    const { track_id } = params;
    // Return the ready version so stream_url is available
    return HttpResponse.json({
      data: { ...mockReadyTrack, id: track_id as string },
    });
  }),

  // PATCH /tracks/:id — update track metadata
  http.patch("*/tracks/:track_id", async ({ request, params }) => {
    const { track_id } = params;
    const body = (await request.json()) as Partial<Track>;
    return HttpResponse.json({
      data: { ...mockReadyTrack, id: track_id as string, ...body },
      message: "Track updated successfully.",
    });
  }),

  // DELETE /tracks/:id — delete a track
  http.delete("*/tracks/:track_id", () => {
    return HttpResponse.json({
      data: { success: true },
      message: "Track deleted successfully.",
    });
  }),

  http.post("*/tracks/:track_id/like-radio", ({ params }) => {
    const seedTrack = { ...mockTrack, id: params.track_id as string } as Track;
    const playlist = createRadioPlaylist(toDiscoveryTrack(seedTrack));
    return HttpResponse.json({
      data: {
        playlist_id: playlist.playlist_id,
        seed_track_id: playlist.seed_track_id,
        title: playlist.title,
        description: playlist.description,
        cover_image: playlist.cover_image,
      },
      message: "Track radio saved to library.",
    });
  }),

  http.delete("*/tracks/:track_id/like-radio", ({ params }) => {
    deleteRadioPlaylistBySeedTrack(params.track_id as string);
    return new HttpResponse(null, { status: 204 });
  }),

  // PATCH /tracks/:id/visibility — toggle public/private
  http.patch("*/tracks/:track_id/visibility", async ({ request, params }) => {
    const { track_id } = params;
    const body = (await request.json()) as { is_public: boolean };
    return HttpResponse.json({
      data: { success: true, id: track_id, is_public: body.is_public },
      message: "Track visibility updated.",
    });
  }),

  http.get("*/subscriptions/me", () => {
    return HttpResponse.json({
      data: {
        user_subscription_id: 1,
        user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        status: "active",
        start_date: "2026-01-01",
        end_date: null,
        auto_renew: false,
        created_at: "2026-01-01T00:00:00Z",
        plan: {
          subscription_plan_id: 1,
          name: "free",
          price: "0.00",
          duration_days: null,
          track_limit: 3,
          playlist_limit: 2,
        },
        usage: {
          tracks_uploaded: 0,
          track_limit: 3,
          playlists_created: 0,
          playlist_limit: 2,
          can_upload_track: true,
          can_create_playlist: true,
          offline_listening_enabled: false,
        },
      },
      message: "Current subscription fetched successfully.",
    });
  }),
];
