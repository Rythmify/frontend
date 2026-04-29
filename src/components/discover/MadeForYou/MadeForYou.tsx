import HorizontalCarousel from "../HorizontalCarousel";
import MadeForYouCard from "@/components/UI/MadeForYouCard/MadeForYouCard";
import type { MadeForYouItem } from "@/components/UI/MadeForYouCard/MadeForYouCard";
import type {
  CuratedMixSummary,
  HomeData,
} from "@/services/api/discover.service";
import { mapDiscoveryTrack } from "@/services/api/discover.mapper";

const BADGE_WORDS: Record<"daily" | "weekly", [string, string]> = {
  daily: ["DAILY", "DROPS"],
  weekly: ["WEEKLY", "WAVE"],
};

function toMadeForYouItem(
  mix: CuratedMixSummary,
  kind: "daily" | "weekly",
): MadeForYouItem {
  return {
    id: mix.id,
    title: mix.label,
    subtitle: mix.description,
    coverUrl: mix.cover_url ?? "",
    madeKind: kind,
    badgeWords: BADGE_WORDS[kind],
    previewTrack: mapDiscoveryTrack(mix.preview_track),
  };
}

interface Props {
  madeForYou: HomeData["made_for_you"];
}

const MadeForYou = ({ madeForYou }: Props) => {
  if (!madeForYou) return null;

  const items: MadeForYouItem[] = [
    toMadeForYouItem(madeForYou.daily_mix, "daily"),
    toMadeForYouItem(madeForYou.weekly_mix, "weekly"),
  ];

  return (
    <div data-test="section-made-for-you">
      <HorizontalCarousel title="Made for you">
        {items.map((item) => (
          <MadeForYouCard key={item.id} item={item} />
        ))}
      </HorizontalCarousel>
    </div>
  );
};

export default MadeForYou;
