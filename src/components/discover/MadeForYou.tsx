import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import MadeForYouCard from "@/components/UI/MadeForYouCard/MadeForYouCard";
import type { MadeForYouItem } from "@/components/UI/MadeForYouCard/MadeForYouCard";
import { getHome } from "@/services/api/discover.service";
import type { CuratedMixSummary } from "@/services/api/discover.service";

const FALLBACK_ITEMS: MadeForYouItem[] = [
  {
    id: "daily-drops",
    title: "Daily Drops",
    subtitle: "New releases based on your taste",
    coverUrl: "https://picsum.photos/200/200?random=801",
    badgeWords: ["DAILY", "DROPS"],
    badgeBg: "#1a237e",
  },
  {
    id: "weekly-wave",
    title: "Weekly Wave",
    subtitle: "The best of Rythmify this week",
    coverUrl: "https://picsum.photos/200/200?random=802",
    badgeWords: ["WEEKLY", "WAVE"],
    badgeBg: "#1b5e20",
  },
];

function toMadeForYouItem(
  mix: CuratedMixSummary,
  fallback: MadeForYouItem,
): MadeForYouItem {
  return {
    ...fallback,
    id: mix.id,
    title: mix.label,
    subtitle: mix.description,
    coverUrl: mix.preview_track?.cover_image ?? fallback.coverUrl,
  };
}

const MadeForYou = () => {
  const [items, setItems] = useState<MadeForYouItem[]>(FALLBACK_ITEMS);

  useEffect(() => {
    getHome()
      .then((data) => {
        if (!data.made_for_you) return;
        setItems([
          toMadeForYouItem(data.made_for_you.daily_mix, FALLBACK_ITEMS[0]),
          toMadeForYouItem(data.made_for_you.weekly_mix, FALLBACK_ITEMS[1]),
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <HorizontalCarousel title="Made for you">
      {items.map((item) => (
        <MadeForYouCard key={item.id} item={item} />
      ))}
    </HorizontalCarousel>
  );
};

export default MadeForYou;
