import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "../api/axiosInstance";
import {
  addTrackToPlaylist,
  createPlaylist,
  deletePlaylist,
  getLikedPlaylists,
  getMyPlaylists,
  getPlaylist,
  getPlaylistEmbed,
  getPlaylistShareLink,
  getPlaylistTracks,
  getPlaylistsByUser,
  removeTrackFromPlaylist,
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
      ["tags[]", "tag-1"],
      ["tags[]", "tag-2"],
    ]);
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
});
