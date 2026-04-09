import HorizontalCarousel from "./HorizontalCarousel";
import MixCard from "@/components/UI/MixCard/MixCard";
import { useAuthStore } from "@/stores/auth.store";
import type { PersonalMix } from "@/services/api/discover.service";

interface Props {
  mixes: PersonalMix[];
}

const MixedForYou = ({ mixes }: Props) => {
  const { user } = useAuthStore();

  if (mixes.length === 0) return null;

  return (
    <HorizontalCarousel title={`Mixed for ${user?.displayName ?? user?.username ?? "You"}`}>
      {mixes.map((mix, i) => (
        <MixCard key={mix.id} mix={mix} index={i} />
      ))}
    </HorizontalCarousel>
  );
};

export default MixedForYou;
