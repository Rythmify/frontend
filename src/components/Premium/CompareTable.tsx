import { useState } from "react";

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
    title: "Get heard",
    rows: [
      {
        name: "Promote tracks",
        description:
          "Our algorithm analyzes and recommends your tracks to 100 or even 1000 listeners most likely to love it.",
        free: NA,
        artistPro: UNL,
      },
      {
        name: "Get playlisted",
        description:
          "Subscribers that opt in can get featured on playlists like Buzzing followed by future fans, A&Rs, and more.",
        free: NA,
        artistPro: UNL,
      },
      {
        name: "Distribute and get paid",
        description:
          "Earn royalties from 60+ social and streaming platforms like Spotify and TikTok.",
        free: NA,
        artistPro: UNL,
      },
      {
        name: "Advanced audience stats",
        description:
          "See how listeners found your music, your top fans, and where they're located.",
        free: txt("How fans found you"),
        artistPro: UNL,
      },
    ],
  },
  {
    title: "Manage your music",
    rows: [
      { name: "Upload limit", free: txt("2 hours"), artistPro: UNL },
      {
        name: "Free mastering credits",
        free: NA,
        artistPro: txt("3 tracks / month"),
      },
      {
        name: "Replace tracks",
        description:
          "Swap out your track files without losing plays, likes, or comments.",
        free: NA,
        artistPro: UNL,
      },
      {
        name: "Quiet mode",
        description:
          "Hide or turn off comments for tracks, and choose if you want to have plays and likes displayed.",
        free: NA,
        artistPro: AVL,
      },
      { name: "Schedule track releases", free: NA, artistPro: AVL },
    ],
  },
  {
    title: "Build your brand",
    rows: [
      {
        name: "Profile badge",
        description: "Visible to fans and collaborators.",
        free: NA,
        artistPro: txt("ARTIST PRO"),
      },
      {
        name: "Spotlight",
        description:
          "Have control over your first impression by spotlighting your best tracks at the top of your profile.",
        free: NA,
        artistPro: txt("5 tracks"),
      },
    ],
  },
  {
    title: "Get paid",
    rows: [
      {
        name: "Monetize on SoundCloud",
        description:
          "Get paid for streams on SoundCloud with fan-powered royalties, and keep 100% of your earnings.",
        free: NA,
        artistPro: UNL,
      },
      {
        name: "Distribute and monetize on 60+ other platforms",
        description:
          "Get paid regularly for streams on Spotify, Apple Music, TikTok and more, and keep 100% of your earnings.",
        free: NA,
        artistPro: UNL,
      },
      {
        name: "YouTube Content ID",
        description: "Get paid when your music is used in YouTube videos.",
        free: NA,
        artistPro: AVL,
      },
      {
        name: "Split royalties",
        description: "Make sure your collaborators get paid.",
        free: NA,
        artistPro: AVL,
      },
    ],
  },
  {
    title: "Special treatment",
    rows: [
      { name: "Priority support", free: NA, artistPro: AVL },
      { name: "Get 50% off Go+", free: NA, artistPro: AVL },
      {
        name: "Exclusive Partner Savings",
        description:
          "Exclusive offers & discounts from partners like Groover, Serato, and Tracklib.",
        free: txt("Partial access"),
        artistPro: txt("Full access"),
      },
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
      <span className="text-[13px] text-slate-400">
        Not Available <span className="text-[11px] text-slate-300">↓</span>
      </span>
    );
  }

  if (value.type === "unlimited") {
    return <span className="text-[13px] font-semibold text-emerald-600">Unlimited</span>;
  }

  if (value.type === "available") {
    return (
      <span className="inline-flex items-center text-[13px] font-medium text-emerald-600">
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
    return <span className="text-[13px] font-semibold text-emerald-600">Full access</span>;
  }

  return <span className="text-[13px] text-black">{value.value}</span>;
}

const COL_W = "w-[200px]";

function PlanHeaderRow() {
  return (
    <div className="flex border-b border-[#e5e7eb] bg-white py-5">
      <div className="flex-1" />

      <div className={`flex ${COL_W} flex-shrink-0 flex-col items-center gap-1 border-l border-[#e5e7eb] px-4`}>
        <span className="text-[15px] font-extrabold text-black">Free</span>
        <span className="text-[12px] text-slate-400">Free</span>
        <span className="mt-1 rounded-full border border-[#e5e7eb] px-3 py-[3px] text-[11px] text-slate-400">
          Current plan
        </span>
      </div>

      <div className={`flex ${COL_W} flex-shrink-0 flex-col items-center gap-1 border-l border-[#e5e7eb] px-4`}>
        <span className="text-[15px] font-extrabold text-black">Artist Pro</span>
        <p className="m-0 text-[11px] text-center">
          <span className="font-bold text-[#ff5500]">EGP 74.99 </span>
          <span className="text-slate-400">/month, billed yearly</span>
        </p>
        <button className="mt-1 rounded-[7px] bg-black px-[18px] py-[7px] text-[11px] font-bold text-white">
          Get started
        </button>
      </div>
    </div>
  );
}

export default function CompareTable() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <section className="bg-white px-6 pb-20 md:px-10 lg:px-20">
      <h2 className="mb-8 pt-14 text-center text-[2.25rem] font-extrabold tracking-[-0.03em] text-black">
        Compare features.
      </h2>

      <div className="sticky top-0 z-20 bg-white">
        <PlanHeaderRow />
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          <PlanHeaderRow />

          <div className="border-b border-[#f3f4f6] py-4">
            <span className="text-[14px] font-bold text-black">{section.title}</span>
          </div>

          {section.rows.map((row) => {
            const key = `${section.title}::${row.name}`;
            const isOpen = expanded.has(key);

            return (
              <div
                key={key}
                className="flex items-start border-b border-[#f3f4f6] py-[18px]"
              >
                <div className="flex-1 pr-8">
                  <button
                    onClick={() => row.description && toggle(key)}
                    className={`flex w-full items-center gap-1.5 bg-transparent p-0 text-left text-[14px] font-bold text-black ${
                      row.description ? "cursor-pointer" : "cursor-default"
                    } border-none`}
                  >
                    {row.name}
                    {row.description && (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#9ca3af"
                        strokeWidth="2.5"
                        className={`flex-shrink-0 transition-transform duration-150 ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </button>

                  {isOpen && row.description && (
                    <p className="mt-1.5 text-[12px] leading-[1.6] text-slate-400">
                      {row.description}
                    </p>
                  )}
                </div>

                <div
                  className={`flex ${COL_W} flex-shrink-0 items-center justify-center border-l border-[#f3f4f6] px-4`}
                >
                  <Cell value={row.free} />
                </div>

                <div
                  className={`flex ${COL_W} flex-shrink-0 items-center justify-center border-l border-[#f3f4f6] px-4`}
                >
                  <Cell value={row.artistPro} />
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <footer className="mt-16 flex flex-col gap-3 border-t border-[#e5e7eb] pt-6 text-[12px] text-slate-400">
        <p className="m-0">
          Signed in as Roweda Ahmed.{" "}
          <a href="#" className="text-[#ff5500] no-underline">
            Sign out
          </a>
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
