import { useState } from "react";
import HeroSection from "../../components/Premium/HeroSection";

// ─── Types ─────────────────────────────────────────────────────────────────────
type CV =
  | { type: "na" }
  | { type: "unlimited" }
  | { type: "available" }
  | { type: "text"; value: string };
const NA: CV = { type: "na" };
const UNL: CV = { type: "unlimited" };
const AVL: CV = { type: "available" };
const txt = (v: string): CV => ({ type: "text", value: v });

// ─── Data ──────────────────────────────────────────────────────────────────────
const sections = [
  {
    title: "Get heard",
    rows: [
      {
        name: "Promote tracks",
        desc: "Our algorithm analyzes and recommends your tracks to 100 or even 1000 listeners most likely to love it.",
        free: NA,
        pro: UNL,
      },
      {
        name: "Get playlisted",
        desc: "Subscribers that opt in can get featured on playlists like Buzzing followed by future fans, A&Rs, and more.",
        free: NA,
        pro: UNL,
      },
      {
        name: "Distribute and get paid",
        desc: "Earn royalties from 60+ social and streaming platforms like Spotify and TikTok.",
        free: NA,
        pro: UNL,
      },
      {
        name: "Advanced audience stats",
        desc: "See how listeners found your music, your top fans, and where they're located.",
        free: txt("How fans found you"),
        pro: UNL,
      },
    ],
  },
  {
    title: "Manage your music",
    rows: [
      { name: "Upload limit", free: txt("2 hours"), pro: UNL },
      {
        name: "Free mastering credits",
        free: NA,
        pro: txt("3 tracks / month"),
      },
      {
        name: "Replace tracks",
        desc: "Swap out your track files without losing plays, likes, or comments.",
        free: NA,
        pro: UNL,
      },
      {
        name: "Quiet mode",
        desc: "Hide or turn off comments for tracks, and choose if you want to have plays and likes displayed.",
        free: NA,
        pro: AVL,
      },
      { name: "Schedule track releases", free: NA, pro: AVL },
    ],
  },
  {
    title: "Build your brand",
    rows: [
      {
        name: "Profile badge",
        desc: "Visible to fans and collaborators.",
        free: NA,
        pro: txt("ARTIST PRO"),
      },
      {
        name: "Spotlight",
        desc: "Have control over your first impression by spotlighting your best tracks at the top of your profile.",
        free: NA,
        pro: txt("5 tracks"),
      },
    ],
  },
  {
    title: "Get paid",
    rows: [
      {
        name: "Monetize on SoundCloud",
        desc: "Get paid for streams on SoundCloud with fan-powered royalties, and keep 100% of your earnings.",
        free: NA,
        pro: UNL,
      },
      {
        name: "Distribute and monetize on 60+ other platforms",
        desc: "Get paid regularly for streams on Spotify, Apple Music, TikTok and more, and keep 100% of your earnings.",
        free: NA,
        pro: UNL,
      },
      {
        name: "YouTube Content ID",
        desc: "Get paid when your music is used in YouTube videos.",
        free: NA,
        pro: AVL,
      },
      {
        name: "Split royalties",
        desc: "Make sure your collaborators get paid.",
        free: NA,
        pro: AVL,
      },
    ],
  },
  {
    title: "Special treatment",
    rows: [
      { name: "Priority support", free: NA, pro: AVL },
      { name: "Get 50% off Go+", free: NA, pro: AVL },
      {
        name: "Exclusive Partner Savings",
        desc: "Exclusive offers & discounts from partners like Groover, Serato, and Tracklib.",
        free: txt("Partial access"),
        pro: txt("Full access"),
      },
    ],
  },
];

