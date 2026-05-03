import type { DiscoveryTrack } from "@/services/api/discover.service";

export interface RadioPlaylistMock {
  playlist_id: string;
  seed_track_id: string;
  title: string;
  description: string;
  cover_image: string | null;
  reference_track: DiscoveryTrack;
  tracks: Array<
    DiscoveryTrack & {
      position: number;
      added_at: string;
      is_public: boolean;
      deleted_at: null;
      artist_id: string;
      audio_url: string | null;
      play_count: number;
    }
  >;
}

const radioPlaylists = new Map<string, RadioPlaylistMock>();

function buildRadioTracks(seedTrack: DiscoveryTrack): RadioPlaylistMock["tracks"] {
  const baseTime = new Date(seedTrack.created_at || new Date().toISOString());
  return [
    {
      ...seedTrack,
      position: 1,
      added_at: seedTrack.created_at,
      is_public: true,
      deleted_at: null,
      artist_id: seedTrack.user_id,
      audio_url: seedTrack.stream_url,
    },
    {
      id: `${seedTrack.id}-radio-2`,
      title: `${seedTrack.title} Radio Cut`,
      cover_image: seedTrack.cover_image,
      duration: seedTrack.duration,
      genre_name: seedTrack.genre_name,
      like_count: seedTrack.like_count,
      repost_count: seedTrack.repost_count ?? 0,
      user_id: seedTrack.user_id,
      artist_name: seedTrack.artist_name,
      stream_url: seedTrack.stream_url,
      created_at: new Date(baseTime.getTime() + 60_000).toISOString(),
      is_liked_by_me: false,
      position: 2,
      added_at: new Date(baseTime.getTime() + 60_000).toISOString(),
      is_public: true,
      deleted_at: null,
      artist_id: seedTrack.user_id,
      audio_url: seedTrack.stream_url,
      play_count: Math.max(0, seedTrack.play_count - 200),
    },
    {
      id: `${seedTrack.id}-radio-3`,
      title: `${seedTrack.title} Deep Mix`,
      cover_image: seedTrack.cover_image,
      duration: seedTrack.duration,
      genre_name: seedTrack.genre_name,
      like_count: seedTrack.like_count,
      repost_count: seedTrack.repost_count ?? 0,
      user_id: seedTrack.user_id,
      artist_name: seedTrack.artist_name,
      stream_url: seedTrack.stream_url,
      created_at: new Date(baseTime.getTime() + 120_000).toISOString(),
      is_liked_by_me: false,
      position: 3,
      added_at: new Date(baseTime.getTime() + 120_000).toISOString(),
      is_public: true,
      deleted_at: null,
      artist_id: seedTrack.user_id,
      audio_url: seedTrack.stream_url,
      play_count: Math.max(0, seedTrack.play_count - 400),
    },
  ];
}

export function createRadioPlaylist(seedTrack: DiscoveryTrack): RadioPlaylistMock {
  const playlist: RadioPlaylistMock = {
    playlist_id: crypto.randomUUID(),
    seed_track_id: seedTrack.id,
    title: `${seedTrack.title} Radio`,
    description: `Tracks inspired by ${seedTrack.title}`,
    cover_image: seedTrack.cover_image,
    reference_track: seedTrack,
    tracks: buildRadioTracks(seedTrack),
  };

  radioPlaylists.set(playlist.playlist_id, playlist);
  return playlist;
}

export function getRadioPlaylist(playlistId: string) {
  return radioPlaylists.get(playlistId) ?? null;
}

export function deleteRadioPlaylistBySeedTrack(seedTrackId: string) {
  for (const [playlistId, playlist] of radioPlaylists.entries()) {
    if (playlist.seed_track_id === seedTrackId) {
      radioPlaylists.delete(playlistId);
      return playlist;
    }
  }
  return null;
}
