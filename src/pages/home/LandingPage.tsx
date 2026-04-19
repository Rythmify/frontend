import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Track } from "@/types/track";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";

interface SlideData {
  headline: string;
  subtitle: string;
  ctas: { label: string; to: string; variant: "primary" | "secondary" }[];
  artist: string;
  artistLabel: string;
  image: string;
}

const slides: SlideData[] = [
  {
    headline: "Discover.\nGet Discovered.",
    subtitle:
      "Discover your next obsession, or become someone else's. Rhythmify is the only community where fans and artists come together to discover and connect through music.",
    ctas: [{ label: "Get Started", to: "/register", variant: "primary" }],
    artist: "DC the Don",
    artistLabel: "Rhythmify Artist Pro",
    image: "/images/hero-slide-1.jpg",
  },
  {
    headline: "It all starts with\nan upload.",
    subtitle:
      "From bedrooms and broom closets to studios and stadiums, Rhythmify is where you define what's next in music. Just hit upload.",
    ctas: [
      { label: "Upload", to: "/upload", variant: "primary" },
      { label: "Explore Artist Pro", to: "/creator/artists", variant: "secondary" },
    ],
    artist: "1900Rugrat",
    artistLabel: "Ascending Artist",
    image: "/images/hero-slide-2.jpg",
  },
  {
    headline: "What will you\nfind today?",
    subtitle:
      "Rhythmify has millions of tracks from independent artists worldwide. Start listening to the artists who are defining what's next.",
    ctas: [{ label: "Start Listening", to: "/discover", variant: "primary" }],
    artist: "Suki Waterhouse",
    artistLabel: "Trending Artist",
    image: "/images/hero-slide-3.jpg",
  },
];

const AUTOPLAY_INTERVAL = 5000;

