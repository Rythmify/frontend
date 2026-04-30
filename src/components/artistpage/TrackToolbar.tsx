import { useNavigate } from "react-router-dom";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  filter: "Public" | "Private";
  onFilterChange: (value: "Public" | "Private") => void;
  trackCount: number;
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-sm border border-[#333] text-text text-sm font-bold hover:border-[#555] hover:text-text-hover transition-colors cursor-pointer bg-transparent"
    >
      {icon}
      {label}
    </button>
  );
}

export function TrackToolbar({ search, onSearchChange, filter, onFilterChange, trackCount }: Props) {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <ActionButton
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          }
          label="Upload or drop tracks"
          onClick={() => navigate("/upload")}
        />
        <ActionButton
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          }
          label="Distribute tracks"
          onClick={() => navigate("/artists/distribution")}
        />
        <ActionButton
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
            </svg>
          }
          label="Monetize tracks"
          onClick={() => navigate("/premium")}
        />
      </div>

      <div className="flex items-center justify-between mb-1 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tracks"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-input-bg text-text-hover text-sm pl-8 pr-3 py-1.5 rounded-sm outline-none border border-[#333] focus:border-[#555] placeholder:text-text w-48 transition-colors"
            />
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-text absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="currentColor"
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </div>

          <div className="flex rounded-sm overflow-hidden border border-[#333]">
            {(["Public", "Private"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onFilterChange(f)}
                className={`px-4 py-1.5 text-sm font-bold transition-colors cursor-pointer ${
                  filter === f ? "bg-input-bg text-text-hover" : "text-text hover:text-text-hover"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-text">
          <span>
            {trackCount} track{trackCount !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            className="flex items-center gap-1 hover:text-text-hover transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
            </svg>
            <span>Date</span>
          </button>
        </div>
      </div>
    </>
  );
}
