import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import MixCard from "@/components/UI/MixCard/MixCard";
import { useAuthStore } from "@/stores/auth.store";
import { getHome } from "@/services/api/discover.service";
import type { PersonalMix } from "@/services/api/discover.service";

const MixedForYou = () => {
  const { user } = useAuthStore();
  const [mixes, setMixes] = useState<PersonalMix[]>([]);

  useEffect(() => {
    getHome()
      .then((data) => setMixes(data.mixed_for_you))
      .catch(() => {});
  }, []);

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