// ─── SVG Icons ─────────────────────────────────────────────────────────────────
const IconUpload = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const IconBoost = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconMoney = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconReplace = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
const IconAI = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconStats = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);
const IconChat = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="15"
    height="15"
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
const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="2.5"
    style={{
      flexShrink: 0,
      transition: "transform .15s",
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Cell ──────────────────────────────────────────────────────────────────────
function Cell({ v }: { v: CV }) {
  if (v.type === "na")
    return (
      <span style={{ color: "#9ca3af", fontSize: 13 }}>
        Not Available <span style={{ color: "#d1d5db", fontSize: 11 }}>↓</span>
      </span>
    );
  if (v.type === "unlimited")
    return (
      <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 13 }}>
        Unlimited
      </span>
    );
  if (v.type === "available")
    return (
      <span
        style={{
          color: "#16a34a",
          fontWeight: 500,
          fontSize: 13,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        Available
        <IconCheck />
      </span>
    );
  if (v.value === "ARTIST PRO")
    return (
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".05em",
          padding: "3px 9px",
          borderRadius: 999,
          background: "rgba(201,168,76,0.18)",
          color: "#c9a84c",
        }}
      >
        🔥 ARTIST PRO
      </span>
    );
  if (v.value === "Full access")
    return (
      <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 13 }}>
        Full access
      </span>
    );
  return <span style={{ color: "#111", fontSize: 13 }}>{v.value}</span>;
}

// ─── Plan header row (repeats before each section) ─────────────────────────────
const COL = 200; // px — each plan column width

