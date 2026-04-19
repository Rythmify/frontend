export interface Track {
  id: string;
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
  trackSlug?: string;
  audioUrl: string;
  isPrivate?: boolean; // private tracks
  madeFor?: string; // made for [username]
  isLiked?: boolean;
  isReposted?: boolean;
  artistId?: string;
  isRepostedByMe?: boolean;
}
