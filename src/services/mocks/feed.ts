import type { FeedItem } from "@/types/feedItem";
import { mockTracks } from "./tracks";

export const mockFeedItems: FeedItem[] = [
  {
    id: "f1",
    type: "repost",
    content_type: "track",
    created_at: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(), // 13 hours ago
    user: {
      id: "1",
      username: "nourabosaif04",
      displayName: "NourAbosaif04",
      avatar: "https://picsum.photos/seed/nour/100/100",
      followers: 320,
    },
    track: mockTracks[0],
  },
  {
    id: "f2",
    type: "post",
    content_type: "playlist",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    user: {
      id: "3",
      username: "alyaa-moh",
      displayName: "Alyaa Mohamed",
      avatar: "https://picsum.photos/seed/alyaa/100/100",
      followers: 8400,
    },
    playlist: {
      id: "1",
      title: "araby",
      artistName: "Alyaa Mohamed",
      artistUsername: "alyaa-moh",
      coverUrl: "https://picsum.photos/seed/playlist1/300/300",
      duration: "4:13",
      likeCount: 12,
      repostCount: 3,
      playCount: 1980,
      commentCount: 7,
      waveformData: mockTracks[2].waveformData,
      audioUrl: mockTracks[2].audioUrl,
      trackCount: 198,
      tracks: mockTracks.slice(0, 5),
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: "f3",
    type: "post",
    content_type: "track",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    user: {
      id: "2",
      username: "moh-elghaleez",
      displayName: "Moh.ElGhaleez",
      avatar: "https://picsum.photos/seed/moh/100/100",
      followers: 1500,
    },
    track: mockTracks[1],
  },
  {
    id: "f4",
    type: "repost",
    content_type: "playlist",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    user: {
      id: "4",
      username: "ghaliaa",
      displayName: "Ghaliaa",
      avatar: "https://picsum.photos/seed/user2/100/100",
      followers: 31500,
      isVerified: true,
    },
    playlist: {
      id: "2",
      title: "Late Night Vibes",
      artistName: "Lege-Cy",
      artistUsername: "lege-cy",
      coverUrl: "https://picsum.photos/seed/playlist2/300/300",
      duration: "18:32",
      likeCount: 340,
      repostCount: 22,
      playCount: 47200,
      commentCount: 91,
      waveformData: mockTracks[0].waveformData,
      audioUrl: mockTracks[0].audioUrl,
      trackCount: 12,
      tracks: mockTracks.slice(0, 5),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: "f5",
    type: "post",
    content_type: "track",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    user: {
      id: "5",
      username: "lege-cy",
      displayName: "Lege-Cy",
      avatar: "https://picsum.photos/seed/user1/100/100",
      followers: 42000,
      isVerified: true,
    },
    track: mockTracks[3],
  },
  {
    id: "f6",
    type: "repost",
    content_type: "track",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    user: {
      id: "6",
      username: "hadeer-yehya",
      displayName: "Hadeer",
      avatar: "https://picsum.photos/seed/user3/100/100",
      followers: 18200,
    },
    track: mockTracks[4],
  },
];

export const USE_MOCK_FEED = true;