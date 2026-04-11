import type { Playlist } from "../../types/playlist";
import { mockTracks } from "./tracks";

/** mock playlists*/
export const mockPlaylists: Playlist[] = [
  {
    id: "1",
    title: "Lege-Cy & Ghaliaa - Msh Awl Mara مش أول مرة",
    creatorUsername: "showw2000",
    creatorName: "Showw2000",
    coverUrl: "https://picsum.photos/seed/playlist1/300/300",
    postedAt: "1 month ago",
    trackCount: 5,
    likeCount: 14200,
    repostCount: 580,
    playlistSlug: "msh-awl-mara",
    isPrivate: false,
    tracks: mockTracks.slice(0, 5),
  },
  {
    id: "2",
    title: "Egyptian R&B Vibes – Summer Mix",
    creatorUsername: "dj-flux",
    creatorName: "DJ FLUX",
    coverUrl: undefined, // triggers mosaic fallback
    postedAt: "3 weeks ago",
    trackCount: 8,
    likeCount: 8900,
    repostCount: 268,
    playlistSlug: "egyptian-rb-summer-mix",
    isPrivate: false,
    tracks: mockTracks.slice(1, 5),
  },
  {
    id: "3",
    title: "Private Chill Session",
    creatorUsername: "shahd",
    creatorName: "Shahd",
    coverUrl: "https://picsum.photos/seed/playlist3/300/300",
    postedAt: "2 days ago",
    trackCount: 3,
    likeCount: 0,
    repostCount: 0,
    playlistSlug: "private-chill",
    isPrivate: true,
    tracks: mockTracks.slice(0, 3),
  },
];
