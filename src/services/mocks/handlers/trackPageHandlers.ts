import { http, HttpResponse } from "msw";
import { mockUsers } from "../users";
import type { Track } from "../../../types/track";

const BASE = "*/api/v1";

const mockTracksJson: Track[] = [
  {
    id: "198d5f30-8c20-4e0f-9a95-367f08e8b0b1",
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
    audioUrl: "/audio/Track 1.mp3",
    trackSlug: "lege-cy-ghaliaa-msh-awl-mara",
    isPrivate: false,
    madeFor: "Shahd Yehya",
  },
  {
    id: "3f92b0c1-4d32-4861-a034-78e920d5f1a2",
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
    audioUrl: "/audio/Track 2.mp3",
    trackSlug: "seneen",
    isPrivate: false,
    madeFor: undefined,
  },
  {
    id: "7c9e1d20-b3a1-4f0e-8d2a-567c8b9d0e1f",
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
    audioUrl: "/audio/Track 3.mp3",
    trackSlug: "shababek",
    isPrivate: false,
    madeFor: undefined,
  },
  {
    id: "f5e4d3c2-b1a0-4987-8765-43210abcdef0",
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
    audioUrl: "/audio/Track 4.mp3",
    trackSlug: "mafish",
    isPrivate: false,
    madeFor: undefined,
  },
  {
    id: "0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a",
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
    audioUrl: "/audio/Track 5.mp3",
    trackSlug: "elwa2t-eldaye3",
    isPrivate: false,
    madeFor: undefined,
  },
];

export const trackPageHandlers = [
  http.get(`${BASE}/tracks`, () => {
    return HttpResponse.json(mockTracksJson);
  }),

  http.get(`${BASE}/tracks/:id/related`, ({ params }) => {
    const related = mockTracksJson.filter((t) => t.id !== params.id);
    return HttpResponse.json(related);
  }),

  http.get(`${BASE}/:username/:slug`, ({ params }) => {
    const slug = (params.slug as string).toLowerCase();

    // Helper to roughly slugify a title for matching
    const slugify = (text: string) =>
      text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Find a track where the slugified title includes the URL slug
    const track =
      mockTracksJson.find((t) => slugify(t.title).includes(slug)) ??
      mockTracksJson[slug.length % mockTracksJson.length]; // Deterministic fallback

    return HttpResponse.json(track);
  }),

  http.post(`${BASE}/tracks/:id/like`, ({ params }) => {
    const track = mockTracksJson.find((t) => t.id === params.id);
    if (!track)
      return HttpResponse.json({ error: "Track not found" }, { status: 404 });
    return HttpResponse.json({ liked: true, likeCount: track.likeCount + 1 });
  }),

  http.delete(`${BASE}/tracks/:id/like`, ({ params }) => {
    const track = mockTracksJson.find((t) => t.id === params.id);
    if (!track)
      return HttpResponse.json({ error: "Track not found" }, { status: 404 });
    return HttpResponse.json({ liked: false, likeCount: track.likeCount - 1 });
  }),

  http.post(`${BASE}/tracks/:id/repost`, ({ params }) => {
    const track = mockTracksJson.find((t) => t.id === params.id);
    if (!track)
      return HttpResponse.json({ error: "Track not found" }, { status: 404 });
    return HttpResponse.json({
      reposted: true,
      repostCount: track.repostCount + 1,
    });
  }),

  http.get(`${BASE}/tracks/:id/comments`, () => {
    return HttpResponse.json([]);
  }),

  http.post(`${BASE}/tracks/:id/comments`, async ({ request, params }) => {
    const body = (await request.json()) as { text: string; timestamp: number };
    return HttpResponse.json(
      {
        id: crypto.randomUUID(), // Using random UUID for the new comment
        trackId: params.id as string, // Keeping trackId as string
        text: body.text,
        timestamp: body.timestamp ?? 0,
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  http.get(`${BASE}/users`, () => {
    return HttpResponse.json(Array.isArray(mockUsers) ? mockUsers : []);
  }),

  http.get(`${BASE}/users/:username`, ({ params }) => {
    const user = mockUsers.find((u) => u.username === params.username);
    if (!user)
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    return HttpResponse.json(user);
  }),

  http.post(`${BASE}/users/:username/follow`, ({ params }) => {
    const user = mockUsers.find((u) => u.username === params.username);
    if (!user)
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    return HttpResponse.json({
      following: true,
      followerCount: user.followerCount + 1,
    });
  }),

  http.delete(`${BASE}/users/:username/follow`, ({ params }) => {
    const user = mockUsers.find((u) => u.username === params.username);
    if (!user)
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    return HttpResponse.json({
      following: false,
      followerCount: user.followerCount - 1,
    });
  }),
];
