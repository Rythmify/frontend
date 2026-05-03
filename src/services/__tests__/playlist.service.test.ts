import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "../api/axiosInstance";
import {
  addTrackToPlaylist,
  convertPlaylist,
  createPlaylist,
  deletePlaylist,
  getAlbumLikers,
  getAlbumReposters,
  getMadeForYouDaily,
  getMadeForYouWeekly,
  getLikedPlaylists,
  getMyPlaylists,
  getPlaylist,
  getPlaylistLikers,
  getPlaylistEmbed,
  getPlaylistShareLink,
  getPlaylistReposters,
  getPlaylistTracks,
  getPlaylistsByUser,
  getRadioTracks,
  getStationTracks,
  getTrendingByGenre,
  formatDuration,
  getPlaylistTotalDuration,
  playlistExists,
  removePlaylistRepost,
  removeTrackFromPlaylist,
  repostPlaylist,
  reorderPlaylistTracks,
  updatePlaylist,
} from "../api/playlist/playlist.service";

vi.mock("../api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

class MockFormData {
  entries: Array<[string, FormDataEntryValue]> = [];

  append(name: string, value: FormDataEntryValue) {
    this.entries.push([name, value]);
  }
}

const mockedAxios = vi.mocked(axiosInstance, true);

describe("playlist.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("FormData", MockFormData as any);
  });

  it("createPlaylist posts the payload and returns response data", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { data: { playlist_id: "pl-1" }, message: "created" },
    } as any);

    const result = await createPlaylist({
      name: "New Playlist",
      description: "Desc",
      is_public: true,
    });

    expect(mockedAxios.post).toHaveBeenCalledWith("/playlists", {
      name: "New Playlist",
      description: "Desc",
      is_public: true,
    });
    expect(result).toEqual({ data: { playlist_id: "pl-1" }, message: "created" });
  });

  it("getMyPlaylists merges mine=true into params", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: { items: [], meta: { limit: 10, offset: 0, total: 0 } } },
    } as any);

    await getMyPlaylists({ limit: 10, q: "chill" });

    expect(mockedAxios.get).toHaveBeenCalledWith("/playlists", {
      params: { limit: 10, q: "chill", mine: true },
    });
  });

  it("getPlaylist forwards params to the playlist endpoint", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: { playlist_id: "pl-1", tracks: [] }, message: "ok" },
    } as any);

    await getPlaylist("pl-1", { include_tracks: true, secret_token: "abc" });

    expect(mockedAxios.get).toHaveBeenCalledWith("/playlists/pl-1", {
      params: { include_tracks: true, secret_token: "abc" },
    });
  });

  it("updatePlaylist appends only provided fields to FormData", async () => {
    mockedAxios.patch.mockResolvedValue({
      data: { data: { playlist_id: "pl-1" }, message: "updated" },
    } as any);

    await updatePlaylist("pl-1", {
      name: "Updated name",
      description: null,
      is_public: false,
      remove_cover_image: true,
      subtype: "album",
      slug: "updated-slug",
      release_date: null,
      genre_id: null,
      is_album_view: true,
      tags: ["tag-1", "tag-2"],
    });

    expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
    const [url, formData, config] = mockedAxios.patch.mock.calls[0] as any;
    expect(url).toBe("/playlists/pl-1");
    expect(config).toEqual({
      headers: { "Content-Type": "multipart/form-data" },
    });

    expect((formData as MockFormData).entries).toEqual([
      ["name", "Updated name"],
      ["description", ""],
      ["is_public", "false"],
      ["remove_cover_image", "true"],
      ["subtype", "album"],
      ["slug", "updated-slug"],
      ["release_date", ""],
      ["genre_id", ""],
      ["is_album_view", "true"],
      ["tags[]", "tag-1"],
      ["tags[]", "tag-2"],
    ]);
  });

  it("formatDuration formats seconds with and without hours", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3661)).toBe("1:01:01");
    expect(formatDuration(-5)).toBe("0:00");
  });

  it("getPlaylistTotalDuration sums track durations and skips missing values", () => {
    expect(
      getPlaylistTotalDuration([
        { track_id: "a", position: 1, added_at: "2025-01-01", duration: 30 },
        { track_id: "b", position: 2, added_at: "2025-01-01" },
        { track_id: "c", position: 3, added_at: "2025-01-01", duration: 45 },
      ]),
    ).toBe("1:15");
  });

  it("deletePlaylist deletes the playlist by id", async () => {
    mockedAxios.delete.mockResolvedValue({
      data: { data: { success: true }, message: "deleted" },
    } as any);

    const result = await deletePlaylist("pl-1");

    expect(mockedAxios.delete).toHaveBeenCalledWith("/playlists/pl-1");
    expect(result.data.success).toBe(true);
  });

  it("addTrackToPlaylist rejects invalid track ids", async () => {
    await expect(addTrackToPlaylist("pl-1", "not-a-uuid")).rejects.toThrow(
      "trackId must be a valid UUID",
    );
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("addTrackToPlaylist rejects invalid playlist ids", async () => {
    await expect(
      addTrackToPlaylist("not-a-uuid", "e5f6a7b8-c9d0-1234-8fab-567890abcdef"),
    ).rejects.toThrow("playlistId must be a valid UUID");
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("addTrackToPlaylist posts the track payload for valid ids", async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true } } as any);

    const result = await addTrackToPlaylist(
      "e5f6a7b8-c9d0-1234-8fab-567890abcdef",
      "e5f6a7b8-c9d0-1234-8fab-567890abcdee",
      3,
    );

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/playlists/e5f6a7b8-c9d0-1234-8fab-567890abcdef/tracks",
      {
        track_id: "e5f6a7b8-c9d0-1234-8fab-567890abcdee",
        position: 3,
      },
    );
    expect(result).toEqual({ success: true });
  });

  it("getPlaylistTracks sends pagination params", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: { tracks: [], pagination: {} }, message: "ok" },
    } as any);

    await getPlaylistTracks("pl-1", { page: 2, limit: 20 });

    expect(mockedAxios.get).toHaveBeenCalledWith("/playlists/pl-1/tracks", {
      params: { page: 2, limit: 20 },
    });
  });

  it("removeTrackFromPlaylist deletes the track from the playlist", async () => {
    mockedAxios.delete.mockResolvedValue({
      data: { data: { playlist_id: "pl-1", tracks: [] }, message: "ok" },
    } as any);

    await removeTrackFromPlaylist("pl-1", "t-1");

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      "/playlists/pl-1/tracks/t-1",
    );
  });

  it("reorderPlaylistTracks sends the reordered items", async () => {
    mockedAxios.patch.mockResolvedValue({
      data: { data: { playlist_id: "pl-1", tracks: [] }, message: "ok" },
    } as any);

    await reorderPlaylistTracks("pl-1", [
      { track_id: "t-1", position: 1 },
      { track_id: "t-2", position: 2 },
    ]);

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      "/playlists/pl-1/tracks/reorder",
      {
        items: [
          { track_id: "t-1", position: 1 },
          { track_id: "t-2", position: 2 },
        ],
      },
    );
  });

  it("getPlaylistEmbed forwards embed params", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: { embed_url: "https://embed", iframe_html: "<iframe />" },
        message: "ok",
      },
    } as any);

    await getPlaylistEmbed("pl-1", {
      autoplay: true,
      theme: "dark",
      width: 400,
      height: 300,
    });

    expect(mockedAxios.get).toHaveBeenCalledWith("/playlists/pl-1/embed", {
      params: {
        autoplay: true,
        theme: "dark",
        width: 400,
        height: 300,
      },
    });
  });

  it("getLikedPlaylists adds mine=true and filter=liked", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: { items: [], meta: { limit: 5, offset: 0, total: 0 } } },
    } as any);

    await getLikedPlaylists({ limit: 5, q: "indie" });

    expect(mockedAxios.get).toHaveBeenCalledWith("/playlists", {
      params: { limit: 5, q: "indie", mine: true, filter: "liked" },
    });
  });

  it("getPlaylistsByUser uses mine=true for the current user", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          items: [{ playlist_id: "mine" }],
          meta: { limit: 10, offset: 0, total: 1 },
        },
      },
    } as any);

    const result = await getPlaylistsByUser("user-1", "user-1", { limit: 10 });

    expect(mockedAxios.get).toHaveBeenCalledWith("/playlists", {
      params: { limit: 10, mine: true },
    });
    expect(result.data.items).toEqual([{ playlist_id: "mine" }]);
  });

  it("getPlaylistsByUser filters other users' playlists client-side", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          items: [
            { playlist_id: "a", owner_user_id: "user-2" },
            { playlist_id: "b", owner_user_id: "user-1" },
            { playlist_id: "c", owner_user_id: "user-2" },
            { playlist_id: "d", owner_user_id: "user-2" },
          ],
          meta: { limit: 12, offset: 0, total: 4 },
        },
      },
    } as any);

    const result = await getPlaylistsByUser("user-2", "user-1", {
      limit: 3,
      q: "mix",
    });

    expect(mockedAxios.get).toHaveBeenCalledWith("/playlists", {
      params: { limit: 12, q: "mix" },
    });
    expect(result.data.items).toEqual([
      { playlist_id: "a", owner_user_id: "user-2" },
      { playlist_id: "c", owner_user_id: "user-2" },
      { playlist_id: "d", owner_user_id: "user-2" },
    ]);
  });

  it("getPlaylistsByUser falls back to the default limit when not provided", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          items: [
            { playlist_id: "a", owner_user_id: "user-2" },
            { playlist_id: "b", owner_user_id: "user-2" },
          ],
          meta: { limit: 12, offset: 0, total: 2 },
        },
      },
    } as any);

    const result = await getPlaylistsByUser("user-2", undefined);

    expect(mockedAxios.get).toHaveBeenCalledWith("/playlists", {
      params: { limit: 12 },
    });
    expect(result.data.items).toHaveLength(2);
  });

  it("getPlaylistShareLink fetches the share link for a playlist", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          playlist_id: "pl-1",
          secret_token: "secret",
          share_url: "https://share",
        },
        message: "ok",
      },
    } as any);

    const result = await getPlaylistShareLink("pl-1");

    expect(mockedAxios.get).toHaveBeenCalledWith("/playlists/pl-1/share-link");
    expect(result.data.share_url).toBe("https://share");
  });

  it("playlistExists returns false for an empty id without calling the API", async () => {
    await expect(playlistExists("")).resolves.toBe(false);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("playlistExists returns true when the playlist is found", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          playlist_id: "pl-1",
          owner_user_id: "user-1",
          name: "Playlist",
          description: null,
          is_public: true,
          created_at: "2025-01-01T00:00:00Z",
          track_count: 0,
          like_count: 0,
          tracks: [],
        },
        message: "ok",
      },
    } as any);

    await expect(playlistExists("pl-1")).resolves.toBe(true);
  });

  it("playlistExists returns false when getPlaylist rejects", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("missing"));

    await expect(playlistExists("pl-1")).resolves.toBe(false);
  });

  it("convertPlaylist posts the conversion payload", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { data: { playlist_id: "pl-1" }, message: "converted" },
    } as any);

    const result = await convertPlaylist("pl-1", {
      name: "Converted",
      is_public: true,
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/playlists/pl-1/convert",
      { name: "Converted", is_public: true },
    );
    expect(result.message).toBe("converted");
  });

  it("getStationTracks maps station data and track items", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        station: {
          id: "station-1",
          artist_id: "artist-1",
          artist_name: "Artist One",
          images: { left: null, center: null, right: null },
          preview_track: null,
          track_count: 2,
        },
        data: [
          {
            id: "track-1",
            title: "First",
            cover_image: null,
            duration: 120,
            genre_name: "Hip-Hop",
            play_count: 10,
            like_count: 3,
            repost_count: 1,
            user_id: "artist-1",
            artist_name: "Artist One",
            stream_url: "https://stream/1",
            created_at: "2025-01-01T00:00:00Z",
          },
          {
            id: "track-2",
            title: "Second",
            cover_image: "cover.jpg",
            duration: 90,
            genre_name: "Pop",
            play_count: 20,
            like_count: 4,
            repost_count: 2,
            user_id: "artist-1",
            artist_name: "Artist One",
            stream_url: "https://stream/2",
            created_at: "2025-01-02T00:00:00Z",
          },
        ],
        pagination: { limit: 2, offset: 0, total: 2 },
      },
    } as any);

    const result = await getStationTracks("artist-1");

    expect(mockedAxios.get).toHaveBeenCalledWith("/home/stations/artist-1/tracks");
    expect(result.station.name).toBe("Artist One's Station");
    expect(result.tracks[0]).toMatchObject({
      track_id: "track-1",
      position: 1,
      title: "First",
      artist_id: "artist-1",
      audio_url: "https://stream/1",
    });
  });

  it("getMadeForYouDaily returns the daily mix payload", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          mix_id: "mix-1",
          title: "Daily",
          cover_url: null,
          tracks: [],
        },
      },
    } as any);

    await expect(getMadeForYouDaily()).resolves.toEqual({
      mix_id: "mix-1",
      title: "Daily",
      cover_url: null,
      tracks: [],
    });
  });

  it("getMadeForYouWeekly returns the weekly mix payload", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          mix_id: "mix-2",
          title: "Weekly",
          cover_url: "cover.png",
          tracks: [],
        },
      },
    } as any);

    await expect(getMadeForYouWeekly()).resolves.toEqual({
      mix_id: "mix-2",
      title: "Weekly",
      cover_url: "cover.png",
      tracks: [],
    });
  });

  it("getRadioTracks returns the radio track payload", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          playlist_id: "pl-1",
          seed_track_id: "seed-1",
          title: "Radio",
          description: "Desc",
          cover_image: null,
          reference_track: {
            id: "seed-1",
            title: "Seed",
            cover_image: null,
            duration: 100,
            genre_name: "Rock",
            play_count: 1,
            like_count: 2,
            repost_count: 3,
            user_id: "artist-1",
            artist_name: "Artist One",
            stream_url: null,
            created_at: "2025-01-01T00:00:00Z",
          },
          tracks: [],
          meta: { limit: 10, offset: 0, total: 0 },
        },
        message: "ok",
      },
    } as any);

    const result = await getRadioTracks("pl-1");

    expect(mockedAxios.get).toHaveBeenCalledWith("/playlists/pl-1/radio-tracks");
    expect(result.title).toBe("Radio");
  });

  it("getTrendingByGenre returns the genre payload", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          genre_id: "genre-1",
          genre_name: "Indie",
          tracks: [],
        },
        message: "ok",
      },
    } as any);

    const result = await getTrendingByGenre("genre-1", {
      limit: 4,
      offset: 8,
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/home/trending-by-genre/genre-1",
      { params: { limit: 4, offset: 8 } },
    );
    expect(result.genre_name).toBe("Indie");
  });

  it("getPlaylistLikers and getPlaylistReposters fetch the correct endpoints", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: [],
        pagination: { limit: 5, offset: 0, total: 0 },
      },
    } as any);

    await getPlaylistLikers("pl-1", { limit: 5 });
    await getPlaylistReposters("pl-1", { limit: 7 });

    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      "/playlists/pl-1/likers",
      { params: { limit: 5 } },
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      "/playlists/pl-1/reposters",
      { params: { limit: 7 } },
    );
  });

  it("getAlbumLikers and getAlbumReposters fetch the correct endpoints", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: [],
        pagination: { limit: 5, offset: 0, total: 0 },
      },
    } as any);

    await getAlbumLikers("album-1", { offset: 2 });
    await getAlbumReposters("album-1", { offset: 4 });

    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      "/albums/album-1/likers",
      { params: { offset: 2 } },
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      "/albums/album-1/reposters",
      { params: { offset: 4 } },
    );
  });

  it("repostPlaylist and removePlaylistRepost call the repost endpoints", async () => {
    mockedAxios.post.mockResolvedValue({ data: { ok: true } } as any);
    mockedAxios.delete.mockResolvedValue({ data: { ok: true } } as any);

    await repostPlaylist("pl-1");
    await removePlaylistRepost("pl-1");

    expect(mockedAxios.post).toHaveBeenCalledWith("/playlists/pl-1/repost");
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      "/playlists/pl-1/repost",
    );
  });
});
