import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import AlbumCard from "@/components/playlist/PlaylistCard";
import type { Playlist } from "@/services/api/playlist/playlist.service";
import { getAlbumsForYou } from "@/services/api/discover.service";
import { mapDiscoveryAlbum } from "@/services/api/discover.mapper";
import { mockAlbumPlaylists } from "@/services/mocks/discover";

const AlbumsForYou = () => {
  const [albums, setAlbums] = useState<Playlist[]>([]);

  useEffect(() => {
    getAlbumsForYou()
      .then((res) => {
        const cards = res.data.map(mapDiscoveryAlbum);
        if (cards.length > 0) setAlbums(cards);
      })
      .catch(() => setAlbums(mockAlbumPlaylists));
  }, []);

  return (
    <div data-test="section-albums-for-you">
      <HorizontalCarousel title="Albums for you">
        {albums.map((album) => (
          <AlbumCard
            key={album.playlist_id}
            playlist={album}
            widthClassName="w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]"
          />
        ))}
      </HorizontalCarousel>
    </div>
  );
};

export default AlbumsForYou;
