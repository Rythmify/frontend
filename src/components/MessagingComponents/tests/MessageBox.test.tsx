import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageBox } from "../MessageBox";

vi.mock("@/services/api/messaging/conversationApi", () => ({
  resolvePermalink: vi.fn(),
  fetchTrack: vi.fn(),
  fetchPlaylist: vi.fn(),
}));

import {
  resolvePermalink,
  fetchTrack,
  fetchPlaylist,
} from "@/services/api/messaging/conversationApi";

const renderBox = (props = {}) =>
  render(
    <MessageBox
      onValueChange={vi.fn()}
      onIsEmptyChange={vi.fn()}
      onEmbedResolved={vi.fn()}
      {...props}
    />
  );

// Helper: simulate typing a full string at once via fireEvent (no timer issues).
// Used only for debounce tests where we control the clock manually.
const fireType = (element: HTMLElement, value: string) =>
  fireEvent.change(element, { target: { value } });

describe("MessageBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the textarea", () => {
    renderBox();
    expect(screen.getByTestId("message-input")).toBeInTheDocument();
  });

  it("does not render title initially", () => {
    renderBox();
    expect(screen.queryByTestId("message-box-title")).not.toBeInTheDocument();
  });

  it("has correct data-test on wrapper", () => {
    renderBox();
    expect(screen.getByTestId("message-box")).toBeInTheDocument();
  });

  // ── Typing (real timers, userEvent) ────────────────────────────────────────

  it("calls onValueChange when user types", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderBox({ onValueChange });
    await user.type(screen.getByTestId("message-input"), "Hello");
    expect(onValueChange).toHaveBeenCalledWith("Hello");
  });

  it("calls onIsEmptyChange(false) when text is entered", async () => {
    const user = userEvent.setup();
    const onIsEmptyChange = vi.fn();
    renderBox({ onIsEmptyChange });
    await user.type(screen.getByTestId("message-input"), "H");
    expect(onIsEmptyChange).toHaveBeenCalledWith(false);
  });

  it("calls onIsEmptyChange(true) when text is cleared", async () => {
    const user = userEvent.setup();
    const onIsEmptyChange = vi.fn();
    renderBox({ onIsEmptyChange });
    const input = screen.getByTestId("message-input");
    await user.type(input, "H");
    await user.clear(input);
    expect(onIsEmptyChange).toHaveBeenCalledWith(true);
  });

  it("calls onEmbedResolved(null) when no URL is in text", async () => {
    const user = userEvent.setup();
    const onEmbedResolved = vi.fn();
    renderBox({ onEmbedResolved });
    await user.type(screen.getByTestId("message-input"), "Just text");
    expect(onEmbedResolved).toHaveBeenCalledWith(null);
  });

  // ── Error styling ──────────────────────────────────────────────────────────

  it("applies error border class when hasError is true", () => {
    renderBox({ hasError: true });
    expect(screen.getByTestId("message-input")).toHaveClass("border-red-500");
  });

  it("applies normal border class when hasError is false", () => {
    renderBox({ hasError: false });
    expect(screen.getByTestId("message-input")).not.toHaveClass("border-red-500");
  });

  // ── Debounced URL embed detection ──────────────────────────────────────────
  // We use fireEvent.change (synchronous, no internal delays) instead of
  // userEvent.type so that fake timers control ALL async behaviour.
  // Pattern: fireType → install fake timers → advance 600ms → flush promises.

  describe("debounced URL embed detection", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("does not call resolvePermalink immediately on URL input (debounced)", () => {
      renderBox();
      fireType(
        screen.getByTestId("message-input"),
        "https://rythmify.com/tracks/123"
      );
      // Debounce delay has NOT elapsed — resolvePermalink must not be called yet
      expect(resolvePermalink).not.toHaveBeenCalled();
    });

    it("calls resolvePermalink after debounce when URL is typed", async () => {
      (resolvePermalink as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { type: "track", id: "t-1" },
      });
      (fetchTrack as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { title: "My Track", id: "t-1" },
      });

      renderBox();
      fireType(
        screen.getByTestId("message-input"),
        "https://rythmify.com/tracks/t-1"
      );

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      await waitFor(() => expect(resolvePermalink).toHaveBeenCalled());
    });

    it("renders track title after successful track embed resolution", async () => {
      (resolvePermalink as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { type: "track", id: "t-1" },
      });
      (fetchTrack as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { title: "Awesome Track", id: "t-1" },
      });

      renderBox();
      fireType(
        screen.getByTestId("message-input"),
        "https://rythmify.com/tracks/t-1"
      );

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      await waitFor(() =>
        expect(screen.getByTestId("message-box-title")).toHaveTextContent("Awesome Track")
      );
    });

    it("renders playlist title after successful playlist embed resolution", async () => {
      (resolvePermalink as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { type: "playlist", id: "p-1" },
      });
      (fetchPlaylist as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { title: "My Playlist", id: "p-1" },
      });

      renderBox();
      fireType(
        screen.getByTestId("message-input"),
        "https://rythmify.com/playlists/p-1"
      );

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      await waitFor(() =>
        expect(screen.getByTestId("message-box-title")).toHaveTextContent("My Playlist")
      );
    });

    it("clears title when embed resolution fails", async () => {
      (resolvePermalink as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Not found")
      );

      renderBox();
      fireType(
        screen.getByTestId("message-input"),
        "https://rythmify.com/tracks/bad"
      );

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      await waitFor(() =>
        expect(screen.queryByTestId("message-box-title")).not.toBeInTheDocument()
      );
    });

    it("calls onEmbedResolved with track embed data on success", async () => {
      const onEmbedResolved = vi.fn();
      (resolvePermalink as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { type: "track", id: "t-99" },
      });
      (fetchTrack as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { title: "Track 99", id: "t-99" },
      });

      renderBox({ onEmbedResolved });
      fireType(
        screen.getByTestId("message-input"),
        "https://rythmify.com/tracks/t-99"
      );

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      await waitFor(() =>
        expect(onEmbedResolved).toHaveBeenCalledWith(
          expect.objectContaining({ type: "track", id: "t-99" })
        )
      );
    });
  });
});