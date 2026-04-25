import HorizontalCarousel from "../HorizontalCarousel";
import MadeForYouCard from "@/components/UI/MadeForYouCard/MadeForYouCard";
import type { MadeForYouItem } from "@/components/UI/MadeForYouCard/MadeForYouCard";
import type {
  CuratedMixSummary,
  HomeData,
} from "@/services/api/discover.service";
import { mapDiscoveryTrack } from "@/services/api/discover.mapper";

const FALLBACK_ITEMS: MadeForYouItem[] = [
  {
    id: "daily-drops",
    title: "Daily Drops",
    subtitle: "New releases based on your taste",
    coverUrl: "https://picsum.photos/200/200?random=801",
    madeKind: "daily",
    badgeWords: ["DAILY", "DROPS"],
    badgeBg: "#1a237e",
  },
  {
    id: "weekly-wave",
    title: "Weekly Wave",
    subtitle: "The best of Rythmify this week",
    coverUrl: "https://picsum.photos/200/200?random=802",
    madeKind: "weekly",
    badgeWords: ["WEEKLY", "WAVE"],
    badgeBg: "#1b5e20",
  },
];

function toMadeForYouItem(
  mix: CuratedMixSummary,
  fallback: MadeForYouItem,
  kind: "daily" | "weekly",
): MadeForYouItem {
  return {
    ...fallback,
    id: mix.id,
    title: mix.label,
    subtitle: mix.description,
    coverUrl: mix.cover_url ?? fallback.coverUrl,
    madeKind: kind,
    previewTrack: mapDiscoveryTrack(mix.preview_track),
  };
}

interface Props {
  madeForYou: HomeData["made_for_you"];
}

const MadeForYou = ({ madeForYou }: Props) => {
  const items: MadeForYouItem[] = madeForYou
    ? [
        toMadeForYouItem(madeForYou.daily_mix, FALLBACK_ITEMS[0], "daily"),
        toMadeForYouItem(madeForYou.weekly_mix, FALLBACK_ITEMS[1], "weekly"),
      ]
    : FALLBACK_ITEMS;

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
