const UploadSuccessView = ({ trackId }: { trackId: string | null }) => {
  return (
    <div className="container max-w-4xl mx-auto py-20 px-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex gap-16 items-start justify-start">
        
        {/* Left Side: Timeline/Icons */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center bg-bg">
            <i className="fa-brands fa-soundcloud text-4xl text-text-upload"></i>
          </div>
          <div className="w-0.5 h-20 border-l-2 border-dashed border-[#9e9e9e] items-center justify-center my-4"></div>
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#9e9e9e] flex items-center justify-center opacity-60">
            <i className="fa-brands fa-spotify text-3xl text-text-upload"></i>
          </div>
          <div className="w-0.5 h-20 border-l-2 border-dashed border-[#9e9e9e] my-4"></div>
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#9e9e9e] flex items-center justify-center opacity-60">
            <i className="fa-brands fa-apple text-3xl text-text-upload"></i>
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
              onClick={() => (window.location.href = `/track/${trackId}`)}
              className="border border-white text-text-upload text-sm px-6 py-2 rounded-full font-bold hover:bg-[#383838] cursor-pointer transition-all"
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
            <button className="bg-bg-inverted text-black px-4 py-2.5 text-sm rounded-full font-bold hover:bg-[#e5e5e5] transition-colors">
              Unlock with Artist Pro
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
export default UploadSuccessView;
