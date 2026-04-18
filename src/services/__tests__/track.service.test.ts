import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import axiosInstance from "../api/axiosInstance";
import {
  uploadTrack,
  getMyTracks,
  getTrack,
  updateTrack,
  deleteTrack,
  setTrackVisibility,
  getGenres,
} from "../api/upload/track.service";

vi.mock("../api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axiosInstance, true);

const mockTrack = {
  id: "e5f6a7b8-c9d0-1234-efab-567890abcdef",
  title: "Summer Vibes",
  description: "A chill electronic track",
  genre: "Electronic",
  tags: [],
  duration: null,
  file_size: 8388608,
  bitrate: null,
  status: "processing" as const,
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

const mockReadyTrack = {
  ...mockTrack,
  status: "ready" as const,
  duration: 210,
  bitrate: 320,
  stream_url: "https://cdn.rythmify.com/tracks/e5f6a7b8/stream.mp3",
  preview_url: "https://cdn.rythmify.com/tracks/e5f6a7b8/preview.mp3",
  waveform_url: "https://cdn.rythmify.com/tracks/e5f6a7b8/waveform.json",
};

const mockTrackSummary = {
  id: mockTrack.id,
  title: mockTrack.title,
  genre: mockTrack.genre,
  duration: null,
  user_id: mockTrack.user_id,
};

beforeEach(() => {
  localStorage.clear();
  mockedAxios.get.mockReset();
  mockedAxios.post.mockReset();
  mockedAxios.patch.mockReset();
  mockedAxios.delete.mockReset();

  mockedAxios.post.mockImplementation(async (url, data) => {
    if (url === "/tracks") {
      const formData =
        data && typeof data === "object" && "get" in data
          ? (data as FormData)
          : null;
      const title = formData?.get("title");

      return {
        data: {
          data: {
            ...mockTrack,
            title: typeof title === "string" ? title : mockTrack.title,
          },
          message: "Track uploaded successfully.",
        },
      } as any;
    }

    return { data: {} } as any;
  });

  mockedAxios.get.mockImplementation(async (url) => {
    if (url === "/tracks/me") {
      return {
        data: {
          data: [mockTrackSummary],
          pagination: { page: 1, limit: 1, total: 1 },
        },
      } as any;
    }

    if (typeof url === "string" && url.startsWith("/tracks/")) {
      const trackId = url.slice("/tracks/".length);
      return {
        data: {
          data: { ...mockReadyTrack, id: trackId },
        },
      } as any;
    }

    return { data: {} } as any;
  });

  mockedAxios.patch.mockImplementation(async (url, body) => {
    if (typeof url === "string" && url.endsWith("/visibility")) {
      const trackId = url.replace("/visibility", "").slice("/tracks/".length);
      return {
        data: {
          data: {
            success: true,
            id: trackId,
            ...(body as { is_public?: boolean }),
          },
          message: "Track visibility updated.",
        },
      } as any;
    }

    if (typeof url === "string" && url.startsWith("/tracks/")) {
      const trackId = url.slice("/tracks/".length);
      return {
        data: {
          data: { ...mockReadyTrack, id: trackId, ...(body as object) },
          message: "Track updated successfully.",
        },
      } as any;
    }

    return { data: {} } as any;
  });

  mockedAxios.delete.mockImplementation(async (url) => {
    if (typeof url === "string" && url.startsWith("/tracks/")) {
      return {
        data: {
          data: { success: true },
          message: "Track deleted successfully.",
        },
      } as any;
    }

    return { data: {} } as any;
  });
});

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

describe("uploadTrack()", () => {
  it('returns a track with status "processing" on success', async () => {
    const fakeAudio = new File(["audio-data"], "track.wav", {
      type: "audio/wav",
    });
    const result = await uploadTrack({
      audio_file: fakeAudio,
      title: "Summer Vibes",
    });

    expect(result.data.title).toBe("Summer Vibes");
    expect(result.data.status).toBe("processing");
    expect(result.data.stream_url).toBeNull();
    expect(result.message).toBeTruthy();
  });

  it("accepts a Blob (recorded audio) and wraps it as a File", async () => {
    const fakeBlob = new Blob(["audio-data"], { type: "audio/wav" });
    const result = await uploadTrack({
      audio_file: fakeBlob,
      title: "Recorded Audio",
    });

    expect(result.data.title).toBe("Recorded Audio");
    expect(result.data.status).toBe("processing");
  });

  it("reflects the title sent in the form data", async () => {
    const fakeAudio = new File(["audio-data"], "track.wav", {
      type: "audio/wav",
    });
    const result = await uploadTrack({
      audio_file: fakeAudio,
      title: "My Custom Title",
    });

    expect(result.data.title).toBe("My Custom Title");
  });

  it("throws on 413 — file too large", async () => {
    mockedAxios.post.mockRejectedValueOnce(
      new Error("File size exceeds the allowed limit"),
    );

    const fakeAudio = new File(["audio-data"], "huge.wav", {
      type: "audio/wav",
    });
    await expect(
      uploadTrack({ audio_file: fakeAudio, title: "Too Big" }),
    ).rejects.toThrow();
  });

  it("throws on 415 — unsupported file format", async () => {
    mockedAxios.post.mockRejectedValueOnce(
      new Error("Unsupported file format"),
    );

    const fakeAudio = new File(["audio-data"], "track.mp4", {
      type: "video/mp4",
    });
    await expect(
      uploadTrack({ audio_file: fakeAudio, title: "Wrong Format" }),
    ).rejects.toThrow();
  });

  it("throws on 401 — missing or invalid token", async () => {
    mockedAxios.post.mockRejectedValueOnce(
      new Error("Authorization header missing"),
    );

    const fakeAudio = new File(["audio-data"], "track.wav", {
      type: "audio/wav",
    });
    await expect(
      uploadTrack({ audio_file: fakeAudio, title: "Unauthorized" }),
    ).rejects.toThrow();
  });

  it("throws on 403 — upload limit reached", async () => {
    mockedAxios.post.mockRejectedValueOnce(
      new Error("Hourly upload limit reached"),
    );

    const fakeAudio = new File(["audio-data"], "track.wav", {
      type: "audio/wav",
    });
    await expect(
      uploadTrack({ audio_file: fakeAudio, title: "Rate Limited" }),
    ).rejects.toThrow();
  });

  it("throws on 500 — server error", async () => {
    mockedAxios.post.mockRejectedValueOnce(
      new Error("An unexpected error occurred"),
    );

    const fakeAudio = new File(["audio-data"], "track.wav", {
      type: "audio/wav",
    });
    await expect(
      uploadTrack({ audio_file: fakeAudio, title: "Server Error" }),
    ).rejects.toThrow();
  });

  it("sends optional metadata fields in the multipart payload", async () => {
    const fakeAudio = new File(["audio-data"], "track.wav", {
      type: "audio/wav",
    });
    const coverImage = new File(["cover"], "cover.png", {
      type: "image/png",
    });

    const result = await uploadTrack({
      audio_file: fakeAudio,
      title: "Metadata Track",
      description: "A detailed description",
      genre: "Electronic",
      tags: ["tag-1", "tag-2"],
      is_public: false,
      cover_image: coverImage,
      artists: "Artist One, Artist Two",
    });

    expect(result.data.title).toBe("Metadata Track");
    const [, formData] = mockedAxios.post.mock.calls[0] as [string, FormData];
    expect(formData.get("description")).toBe("A detailed description");
    expect(formData.get("genre")).toBe("Electronic");
    expect(formData.get("is_public")).toBe("false");
    expect(formData.get("artists")).toBe("Artist One, Artist Two");
    expect(formData.get("cover_image")).toBe(coverImage);
    expect(formData.getAll("tags[]")).toEqual(["tag-1", "tag-2"]);
  });

  it("reports progress while uploading when onProgress is provided", async () => {
    vi.useFakeTimers();

    mockedAxios.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                data: {
                  data: {
                    ...mockTrack,
                    title: "Progress Track",
                  },
                  message: "Track uploaded successfully.",
                },
              }),
            1200,
          );
        }),
    );

    const progressUpdates: number[] = [];
    const uploadPromise = uploadTrack(
      {
        audio_file: new File(["audio-data"], "track.wav", {
          type: "audio/wav",
        }),
        title: "Progress Track",
      },
      (pct) => progressUpdates.push(pct),
    );

    await vi.advanceTimersByTimeAsync(600);
    expect(progressUpdates.length).toBeGreaterThan(0);

    await vi.advanceTimersByTimeAsync(600);
    const result = await uploadPromise;

    expect(result.data.title).toBe("Progress Track");
    expect(progressUpdates.at(-1)).toBe(100);
  });
});