const TrendingTrackCard = ({ track }: { track: Track }) => (
  <Link to={`/${track.artistUsername}/${track.id}`} className="group block">
    <div className="aspect-square rounded bg-[#333] mb-2 overflow-hidden relative">
      {track.coverUrl ? (
        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-[#666]" />
      )}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-3">
        <button aria-label="Like" className="text-white/80 hover:text-white text-sm">♥</button>
        <button aria-label="Follow" className="text-white/80 hover:text-white text-sm">👤</button>
        <button aria-label="More" className="text-white/80 hover:text-white text-sm">•••</button>
      </div>
    </div>
    <p className="text-sm font-medium text-white truncate">{track.title}</p>
    <p className="text-xs text-[#999] truncate">{track.artistName}</p>
  </Link>
);

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingTracks, setTrendingTracks] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    import("@/services/feed.service").then(({ getHome }) => {
      getHome()
        .then((homeData) => {
          if (homeData?.trending_by_genre?.initial_tab?.tracks) {
            const mappedTracks = homeData.trending_by_genre.initial_tab.tracks.map((t: any) => ({
              id: t.id,
              title: t.title,
              coverUrl: t.cover_image,
              artistName: t.artist_name,
              artistUsername: "artist",
              audioUrl: t.stream_url,
            }));
            setTrendingTracks(mappedTracks.slice(0, 10));
          }
        })
        .catch((e) => console.error("Failed to load home data", e));
    });
  }, []);

  const goToSlide = useCallback((index: number) => setCurrentSlide(index), []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = slides[currentSlide];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="w-full bg-[#121212]">
      {/* ── Announcement Banner ──────────────────────────────────────────── */}
      <div className="flex items-center justify-center min-h-[64px] gap-2 mb-10 bg-[#303030] px-4 py-4 text-white rounded border border-gray-300/40">
        <img
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzZDMTJEMiIgZD0ibTguMzgzIDItNiAxMmg1LjM4bC0xLjg4IDguNzc2TDIzLjYzMSA3aC02Ljg2NGwzLTVIOC4zODNaIi8+PC9zdmc+"
          className="flex-shrink-0"
          alt=""
        />
        <span className="text-[#ccc] text-sm sm:text-base md:text-lg text-center">
          Uploading tracks just got way easier: upload, get heard, and get paid in one seamless experience.{" "}
          <Link to="/upload" className="text-[#608cf3] hover:underline font-medium">
            Try it out
          </Link>
        </span>
      </div>

      {/* ── Hero Carousel ────────────────────────────────────────────────── */}
      <div
        className="relative min-h-[420px] sm:min-h-[500px] overflow-hidden rounded-3xl bg-[#111]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background images — crossfade */}
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
            style={{ backgroundImage: `url(${s.image})`, opacity: i === currentSlide ? 1 : 0 }}
          />
        ))}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(17,17,17,0.92) 0%, rgba(17,17,17,0.6) 50%, rgba(17,17,17,0.1) 100%)",
          }}
        />

        {/* Navbar */}
        <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 pt-5">
          <Link to="/" className="flex items-center gap-2">
            <i className="fa-brands fa-soundcloud text-text-hover text-2xl sm:text-3xl" />
            <span className="text-base sm:text-lg font-medium tracking-wider text-white/90">
              RHYTHMIFY
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/signin"
              className="rounded px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-md font-extrabold bg-white text-black border border-white/30 hover:text-text-secondary transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-md font-extrabold text-white bg-black hover:text-text-secondary transition-colors"
            >
              <span className="hidden sm:inline">Create account</span>
              <span className="sm:hidden">Join</span>
            </Link>
            <Link
              to="/creator/artists"
              className="hidden md:block px-2 py-2 text-md font-medium text-white/80 hover:text-white transition-colors"
            >
              For Artists
            </Link>
          </div>
        </div>

        {/* Slide content */}
        <div className="relative z-10 flex min-h-[280px] sm:min-h-[340px] flex-col justify-center px-5 sm:px-8 md:px-10 max-w-[800px] pt-4">
          <h1 className="mb-4 text-[32px] sm:text-[48px] md:text-[60px] font-extrabold leading-[1.15] text-white whitespace-pre-line">
            {slide.headline}
          </h1>
          <p className="mb-8 max-w-[600px] text-[13px] sm:text-[15px] md:text-[17px] leading-relaxed text-white/80">
            {slide.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {slide.ctas.map((cta, i) =>
              cta.variant === "primary" ? (
                <Link
                  key={i}
                  to={cta.to}
                  className="rounded bg-white px-5 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-md font-bold text-[#111] transition-colors hover:bg-gray-200"
                >
                  {cta.label}
                </Link>
              ) : (
                <Link
                  key={i}
                  to={cta.to}
                  className="rounded border border-white/40 px-5 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-white transition-colors hover:border-white"
                >
                  {cta.label}
                </Link>
              ),
            )}
          </div>
        </div>

        {/* Artist badge */}
        <div className="absolute bottom-5 right-4 sm:right-6 z-10 text-right text-white">
          <div className="text-xs sm:text-sm font-semibold">{slide.artist}</div>
          <div className="text-[10px] sm:text-xs text-white/70">{slide.artistLabel}</div>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-3 sm:gap-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-[1.5px] transition-all cursor-pointer ${
                i === currentSlide
                  ? "border-white bg-white"
                  : "border-white/60 bg-transparent hover:border-white"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Search Row ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center my-10 justify-center gap-3 sm:gap-4 px-5 py-7 bg-[#111]">
        <form onSubmit={handleSearch} className="relative w-full max-w-[560px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for artists, bands, tracks, podcasts"
            className="w-full rounded border border-[#555] bg-[#111] px-4 py-2.5 pr-10 text-sm text-white outline-none focus:border-[#999] placeholder:text-[#999]"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-white transition-colors"
          >
            <i className="fa-solid fa-magnifying-glass text-sm font-medium" />
          </button>
        </form>
        <span className="text-sm text-[#999]">or</span>
        <Link
          to="/upload"
          className="whitespace-nowrap rounded border border-[#555] bg-transparent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white"
        >
          Upload your own
        </Link>
      </div>

      {/* ── Trending Tracks ──────────────────────────────────────────────── */}
      <div className="pb-15 gap-5 px-4 sm:px-8">
        <h2 className="pb-6 text-center text-base sm:text-lg font-medium text-white">
          Hear what's trending for free in the Rhythmify community
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-10">
          {trendingTracks.length > 0 ? (
            trendingTracks.map((track) => <TrendingTrackCard key={track.id} track={track} />)
          ) : (
            <p className="text-[#999] col-span-full text-center">Loading trending tracks...</p>
          )}
        </div>

        <div className="flex justify-center">
          <Link
            to="/discover"
            className="rounded px-6 sm:px-8 py-3 text-base sm:text-xl font-bold text-black bg-white hover:bg-gray-200 transition-colors"
          >
            Explore trending playlists
          </Link>
        </div>
      </div>

      {/* ── Never Stop Listening ─────────────────────────────────────────── */}
      <div className="bg-[#f2f2f2]">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-12 sm:pt-15 flex flex-col md:flex-row items-center gap-8 sm:gap-15 pb-12">
          <div className="flex-1 flex items-center justify-center">
            <img src="/images/mobile.jpg" className="max-w-full h-auto" alt="App preview" />
          </div>
          <div className="flex-1 max-w-full md:max-w-[400px] text-center md:text-left">
            <h2 className="text-[28px] sm:text-[40px] font-extrabold text-[#111] mb-2">
              Never stop listening
            </h2>
            <div className="w-15 h-1 mb-6 bg-gradient-to-r from-[#ff5500] via-blue-600 to-fuchsia-700 rounded mx-auto md:mx-0" />
            <p className="text-[14px] sm:text-[15px] text-black leading-relaxed mb-8">
              Rhythmify is available on Web, iOS, Android, Sonos, Chromecast, and Xbox One.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
              <a href="https://apps.apple.com/us/app/soundcloud-the-music-you-love/id336353151">
                <img src="/images/app_store.png" alt="App Store" className="h-10 sm:h-12" />
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.soundcloud.android&hl=us">
                <img src="/images/google_store.png" alt="Google Play" className="h-10 sm:h-12" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Calling All Creators ─────────────────────────────────────────── */}
      <div className="w-full">
        {/* Desktop: image with text overlay */}
        <div className="relative w-full overflow-hidden hidden md:block">
          <img src="/images/girl.jpg" alt="Creator" className="w-full object-cover max-h-[600px]" />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.05) 100%)",
            }}
          />
          <div className="absolute inset-0 flex items-center px-12 lg:px-24">
            <div className="max-w-[450px]">
              <h2 className="text-[36px] lg:text-[40px] font-bold text-white mb-4">
                Calling all creators
              </h2>
              <p className="text-[15px] text-[#ccc] leading-relaxed mb-8">
                Get on Rhythmify to connect with fans, share your sounds, and grow your audience. What are you waiting for?
              </p>
              <Link
                to="/creator/artists"
                className="inline-block rounded border bg-white border-white/40 px-4 py-2.5 text-lg font-bold text-black hover:text-white hover:bg-white/10 transition-colors"
              >
                Find out more
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile: image on top, text below */}
        <div className="md:hidden">
          <img src="/images/girl.jpg" alt="Creator" className="w-full object-cover h-[220px] sm:h-[300px]" />
          <div className="bg-[#121212] px-6 py-8">
            <h2 className="text-[26px] sm:text-[32px] font-bold text-white mb-4">
              Calling all creators
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#ccc] leading-relaxed mb-6">
              Get on Rhythmify to connect with fans, share your sounds, and grow your audience. What are you waiting for?
            </p>
            <Link
              to="/creator/artists"
              className="inline-block rounded border bg-white border-white/40 px-4 py-2.5 text-base font-bold text-black hover:text-white hover:bg-white/10 transition-colors"
            >
              Find out more
            </Link>
          </div>
        </div>
      </div>

      {/* ── Thanks for Listening ─────────────────────────────────────────── */}
      <div className="py-16 sm:py-20 px-6 sm:px-8">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-[24px] sm:text-[32px] font-bold text-white mb-4">
            Thanks for listening. Now join in.
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#ccc] mb-8">
            Save tracks, follow artists and build playlists. All for free.
          </p>
          <Link
            to="/signin"
            className="inline-block rounded-sm border border-[#555] bg-transparent px-8 sm:px-10 py-3 text-sm font-medium text-white hover:border-white transition-colors mb-6"
          >
            Create account
          </Link>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-[#999]">Already have an account?</span>
            <Link to="/signin" className="text-white font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <GuestPageFooter />
    </div>
  );
};

export default LandingPage;
