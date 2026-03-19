import { useNavigate } from "react-router-dom";
import { mockDiscoverTracks } from "@/mocks/discover";
import RectangularCard from "./RectangularCard";

// ─── Styles ───────────────────────────────────────────────
const styles = {
  wrapper: `
    flex flex-col gap-3
    w-full
  `,
  header: `
    flex items-center justify-between
    border-b border-zinc-700
    pb-2
  `,
  title: `
    text-white text-sm font-black
    tracking-normal uppercase
  `,
  viewAllBtn: `
    text-zinc-400 hover:text-white
    text-xs font-semibold
    transition-colors duration-200
    cursor-pointer
  `,
  tracksContainer: `
    flex flex-col gap-3
    pt-2
  `,
};

// ─── Main Component ───────────────────────────────────────
const ListeningHistoryCard = () => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/library/history");
  };

  // Use first 3 tracks from mock data
  const historyTracks = mockDiscoverTracks.slice(0, 3);

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>Listening History</h3>
        <button onClick={handleViewAll} className={styles.viewAllBtn}>
          View all
        </button>
      </div>

      {/* Tracks Container */}
      <div className={styles.tracksContainer}>
        {historyTracks.map((track) => (
          <RectangularCard key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
};

export default ListeningHistoryCard;