describe("getMyTracks()", () => {
  it("returns a paginated list of the user's tracks", async () => {
    const result = await getMyTracks();

    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.pagination).toBeDefined();
    expect(result.pagination.page).toBe(1);
  });

  it("throws on 401 — unauthenticated", async () => {
    mockedAxios.get.mockRejectedValueOnce(
      new Error("Authorization header missing"),
    );

    await expect(getMyTracks()).rejects.toThrow();
  });
});

describe("getTrack()", () => {
  it("returns a full track object for a valid ID", async () => {
    const result = await getTrack("e5f6a7b8-c9d0-1234-efab-567890abcdef");

    expect(result.data.id).toBe("e5f6a7b8-c9d0-1234-efab-567890abcdef");
    expect(result.data.status).toBe("ready");
    expect(result.data.stream_url).toBeTruthy();
  });

  it("throws on 404 — track not found", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Resource not found."));

    await expect(getTrack("non-existent-id")).rejects.toThrow();
  });

  it("throws on 403 — private track accessed by non-owner", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("This track is private."));

    await expect(getTrack("private-track-id")).rejects.toThrow();
  });
});

describe("updateTrack()", () => {
  it("returns updated track on success", async () => {
    const result = await updateTrack("e5f6a7b8-c9d0-1234-efab-567890abcdef", {
      title: "Summer Vibes (Remastered)",
    });

    expect(result.data.title).toBe("Summer Vibes (Remastered)");
    expect(result.message).toBeTruthy();
  });

  it("throws on 401 — unauthenticated", async () => {
    mockedAxios.patch.mockRejectedValueOnce(
      new Error("Authorization header missing"),
    );

    await expect(
      updateTrack("e5f6a7b8-c9d0-1234-efab-567890abcdef", {
        title: "New Title",
      }),
    ).rejects.toThrow();
  });
});

