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
    <div className={`group flex flex-col gap-2 ${widthClassName}`}>
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        {!isEmpty && (
          <img
            src={item.coverUrl!}
            alt={item.title}
            className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-200 cursor-pointer"
          />
        )}
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
