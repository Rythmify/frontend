import { useNavigate } from "react-router-dom";

function ArtistsSectionGuest() {
  const navigate = useNavigate();
  const handleUploadClick = () => {
    navigate("/signin");
  };

  const artists = [
    {
      name: "Tei Shi",
      followers: "36.5K",
      img: "https://a-v2.sndcdn.com/assets/images/TeiShi@1x-19d00c7d.jpg",
      quote:
        "When I first started putting my music out there, it was through SoundCloud because the platform makes it so easy to upload and share music so immediately and directly.",
    },
    {
      name: "Eli Sostre",
      followers: "48K",
      img: "https://a-v2.sndcdn.com/assets/images/EliSostre@2x-3b82c28e.jpg",
      quote:
        "SoundCloud allowed me to have a place I could instantly upload my songs and send my thoughts and feelings out to people all over the world in a simple way.",
    },
    {
      name: "Pollari",
      followers: "62.1K",
      img: "https://a-v2.sndcdn.com/assets/images/Pollari@1x-4bc56e72.jpg",
      quote:
        "SoundCloud is a place for artists to share their art, grow their network, and create opportunities all while increasing their personal net worth.",
    },
  ];
  return (
    <div
      className="bg-[#f8f8f8] text-black pb-24 pt-32"
      style={{
        clipPath: "polygon(0 8%, 100% 0, 100% 100%, 0 100%)",
        marginTop: "-40px",
        paddingTop: "100px",
        paddingBottom: "100px",
      }}
    >
      <div className="container mx-auto px-6 md:px-20">
        <div className="max-w-[415px] mb-16">
          <h2 className="text-[36px] font-bold mb-2">
            Made here, played everywhere
          </h2>
          <div className="w-16 h-1 bg-[#ff5500] mb-6"></div>
          <p className="text-[18px] leading-snug">
            Join the world's most diverse community of creators, from those
            sharing their first track to buzzworthy acts. No matter where you're
            at in your career, SoundCloud's what's next.
          </p>
        </div>

        {/* Artist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 ">
          {artists.map((artist, index) => (
            <li
              key={artist.name}
              className={`flex flex-col ${
                index === 0 ? "mt-24" : index === 1 ? "mt-12" : "mt-0"
              }`}
            >
              <div className="bg-white flex flex-col">
                <div className="flex items-center justify-between px-4 py-3">
                  <h2 className="text-[15px] font-bold text-text-muted">
                    {artist.name}
                  </h2>
                  <div className="flex items-center gap-1 text-[12px] text-[#044dd2] cursor-pointer hover:underline">
                    <svg
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                      aria-hidden="true"
                    >
                      <g fill="currentColor">
                        <path d="M8 7.5a3 3 0 100-6 3 3 0 000 6zM2.001 14.248C2.036 10.005 2.984 8.5 8 8.5s5.965 1.487 5.999 5.748a.25.25 0 01-.249.252H2.25a.25.25 0 01-.249-.252z" />
                      </g>
                    </svg>
                    {artist.followers}
                  </div>
                </div>

                <img
                  src={artist.img}
                  alt={artist.name}
                  className="w-77 object-cover"
                />

                <blockquote className="px-4 py-4 text-sm leading-relaxed text-[#121212]">
                  "{artist.quote}"
                </blockquote>
              </div>
            </li>
          ))}
        </div>

        <button
          onClick={handleUploadClick}
          className="bg-[#121212] text-white hover:text-[#717171] cursor-pointer transition-colors  px-3 py-1.5 font-bold text-[22px] rounded-sm"
        >
          Join Now
        </button>
      </div>
    </div>
  );
}

export default ArtistsSectionGuest;
