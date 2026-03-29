import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleExternalAbuse,
  handleExternalImpersonation,
  handleExternalTrademark,
  handleExternalOther,
} from "../externalhandler";

describe("externalhandler", () => {
  beforeEach(() => {
    vi.restoreAllMocks(); // clears call history from the previous test's spy
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  it("handleExternalAbuse opens the abuse URL in a new tab", () => {
    handleExternalAbuse();
    expect(window.open).toHaveBeenCalledWith(
      "https://help.soundcloud.com/hc/en-us/articles/115003566048-Reporting-abuse-or-harassment",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("handleExternalImpersonation opens the impersonation URL in a new tab", () => {
    handleExternalImpersonation();
    expect(window.open).toHaveBeenCalledWith(
      "https://help.soundcloud.com/hc/en-us/articles/115003564108-Reporting-impersonation",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("handleExternalTrademark opens the trademark URL in a new tab", () => {
    handleExternalTrademark();
    expect(window.open).toHaveBeenCalledWith(
      "https://help.soundcloud.com/hc/en-us/articles/115003445387-Reporting-trademark-infringement",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("handleExternalOther opens the other URL in a new tab", () => {
    handleExternalOther();
    expect(window.open).toHaveBeenCalledWith(
      "https://help.soundcloud.com/hc/en-us/articles/115003569668-Reporting-on-SoundCloud",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("each handler opens exactly one window", () => {
    handleExternalAbuse();
    expect(window.open).toHaveBeenCalledTimes(1);
  });

  it("all four handlers open different URLs", () => {
    handleExternalAbuse();
    handleExternalImpersonation();
    handleExternalTrademark();
    handleExternalOther();
    const calls = (window.open as ReturnType<typeof vi.fn>).mock.calls.map(
      (c) => c[0]
    );
    const unique = new Set(calls);
    expect(unique.size).toBe(4);
  });
});