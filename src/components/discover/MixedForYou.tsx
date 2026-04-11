import HorizontalCarousel from "./HorizontalCarousel";
import MixCard from "@/components/UI/MixCard/MixCard";
import { useAuthStore } from "@/stores/auth.store";
import type { PersonalMix } from "@/services/api/discover.service";
import { mockMixes } from "@/services/mocks/discover";

interface Props {
  mixes: PersonalMix[];
}

const MixedForYou = ({ mixes }: Props) => {
  const { user } = useAuthStore();
  const items = mixes.length ? mixes : mockMixes;

  return (
    <div data-test="section-mixed-for-you">
      <HorizontalCarousel title={`Mixed for ${user?.displayName ?? user?.username ?? "You"}`}>
        {items.map((mix, i) => (
          <MixCard key={mix.id} mix={mix} index={i} />
        ))}
      </HorizontalCarousel>
    </div>
  );
};

export default MixedForYou;
