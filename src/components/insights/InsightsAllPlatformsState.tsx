export function InsightsAllPlatformsState() {
  return (
    <div
      className="border-1 border-[#9f9d9d] rounded flex items-center justify-between px-12 py-17 gap-8"
      data-test="insights-all-platforms-state"
    >
      <div className="max-w-3xl">
        <h2 className="text-white font-extrabold text-4xl tracking-tighter leading-snug mb-5">
          Unlock key performance and audience insights across multiple platforms for your music
        </h2>
        <p className="text-text-hover text-md mb-3">
          Access audience and performance insights for your distributed tracks from Spotify, Apple
          Music, and Rythmify all from one dashboard.
        </p>
        <p className="text-text-hover text-sm mb-8">
          Upgrade your account, upload and distribute your track to get started.
        </p>
        <a
          href="/premium"
          className="inline-block px-8 py-3 border border-white text-white font-bold text-sm hover:bg-white hover:text-black transition-colors rounded-sm"
          data-test="insights-all-platforms-upgrade-btn"
        >
          Upgrade to Artist Pro
        </a>
      </div>

      <div className="shrink-0 hidden md:block">
     <img alt="empty-state-no-sc-tracks" loading="lazy" width={335} height={310} decoding="async" data-nimg={1} src="https://insights-ui.sndcdn.com/_next/static/media/empty-state-no-distribution.261e85d0.svg" style={{color: 'transparent'}} />

      </div>
    </div>
  );
}
