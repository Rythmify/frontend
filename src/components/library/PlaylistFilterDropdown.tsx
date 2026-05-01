import { useState } from "react";

export type FilterOption = "All" | "Created" | "Liked";

const OPTIONS: FilterOption[] = ["All", "Created", "Liked"];

export function PlaylistFilterDropdown({
  value,
  onChange,
}: {
  value: FilterOption;
  onChange: (v: FilterOption) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        data-test="library-playlist-filter-toggle"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-2 min-w-[90px] border border-[#444] rounded-sm py-1.5 px-3 bg-transparent text-[13px] text-white font-bold hover:border-text-secondary transition-all cursor-pointer focus:outline-none"
      >
        <span>{value}</span>
        <svg
          viewBox="0 0 24 24"
          className={`w-3.5 h-3.5 fill-current transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M20.5303 9.53033L12 18.0607L3.46967 9.53033L4.53033 8.46967L12 15.9393L19.4697 8.46967L20.5303 9.53033Z" />
        </svg>
      </button>

      {open && (
        <ul className="absolute right-0 mt-1 w-full border border-text-secondary rounded-sm shadow-xl z-20 overflow-hidden bg-bg py-1">
          {OPTIONS.map((opt) => (
            <li key={opt}>
              <button
                data-test={`library-playlist-filter-option-${opt.toLowerCase()}`}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors cursor-pointer ${
                  value === opt
                    ? "text-white font-bold"
                    : "text-text-secondary hover:text-white hover:bg-bg"
                }`}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
