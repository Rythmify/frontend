import type { Track } from "../../types/track";
import track1 from "../assets/audio/Track 1.mp3";
import track2 from "../assets/audio/Track 2.mp3";
import track3 from "../assets/audio/Track 3.mp3";
import track4 from "../assets/audio/Track 4.mp3";
import track5 from "../assets/audio/Track 5.mp3";

export const mockTracks: Track[] = [
  {
    id: 1,
    title: "Lege-Cy & Ghaliaa - Msh Awl Mara",
    artistName: "Lege-Cy",
    artistUsername: "lege-cy",
    coverUrl: "https://picsum.photos/seed/track1/300/300",
    genre: "R&B & Soul",
    likeCount: 14000,
    repostCount: 35,
    playCount: 507000,
    commentCount: 120,
    duration: "3:12",
    postedAt: "2 months ago",
    waveformData: [
      20, 45, 60, 30, 80, 55, 40, 70, 90, 35, 60, 75, 50, 85, 40, 65, 30, 55,
      70, 45, 80, 60, 35, 90, 50, 40, 75, 65, 55, 80, 30, 60, 45, 70, 85, 40,
      55, 65, 75, 30, 80, 50, 40, 90, 60, 35, 70, 55, 45, 80,
    ],
    audioUrl: track1,
    isPrivate: false,
    madeFor: "Shahd Yehya",
  },
  {
    id: 2,
    title: "Seneen",
    artistName: "Tul8te",
    artistUsername: "tul8te",
    coverUrl: "https://picsum.photos/seed/track2/300/300",
    genre: "R&B & Soul",
    likeCount: 8200,
    repostCount: 22,
    playCount: 210000,
    commentCount: 75,
    duration: "3:33",
    postedAt: "3 months ago",
    waveformData: [
      30, 55, 70, 40, 85, 60, 45, 75, 95, 40, 65, 80, 55, 90, 45, 70, 35, 60,
      75, 50, 85, 65, 40, 95, 55, 45, 80, 70, 60, 85, 35, 65, 50, 75, 90, 45,
      60, 70, 80, 35, 85, 55, 45, 95, 65, 40, 75, 60, 50, 85,
    ],
    audioUrl: track2,
    isPrivate: false,
    madeFor: undefined,
  },
  {
    id: 3,
    title: "Shababek'",
    artistName: "Mohamed Mounir",
    artistUsername: "mohamed-mounir",
    coverUrl: "https://picsum.photos/seed/track3/300/300",
    genre: "R&B & Soul",
    likeCount: 5100,
    repostCount: 18,
    playCount: 130000,
    commentCount: 42,
    duration: "4:52",
    postedAt: "4 months ago",
    waveformData: [
      15, 40, 55, 25, 75, 50, 35, 65, 85, 30, 55, 70, 45, 80, 35, 60, 25, 50,
      65, 40, 75, 55, 30, 85, 45, 35, 70, 60, 50, 75, 25, 55, 40, 65, 80, 35,
      50, 60, 70, 25, 75, 45, 35, 85, 55, 30, 65, 50, 40, 75,
    ],
    audioUrl: track3,
    isPrivate: false,
    madeFor: undefined,
  },
  {
    id: 4,
    title: "Mafish",
    artistName: "Donia Wael",
    artistUsername: "donia-wael",
    coverUrl: "https://picsum.photos/seed/track4/300/300",
    genre: "R&B & Soul",
    likeCount: 3400,
    repostCount: 12,
    playCount: 89000,
    commentCount: 28,
    duration: "2:38",
    postedAt: "5 months ago",
    waveformData: [
      25, 50, 65, 35, 80, 55, 40, 70, 90, 35, 60, 75, 50, 85, 40, 65, 30, 55,
      70, 45, 80, 60, 35, 90, 50, 40, 75, 65, 55, 80, 30, 60, 45, 70, 85, 40,
      55, 65, 75, 30, 80, 50, 40, 90, 60, 35, 70, 55, 45, 80,
    ],
    audioUrl: track4,
    isPrivate: false,
    madeFor: undefined,
  },
  {
    id: 5,
    title: "Elwa2t Eldaye3",
    artistName: "Lege-Cy",
    artistUsername: "lege-cy",
    coverUrl: "https://picsum.photos/seed/track5/300/300",
    genre: "R&B & Soul",
    likeCount: 2800,
    repostCount: 9,
    playCount: 67000,
    commentCount: 19,
    duration: "2:54",
    postedAt: "6 months ago",
    waveformData: [
      20, 45, 60, 30, 75, 50, 35, 65, 85, 30, 55, 70, 45, 80, 35, 60, 25, 50,
      65, 40, 75, 55, 30, 85, 45, 35, 70, 60, 50, 75, 25, 55, 40, 65, 80, 35,
      50, 60, 70, 25, 75, 45, 35, 85, 55, 30, 65, 50, 40, 75,
    ],
    audioUrl: track5,
    isPrivate: false,
    madeFor: undefined,
  },
];

export const mockTrack = mockTracks[0];

// Config toggle: swap for real API when ready
export const USE_MOCK_DATA = true;