describe("deleteTrack()", () => {
  it("returns success true on deletion", async () => {
    const result = await deleteTrack("e5f6a7b8-c9d0-1234-efab-567890abcdef");
    expect(result.data.success).toBe(true);
  });

  it("throws on 404 — track not found", async () => {
    mockedAxios.delete.mockRejectedValueOnce(new Error("Resource not found."));

    await expect(deleteTrack("non-existent-id")).rejects.toThrow();
  });
});

describe("setTrackVisibility()", () => {
  it("sets track to private successfully", async () => {
    const result = await setTrackVisibility(
      "e5f6a7b8-c9d0-1234-efab-567890abcdef",
      false,
    );
    expect(result.data.success).toBe(true);
  });

  it("sets track to public successfully", async () => {
    const result = await setTrackVisibility(
      "e5f6a7b8-c9d0-1234-efab-567890abcdef",
      true,
    );
    expect(result.data.success).toBe(true);
  });

  it("throws on 401 — unauthenticated", async () => {
    mockedAxios.patch.mockRejectedValueOnce(
      new Error("Authorization header missing"),
    );

    await expect(
      setTrackVisibility("e5f6a7b8-c9d0-1234-efab-567890abcdef", false),
    ).rejects.toThrow();
  });
});

describe("getGenres()", () => {
  it("returns genres from the API", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        data: [
          { id: "genre-rock", name: "rock" },
          { id: "genre-pop", name: "pop" },
        ],
      },
    } as any);

    await expect(getGenres()).resolves.toEqual([
      { id: "genre-rock", name: "rock" },
      { id: "genre-pop", name: "pop" },
    ]);
  });

  it("returns an empty array when the API returns no genres", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: [] },
    } as any);

    await expect(getGenres()).resolves.toEqual([]);
  });

  it("falls back to an empty array when genres cannot be fetched", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("network error"));

    await expect(getGenres()).resolves.toEqual([]);
  });
});
