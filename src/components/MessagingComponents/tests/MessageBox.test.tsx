import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
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

// Synchronously sets the textarea value and fires onChange.
// Used in debounce tests so fake timers control ALL async work —
// userEvent.type uses its own internal setTimeout delays which
// conflict with vi.useFakeTimers() and cause indefinite hangs.
const fireType = (element: HTMLElement, value: string) =>
  fireEvent.change(element, { target: { value } });

// Fires all pending timers AND flushes resulting Promise microtasks,
// then wraps everything in act() so React commits all setState calls to the DOM.
const runAllTimers = () => act(async () => { await vi.runAllTimersAsync(); });

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

  // ── Typing (real timers + userEvent) ───────────────────────────────────────

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
  //
  // PROBLEM (the last 2 failures):
  //   vi.runAllTimersAsync() fires the debounce setTimeout and drains Promise
  //   microtasks (resolvePermalink, fetchTrack chains), but React's setTitle()
  //   calls happen INSIDE those async callbacks. React batches setState and
  //   only commits them to the DOM when the update is flushed inside act().
  //   Without act(), the DOM never updates — so getByTestId("message-box-title")
  //   finds nothing even though setTitle("Awesome Track") was called.
  //
  // FIX:
  //   Wrap vi.runAllTimersAsync() inside act(async () => { ... }).
  //   act() tells React "flush everything now" — timers fire, promises drain,
  //   and all resulting setState calls are committed to the DOM before we assert.
  //
  //   Extracted into the runAllTimers() helper above for readability.

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

      await runAllTimers();

      expect(resolvePermalink).toHaveBeenCalled();
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

      await runAllTimers();

      expect(screen.getByTestId("message-box-title")).toHaveTextContent("Awesome Track");
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

      await runAllTimers();

      expect(screen.getByTestId("message-box-title")).toHaveTextContent("My Playlist");
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

      await runAllTimers();

      expect(screen.queryByTestId("message-box-title")).not.toBeInTheDocument();
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

      await runAllTimers();

      expect(onEmbedResolved).toHaveBeenCalledWith(
        expect.objectContaining({ type: "track", id: "t-99" })
      );
    });
  });
});