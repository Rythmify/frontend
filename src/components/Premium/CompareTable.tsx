import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

type CellValue =
  | { type: "na" }
  | { type: "unlimited" }
  | { type: "available" }
  | { type: "text"; value: string };

interface FeatureRow {
  name: string;
  description?: string;
  free: CellValue;
  artistPro: CellValue;
}

interface FeatureSection {
  title: string;
  rows: FeatureRow[];
}

const NA: CellValue = { type: "na" };
const UNL: CellValue = { type: "unlimited" };
const AVL: CellValue = { type: "available" };
const txt = (value: string): CellValue => ({ type: "text", value });

const sections: FeatureSection[] = [
  {
    title: "Manage your music",
    rows: [
      { name: "Unlimited uploads", free: txt("3 tracks"), artistPro: UNL },
      { name: "Offline listening downloads", free: NA, artistPro: AVL },
    ],
  },
];

function CheckCircle() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="ml-1 inline-block h-4 w-4 flex-shrink-0 align-middle"
    >
      <circle cx="12" cy="12" r="10" className="fill-emerald-600" />
      <path
        d="M7 12.5l3.5 3.5 6.5-7"
        className="stroke-white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Cell({ value }: { value: CellValue }) {
  if (value.type === "na") {
    return (
      <span className="text-[15px] font-semibold leading-none text-black/70">
        Not Available <span className="text-[12px] text-black/35">↓</span>
      </span>
    );
  }

  if (value.type === "unlimited") {
    return (
      <span className="text-[15px] font-semibold leading-none text-emerald-600">
        Unlimited
      </span>
    );
  }

  if (value.type === "available") {
    return (
      <span className="inline-flex items-center text-[15px] font-semibold leading-none text-emerald-600">
        Available
        <CheckCircle />
      </span>
    );
  }

  if (value.value === "ARTIST PRO") {
    return (
      <span className="inline-flex items-center rounded-full bg-[rgba(201,168,76,0.18)] px-2.5 py-[3px] text-[10px] font-bold tracking-[0.05em] text-[#c9a84c]">
        ARTIST PRO
      </span>
    );
  }

  if (value.value === "Full access") {
    return (
      <span className="text-[15px] font-semibold leading-none text-emerald-600">
        Full access
      </span>
    );
  }

  return (
    <span className="text-[15px] font-semibold leading-none text-black">
      {value.value}
    </span>
  );
}

const COL_W = "w-[280px]";

function PlanHeaderRow() {
  return (
    <div className="flex bg-white py-8">
      <div className="w-[380px]" />

      <div
        className={`flex ${COL_W} flex-shrink-0 flex-col items-center gap-2 px-4`}
      >
        <span className="text-[32px] font-black leading-none tracking-[-0.04em] text-black">
          Free
        </span>
        <span className="text-[15px] font-semibold text-black/60">Basic</span>
        <span className="mt-1 rounded-full border border-[#e5e7eb] px-5 py-[10px] text-[14px] font-semibold text-black/50">
          Current plan
        </span>
      </div>

      <div
        className={`flex ${COL_W} flex-shrink-0 flex-col items-center gap-2 px-4`}
      >
        <span className="text-[32px] font-black leading-none tracking-[-0.04em] text-black">
          Premium
        </span>
        <p className="m-0 text-center text-[15px] leading-[1.35] text-black/60">
          <span className="font-bold text-emerald-600">EGP 29.99 </span>
          <span>/month, billed yearly for EGP 359.88</span>
        </p>
        <Link
          to="/creator/checkout"
          className="mt-2 rounded-full bg-black px-6 py-3 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
        >
          Get started
        </Link>
      </div>
    </div>
  );
}

export default function CompareTable() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleSignOut = () => {
    logout();
    navigate("/logout");
  };

  return (
    <section className="bg-white px-6 pb-20 md:px-10 lg:px-12 xl:px-16">
      <h2 className="mb-8 pt-14 text-center text-[2.25rem] font-extrabold tracking-[-0.03em] text-black">
        Compare features.
      </h2>

      <div className="mx-auto w-fit max-w-full bg-white">
        <div className="sticky top-0 z-20 bg-white">
          <PlanHeaderRow />
        </div>

        {sections.map((section) => (
          <div key={section.title}>
            <div className="py-6">
              <span className="text-[18px] font-black tracking-[-0.02em] text-black">
                {section.title}
              </span>
            </div>

            {section.rows.map((row) => {
              return (
                <div
                  key={`${section.title}::${row.name}`}
                  className="flex items-center border-b border-[#f3f4f6] py-6"
                >
                  <div className="w-[380px] pr-8">
                    <div className="text-[16px] font-bold leading-[1.35] text-black">
                      {row.name}
                    </div>
                    {row.description && (
                      <div className="mt-1.5 text-[13px] leading-[1.55] text-slate-500">
                        {row.description}
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex ${COL_W} flex-shrink-0 items-center justify-center px-4`}
                  >
                    <Cell value={row.free} />
                  </div>

                  <div
                    className={`flex ${COL_W} flex-shrink-0 items-center justify-center px-4`}
                  >
                    <Cell value={row.artistPro} />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <footer className="mt-16 flex flex-col gap-3 border-t border-[#e5e7eb] pt-6 text-[12px] text-slate-400">
        <p className="m-0">
          Signed in as {user?.displayName ?? user?.username ?? "User"}.{" "}
          <button
            type="button"
            onClick={handleSignOut}
            className="cursor-pointer border-0 bg-transparent p-0 text-[#ff5500] no-underline"
          >
            Sign out
          </button>
        </p>

        <nav className="flex flex-wrap gap-5">
          {[
            "Legal",
            "Privacy",
            "Cookies",
            "Consent Manager",
            "Imprint",
            "Help Center",
          ].map((link) => (
            <a key={link} href="#" className="text-slate-400 no-underline">
              {link}
            </a>
          ))}
        </nav>

        <select className="w-fit cursor-pointer rounded border border-[#e5e7eb] bg-transparent px-2 py-1 text-[12px] text-slate-400">
          <option>English (US)</option>
        </select>
      </footer>
    </section>
  );
}
