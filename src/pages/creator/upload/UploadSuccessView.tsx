import { useNavigate } from "react-router-dom";

const UploadSuccessView = ({ trackId }: { trackId: string | null }) => {
  const navigate = useNavigate();

  const handleArtistProClick = () => {
    navigate("creator/checkout");
  };

  return (
    <div className="container max-w-4xl mx-auto py-20 px-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex gap-16 items-start justify-start">
        {/* Left Side: Timeline/Icons */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-24 h-24 rounded-full border-2 border-bg-inverted flex items-center justify-center bg-bg">
            <i className="fa-brands fa-soundcloud text-4xl text-text-upload"></i>
          </div>
          <div className="w-0.5 h-20 border-l-2 border-dashed border-[#9e9e9e] items-center justify-center my-4"></div>
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#9e9e9e] flex items-center justify-center opacity-60">
            <i className="fa-brands fa-spotify text-3xl text-text-upload"></i>
          </div>
          <div className="w-0.5 h-20 border-l-2 border-dashed border-[#9e9e9e] my-4"></div>
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#9e9e9e] flex items-center justify-center opacity-60">
            <svg
              height="32"
              width="32"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="text-text-upload"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M56.25 18.29v1.882l-.022 19.653c0 .209 0 .418.002.627.001.418.003.836-.002 1.254 0 .525-.007 1.057-.022 1.582-.036 1.153-.102 2.312-.306 3.45a11.566 11.566 0 0 1-1.08 3.281 10.959 10.959 0 0 1-2.026 2.793A11.088 11.088 0 0 1 50 54.84a11.518 11.518 0 0 1-3.274 1.08c-1.137.204-2.297.277-3.449.306a57.18 57.18 0 0 1-1.582.022H20.164l-.628.001c-.418.002-.836.004-1.254-.001a57.18 57.18 0 0 1-1.582-.022c-1.152-.037-2.311-.102-3.449-.306a11.595 11.595 0 0 1-3.274-1.08 11.089 11.089 0 0 1-2.793-2.027 11.086 11.086 0 0 1-2.027-2.793 11.64 11.64 0 0 1-1.079-3.281c-.204-1.138-.277-2.297-.306-3.45a57.232 57.232 0 0 1-.022-1.582V18.291l.022-1.575c.036-1.153.102-2.312.306-3.45.204-1.16.547-2.231 1.08-3.281a10.985 10.985 0 0 1 2.034-2.793 10.957 10.957 0 0 1 2.792-2.027c1.043-.54 2.122-.875 3.274-1.087 1.138-.204 2.297-.277 3.45-.306a57.22 57.22 0 0 1 1.582-.022H41.71l1.59.022c1.152.036 2.312.102 3.449.306 1.152.204 2.224.547 3.274 1.08a11.085 11.085 0 0 1 2.793 2.027 11.086 11.086 0 0 1 2.027 2.793c.532 1.05.875 2.129 1.079 3.281.204 1.138.277 2.297.306 3.45.015.524.022 1.057.022 1.582Zm-16.778-6.278a55.87 55.87 0 0 1 1.393-.241c.845-.073 1.32.481 1.327 1.378v24.755c0 .664-.008 1.269-.146 1.933a4.932 4.932 0 0 1-.766 1.8c-.379.547-.867.992-1.436 1.328-.576.342-1.181.532-1.823.663-1.21.248-2.035.3-2.815.146a3.95 3.95 0 0 1-1.896-.962 4.085 4.085 0 0 1-1.327-2.596 4.114 4.114 0 0 1 1.116-3.267c.438-.452.977-.81 1.706-1.094.758-.291 1.597-.466 2.888-.729.171-.033.34-.067.51-.102.17-.035.34-.07.51-.102.445-.095.832-.204 1.138-.583.306-.38.314-.839.314-1.298V21.476c0-.882-.394-1.123-1.24-.962-.605.116-13.577 2.734-13.577 2.734-.736.182-.992.423-.992 1.327v16.931c0 .664-.036 1.27-.175 1.933a4.932 4.932 0 0 1-.765 1.8c-.38.548-.868.992-1.437 1.328a5.91 5.91 0 0 1-1.823.67c-1.21.248-2.034.3-2.814.146a3.897 3.897 0 0 1-1.896-.97 4.048 4.048 0 0 1-1.298-2.595c-.124-1.145.226-2.37 1.086-3.267.438-.452.978-.81 1.707-1.094.758-.291 1.597-.466 2.887-.729.172-.033.341-.067.51-.102.17-.034.34-.07.511-.102.445-.095.831-.204 1.137-.583.307-.38.343-.817.343-1.276V17.138c0-.263.022-.438.037-.525.065-.409.226-.766.525-1.014.24-.204.561-.35.97-.437h.007l15.604-3.15Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 flex flex-col items-start text-left pt-4">
          <section className="mb-20">
            <h1 className="text-[40px] font-bold text-text-upload leading-tight mb-2">
              Saved to SoundCloud.
            </h1>
            <p className="text-text-upload text-[16px] mb-8">
              Congratulations! Your tracks are now on SoundCloud.
            </p>
            <button
              data-test="view-track-button"
              onClick={() => (window.location.href = `/track/${trackId}`)}
              className="border border-bg-inverted text-text-upload text-sm px-6 py-2 rounded-full font-bold hover:bg-bg-inverted/50 cursor-pointer transition-all"
            >
              View track
            </button>
          </section>

          <section>
            <h2 className="text-[40px] font-bold text-text-upload leading-tight mb-2">
              Distribute to more streaming services?
            </h2>
            <p className="text-text-upload text-[16px] mb-8 leading-relaxed">
              Easily send your SoundCloud tracks to Spotify, Apple Music,
              TikTok, Instagram and more with a Artist Pro subscription.
              <a href="#" className="text-text-upload underline ml-1">
                Learn more.
              </a>
            </p>
            <button
              onClick={handleArtistProClick}
              data-test="unlock-artist-pro-button"
              className="bg-bg-inverted text-bg px-4 py-2.5 text-sm rounded-full font-bold hover:bg-bg-inverted/80 cursor-pointer transition-colors"
            >
              Unlock with Artist Pro
            </button>
          </section>
        </div>
        <footer className="py-8 mt-20 fixed bottom-0 left-0 right-0 z-50  bg-bg/90 transition-all duration-300">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[12px] text-[#9e9e9e] ">
          {[
            "Legal",
            "Privacy",
            "Cookie Policy",
            "Cookie Manager",
            "Imprint",
            "About us",
            "Copyright",
            "Feedback",
          ].map((link) => (
            <a
              key={link}
              href="#"
              className="hover:underline last:after:content-none after:content-['-'] after:ml-2"
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
      </div>
    </div>
  );
};
export default UploadSuccessView;
