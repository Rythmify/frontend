import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import type { DiscoveryAlbum } from "@/services/api/discover.service";
import { getAlbumsForYou } from "@/services/api/discover.service";
import { mapDiscoveryTrack } from "@/services/api/discover.mapper";
import AlbumCard from "../UI/AlbumCard";

const AlbumsForYou = () => {
  const [albums, setAlbums] = useState<DiscoveryAlbum[]>([]);

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
          <AlbumCard
            key={album.id}
            widthClassName="w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]"
            item={{
              id: album.id,
              title: album.name,
              owner: album.owner_name,
              slug: null,
              coverUrl: album.cover_image ?? null,
              isAlbumView: true,
              previewTrack: album.preview_track
                ? mapDiscoveryTrack(album.preview_track)
                : undefined,
            }}
          />
        ))}
      </HorizontalCarousel>
    </div>
  );
};

export default AlbumsForYou;
