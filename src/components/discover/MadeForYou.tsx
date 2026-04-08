import HorizontalCarousel from "./HorizontalCarousel";
import MadeForYouCard from "@/components/UI/MadeForYouCard/MadeForYouCard";
import type { MadeForYouItem } from "@/components/UI/MadeForYouCard/MadeForYouCard";

const MADE_FOR_YOU_ITEMS: MadeForYouItem[] = [
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

const MadeForYou = () => (
  <HorizontalCarousel title="Made for you">
    {MADE_FOR_YOU_ITEMS.map((item) => (
      <MadeForYouCard key={item.id} item={item} />
    ))}
  </HorizontalCarousel>
);

export default MadeForYou;
