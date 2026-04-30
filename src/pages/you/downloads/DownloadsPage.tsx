import { Link } from "react-router-dom";
import TrackCard from "@/components/UI/card/Card";
import { useDownloadStore } from "@/stores/useDownload";
import { useAuthStore } from "@/stores/auth.store";

// ── Icons ─────────────────────────────────────────────────────

function DownloadCloudIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
    >
      <path d="M12 3v11" />
      <path d="M8 10.5 12 14.5 16 10.5" />
      <path d="M6 19h12" />
    </svg>
  );
}

// ── Empty states ──────────────────────────────────────────────

function EmptyNotPremium() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      <DownloadCloudIcon />
      <div className="flex flex-col gap-2">
        <p className="text-white font-semibold text-base">
          Offline listening is a Premium feature
        </p>
        <p className="text-white/50 text-sm max-w-xs leading-relaxed">
          Upgrade to Premium to download tracks and listen without an internet
          connection.
        </p>
      </div>
      <Link
        to="/premium"
        className="mt-1 px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors"
      >
        Try Premium
      </Link>
    </div>
  );
}

function EmptyNothingDownloaded() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <DownloadCloudIcon />
      <div className="flex flex-col gap-2">
        <p className="text-white font-semibold text-base">No downloads yet</p>
        <p className="text-white/50 text-sm max-w-xs leading-relaxed">
          Hit the download button on any track to save it here for offline
          listening.
        </p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function DownloadsPage() {
  const { user } = useAuthStore();
  const { downloadedTracks } = useDownloadStore();

  const isPro = user?.isPro ?? false;

  if (!isPro) return <EmptyNotPremium />;

  if (downloadedTracks.length === 0) return <EmptyNothingDownloaded />;

  return (
    <div className="flex flex-col">
      <p className="text-white/40 text-sm mb-6">
        {downloadedTracks.length}{" "}
        {downloadedTracks.length === 1 ? "track" : "tracks"} downloaded
      </p>

      {downloadedTracks.map((track) => (
        <TrackCard
          key={track.id}
          track={track}
          contextQueue={downloadedTracks}
        />
      ))}
    </div>
  );
}
