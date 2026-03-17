import TrackHero from "./components/TrackHero";
import type { Track } from "../../../types/track";
import audioFile from "../../../assets/Msh Awl Marra.mp3";
// import { mockTrack } from "@/mocks/tracks"; // uncomment when MSW is ready

const mockTrack: Track = {
  id: 1,
  title: "Lege-Cy & Ghaliaa - Msh Awl Mara",
  artistName: "Samo Lotfy",
  artistUsername: "samo-lotfy",
  coverUrl: "https://picsum.photos/seed/track1/600/400",
  genre: "R&B & Soul",
  likeCount: 0,
  repostCount: 0,
  playCount: 0,
  commentCount: 0,
  duration: "3:11",
  postedAt: "2 months ago",
  waveformData: [10, 30, 50, 20, 60, 80, 40, 20, 70, 90, 30],
  audioUrl: audioFile, 
  isPrivate: true,
  madeFor: "Shahd Yehya",
};

export default function TrackSlugPage() {
  return (
    <div className="flex-1 container px-4 md:px-8 lg:px-20">
      <TrackHero track={mockTrack} comments={[]} />
    </div>
  );
}