import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/stores/player.store";
import { useAuthStore } from "@/stores/auth.store";

export function usePromoModal() {
  const [showPromo, setShowPromo] = useState(false);
  const tracksPlayedRef = useRef(0);
  const prevTrackIdRef = useRef<string | number | null | undefined>(undefined);
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id ?? null);

  useEffect(() => {
    if (prevTrackIdRef.current === undefined) {
      prevTrackIdRef.current = currentTrackId;
      return;
    }
    if (currentTrackId === null || currentTrackId === prevTrackIdRef.current) return;
    prevTrackIdRef.current = currentTrackId;
    if (useAuthStore.getState().user?.isPro) return;
    tracksPlayedRef.current += 1;
    if (tracksPlayedRef.current % 5 === 0) {
      setShowPromo(true);
    }
  }, [currentTrackId]);

  return { showPromo, closePromo: () => setShowPromo(false) };
}
