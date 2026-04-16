import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlaylistHero from "../PlaylistHero";

vi.mock("@/services/mocks/Track.service", () => ({
  getTrackComments: vi.fn().mockResolvedValue([
    { id: 1, avatarUrl: "https://picsum.photos/seed/comment-a/40/40", timestamp: 18 },
    { id: 2, avatarUrl: "https://picsum.photos/seed/comment-b/40/40", timestamp: 64 },
  ]),
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => ({ user: { displayName: "Mariam", username: "mariam" } }),
}));

vi.mock(
  "@/pages/[username]/[trackSlug]/components/TrackWaveform",
  () => ({
    default: () => <div data-test="mock-playlist-waveform" />,
  }),
);

const mockPlaylist = {
  playlist_id: "8d5a8f6c-7b4a-4c7a-9c25-9a9f1e3a12aa",
  name: "Electronic Mix",
  is_public: true,
  track_count: 12,
  owner_user_id: "Mariam",
  cover_image: "cover.jpg",
  tracks: [
    { track_id: "11111111-1111-1111-1111-111111111111", duration: 225 },
    { track_id: "22222222-2222-2222-2222-222222222222", duration: 200 },
    { track_id: "33333333-3333-3333-3333-333333333333", duration: 194 },
  ],
} as any;

describe("PlaylistHero", () => {
  it("renders playlist name and track count", () => {
    render(
      <MemoryRouter>
        <PlaylistHero playlist={mockPlaylist} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Electronic Mix")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("10:19")).toBeInTheDocument();
    expect(
      screen.queryByTestId("mock-playlist-waveform"),
    ).not.toBeInTheDocument();
  });

  it("calls onPlayPause when the hero play button is clicked", () => {
    const onPlayPause = vi.fn();
    render(
      <MemoryRouter>
        <PlaylistHero playlist={mockPlaylist} onPlayPause={onPlayPause} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("button-play-pause-hero-playlist"));
    expect(onPlayPause).toHaveBeenCalled();
  });

  it("shows Private badge only when playlist is not public", () => {
    const { rerender } = render(
      <MemoryRouter>
        <PlaylistHero playlist={{ ...mockPlaylist, is_public: true }} />
      </MemoryRouter>,
    );
    expect(screen.queryByText(/Private/)).not.toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <PlaylistHero playlist={{ ...mockPlaylist, is_public: false }} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Private/)).toBeInTheDocument();
  });

  it("renders the replace image button", () => {
    render(
      <MemoryRouter>
        <PlaylistHero playlist={mockPlaylist} />
      </MemoryRouter>,
    );
    expect(
      screen.getByTestId("button-upload-cover-hero-playlist"),
    ).toBeInTheDocument();
  });

  it("hides the replace image button when showUploadButton is false", () => {
    render(
      <MemoryRouter>
        <PlaylistHero playlist={mockPlaylist} showUploadButton={false} />
      </MemoryRouter>,
    );
    expect(
      screen.queryByTestId("button-upload-cover-hero-playlist"),
    ).not.toBeInTheDocument();
  });

  it("triggers file upload when replace image is clicked", () => {
    render(
      <MemoryRouter>
        <PlaylistHero playlist={mockPlaylist} />
      </MemoryRouter>,
    );
    const input = document.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    const spy = vi.spyOn(input, "click");
    fireEvent.click(screen.getByTestId("button-upload-cover-hero-playlist"));
    expect(spy).toHaveBeenCalled();
  });

  it("calls onImageUpload when a file is chosen", () => {
    const onUpload = vi.fn();
    render(
      <MemoryRouter>
        <PlaylistHero playlist={mockPlaylist} onImageUpload={onUpload} />
      </MemoryRouter>,
    );
    const input = document.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    const file = new File(["foo"], "photo.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it("shows comment avatars when the playlist is playing an active track", async () => {
    render(
      <MemoryRouter>
        <PlaylistHero
          playlist={mockPlaylist}
          isPlaying
          activeTrackId="11111111-1111-1111-1111-111111111111"
        />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("playlist-comment-avatars")).toBeInTheDocument(),
    );
    expect(screen.getAllByAltText("commenter")).toHaveLength(2);
  });

  it("shows the waveform and hides the circular stats when playing", () => {
    render(
      <MemoryRouter>
        <PlaylistHero
          playlist={mockPlaylist}
          isPlaying
          activeTrackId="11111111-1111-1111-1111-111111111111"
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("mock-playlist-waveform")).toBeInTheDocument();
    expect(screen.queryByText("Tracks")).not.toBeInTheDocument();
  });

});
