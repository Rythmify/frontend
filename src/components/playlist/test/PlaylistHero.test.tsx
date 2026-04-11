import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlaylistHero from "../PlaylistHero";

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => ({ user: { displayName: "Mariam", username: "mariam" } }),
}));

const mockPlaylist = {
  playlist_id: "pl-1",
  name: "Electronic Mix",
  is_public: true,
  track_count: 12,
  owner_user_id: "Mariam",
  cover_image: "cover.jpg",
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

});
