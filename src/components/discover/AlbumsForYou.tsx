import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import type { DiscoveryAlbum } from "@/services/api/discover.service";
import {
  getAlbumsForYou,
  getAlbumPreviewTrackId,
} from "@/services/api/discover.service";
import { mapDiscoveryTrack } from "@/services/api/discover.mapper";
import AlbumCard from "../UI/AlbumCard";
import { useLikesStore } from "@/stores/likes.store";

const AlbumsForYou = () => {
  const [albums, setAlbums] = useState<DiscoveryAlbum[]>([]);
  const seedAlbums = useLikesStore((s) => s.seedAlbums);

  useEffect(() => {
    getAlbumsForYou()
      .then((res) => {
        if (res.data.length > 0) {
          setAlbums(res.data);
          seedAlbums(res.data);
        }
      })
      .catch();
  }, [seedAlbums]);

  if (!albums.length) return null;

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
              ownerId: album.owner_id,
              coverUrl: album.cover_image ?? null,
              trackCount: album.track_count,
              likeCount: album.like_count,
              createdAt: album.created_at,
              previewTrackId: getAlbumPreviewTrackId(album),
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
