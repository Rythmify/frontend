import { useNavigate } from "react-router-dom";

export default function VinylPage() {
  const navigate = useNavigate();

  return (
    <div className=" pb-20">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
        {/* Left: text */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-full bg-[#FFB800] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-black" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="text-text-hover text-xs font-bold uppercase tracking-widest">
              Artist Pro
            </span>
          </div>

          <h1 className="text-white font-extrabold text-3xl sm:text-4xl leading-tight tracking-tight mb-5">
            Your music. On vinyl. On demand.
          </h1>

          <p className="text-text-hover text-lg leading-relaxed mb-4">
            We're partnering with elasticStage to{" "}
            
              release your albums on vinyl, on-demand, with no up-front cost to
              you.
            
          </p>
          <p className="text-text-hover text-lg leading-relaxed mb-8">
            You and your fans can purchase just one record or a thousand. Either
            way, you get paid for every sale.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/premium")}
              className="bg-bg-inverted text-bg font-bold text-sm px-6 py-3 rounded-full hover:opacity-85 transition-opacity cursor-pointer"
            >
              Get Premium
            </button>
            <span className="text-[13px] font-bold mx-4 text-text border border-[#444] rounded-xl px-2.5 py-0.5">
                Coming Soon
              </span>
          </div>
        </div>

        {/* Right: vinyl visual */}
        <div className="shrink-0 relative w-100 h-100 flex items-center justify-center">
          {/* Vinyl record */}
          <img aria-hidden="true" loading="lazy" width="700" height={700} decoding="async" data-nimg={1} src="https://assets.web.soundcloud.cloud/_next/static/media/vinyl_cover_with_placeholder.8603980b.png" style={{color: 'transparent'}} />

        </div>
      </div>
    </div>
  );
}
