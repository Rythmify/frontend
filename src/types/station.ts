export interface Station {
  id: string;
  name: string;
  seedArtist: {
    id: string;
    displayName: string;
    username?: string;
    avatarUrl?: string;
  };
  artists?: { avatarUrl?: string; displayName?: string }[];
  coverUrl: string | null;
  trackCount: number;
}
