import type { Track } from "@/types/track";
import type { Mix } from "@/types/mix";

// ─── Base Track Data ──────────────────────────────────────
const baseTrackData = {
  title: "ما أجهلك",
  artistName: "أمجد سمير",
  artistUsername: "amjad-samir", // Using artistUsername (not username)
  trackSlug: "ma-ajhalak",
  coverUrl:
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.5bunY-fh0HjO3ylZBApEygHaE7%3Fpid%3DApi&f=1&ipt=1405027ce312499797716b2bdb5b0806f702c8ef03bd97fa5fca3804ea34a121&ipo=images",
  genre: "Vocal",
  likeCount: 5140,
  repostCount: 70,
  playCount: 312000,
  commentCount: 99,
  duration: "4:32",
  postedAt: "2024-01-01",
  waveformData: [10, 20, 35, 50],
  audioUrl: "https://example.com/audio/ma-ajhalak.mp3",
};

// ─── Generated Mock Tracks ────────────────────────────────
// Generate 10 identical tracks with unique IDs
export const mockDiscoverTracks: Track[] = Array.from(
  { length: 10 },
  (_, index) => ({
    ...baseTrackData,
    id: index + 1, // IDs: 1, 2, 3, ..., 10
  }),
);

// ─── Mock Mixes ───────────────────────────────────────────


