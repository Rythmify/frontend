import { describe, it, expect } from "vitest";
import { getBarCount, getBarLabels, generateBars } from "../insights.helpers";
import type { Track } from "@/services/api/upload/track.service";

const makeTracks = (overrides: Partial<Track>[] = []): Track[] =>
  overrides.map((o, i) => ({
    id: `track-${i}`,
    title: `Track ${i}`,
    artists: null,
    genre: null,
    is_public: true,
    cover_image: null,
    audio_url: "",
    duration: 180,
    status: "ready" as const,
    created_at: "",
    play_count: 0,
    like_count: 0,
    comment_count: 0,
    repost_count: 0,
    ...o,
  }));

describe("getBarCount", () => {
  it("returns 24 for today", () => {
    expect(getBarCount("today")).toBe(24);
  });

  it("returns 7 for 7d", () => {
    expect(getBarCount("7d")).toBe(7);
  });

  it("returns 30 for 30d", () => {
    expect(getBarCount("30d")).toBe(30);
  });

  it("returns 12 for 12m", () => {
    expect(getBarCount("12m")).toBe(12);
  });

  it("returns 12 for all", () => {
    expect(getBarCount("all")).toBe(12);
  });
});

describe("getBarLabels", () => {
  it("returns 24 labels for today", () => {
    const labels = getBarLabels("today");
    expect(labels).toHaveLength(24);
  });

  it("labels index 0 as '0:00' for today", () => {
    const labels = getBarLabels("today");
    expect(labels[0]).toBe("0:00");
  });

  it("labels index 6 as '6:00' for today", () => {
    const labels = getBarLabels("today");
    expect(labels[6]).toBe("6:00");
  });

  it("labels index 12 as '12:00' for today", () => {
    const labels = getBarLabels("today");
    expect(labels[12]).toBe("12:00");
  });

  it("leaves non-multiple-of-6 indices empty for today", () => {
    const labels = getBarLabels("today");
    expect(labels[1]).toBe("");
    expect(labels[5]).toBe("");
  });

  it("returns 7 day-of-week labels for 7d", () => {
    const labels = getBarLabels("7d");
    expect(labels).toHaveLength(7);
    const validDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    labels.forEach((l) => expect(validDays).toContain(l));
  });

  it("returns 30 labels for 30d", () => {
    const labels = getBarLabels("30d");
    expect(labels).toHaveLength(30);
  });

  it("every 5th label is non-empty for 30d", () => {
    const labels = getBarLabels("30d");
    expect(labels[0]).not.toBe("");
    expect(labels[5]).not.toBe("");
    expect(labels[10]).not.toBe("");
  });

  it("off-5 labels are empty for 30d", () => {
    const labels = getBarLabels("30d");
    expect(labels[1]).toBe("");
    expect(labels[3]).toBe("");
  });

  it("returns 12 month labels for 12m", () => {
    const labels = getBarLabels("12m");
    expect(labels).toHaveLength(12);
    labels.forEach((l) => expect(l).toMatch(/^[A-Z][a-z]{2}$/));
  });

  it("returns 12 month labels for all", () => {
    const labels = getBarLabels("all");
    expect(labels).toHaveLength(12);
  });
});

describe("generateBars", () => {
  it("returns all zeros when tracks array is empty", () => {
    const bars = generateBars([], "7d", "plays");
    expect(bars).toHaveLength(7);
    expect(bars.every((v) => v === 0)).toBe(true);
  });

  it("returns correct number of bars for each period", () => {
    const tracks = makeTracks([{ play_count: 100 }]);
    expect(generateBars(tracks, "today", "plays")).toHaveLength(24);
    expect(generateBars(tracks, "7d", "plays")).toHaveLength(7);
    expect(generateBars(tracks, "30d", "plays")).toHaveLength(30);
    expect(generateBars(tracks, "12m", "plays")).toHaveLength(12);
    expect(generateBars(tracks, "all", "plays")).toHaveLength(12);
  });

  it("bar values sum to total play_count", () => {
    const tracks = makeTracks([{ play_count: 100 }, { play_count: 50 }]);
    const bars = generateBars(tracks, "7d", "plays");
    expect(bars.reduce((s, v) => s + v, 0)).toBe(150);
  });

  it("bar values sum to total like_count", () => {
    const tracks = makeTracks([{ like_count: 40 }, { like_count: 10 }]);
    const bars = generateBars(tracks, "7d", "likes");
    expect(bars.reduce((s, v) => s + v, 0)).toBe(50);
  });

  it("bar values sum to total comment_count", () => {
    const tracks = makeTracks([{ comment_count: 7 }, { comment_count: 3 }]);
    const bars = generateBars(tracks, "7d", "comments");
    expect(bars.reduce((s, v) => s + v, 0)).toBe(10);
  });

  it("bar values sum to total repost_count", () => {
    const tracks = makeTracks([{ repost_count: 5 }]);
    const bars = generateBars(tracks, "7d", "reposts");
    expect(bars.reduce((s, v) => s + v, 0)).toBe(5);
  });

  it("returns zeros for downloads metric (unsupported, returns 0 total)", () => {
    const tracks = makeTracks([{ play_count: 100 }]);
    const bars = generateBars(tracks, "7d", "downloads");
    expect(bars.every((v) => v === 0)).toBe(true);
  });

  it("all bar values are non-negative integers", () => {
    const tracks = makeTracks([{ play_count: 200 }]);
    const bars = generateBars(tracks, "30d", "plays");
    bars.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(v)).toBe(true);
    });
  });
});
