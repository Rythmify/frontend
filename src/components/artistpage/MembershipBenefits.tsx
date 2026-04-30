import { useNavigate } from "react-router-dom";

const BENEFITS = [
  {
    brand: "Splice",
    description: "Get 2 free months of Splice Sounds+ royalty-free samples",
    save: "Save $25.98",
    bgImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-splice-back.5c615c72.svg",
    overlayImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-splice.b3f7f14f.svg",
  },
  {
    brand: "Groover",
    description: "Get 20% off all campaigns on Groover.co and free hype add-on",
    save: "Save $21",
    bgImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-groover-back.0117f664.svg",
    overlayImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-groover.828d0c91.svg",
  },
  {
    brand: "Native Instruments",
    description: "Get 1 month free of Native Instrument's 360 Pro suite",
    save: "Save $50",
    bgImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-native-back.75f49e1a.svg",
    overlayImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-native.5f4fae17.svg",
  },
  {
    brand: "Output Arcade",
    description: "Get 3 free months of Output's Arcade plug-in and samples",
    save: "Save $39",
    bgImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-arcade-back.fe7f4eaf.svg",
    overlayImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-arcade.387a3c3f.svg",
  },
];

export function MembershipBenefits() {
  const navigate = useNavigate();

  return (
    <div className="mt-16 bg-[#1a1a1a] rounded-xl p-6" data-test="membership-benefits">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-text-hover font-extrabold text-xl tracking-tight flex items-center gap-2">
            Artist Pro Membership Benefits
            <span className="text-[13px] font-bold text-text border border-[#444] rounded-full px-2.5 py-0.5">
              Coming Soon
            </span>
          </h3>
          <p className="text-text text-sm mt-1 max-w-xl">
            Jump start your music career with Artist Pro and immediately unlock $100+ in premium music tools and services.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/premium")}
          className="shrink-0 px-4 py-1.5 rounded-full border border-[#444] text-text-hover text-sm font-semibold hover:border-[#666] transition-colors cursor-pointer"
          data-test="benefits-see-all-btn"
        >
          See all
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        {BENEFITS.map(({ brand, description, save, bgImage, overlayImage }) => (
          <div
            key={brand}
            className="flex flex-col rounded-lg overflow-hidden bg-[#111] cursor-pointer group"
            data-test={`benefit-card-${brand.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="relative h-52 overflow-hidden">
              {bgImage ? (
                <>
                  <img
                    alt="Main"
                    loading="lazy"
                    decoding="async"
                    src={bgImage}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    style={{ color: "transparent" }}
                  />
                  <div
                    className="absolute bg-black/70"
                    aria-label="Black cover"
                    style={{ width: "72%", height: "160%", top: "-30%", left: "-22%", transform: "rotate(-12deg)" }}
                  />
                  <img
                    alt="Overlay"
                    loading="lazy"
                    decoding="async"
                    src={overlayImage}
                    className="absolute top-30 left-3 w-20 object-contain"
                    style={{ color: "transparent" }}
                  />
                </>
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                  <span className="text-white font-bold text-lg opacity-60 group-hover:opacity-90 transition-opacity">
                    {brand}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col gap-3 flex-1">
              <p className="text-text-hover text-md font-bold leading-snug">{description}</p>
              <button
                type="button"
                onClick={() => navigate("/premium")}
                className="mt-auto inline-block bg-[#1db954] text-white text-xs font-bold px-3 py-1.5 rounded-full w-fit cursor-pointer hover:bg-[#1ed760] transition-colors"
                data-test={`benefit-save-btn-${brand.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {save}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
