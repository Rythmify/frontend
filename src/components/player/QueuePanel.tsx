/**
 * QueuePanel – SoundCloud-style "Next up" panel
 * Slides up above the sticky player, supports drag-to-reorder.
 */
import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaTimes, FaGripLines } from "react-icons/fa";
import { MdPlayArrow } from "react-icons/md";
import { usePlayerStore } from "../../stores/player.store";
import type { Track } from "../../types/track";
import { toast } from "sonner";

function fmt(s: string | number | undefined) {
  if (!s) return "";
  if (typeof s === "number") {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }
  return s;
}

// ─── Drag state tracked via ref (no re-renders mid-drag) ────────────────────
interface DragState {
  dragging: boolean;
  fromIndex: number;
  overIndex: number;
}

// ─── Individual queue row ────────────────────────────────────────────────────
function QueueRow({
  track,
  index,
  isCurrent,
  onPlay,
  onRemove,
  dragState,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  track: Track;
  index: number;
  isCurrent: boolean;
  onPlay: () => void;
  onRemove: () => void;
  dragState: DragState;
  onDragStart: (i: number) => void;
  onDragOver: (i: number) => void;
  onDrop: () => void;
}) {
  const isDragging =
    dragState.dragging && dragState.fromIndex === index;
  const isOver =
    dragState.dragging && dragState.overIndex === index && !isDragging;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={onDrop}
      data-test={`queue-row-${index}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        cursor: "pointer",
        borderRadius: 4,
        transition: "background 0.1s",
        opacity: isDragging ? 0.35 : 1,
        background: isCurrent
          ? "rgba(235,73,38,0.10)"
          : isOver
          ? "rgba(255,255,255,0.07)"
          : "transparent",
        borderLeft: isCurrent
          ? "2px solid #eb4926"
          : "2px solid transparent",
      }}
      onClick={onPlay}
    >
      {/* Drag handle */}
      <span
        style={{ color: "#555", cursor: "grab", flexShrink: 0, paddingRight: 4 }}
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder"
      >
        <FaGripLines size={12} />
      </span>

      {/* Cover */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 3,
          overflow: "hidden",
          flexShrink: 0,
          background: "#1a1a1a",
          position: "relative",
        }}
      >
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#2d2d2d,#111)" }}
          />
        )}
        {isCurrent && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.5)",
            }}
          >
            <MdPlayArrow size={18} color="#eb4926" />
          </div>
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            color: "#888",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <Link
            to={`/${track.artistUsername}`}
            onClick={(e) => e.stopPropagation()}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {track.artistName}
          </Link>
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: isCurrent ? "#eb4926" : "#fff",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {track.title}
        </div>
      </div>

      {/* Duration */}
      <span style={{ fontSize: 11, color: "#666", flexShrink: 0 }}>
        {fmt(track.duration)}
      </span>

      {/* Remove button */}
      <button
        data-test={`queue-remove-${index}`}
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        title="Remove"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#555",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 4,
          borderRadius: 3,
          flexShrink: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#ccc")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#555")}
      >
        <FaTimes size={11} />
      </button>
    </div>
  );
}

// ─── QueuePanel ──────────────────────────────────────────────────────────────
interface QueuePanelProps {
  onClose: () => void;
}

export default function QueuePanel({ onClose }: QueuePanelProps) {
  const {
    queue,
    queueIndex,
    currentTrack,
    isAutoplay,
    toggleAutoplay,
    setTrack,
    removeFromQueue,
    reorderQueue,
    clearQueue: clearQueueOriginal,
  } = usePlayerStore();

  const clearQueue = () => {
    clearQueueOriginal();
    toast.success("Queue cleared");
  };

  // Tracks after the currently playing one
  const upNext = queue.slice(queueIndex + 1);

  const [dragState, setDragState] = useState<DragState>({
    dragging: false,
    fromIndex: -1,
    overIndex: -1,
  });

  const dragStateRef = useRef(dragState);
  dragStateRef.current = dragState;

  const handleDragStart = useCallback((i: number) => {
    setDragState({ dragging: true, fromIndex: i, overIndex: i });
  }, []);

  const handleDragOver = useCallback((i: number) => {
    setDragState((prev) => ({ ...prev, overIndex: i }));
  }, []);

  const handleDrop = useCallback(() => {
    const { fromIndex, overIndex } = dragStateRef.current;
    if (fromIndex !== overIndex && fromIndex >= 0 && overIndex >= 0) {
      // upNext indices → queue-global indices
      const globalFrom = queueIndex + 1 + fromIndex;
      const globalTo = queueIndex + 1 + overIndex;
      reorderQueue(globalFrom, globalTo);
    }
    setDragState({ dragging: false, fromIndex: -1, overIndex: -1 });
  }, [queueIndex, reorderQueue]);

  // Close on outside click
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handlePlayFromQueue = (globalIndex: number) => {
    const track = queue[globalIndex];
    if (track) setTrack(track, queue);
  };

  return (
    <div
      ref={panelRef}
      data-test="queue-panel"
      style={{
        position: "fixed",
        bottom: 56, // height of sticky player
        right: 0,
        width: 340,
        maxHeight: "calc(100vh - 120px)",
        background: "#1a1a1a",
        borderTop: "1px solid #2a2a2a",
        borderLeft: "1px solid #2a2a2a",
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
        boxShadow: "-4px -4px 24px rgba(0,0,0,0.6)",
        borderRadius: "8px 0 0 0",
        animation: "queueSlideUp 0.2s ease",
      }}
    >
      <style>{`
        @keyframes queueSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px 10px",
          borderBottom: "1px solid #2a2a2a",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
          Next up
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {queue.length > 1 && (
            <button
              data-test="queue-clear-btn"
              onClick={clearQueue}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#aaa",
                fontSize: 13,
                fontWeight: 600,
                padding: "2px 6px",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#fff")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#aaa")}
            >
              Clear
            </button>
          )}
          <button
            data-test="queue-close-btn"
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#333",
              border: "none",
              cursor: "pointer",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaTimes size={12} />
          </button>
        </div>
      </div>

      {/* ── Scrollable list ── */}
      <div
        style={{
          overflowY: "auto",
          flex: 1,
          paddingBottom: 8,
        }}
      >
        {/* Currently playing */}
        {currentTrack && (
          <>
            <div
              style={{
                padding: "8px 14px 4px",
                fontSize: 11,
                fontWeight: 700,
                color: "#555",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Now playing
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                background: "rgba(235,73,38,0.08)",
                borderLeft: "2px solid #eb4926",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 3,
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "#1a1a1a",
                }}
              >
                {currentTrack.coverUrl ? (
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : null}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentTrack.artistName}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#eb4926", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentTrack.title}
                </div>
              </div>
              <span style={{ fontSize: 11, color: "#666", flexShrink: 0 }}>
                {fmt(currentTrack.duration)}
              </span>
            </div>
          </>
        )}

        {/* Up next */}
        {upNext.length > 0 ? (
          <>
            <div
              style={{
                padding: "12px 14px 4px",
                fontSize: 11,
                fontWeight: 700,
                color: "#555",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Up next
            </div>
            {upNext.map((track, i) => {
              const globalIndex = queueIndex + 1 + i;
              return (
                <QueueRow
                  key={`${track.id}-${globalIndex}`}
                  track={track}
                  index={i}
                  isCurrent={false}
                  onPlay={() => handlePlayFromQueue(globalIndex)}
                  onRemove={() => removeFromQueue(globalIndex)}
                  dragState={dragState}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              );
            })}
          </>
        ) : (
          !currentTrack && (
            <div
              style={{
                padding: "40px 16px",
                textAlign: "center",
                color: "#555",
                fontSize: 13,
              }}
            >
              Your queue is empty.
              <br />
              <span style={{ fontSize: 12 }}>
                Add tracks using the "Add to Next up" button.
              </span>
            </div>
          )
        )}

        {upNext.length === 0 && currentTrack && (
          <div
            style={{
              padding: "20px 16px",
              textAlign: "center",
              color: "#555",
              fontSize: 12,
            }}
          >
            No more tracks in queue.
          </div>
        )}
      </div>

      {/* ── Footer / Autoplay ── */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #2a2a2a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          background: "#1a1a1a",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Autoplay station</span>
          <span style={{ fontSize: 11, color: "#666" }}>Related tracks will be added to queue</span>
        </div>
        <button
          onClick={toggleAutoplay}
          style={{
            width: 36,
            height: 20,
            borderRadius: 10,
            background: isAutoplay ? "#eb4926" : "#333",
            border: "none",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#fff",
              position: "absolute",
              top: 2,
              left: isAutoplay ? 18 : 2,
              transition: "left 0.2s",
            }}
          />
        </button>
      </div>
    </div>
  );
}
