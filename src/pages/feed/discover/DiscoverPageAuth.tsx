// import TrackCard from "@/components/UI/Card";
// import { mockDiscoverTracks } from "@/mocks/discover";

// const DiscoverPageAuth = () => {
//   return (
//     <div className="min-h-screen w-full" style={{ backgroundColor: "#121212" }}>
//       <div className="flex gap-4 p-6">
//         {mockDiscoverTracks.map((track) => (
//           <TrackCard key={track.id} track={track} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default DiscoverPageAuth;

import TrackCard from "@/components/UI/Card";
import HorizontalCarousel from "@/components/discover/HorizontalCarousel";
import { mockDiscoverTracks } from "@/mocks/discover";

const DiscoverPageAuth = () => {
  return (
    <div
      className="min-h-screen w-full p-6"
      style={{ backgroundColor: "#121212" }}
    >
      <HorizontalCarousel title="More of what you like">
        {mockDiscoverTracks.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </HorizontalCarousel>
    </div>
  );
};

export default DiscoverPageAuth;
