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

  const footerLinks = [
    "Legal",
    "Privacy",
    "Cookie Policy",
    "Cookie Manager",
    "Imprint",
    "Artist Resources",
    "Newsroom",
    "Charts",
    "Transparency Reports",
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
            <div className="space-y-4 mt-16">
              <h3 className="text-xl font-bold">Real-time stats</h3>
              <p className=" text-[16px] ">
                See which fans are listening to your tracks the most and where
                your top fans are, all in real-time.
              </p>
            </div>

            <div className="space-y-4 mt-8">
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
        className="bg-[#f8f8f8] text-black pb-24 pt-32"
        style={{
          clipPath: "polygon(0 8%, 100% 0, 100% 100%, 0 100%)",
          marginTop: "-40px",
          paddingTop: "100px",
          paddingBottom: "100px",
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

                  <blockquote className="px-4 py-4 text-sm leading-relaxed text-bg">
                    "{artist.quote}"
                  </blockquote>
                </div>
              </li>
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

      <section
        className="bg-bg text-black pb-16.25 pt-32"
        style={{
          clipPath: "polygon(0 8%, 100% 0, 100% 100%, 0 100%)",
          marginTop: "-100px",
          paddingTop: "130px",
        }}
      >
        <div className="container mx-auto px-6 md:px-20">
          <div className="max-w-[415px] mb-16">
            <h2 className="text-[36px] text-text-upload font-bold mb-2">
              Connect with fans and see who's listening
            </h2>
            <div className="w-16 h-1 bg-[#ff5500] mb-6"></div>
            <p className="text-[18px] leading-snug text-text-upload">
              Uploading is just the beginning: SoundCloud gives you the tools to
              level up your career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-text-upload">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">
                Share your tracks anywhere on the web
              </h3>
              <p className=" text-[16px] ">
                Use the embed player and audio cards to share your tracks
                wherever your audience is: from music blogs to your Twitter
                stream.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">
                Get to know and connect with your audience
              </h3>
              <p className=" text-[16px]">
                Measure your progress with stats and interact with your fans
                directly via comments and messages.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">
                Take creator tools with you anytime and anywhere
              </h3>
              <p className=" text-[16px]">
                Whether you're in the studio, at home or on a tour bus, keep
                your community humming with our mobile app for creators.
              </p>
            </div>
          </div>
          <img
            src="https://a-v2.sndcdn.com/assets/images/upload_devices-3d92796c.png"
            className="w-full h-auto mt-8 ml-8 mr-8"
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
            <button
              onClick={handleUploadClick}
              className="bg-bg-inverted cursor-pointer transition-colors items-center px-3 py-1.5 font-bold text-[22px] rounded-sm"
            >
              Try it free
            </button>
            <button
              onClick={() => navigate("/artist-pro")}
              className="text-[#699fff] text-[22px] font-bold cursor-pointer bg-transparent border-none"
            >
              Learn more about Pro plans
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-bg py-8">
        <div className="flex flex-wrap items-center gap-y-1 mb-4">
          {footerLinks.map((link, i) => (
            <span key={link} className="flex items-center">
              <button className="text-sm text-text-secondary hover:text-[#484848] transition-colors cursor-pointer bg-transparent border-none">
                {link}
              </button>
              {i < footerLinks.length - 1 && (
                <span className="text-text-secondary text-[12px] mx-2">·</span>
              )}
            </span>
          ))}
        </div>
        <p className="text-sm text-text-secondary">
          Language:{" "}
          <button className="text-[#699fff] hover:underline cursor-pointer bg-transparent border-none font-medium">
            English (US)
          </button>
        </p>
      </footer>
    </div>
  );
};

export default UploadGuestPage;
