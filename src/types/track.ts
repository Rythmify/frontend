export interface Track {
  id: number;
  title: string;
  artistName: string;
  coverUrl: string;
  genre: string;
  likeCount: number;
  repostCount: number;
  playCount: number;
  commentCount: number;
  duration: string;
  postedAt: string;
  waveformData: number[];
}
