export interface Track {
  id: number;
  title: string;
  artistName: string;
  artistUsername: string; // for profile link
  coverUrl: string;
  genre: string;
  likeCount: number;
  repostCount: number;
  playCount: number;
  commentCount: number;
  duration: string;
  postedAt: string;
  waveformData: number[];
  username: string;
  trackSlug: string;
  audioUrl: string;
  isPrivate?: boolean; // private tracks
  madeFor?: string; // made for [username]
}
