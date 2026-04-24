import { useNavigate } from "react-router-dom";
import FollowButton from "../FollowButton";
import UserAvatar from "../UserAvatar";

// ─── Types ────────────────────────────────────────────────
export interface Artist {
  id: string;
  username: string;
  avatar?: string;
  followers: number;
  tracks?: number;
  isVerified?: boolean;
}

interface ArtistListSectionProps {
  title: string;
  artists: Artist[];
  viewAllLink?: string;
  onRefresh?: () => void;
  maxDisplay?: number;
}

// ─── Styles ───────────────────────────────────────────────
const styles = {
  container: `flex flex-col gap-4 w-full`,
  header: `flex items-center justify-between hover:opacity-70 transition-opacity`,
  title: `text-xs font-semibold text-text-hover cursor-pointer`,
  viewAll: `text-xs cursor-pointer hover:underline text-text-secondary hover:text-text`,
  refreshButton: `text-xs cursor-pointer hover:underline text-text-secondary hover:text-text flex items-center gap-1`,
  refreshIcon: `fa-solid fa-arrows-rotate text-[10px]`,
  artistList: `flex flex-col gap-4`,
  artistItem: `flex items-center justify-between`,
  artistInfo: `flex items-center gap-3`,
  avatar: `w-12 h-12 cursor-pointer rounded-full overflow-hidden bg-border flex-shrink-0`,
  details: `flex flex-col`,
  nameRow: `flex items-center gap-1`,
  username: `cursor-pointer text-sm font-bold text-text-hover hover:opacity-70 transition-opacity`,
  verifiedIcon: `fa-solid fa-circle-check text-[#2196F3] text-xs`,
  stats: `flex items-center gap-2 text-xs text-text-secondary`,
  stat: `flex cursor-pointer items-center gap-0.5 hover:opacity-70 transition-opacity`,
  statIcon: `fa-solid text-[10px]`,
};

// ─── Component ────────────────────────────────────────────
const ArtistListSection = ({
  title,
  artists,
  viewAllLink,
  onRefresh,
  maxDisplay = 3,
}: ArtistListSectionProps) => {
  const navigate = useNavigate();

  if (artists.length === 0) return null;

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div data-test="artist-list-section" className={styles.container}>
      {/* Header */}
      <div data-test="artist-list-section-header" className={styles.header}>
        <button
          data-test="artist-list-section-title"
          onClick={() => viewAllLink && navigate(viewAllLink)}
          className={styles.title}
        >
          {title}
        </button>

        {/* Show "View all" OR "Refresh list" */}
        {viewAllLink ? (
          <button
            data-test="artist-list-section-view-all"
            onClick={() => navigate(viewAllLink)}
            className={styles.viewAll}
          >
            View all
          </button>
        ) : onRefresh ? (
          <button
            data-test="artist-list-section-refresh"
            onClick={onRefresh}
            className={styles.refreshButton}
          >
            <i className={styles.refreshIcon} />
            Refresh list
          </button>
        ) : null}
      </div>

      {/* Artist List */}
      <div
        data-test="artist-list-section-artists"
        className={styles.artistList}
      >
        {artists.slice(0, maxDisplay).map((artist) => (
          <div
            key={artist.username}
            data-test={`artist-item-${artist.username}`}
            className={styles.artistItem}
          >
            <div className={styles.artistInfo}>
              {/* Avatar */}
              <UserAvatar
                src={artist.avatar}
                name={artist.username}
                alt={artist.username}
                dataTest={`artist-avatar-${artist.username}`}
                wrapperClassName={styles.avatar}
                initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-white text-sm font-bold"
                onClick={() => navigate(`/${artist.username}`)}
              />

              {/* Details */}
              <div className={styles.details}>
                {/* Name + Verified */}
                <div className={styles.nameRow}>
                  <button
                    data-test={`artist-username-${artist.username}`}
                    onClick={() => navigate(`/${artist.username}`)}
                    className={styles.username}
                  >
                    {artist.username}
                  </button>
                  {artist.isVerified && (
                    <i
                      data-test={`artist-verified-${artist.username}`}
                      className={styles.verifiedIcon}
                    />
                  )}
                </div>

                {/* Stats */}
                <div className={styles.stats}>
                  <button
                    data-test={`artist-followers-${artist.username}`}
                    onClick={() => navigate(`/${artist.username}/follower`)}
                    className={styles.stat}
                  >
                    <i className={`${styles.statIcon} fa-user`} />
                    {formatCount(artist.followers)}
                  </button>
                  {artist.tracks !== undefined && artist.tracks > 0 && (
                    <button
                      data-test={`artist-tracks-${artist.username}`}
                      onClick={() => navigate(`/${artist.username}/tracks`)}
                      className={styles.stat}
                    >
                      <i className={`${styles.statIcon} fa-bars`} />
                      {artist.tracks}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <div data-test={`artist-follow-button-${artist.username}`}>
              <FollowButton username={artist.username} userId={artist.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistListSection;
