import { mockRecentlyPlayedTracks } from "@/services/mocks/discover";
import LikesContent from "@/components/UI/LikesContent/LikesContent";
import type { Track } from "@/types/track";

export default function YouLikesPage() {
  // TODO: replace with API call when the likes endpoint is available
  const tracks: Track[] = mockRecentlyPlayedTracks;

  return <LikesContent tracks={tracks} showControls />;
}
