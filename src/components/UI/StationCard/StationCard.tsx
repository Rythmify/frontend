import type { Station } from "@/types/station";

// ─── Props ────────────────────────────────────────────────

interface StationCardProps {
  station: Station;
  widthClassName?: string;
}

// ─── Component ────────────────────────────────────────────

export default function StationCard({ station, widthClassName = "w-[200px]" }: StationCardProps) {
  return (
    <div className={`group flex flex-col gap-2 ${widthClassName} cursor-pointer`}>
      <div className="relative w-full aspect-square">
        <div className="w-full h-full rounded-md overflow-hidden bg-input-bg">
          {station.coverUrl && (
            <img
              src={station.coverUrl}
              alt={station.name}
              className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-200"
            />
          )}
        </div>
        {station.seedArtist.avatarUrl && (
          <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full overflow-hidden border-2 border-bg-main bg-input-bg">
            <img
              src={station.seedArtist.avatarUrl}
              alt={station.seedArtist.displayName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-play text-white text-sm ml-0.5" />
          </div>
        </div>
      </div>
      <p className="text-white text-sm font-semibold truncate">{station.name}</p>
      <p className="text-text-secondary text-xs truncate">
        {station.seedArtist.displayName} · Artist station
      </p>
    </div>
  );
}
