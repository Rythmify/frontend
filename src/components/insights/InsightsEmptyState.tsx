export function InsightsEmptyState() {
  return (
    <div
      className="border-1 border-[#959292] rounded flex items-center justify-between px-12 py-17 gap-8"
      data-test="insights-empty-state"
    >
      <div className="max-w-3xl">
        <h2 className="text-white font-extrabold text-4xl tracking-tighter leading-snug mb-5">
          Get unmatched insights into your listeners that you won't find anywhere else.
        </h2>
        <p className="text-text-hover text-md mb-3">
          Rythmify is the only platform that lets you easily identify and connect with your top
          fans based on their listening and engagement habits.
        </p>
        <p className="text-text-hover text-sm mb-8">To get started, all it takes is an upload.</p>
        <a
          href="/upload"
          className="inline-block px-8 py-3 border border-white text-white font-bold text-sm hover:bg-white hover:text-black transition-colors rounded-sm"
          data-test="insights-empty-upload-btn"
        >
          Upload
        </a>
      </div>

      <div className="shrink-0 hidden md:block">
<img alt="empty-state-no-sc-tracks" loading="lazy" width={400} height={277} decoding="async" data-nimg={1} src="https://insights-ui.sndcdn.com/_next/static/media/empty-state-no-SC-tracks.098e8896.svg" style={{color: 'transparent'}} />

      </div>
    </div>
  );
}
