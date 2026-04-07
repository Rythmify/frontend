// ─── Types ────────────────────────────────────────────────

export type PlaylistCardData = {
  id: string;
  title: string;
  owner: string;
  coverUrl: string | null;
  isPrivate?: boolean;
  isLiked?: boolean;
};

// ─── Props ────────────────────────────────────────────────

interface PlaylistCardProps {
  item: PlaylistCardData;
  widthClassName?: string;
}

// ─── Component ────────────────────────────────────────────

export default function PlaylistCard({ item, widthClassName = "w-[200px]" }: PlaylistCardProps) {
  const isEmpty = !item.coverUrl;

  return (
    <div className={`group flex flex-col gap-2 ${widthClassName} cursor-pointer`}>
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        {!isEmpty && (
          <img
            src={item.coverUrl!}
            alt={item.title}
            className="w-full h-full object-cover transition-all duration-200"
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-play text-black text-base ml-0.5" />
            </div>
          </div>
          <button
            className="absolute bottom-2 right-10 text-[#e74c3c] text-base hover:scale-110 transition-transform z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fa-solid fa-heart" />
          </button>
          <button
            className="absolute bottom-2.5 right-2.5 text-white/80 text-xs hover:text-white transition-colors tracking-widest z-10"
            onClick={(e) => e.stopPropagation()}
          >
            •••
          </button>
        </div>
      </div>
      {!isEmpty && (
        <>
          <p className="text-white text-sm font-semibold truncate w-full flex items-center gap-1 cursor-pointer">
            {item.isPrivate && (
              <i className="fa-solid fa-lock text-[10px] text-gray-400 shrink-0" />
            )}
            {item.isLiked && (
              <i className="fa-solid fa-heart text-[10px] text-white shrink-0" />
            )}
            <span className="truncate">{item.title}</span>
          </p>
          <p className="text-gray-400 text-xs truncate w-full">{item.owner}</p>
        </>
      )}
    </div>
  );
}
