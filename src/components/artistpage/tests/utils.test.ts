import { describe, it, expect } from "vitest";
import { formatDuration, formatDate } from "../utils";

describe("formatDuration", () => {
  it("returns '0:00' for null", () => {
    expect(formatDuration(null)).toBe("0:00");
  });

  it("returns '0:00' for undefined", () => {
    expect(formatDuration(undefined)).toBe("0:00");
  });

  it("returns '0:00' for 0", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("formats 60 seconds as 1:00", () => {
    expect(formatDuration(60)).toBe("1:00");
  });

  it("formats 65 seconds as 1:05", () => {
    expect(formatDuration(65)).toBe("1:05");
  });

  it("formats 180 seconds as 3:00", () => {
    expect(formatDuration(180)).toBe("3:00");
  });

  it("pads single-digit seconds with leading zero", () => {
    expect(formatDuration(61)).toBe("1:01");
    expect(formatDuration(609)).toBe("10:09");
  });

  it("formats 3599 seconds as 59:59", () => {
    expect(formatDuration(3599)).toBe("59:59");
  });

  it("rounds seconds correctly", () => {
    expect(formatDuration(90)).toBe("1:30");
  });
});

describe("formatDate", () => {
  it("returns '—' for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns '—' for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("returns '—' for empty string", () => {
    expect(formatDate("")).toBe("—");
  });

  it("formats a valid ISO date string containing month, day, and year", () => {
    const result = formatDate("2024-03-15T00:00:00Z");
    expect(result).toMatch(/Mar/);
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/15/);
  });

  it("formats January correctly", () => {
    const result = formatDate("2023-01-01T00:00:00Z");
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2023/);
  });

  it("formats December correctly", () => {
    const result = formatDate("2022-12-31T00:00:00Z");
    expect(result).toMatch(/Dec/);
    expect(result).toMatch(/2022/);
  });
});
