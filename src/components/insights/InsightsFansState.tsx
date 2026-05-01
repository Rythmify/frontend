export function InsightsFansState() {
  return (
    <div
      className="border-1 border-[#858383] rounded flex items-center justify-between px-12 py-17 gap-8"
      data-test="insights-fans-state"
    >
      <div className="max-w-3xl">
        <h2 className="text-white font-extrabold text-4xl tracking-tighter leading-snug mb-5">
          Connect with your biggest fans
        </h2>
        <p className="text-text-hover text-md mb-3">
          See which fans are your most engaged and connect directly with them to create fans for
          life. Other platforms call them followers — we know they are way more than that. Your fans
          are your day ones, your biggest supporters, your best promoters.
        </p>
        <p className="text-text-hover text-sm mb-3">Get to know your fans — start today.</p>
        <p className="text-white text-sm font-bold mb-8">Available to Artist Pro subscribers.</p>
        <a
          href="/premium"
          className="inline-block px-8 py-3 border border-white text-white font-bold text-sm hover:bg-white hover:text-black transition-colors rounded-sm"
          data-test="insights-fans-upgrade-btn"
        >
          Upgrade to Artist Pro
        </a>
      </div>

      <div className="shrink-0 hidden md:block">
<img alt="Fans illustration" loading="lazy" width={254} height={220} src="https://insights-ui.sndcdn.com/_next/static/media/soundcloud-fpi-dark.155febe3.png" />

      </div>
    </div>
  );
}
