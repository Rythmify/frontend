import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

// ─── Props ────────────────────────────────────────────────
interface TrackListSectionProps {
  title: string;
  viewAllLink: string;
  children: ReactNode;
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

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate(viewAllLink)} className={styles.title}>
          {title}
        </button>
        <button
          onClick={() => navigate(viewAllLink)}
          className={styles.viewAll}
        >
          View all
        </button>
      </div>

      {/* Track List */}
      <div className={styles.trackList}>{children}</div>
    </div>
  );
};

export default TrackListSection;
