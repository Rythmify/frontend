import { useNavigate } from "react-router-dom";
import ArtistsSectionGuest from "./ArtistsSectionGuest";

const UploadGuestPage = () => {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate("/signin");
  };

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
              className="object-cover h-full w-full"
              alt=""
            />
          </div>
        </div>

        {/*Content Structure */}
        <div className="relative z-10 px-10 pt-27.5 pl-15 pr-130">
          <div className=" max-w-2xl">
            <h1 className="text-white text-[40px] ">
              First upload to first album
            </h1>
            <p className="text-white text-[17px] font-bold mb-7.5 mt-2">
              Share your tracks and access the tools you need to break through
              and build your legacy.
            </p>
            <button
              data-test="upload-guestpage-button"
              type="button"
              onClick={handleUploadClick}
              className="bg-[#ffffff] text-[#121212] hover:text-[#b0b0b0] cursor-pointer transition-all px-3 py-1.5 font-bold text-[22px] rounded-sm shadow-lg"
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
            <div className="space-y-4 mt-24">
              <h3 className="text-xl font-bold">Real-time stats</h3>
              <p className=" text-[16px] ">
                See which fans are listening to your tracks the most and where
                your top fans are, all in real-time.
              </p>
            </div>

            <div className="space-y-4 mt-12">
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
      <ArtistsSectionGuest />
      <section
        className="bg-bg text-[#121212] pb-16.25 pt-32"
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
              className="bg-bg-inverted text-bg cursor-pointer transition-colors items-center px-3 py-1.5 font-bold text-[22px] rounded-sm"
            >
              Try it free
            </button>
            <button
              onClick={() => navigate("/artist-pro")}
              className="dark:!text-[#699fff] text-[#044dd2] text-[22px] font-bold cursor-pointer bg-transparent border-none"
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
              <button className="text-sm dark:text-text-secondary dark:hover:text-[#484848] text-text-muted hover:text-[#c2c2c2] cursor-pointer">
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
          <button className="text-[#044dd2] dark:text-[#699fff] hover:underline cursor-pointer bg-transparent border-none font-medium">
            English (US)
          </button>
        </p>
      </footer>
    </div>
  );
};

export default UploadGuestPage;