function PlanHeaderRow() {
  return (
    <div
      style={{
        display: "flex",
        borderBottom: "1px solid #e5e7eb",
        paddingTop: 20,
        paddingBottom: 20,
        background: "#fff",
      }}
    >
      <div style={{ flex: 1 }} />
      {/* Free */}
      <div
        style={{
          width: COL,
          flexShrink: 0,
          borderLeft: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          padding: "0 16px",
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 15, color: "#111" }}>
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
            marginTop: 2,
          }}
        >
          Current plan
        </span>
      </div>
      {/* Artist Pro */}
      <div
        style={{
          width: COL,
          flexShrink: 0,
          borderLeft: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          padding: "0 16px",
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 15, color: "#111" }}>
          Artist Pro
        </span>
        <p style={{ fontSize: 11, textAlign: "center", margin: 0 }}>
          <span style={{ fontWeight: 700, color: "#ff5500" }}>EGP 74.99 </span>
          <span style={{ color: "#9ca3af" }}>/month, billed yearly</span>
        </p>
        <button
          style={{
            marginTop: 4,
            background: "#111",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "7px 18px",
            borderRadius: 7,
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

// ─── Hero ──────────────────────────────────────────────────────────────────────
function LegacyHeroSection() {
  const feats = [
    {
      title: "Grow your audience",
      desc: "Artist Pro subscribers get on average 400% more listens, thanks to our audio algorithm and featured playlists.",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      title: "Know your audience",
      desc: "Get advanced fan Insights and custom listening reports to build connections and plan promotions, releases, and tours.",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="12" width="4" height="9" rx="1" />
          <rect x="10" y="7" width="4" height="14" rx="1" />
          <rect x="17" y="3" width="4" height="18" rx="1" />
        </svg>
      ),
    },
    {
      title: "Upload unlimited tracks",
      desc: "Upload and replace unlimited tracks without losing your plays, likes, and comments.",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4zm0 0c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z" />
        </svg>
      ),
    },
    {
      title: "Distribution is included",
      desc: "Distribute and get paid on SoundCloud and 60+ platforms including Spotify, Apple Music, and TikTok.",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      ),
    },
  ];
  return (
    <section>
      <div
        style={{
          background: "#111",
          padding: "56px 64px",
          position: "relative",
          overflow: "hidden",
          minHeight: 240,
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src="/assets/hero-gear.png"
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            height: "100%",
            width: "55%",
            objectFit: "cover",
            objectPosition: "left",
            pointerEvents: "none",
            maskImage:
              "linear-gradient(to right,transparent 0%,rgba(0,0,0,.2) 20%,black 55%)",
            WebkitMaskImage:
              "linear-gradient(to right,transparent 0%,rgba(0,0,0,.2) 20%,black 55%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 520 }}>
          <h1
            style={{
              color: "#fff",
              fontSize: 48,
              fontWeight: 900,
              letterSpacing: -1,
              lineHeight: 1.05,
              margin: "0 0 12px",
            }}
          >
            Reach more listeners.
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,.75)",
              fontSize: 14,
              margin: "0 0 24px",
            }}
          >
            🎵🎶 Join millions of artists that use SoundCloud to get heard.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              style={{
                background: "#fff",
                color: "#111",
                fontWeight: 700,
                fontSize: 13,
                padding: "10px 22px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
              }}
            >
              Get Artist Pro
            </button>
            <button
              style={{
                background: "transparent",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                padding: "10px 22px",
                borderRadius: 999,
                border: "1.5px solid rgba(255,255,255,.45)",
                cursor: "pointer",
              }}
            >
              See all plans
            </button>
          </div>
        </div>
      </div>
      <div
        style={{
          background: "#1a1a1a",
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 28,
          padding: "36px 64px",
        }}
      >
        {feats.map((f) => (
          <div key={f.title}>
            <div style={{ color: "rgba(255,255,255,.6)", marginBottom: 10 }}>
              {f.icon}
            </div>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                margin: "0 0 6px",
              }}
            >
              {f.title}
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,.5)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Pricing Cards ─────────────────────────────────────────────────────────────
function PricingCards() {
  const badgeMuted = {
    fontSize: 10,
    fontWeight: 700,
    padding: "3px 7px",
    borderRadius: 999,
    background: "#f3f4f6",
    color: "#6b7280",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  };
  const badgeGold = {
    ...badgeMuted,
    background: "rgba(201,168,76,0.18)",
    color: "#c9a84c",
  };

  return (
    <section style={{ padding: "56px 64px", background: "#fff" }}>
      <h2
        style={{
          fontSize: 34,
          fontWeight: 900,
          textAlign: "center",
          color: "#111",
          margin: "0 0 36px",
          letterSpacing: -0.5,
        }}
      >
        Available plans.
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          maxWidth: 780,
          margin: "0 auto",
        }}
      >
        {/* FREE */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 24,
            background: "#fff",
          }}
        >
          <div
            style={{
              fontSize: 19,
              fontWeight: 900,
              color: "#111",
              marginBottom: 3,
            }}
          >
            Free
          </div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>
            Start sharing your music for free
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 7,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 19, fontWeight: 900, color: "#ff5500" }}>
              EGP 0
            </span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>forever free</span>
          </div>
          <button
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              background: "#e5e7eb",
              color: "#9ca3af",
              cursor: "default",
              marginBottom: 18,
            }}
          >
            Current plan
          </button>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 13,
            }}
          >
            {[
              { icon: <IconUpload />, label: "2 hours of uploads" },
              {
                icon: <IconBoost />,
                label: "Boost tracks and get 100+ listeners",
                badge: "2X MONTH",
                gold: false,
              },
              {
                icon: <IconMoney />,
                label: "Distribute & monetize tracks",
                badge: "2X MONTH",
                gold: false,
              },
              {
                icon: <IconReplace />,
                label: "Replace tracks without losing stats",
                badge: "3X MONTH",
                gold: false,
              },
              {
                icon: <IconAI />,
                label: "AI Mastering",
                badge: "1X MONTH",
                gold: false,
              },
            ].map((f, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  fontSize: 13,
                  color: "#111",
                }}
              >
                <span style={{ color: "#9ca3af", flexShrink: 0 }}>
                  {f.icon}
                </span>
                <span style={{ flex: 1 }}>{f.label}</span>
                {"badge" in f && <span style={badgeMuted}>{f.badge}</span>}
              </li>
            ))}
          </ul>
        </div>

        {/* ARTIST PRO */}
        <div
          style={{
            border: "2px solid #111",
            borderRadius: 14,
            padding: 24,
            background: "#fff",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -13,
              right: 18,
              background: "#c9a84c",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".08em",
              padding: "4px 13px",
              borderRadius: 999,
            }}
          >
            MOST POPULAR
          </div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 900,
              color: "#111",
              marginBottom: 3,
            }}
          >
            Artist Pro 🔥
          </div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>
            Unlimited access to all artist tools
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 7,
              marginBottom: 16,
              flexWrap: "wrap" as const,
            }}
          >
            <span style={{ fontSize: 19, fontWeight: 900, color: "#ff5500" }}>
              EGP 74.99
            </span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              / month, billed yearly for EGP 899.88
            </span>
          </div>
          <button
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
              marginBottom: 18,
            }}
          >
            Get started
          </button>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 13,
            }}
          >
            {[
              { icon: <IconUpload />, label: "Unlimited uploads" },
              {
                icon: <IconBoost />,
                label: "Boost tracks and get 100+ listeners",
                badge: "UNLIMITED",
              },
              {
                icon: <IconMoney />,
                label: "Distribute & monetize tracks",
                badge: "UNLIMITED",
              },
              {
                icon: <IconReplace />,
                label: "Replace tracks without losing stats",
                badge: "UNLIMITED",
              },
              { icon: <IconAI />, label: "AI Mastering", badge: "3X MONTH" },
            ].map((f, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  fontSize: 13,
                  color: "#111",
                }}
              >
                <span style={{ color: "#9ca3af", flexShrink: 0 }}>
                  {f.icon}
                </span>
                <span style={{ flex: 1 }}>{f.label}</span>
                {"badge" in f && <span style={badgeGold}>{f.badge}</span>}
              </li>
            ))}
          </ul>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".1em",
              color: "#9ca3af",
              textTransform: "uppercase",
              margin: "16px 0 12px",
            }}
          >
            <span style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            AND MORE
            <span style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <li
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                fontSize: 13,
                color: "#111",
              }}
            >
              <span style={{ color: "#9ca3af" }}>
                <IconStats />
              </span>
              Audience stats and insights
            </li>
            <li
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                fontSize: 13,
                color: "#111",
              }}
            >
              <span style={{ color: "#9ca3af" }}>
                <IconChat />
              </span>
              Community management tools
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── Compare Table ─────────────────────────────────────────────────────────────
function CompareTable() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (k: string) =>
    setExpanded((p) => {
      const n = new Set(p);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });

  return (
    <section style={{ padding: "0 64px 64px", background: "#fff" }}>
      <h2
        style={{
          fontSize: 34,
          fontWeight: 900,
          textAlign: "center",
          color: "#111",
          paddingTop: 48,
          margin: "0 0 32px",
          letterSpacing: -0.5,
        }}
      >
        Compare features.
      </h2>

      {/* Sticky top header */}
      <div
        style={{ position: "sticky", top: 0, zIndex: 20, background: "#fff" }}
      >
        <PlanHeaderRow />
      </div>

      {sections.map((sec) => (
        <div key={sec.title}>
          <PlanHeaderRow />

          {/* Section label */}
          <div style={{ padding: "14px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>
              {sec.title}
            </span>
          </div>

          {/* Rows */}
          {sec.rows.map((row) => {
            const key = `${sec.title}::${row.name}`;
            const hasDesc = "desc" in row;
            const open = expanded.has(key);
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  borderBottom: "1px solid #f3f4f6",
                  padding: "16px 0",
                }}
              >
                {/* Name */}
                <div style={{ flex: 1, paddingRight: 24 }}>
                  <button
                    onClick={() => hasDesc && toggle(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#111",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: hasDesc ? "pointer" : "default",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    {row.name}
                    {hasDesc && <IconChevron open={open} />}
                  </button>
                  {open && hasDesc && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        marginTop: 5,
                        lineHeight: 1.55,
                      }}
                    >
                      {(row as any).desc}
                    </p>
                  )}
                </div>
                {/* Free */}
                <div
                  style={{
                    width: COL,
                    flexShrink: 0,
                    borderLeft: "1px solid #f3f4f6",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "0 16px",
                  }}
                >
                  <Cell v={row.free} />
                </div>
                {/* Pro */}
                <div
                  style={{
                    width: COL,
                    flexShrink: 0,
                    borderLeft: "1px solid #f3f4f6",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "0 16px",
                  }}
                >
                  <Cell v={row.pro} />
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Footer */}
      <footer
        style={{
          marginTop: 48,
          paddingTop: 20,
          borderTop: "1px solid #e5e7eb",
          fontSize: 12,
          color: "#9ca3af",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <p style={{ margin: 0 }}>
          Signed in as Roweda Ahmed.{" "}
          <a href="#" style={{ color: "#ff5500", textDecoration: "none" }}>
            Sign out
          </a>
        </p>
        <nav style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {[
            "Legal",
            "Privacy",
            "Cookies",
            "Consent Manager",
            "Imprint",
            "Help Center",
          ].map((l) => (
            <a
              key={l}
              href="#"
              style={{ color: "#9ca3af", textDecoration: "none" }}
            >
              {l}
            </a>
          ))}
        </nav>
        <select
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 4,
            padding: "3px 7px",
            fontSize: 11,
            color: "#9ca3af",
            background: "transparent",
            cursor: "pointer",
            width: "fit-content",
          }}
        >
          <option>English (US)</option>
        </select>
      </footer>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function PlanPage() {
  return (
    <main
      style={{
        background: "#fff",
        minHeight: "100vh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <HeroSection />
      <PricingCards />
      <CompareTable />
    </main>
  );
}
