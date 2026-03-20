import { useNavigate } from "react-router-dom";

const UploadGuestPage = () => {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate("/signin");
  };
  return (
    <div className="bg-bg container px-4 md:px-4 lg:px-20 text-text-upload ">
      <section className="relative h-[600px] w-full overflow-hidden flex ">
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
      <section className="bg-bg py-20 border-t border-white/10">
        <div className="container mx-auto px-10 max-w-[1240px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-white">
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
    </div>
  );
};

export default UploadGuestPage;
