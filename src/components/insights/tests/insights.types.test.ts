import { describe, it, expect } from "vitest";
import { PERIOD_LABELS, PERIOD_SUFFIX } from "../insights.types";

describe("PERIOD_LABELS", () => {
  it("has a label for every period key", () => {
    expect(Object.keys(PERIOD_LABELS)).toEqual(["today", "7d", "30d", "12m", "all"]);
  });

  it("maps today → Today", () => {
    expect(PERIOD_LABELS["today"]).toBe("Today");
  });

  it("maps 7d → Last 7 days", () => {
    expect(PERIOD_LABELS["7d"]).toBe("Last 7 days");
  });

  it("maps 30d → Last 30 days", () => {
    expect(PERIOD_LABELS["30d"]).toBe("Last 30 days");
  });

  it("maps 12m → Last 12 months", () => {
    expect(PERIOD_LABELS["12m"]).toBe("Last 12 months");
  });

  it("maps all → All time", () => {
    expect(PERIOD_LABELS["all"]).toBe("All time");
  });
});

describe("PERIOD_SUFFIX", () => {
  it("has a suffix for every period key", () => {
    expect(Object.keys(PERIOD_SUFFIX)).toEqual(["today", "7d", "30d", "12m", "all"]);
  });

  it("maps today → today", () => {
    expect(PERIOD_SUFFIX["today"]).toBe("today");
  });

  it("maps 7d → last 7 days", () => {
    expect(PERIOD_SUFFIX["7d"]).toBe("last 7 days");
  });

  it("maps 30d → last 30 days", () => {
    expect(PERIOD_SUFFIX["30d"]).toBe("last 30 days");
  });

  it("maps 12m → last 12 months", () => {
    expect(PERIOD_SUFFIX["12m"]).toBe("last 12 months");
  });

  it("maps all → since 2026", () => {
    expect(PERIOD_SUFFIX["all"]).toBe("since 2026");
  });
});
