import { useNavigate } from "react-router-dom";

const UploadGuestPage = () => {
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
    <div className="bg-bg container px-4 md:px-4 lg:px-20 text-text-upload ">
      <section
        className="relative w-full overflow-hidden"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 88%, 0 100%)",
          paddingBottom: "120px",
        }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 h-full items-center">
          <div className="relative h-full w-full">
            <img
              src="https://a-v2.sndcdn.com/assets/images/img-upload-hero-0fd428fc.jpg"
              className="object-cover h-full w-full opacity-50"
              alt=""
            />
          </div>
        </div>

        {/*Content Structure */}
        <div className="relative z-10 px-10 pt-27.5 pl-15 pr-130">
          <div className=" max-w-2xl">
            <h1 className="text-text-upload text-[40px] ">
              First upload to first album
            </h1>
            <p className="text-text-upload text-[17px] font-bold mb-7.5 mt-2">
              Share your tracks and access the tools you need to break through
              and build your legacy.
            </p>
            <button
              data-test="upload-guestpage-button"
              type="button"
              onClick={handleUploadClick}
              className="bg-bg-inverted text-bg hover:text-[#b0b0b0] cursor-pointer transition-all px-3 py-1.5 font-bold text-[22px] rounded-sm shadow-lg"
            >
              Upload your first track
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-bg py-20 " style={{ marginTop: "-60px" }}>
        <div className="container mx-auto px-10 max-w-[1240px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-text-upload">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Real-time stats</h3>
              <p className=" text-[16px] ">
                See which fans are listening to your tracks the most and where
                your top fans are, all in real-time.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Find your community</h3>
              <p className=" text-[16px]">
                Share your work with millions of daily active listeners or share
                a private link with a few very special people.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Connect directly with fans</h3>
              <p className=" text-[16px]">
                With direct messaging and in-track comments, you can always be
                in touch with your fans, whether they are on your block or on
                the other side of the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*artists*/}
      <section
        className="bg-[#fafafafa] text-black pb-24 pt-32"
        style={{
          clipPath: "polygon(0 8%, 100% 0, 100% 100%, 0 100%)",
          marginTop: "-40px",
          paddingTop: "100px",
        }}
      >
        <div className="container mx-auto px-6 md:px-20">
          <div className="max-w-4xl mb-16">
            <h2 className="text-[36px] font-bold mb-2">
              Made here, played everywhere
            </h2>
            <div className="w-16 h-1 bg-[#ff5500] mb-6"></div>
            <p className="text-[18px] leading-snug">
              Join the world's most diverse community of creators, from those
              sharing their first track to buzzworthy acts. No matter where
              you're at in your career, SoundCloud's what's next.
            </p>
          </div>

          {/* Artist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {artists.map((artist) => (
              <div
                key={artist.name}
                className="bg-bg-inverted p-1 shadow-sm border border-gray-100 flex flex-col"
              >
                <div className="p-3 flex justify-between items-center bg-bg-inverted">
                  <span className="font-bold text-sm text-text-muted">
                    {artist.name}
                  </span>
                  <span className="text-[11px] text-[#044dd2] font-bold flex items-center gap-1">
                    <i className="fa-solid fa-user text-[10px]" />{" "}
                    {artist.followers}
                  </span>
                </div>
                <img
                  src={artist.img}
                  alt={artist.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-5 bg-bg-inverted flex-1">
                  <p className="text-[13px] leading-relaxed text-bg">
                    "{artist.quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleUploadClick}
            className="bg-bg text-text-upload cursor-pointer transition-colors  px-3 py-1.5 font-bold text-[22px] rounded-sm"
          >
            Join Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default UploadGuestPage;
