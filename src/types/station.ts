export interface Station {
  id: string;
  name: string;
  seedArtist: {
    id: string;
    displayName: string;
    username?: string;
    avatarUrl?: string;
  };
  coverUrl: string | null;
  trackCount: number;
}
