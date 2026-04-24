import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import PlaylistCard from "../UI/PlaylistCard/PlaylistCard";
import type { Playlist } from "@/services/api/playlist/playlist.service";
import { getAlbumsForYou } from "@/services/api/discover.service";
import { mockAlbumPlaylists } from "@/services/mocks/handlers/playlistHandlers";

const AlbumsForYou = () => {
  const [albums, setAlbums] = useState<Playlist[]>([]);

  useEffect(() => {
    getAlbumsForYou()
      .then((res) => {
        if (res.data.length > 0) setAlbums(res.data);
      })
      .catch();
  }, []);

  return (
    <div data-test="section-albums-for-you">
      <HorizontalCarousel title="Albums for you" data-section="albums-for-you">
        {albums.map((album) => (
          <PlaylistCard
            key={album.playlist_id}
            widthClassName="w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]"
            item={{
              id: album.playlist_id,
              title: album.name,
              owner: album.owner_user_id,
              slug: null,
              coverUrl: album.cover_image ?? null,
              isPrivate: !album.is_public,
              isAlbumView: true,
            }}
          />
        ))}
      </HorizontalCarousel>
    </div>
  );
};

export default AlbumsForYou;
