import { useLikesStore } from "@/stores/likes.store";
import { useAuthStore } from "@/stores/auth.store";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  const { isPlaylistLiked, togglePlaylist } = useLikesStore();
  const { user } = useAuthStore();
  const liked = isPlaylistLiked(item.id);
  const ownerDisplay = UUID_RE.test(item.owner)
    ? (user?.displayName ?? user?.username ?? item.owner)
    : item.owner;

  return (
    <div className={`group flex flex-col gap-2 ${widthClassName} shrink-0 cursor-pointer`}>
      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-input-bg">
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-all duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fa-solid fa-music text-3xl text-gray-500" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          <div />
          <div className="flex items-center justify-center flex-1">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-play text-black text-base ml-0.5" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-2 pb-2">
            <button className="flex flex-col items-center gap-0.5 group/btn" onClick={(e) => { e.stopPropagation(); togglePlaylist(item); }}>
              <i className={`fa-sharp ${liked ? "fa-solid fa-heart text-[#e74c3c]" : "fa-regular fa-heart text-white"} text-[12px] group-hover/btn:opacity-50 transition-opacity duration-150`} />
            </button>
            <button className="flex flex-col items-center gap-0.5 group/btn" onClick={(e) => e.stopPropagation()}>
              <i className="fa-solid fa-ellipsis text-[12px] text-white group-hover/btn:opacity-50 transition-opacity duration-150" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-white text-sm font-semibold truncate w-full flex items-center gap-1 cursor-pointer">
        {item.isPrivate && (
          <i className="fa-solid fa-lock text-[10px] text-gray-400 shrink-0" />
        )}
        {item.isLiked && (
          <i className="fa-solid fa-heart text-[10px] text-white shrink-0" />
        )}
        <span className="truncate">{item.title}</span>
      </p>
      <p className="text-gray-400 text-xs truncate w-full">{ownerDisplay}</p>
    </div>
  );
}
