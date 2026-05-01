import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Tooltip } from "@heroui/react";

// ─── Types ────────────────────────────────────────────────

export interface MoreMenuItem {
  label: string;
  iconNode?: React.ReactNode;
  onClick: () => void;
}

interface CardOverlayProps {
  isPlaying: boolean;
  onPlay: (e: React.MouseEvent) => void;
  isLiked: boolean;
  onLike: (e: React.MouseEvent) => void;
  downloadMenuItem?: MoreMenuItem;
  moreMenuItems?: MoreMenuItem[];
  /** Extra z-index class, e.g. "z-40". StationCard needs this due to child layers z-10…z-30. */
  overlayZClass?: string;
  /** Compose prefixed data-test IDs, e.g. "station-card" + itemId → "station-card-play-{id}" */
  dataTestPrefix?: string;
  itemId?: string;
}

// ─── Shared Assets ────────────────────────────────────────

const tooltipStyles = {
  base: "bg-gray-700 rounded-md",
  content: "bg-gray-700 text-white text-xs px-2 py-1 rounded-md",
  tooltip: "bg-gray-700",
};

export const AddToPlaylistIcon = (
  <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current shrink-0">
    <path d="M3.25 7V4.75H1v-1.5h2.25V1h1.5v2.25H7v1.5H4.75V7h-1.5zM9 4.75h6v-1.5H9v1.5zM15 9.875H1v-1.5h14v1.5zM1 15h14v-1.5H1V15z" />
  </svg>
);

const MENU_WIDTH_PX = 176; // w-44
const MENU_ITEM_HEIGHT_PX = 40;

// ─── Component ────────────────────────────────────────────

export default function CardOverlay({
  isPlaying,
  onPlay,
  isLiked,
  onLike,
  downloadMenuItem,
  moreMenuItems,
  overlayZClass = "",
  dataTestPrefix,
  itemId,
}: CardOverlayProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const resolvedMenuItems = [
    ...(downloadMenuItem ? [downloadMenuItem] : []),
    ...(moreMenuItems ?? []),
  ];
  const hasMenu = resolvedMenuItems.length > 0;

  const playTest =
    dataTestPrefix && itemId ? `${dataTestPrefix}-play-${itemId}` : "button-play";
  const likeTest =
    dataTestPrefix && itemId ? `${dataTestPrefix}-like-${itemId}` : "button-like";
  const moreTest =
    dataTestPrefix && itemId ? `${dataTestPrefix}-more-${itemId}` : "button-more";

  useEffect(() => {
    if (!showMoreMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMoreMenu(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (menuPanelRef.current && !menuPanelRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    const onScroll = () => setShowMoreMenu(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [showMoreMenu]);

  const handleOpenMore = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const estimatedHeight = resolvedMenuItems.length * MENU_ITEM_HEIGHT_PX;
    const flipUp = window.innerHeight - rect.bottom < estimatedHeight;
    setMenuPos({
      top: flipUp ? rect.top - estimatedHeight : rect.bottom,
      left: rect.right - MENU_WIDTH_PX,
    });
    setShowMoreMenu((prev) => !prev);
  };

  return (
    <div
      className={`absolute inset-0 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${overlayZClass}`}
    >
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        <div />

        {/* Play button */}
        <div className="flex items-center justify-center flex-1">
          <button
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
            onClick={onPlay}
            data-test={playTest}
          >
            <i
              className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"} text-black text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] ${!isPlaying ? "ml-0.5" : ""}`}
            />
          </button>
        </div>

        {/* Like + More */}
        <div className="flex items-center justify-end gap-2 px-2 pb-2">
          <Tooltip
            content="Like"
            showArrow
            placement="bottom"
            classNames={tooltipStyles}
            closeDelay={0}
          >
            <button
              className="flex flex-col items-center gap-0.5 group/btn"
              onClick={onLike}
              data-test={likeTest}
            >
              <i
                className={`fa-solid fa-heart text-[12px] ${isLiked ? "text-[#e74c3c]" : "text-white"} group-hover/btn:opacity-50 transition-opacity duration-150`}
              />
            </button>
          </Tooltip>

          {hasMenu && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Tooltip
                content="More"
                showArrow
                placement="bottom"
                classNames={tooltipStyles}
              >
                <button
                  className="flex flex-col items-center gap-0.5 group/btn"
                  data-test={moreTest}
                  onClick={handleOpenMore}
                >
                  <i
                    className={`fa-solid fa-ellipsis text-[12px] ${showMoreMenu ? "text-accent" : "text-white"} group-hover/btn:opacity-50 transition-opacity duration-150`}
                  />
                </button>
              </Tooltip>

              {showMoreMenu &&
                createPortal(
                  <div
                    ref={menuPanelRef}
                    style={{ top: menuPos.top, left: menuPos.left }}
                    className="fixed z-[9999] bg-bg w-44 border font-bold border-[#353535] rounded shadow-xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {resolvedMenuItems.map((menuItem, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-3 py-2 text-[14px] text-white hover:text-[#717171] cursor-pointer transition-colors flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMoreMenu(false);
                          menuItem.onClick();
                        }}
                      >
                        {menuItem.iconNode}
                        {menuItem.label}
                      </button>
                    ))}
                  </div>,
                  document.body,
                )}
            </div>
          )}
        </div>
    </div>
  );
}
