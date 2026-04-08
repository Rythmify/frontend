import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import PlaylistCard from "@/components/playlist/PlaylistCard";
import { mockAlbumPlaylists } from "@/services/mocks/discover";
import {
  getMyPlaylists,
  getLikedPlaylists,
  type Playlist,
} from "@/services/api/playlist/playlist.service";

const AlbumsForYou = () => {
  const [albums, setAlbums] = useState<Playlist[]>(mockAlbumPlaylists);

  useEffect(() => {
    Promise.all([
      getMyPlaylists({ limit: 50, is_album_view: true }),
      getLikedPlaylists({ limit: 50 }),
    ])
      .then(([created, liked]) => {
        const likedAlbums = liked.data.items.filter((p) => p.is_album_view);
        const merged = [...created.data.items, ...likedAlbums];
        const seen = new Set<string>();
        const unique = merged.filter((p) => {
          if (seen.has(p.playlist_id)) return false;
          seen.add(p.playlist_id);
          return true;
        });
        if (unique.length > 0) setAlbums(unique);
      })
      .catch(() => {}); // keep mock fallback on error
  }, []);

  return (
    <HorizontalCarousel title="Albums for you" data-section="albums-for-you">
      {albums.map((album) => (
        <PlaylistCard key={album.playlist_id} playlist={album} />
      ))}
    </HorizontalCarousel>
  );
};

export default AlbumsForYou;
