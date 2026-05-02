import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PlaylistCover from "../PlaylistCover";

const createObjectURL = vi.fn(() => "blob:preview-image");

describe("PlaylistCover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(URL, "createObjectURL", {
      value: createObjectURL,
      configurable: true,
    });
  });

  it("renders the default cover image and upload button", () => {
    render(
      <PlaylistCover playlistId="pl-1" playlistName="My Playlist" />,
    );

    expect(screen.getByAltText("My Playlist")).toHaveAttribute(
      "src",
      expect.stringContaining("cdn.prod.website-files.com"),
    );
    expect(
      screen.getByTestId("button-upload-cover-hero-playlist"),
    ).toBeInTheDocument();
  });

  it("renders the collage layout when multiple cover images are provided", () => {
    render(
      <PlaylistCover
        playlistId="pl-1"
        playlistName="Collage"
        coverImages={["one.jpg", "two.jpg", "three.jpg"]}
      />,
    );

    expect(screen.getAllByAltText("Collage")).toHaveLength(3);
  });

  it("renders the station layout and view-only cover when isStation is true", () => {
    render(
      <PlaylistCover
        playlistId="pl-1"
        playlistName="Station"
        coverImages={["one.jpg"]}
        isStation
      />,
    );

    expect(screen.getByTestId("playlist-cover-station-rings")).toBeInTheDocument();
    expect(screen.getByText("STATION")).toBeInTheDocument();
    expect(screen.queryByTestId("button-upload-cover-hero-playlist")).toBeInTheDocument();
  });

  it("renders the for-you badge when isForYou is true", () => {
    render(
      <PlaylistCover
        playlistId="pl-1"
        playlistName="For You"
        coverImage="cover.jpg"
        isForYou
        forYouBadgeWords={["FOR", "YOU"]}
      />,
    );

    expect(screen.getByTestId("for-you-card-badge")).toHaveTextContent("FOR");
    expect(screen.getByTestId("for-you-card-badge")).toHaveTextContent("YOU");
  });

  it("renders the mix badge when isMix is true", () => {
    render(
      <PlaylistCover
        playlistId="pl-1"
        playlistName="Mix Name"
        coverImage="cover.jpg"
        isMix
      />,
    );

    expect(screen.getByTestId("mix-card-badge")).toHaveTextContent("Mix Name");
    expect(screen.getByTestId("mix-card-image")).toHaveAttribute("src", "cover.jpg");
  });

  it("renders the related badge when isMoreOfLike is true", () => {
    render(
      <PlaylistCover
        playlistId="pl-1"
        playlistName="Related"
        coverImages={["one.jpg"]}
        isMoreOfLike
      />,
    );

    expect(screen.getByTestId("more-of-like-card-badge")).toHaveTextContent("RELATED");
  });

  it("uses onUploadClick when provided", () => {
    const onUploadClick = vi.fn();
    render(
      <PlaylistCover
        playlistId="pl-1"
        playlistName="Upload"
        onUploadClick={onUploadClick}
      />,
    );

    fireEvent.click(screen.getByTestId("button-upload-cover-hero-playlist"));
    expect(onUploadClick).toHaveBeenCalledTimes(1);
  });

  it("updates the preview when a file is chosen and resets on playlist change", async () => {
    const onImageUpload = vi.fn();
    const { rerender } = render(
      <PlaylistCover
        playlistId="pl-1"
        playlistName="Upload"
        coverImage="cover.jpg"
        onImageUpload={onImageUpload}
      />,
    );

    const input = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["data"], "cover.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(onImageUpload).toHaveBeenCalledWith(file));
    expect(createObjectURL).toHaveBeenCalledWith(file);
    expect(screen.getByAltText("Upload")).toHaveAttribute("src", "blob:preview-image");

    rerender(
      <PlaylistCover
        playlistId="pl-2"
        playlistName="Upload"
        coverImage="cover.jpg"
      />,
    );

    expect(screen.getByAltText("Upload")).toHaveAttribute("src", "cover.jpg");
  });

  it("falls back to the SoundCloud home URL when the cover image fails", () => {
    render(
      <PlaylistCover
        playlistId="pl-1"
        playlistName="Broken Cover"
        coverImage="https://example.com/broken.jpg"
      />,
    );

    fireEvent.error(screen.getByAltText("Broken Cover"));

    expect(screen.getByAltText("Broken Cover")).toHaveAttribute(
      "src",
      "https://cdn.prod.website-files.com/62a0a0168756b795debc65bc/65df5bfb519e57f33c35d493_419679-1x1_SoundCloudLogo_cloudmark-f5912b-large-1645807040%20(2).jpg",
    );
  });
});
