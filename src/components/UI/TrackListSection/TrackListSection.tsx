// src/components/common/TrackListSection.tsx

import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

// ─── Props ────────────────────────────────────────────────
interface TrackListSectionProps {
  title: string;
  viewAllLink: string;
  children?: ReactNode;
}

// ─── Styles ───────────────────────────────────────────────
const styles = {
  container: `flex flex-col gap-3 w-full`,
  header: `flex items-center justify-between w-full hover:opacity-70 transition-opacity`,
  title: `text-xs font-bold text-white cursor-pointer hover:text-text-secondary`,
  viewAll: `text-xs cursor-pointer hover:underline text-text-secondary hover:text-text`,
  trackList: `flex flex-col gap-4`,
};

// ─── Component ────────────────────────────────────────────
const TrackListSection = ({
  title,
  viewAllLink,
  children,
}: TrackListSectionProps) => {
  const navigate = useNavigate();

  // ✅ Early return if no children
  if (!children) {
    return null;
  }

  return (
    <div className={styles.container} data-test="track-list-section">
      {/* Header */}
      <div className={styles.header} data-test="track-list-section-header">
        <button
          onClick={() => navigate(viewAllLink)}
          className={styles.title}
          data-test="track-list-section-title"
        >
          {title}
        </button>
        <button
          onClick={() => navigate(viewAllLink)}
          className={styles.viewAll}
          data-test="track-list-section-view-all"
        >
          View all
        </button>
      </div>

      {/* Tracks */}
      <div className={styles.trackList} data-test="track-list-section-tracks">
        {children}
      </div>
    </div>
  );
};

export default TrackListSection;
