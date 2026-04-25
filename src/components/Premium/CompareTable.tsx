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

// ─── Green check circle ────────────────────────────────────────────────────────
function CheckCircle() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        marginLeft: 4,
        flexShrink: 0,
      }}
    >
      <circle cx="12" cy="12" r="10" fill="#16a34a" />
      <path
        d="M7 12.5l3.5 3.5 6.5-7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Cell ──────────────────────────────────────────────────────────────────────
function Cell({ value }: { value: CellValue }) {
  if (value.type === "na") {
    return (
      <span style={{ color: "#9ca3af", fontSize: 14 }}>
        Not Available <span style={{ color: "#d1d5db", fontSize: 11 }}>↓</span>
      </span>
    );
  }
  if (value.type === "unlimited") {
    return (
      <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 14 }}>
        Unlimited
      </span>
    );
  }
  if (value.type === "available") {
    return (
      <span
        style={{
          color: "#16a34a",
          fontWeight: 500,
          fontSize: 14,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        Available
        <CheckCircle />
      </span>
    );
  }
  if (value.value === "ARTIST PRO") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.05em",
          padding: "3px 10px",
          borderRadius: 999,
          backgroundColor: "rgba(201,168,76,0.15)",
          color: "#c9a84c",
        }}
      >
        🔥 ARTIST PRO
      </span>
    );
  }
  if (value.value === "Full access") {
    return (
      <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 14 }}>
        Full access
      </span>
    );
  }
  return <span style={{ color: "#111", fontSize: 14 }}>{value.value}</span>;
}

// ─── Plan header row — columns pinned to the right ─────────────────────────────
const COL_W = 200; // px width per plan column

function PlanHeaderRow() {
  return (
    <div
      style={{
        display: "flex",
        borderBottom: "1px solid #e5e7eb",
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: "#fff",
      }}
    >
      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Free */}
      <div
        style={{
          width: COL_W,
          flexShrink: 0,
          borderLeft: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 16, color: "#111" }}>
          Free
        </span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>Free</span>
        <span
          style={{
            fontSize: 11,
            color: "#9ca3af",
            border: "1px solid #e5e7eb",
            borderRadius: 999,
            padding: "3px 12px",
            marginTop: 4,
          }}
        >
          Current plan
        </span>
      </div>

      {/* Artist Pro */}
      <div
        style={{
          width: COL_W,
          flexShrink: 0,
          borderLeft: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 16, color: "#111" }}>
          Artist Pro
        </span>
        <p style={{ fontSize: 12, textAlign: "center", margin: 0 }}>
          <span style={{ fontWeight: 700, color: "#ff5500" }}>EGP 74.99 </span>
          <span style={{ color: "#9ca3af" }}>/month, billed yearly</span>
        </p>
        <button
          style={{
            marginTop: 4,
            backgroundColor: "#111",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            padding: "8px 20px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Get started
        </button>
      </div>
    </div>
  );
}

// ─── CompareTable ──────────────────────────────────────────────────────────────
export default function CompareTable() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <section
      style={{
        paddingLeft: 80,
        paddingRight: 80,
        paddingBottom: 80,
        backgroundColor: "#fff",
      }}
    >
      <h2
        style={{
          fontSize: 36,
          fontWeight: 800,
          textAlign: "center",
          color: "#111",
          paddingTop: 56,
          marginBottom: 32,
        }}
      >
        Compare features.
      </h2>

      {/* Sticky top header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backgroundColor: "#fff",
        }}
      >
        <PlanHeaderRow />
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          {/* Repeating plan header before each section */}
          <PlanHeaderRow />

          {/* Section title */}
          <div style={{ padding: "16px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
              {section.title}
            </span>
          </div>

          {/* Feature rows */}
          {section.rows.map((row) => {
            const key = `${section.title}::${row.name}`;
            const isOpen = expanded.has(key);

            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  borderBottom: "1px solid #f3f4f6",
                  paddingTop: 18,
                  paddingBottom: 18,
                }}
              >
                {/* Feature name — full left */}
                <div style={{ flex: 1, paddingRight: 32 }}>
                  <button
                    onClick={() => row.description && toggle(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#111",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: row.description ? "pointer" : "default",
                      textAlign: "left",
                      width: "100%",
                    }}
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
                        style={{
                          flexShrink: 0,
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.15s",
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </button>
                  {isOpen && row.description && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        marginTop: 6,
                        lineHeight: 1.6,
                      }}
                    >
                      {row.description}
                    </p>
                  )}
                </div>

                {/* Free value */}
                <div
                  style={{
                    width: COL_W,
                    flexShrink: 0,
                    borderLeft: "1px solid #f3f4f6",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingLeft: 16,
                    paddingRight: 16,
                  }}
                >
                  <Cell value={row.free} />
                </div>

                {/* Artist Pro value */}
                <div
                  style={{
                    width: COL_W,
                    flexShrink: 0,
                    borderLeft: "1px solid #f3f4f6",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingLeft: 16,
                    paddingRight: 16,
                  }}
                >
                  <Cell value={row.artistPro} />
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Footer */}
      <footer
        style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: "1px solid #e5e7eb",
          fontSize: 12,
          color: "#9ca3af",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <p style={{ margin: 0 }}>
          Signed in as Roweda Ahmed.{" "}
          <a href="#" style={{ color: "#ff5500", textDecoration: "none" }}>
            Sign out
          </a>
        </p>
        <nav style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            "Legal",
            "Privacy",
            "Cookies",
            "Consent Manager",
            "Imprint",
            "Help Center",
          ].map((link) => (
            <a
              key={link}
              href="#"
              style={{ color: "#9ca3af", textDecoration: "none" }}
            >
              {link}
            </a>
          ))}
        </nav>
        <select
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 4,
            padding: "4px 8px",
            fontSize: 12,
            color: "#9ca3af",
            background: "transparent",
            width: "fit-content",
            cursor: "pointer",
          }}
        >
          <option>English (US)</option>
        </select>
      </footer>
    </section>
  );
}
