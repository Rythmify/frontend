import type { Track } from "@/types/track";
import { useState } from "react";
import { Tooltip } from "@heroui/react";

// import { Card, CardBody } from "@heroui/react";

// ─── Props ────────────────────────────────────────────────
interface TrackCardProps {
  track: Pick<Track, "id" | "title" | "artistName" | "coverUrl">;
}

// ─── Styles ───────────────────────────────────────────────

const styles = {
  card: `
    group flex flex-col gap-2
    w-[110px] sm:w-[130px] md:w-[145px] lg:w-[159px]
    cursor-pointer shrink-0
  `,
  imageWrapper: `
    relative w-full aspect-square
    rounded-md overflow-hidden
  `,
  image: `
    w-full h-full object-cover
    text-white
    group-hover:brightness-75
    transition-all duration-200
  `,
  overlay: `
  absolute inset-0
  flex flex-col
  justify-between
  opacity-0 group-hover:opacity-100
  transition-opacity duration-200
`,
  overlayCenter: `
  flex items-center justify-center
  flex-1
`,
  overlayBottom: `
  flex items-center justify-end
  gap-2 px-2 pb-2
`,
  likeButton: `
  fa-sharp fa-regular fa-heart
  text-[10px] text-black
`,
  likeButtonActive: `
  fa-sharp fa-solid fa-heart
  text-[10px] text-red-500
`,
  moreButton: `
  fa-solid fa-ellipsis
  text-[10px] text-black
`,
  playButton: `
    w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
    bg-white
    rounded-full
    flex items-center justify-center
  `,
  playIcon: `
    text-white text-lg pl-1
  `,
  title: `
    text-white text-sm font-semibold
    truncate w-full
  `,
  artist: `
    text-gray-400 text-xs
    truncate w-full
  `,
  actionButton: `
  flex flex-col items-center gap-0.5
  group/btn
`,
  actionIcon: `
  text-[12px] text-black
  group-hover/btn:opacity-50
  transition-opacity duration-150
`,
  actionIconActive: `
  text-[12px] text-red-500
  group-hover/btn:opacity-50
  transition-opacity duration-150
`,
  actionLabel: `
  text-white text-[8px]
  opacity-0 group-hover/btn:opacity-100
  transition-opacity duration-150
`,
};

const tooltipStyles = {
  base: "bg-gray-700 rounded-md",
  content: "bg-gray-700 text-white text-xs px-2 py-1 rounded-md",
  tooltip: "bg-gray-700",
};

// ─── HeroUi Component ────────────────────────────────────────────

// const TrackCard = ({ track }: TrackCardProps) => {
//   const [liked, setLiked] = useState(false);
//   return (
//     <Card isPressable className={styles.card}>
//       <CardBody className="p-0">
//         <div className={styles.imageWrapper}>
//           <img
//             src={track.coverUrl}
//             alt={track.title}
//             className={styles.image}
//           />
//           <div className={styles.overlay}>
//             {/* Top spacer */}
//             <div />

//             {/* Center — Play Button */}
//             <div className={styles.overlayCenter}>
//               <button className={styles.playButton}>
//                 <i className="fa-sharp fa-solid fa-play text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] pl-0.5"></i>
//               </button>
//             </div>

//             {/* Bottom — Like + More */}
//             <div className={styles.overlayBottom}>
//               {/* Like Button */}
//               <button onClick={() => setLiked(!liked)}>
//                 <i
//                   className={
//                     liked ? styles.likeButtonActive : styles.likeButton
//                   }
//                 ></i>
//               </button>

//               {/* More Button — HeroUI Dropdown */}
//               <button>
//                 <i className={styles.moreButton}></i>
//               </button>
//             </div>
//           </div>
//         </div>
//         <p className={styles.title}>{track.title}</p>
//         <p className={styles.artist}>{track.artistName}</p>
//       </CardBody>
//     </Card>
//   );
// };

// export default TrackCard;

// // ─── Component ────────────────────────────────────────────

const TrackCard = ({ track }: TrackCardProps) => {
  const [liked, setLiked] = useState(false);
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={track.coverUrl} alt={track.title} className={styles.image} />
        <div className={styles.overlay}>
          {/* Top spacer */}
          <div />

          {/* Center — Play Button */}
          <div className={styles.overlayCenter}>
            <button className={styles.playButton}>
              <i className="fa-sharp fa-solid fa-play text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] pl-0.5"></i>
            </button>
          </div>

          {/* Bottom — Like + More */}
          <div className={styles.overlayBottom}>
            {/* Like Button */}
            <Tooltip
              content="Like"
              showArrow
              placement="bottom"
              classNames={tooltipStyles}
              closeDelay={0}
            >
              <button
                onClick={() => setLiked(!liked)}
                className={styles.actionButton}
              >
                <i
                  className={`fa-solid fa-heart ${liked ? styles.actionIconActive : styles.actionIcon}`}
                ></i>
              </button>
            </Tooltip>

            {/* More Button — HeroUI Dropdown */}
            <Tooltip
              content="More"
              showArrow={true}
              placement="bottom"
              classNames={tooltipStyles}
            >
              <button className={styles.actionButton}>
                <i className={`fa-solid fa-ellipsis ${styles.actionIcon}`}></i>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
      <p className={styles.title}>{track.title}</p>
      <p className={styles.artist}>{track.artistName}</p>
    </div>
  );
};

export default TrackCard;
