import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import PlaylistCard from "@/components/UI/PlaylistCard/PlaylistCard";
import type { PlaylistCardData } from "@/components/UI/PlaylistCard/PlaylistCard";
import { getAlbumsForYou } from "@/services/api/discover.service";
import { mapDiscoveryAlbum } from "@/services/api/discover.mapper";

function toPlaylistCardData(
  p: ReturnType<typeof mapDiscoveryAlbum>,
): PlaylistCardData {
  return {
    id: p.playlist_id,
    title: p.name,
    owner: p.owner_user_id,
    coverUrl: p.cover_image ?? null,
  };
}

const AlbumsForYou = () => {
  const [albums, setAlbums] = useState<PlaylistCardData[]>([]);

  useEffect(() => {
    getAlbumsForYou()
      .then((res) => {
        const cards = res.data.map(mapDiscoveryAlbum).map(toPlaylistCardData);
        if (cards.length > 0) setAlbums(cards);
      })
      .catch(() => {});
  }, []);

  if (albums.length === 0) return null;

  return (
    <HorizontalCarousel title="Albums for you" data-section="albums-for-you">
      {albums.map((album) => (
        <PlaylistCard key={album.id} item={album} />
      ))}
    </HorizontalCarousel>
  );
};

export default AlbumsForYou;

//Nour's AlbumForYou

// import { useState, useEffect } from "react";
// import HorizontalCarousel from "./HorizontalCarousel";
// import PlaylistCard from "@/components/Playlist/PlaylistCard";
// import { mockAlbumPlaylists } from "@/services/mocks/discover";
// import {
//   getMyPlaylists,
//   getLikedPlaylists,
//   type Playlist,
// } from "@/services/api/playlist/playlist.service";

// const AlbumsForYou = () => {
//   const [albums, setAlbums] = useState<Playlist[]>(mockAlbumPlaylists);

//   useEffect(() => {
//     Promise.all([
//       getMyPlaylists({ limit: 50, is_album_view: true }),
//       getLikedPlaylists({ limit: 50 }),
//     ])
//       .then(([created, liked]) => {
//         const likedAlbums = liked.data.items.filter((p) => p.is_album_view);
//         const merged = [...created.data.items, ...likedAlbums];
//         const seen = new Set<string>();
//         const unique = merged.filter((p) => {
//           if (seen.has(p.playlist_id)) return false;
//           seen.add(p.playlist_id);
//           return true;
//         });
//         if (unique.length > 0) setAlbums(unique);
//       })
//       .catch(() => {}); // keep mock fallback on error
//   }, []);

//   return (
//     <HorizontalCarousel title="Albums for you" data-section="albums-for-you">
//       {albums.map((album) => (
//         <PlaylistCard key={album.playlist_id} playlist={album} />
//       ))}
//     </HorizontalCarousel>
//   );
// };

// export default AlbumsForYou;
