import HorizontalCarousel from "../HorizontalCarousel";
import CuratedMixCard from "@/components/UI/MixCard/CuratedMixCard";
import type { CuratedHomeMixPreview } from "@/services/api/discover.service";
import { mockCuratedMixes } from "@/services/mocks/discover";

interface Props {
  mixes: CuratedHomeMixPreview[];
}

const CuratedByRythmify = ({ mixes }: Props) => {
  const items = mixes.length ? mixes : mockCuratedMixes;

  return (
    <div data-test="section-curated-by-rythmify">
      <HorizontalCarousel title="Curated by Rythmify">
        {items.map((mix) => (
          <CuratedMixCard key={mix.mix_id} mix={mix} />
        ))}
      </HorizontalCarousel>
    </div>
  );
};

export default CuratedByRythmify;
