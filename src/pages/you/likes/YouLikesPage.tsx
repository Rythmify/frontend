import LikesContent from "@/components/UI/LikesContent/LikesContent";
import { useLikesStore } from "@/stores/likes.store";

export default function YouLikesPage() {
  const { likedTracks } = useLikesStore();

  return <LikesContent tracks={likedTracks} showControls />;
}
