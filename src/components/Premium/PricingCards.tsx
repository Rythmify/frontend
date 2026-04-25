import React from "react";

// ─── Icons ─────────────────────────────────────────────────────────────────────
const UploadIcon = () => (
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
const BoostIcon = () => (
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
const MoneyIcon = () => (
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
const ReplaceIcon = () => (
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
const AIIcon = () => (
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
const StatsIcon = () => (
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
const CommunityIcon = () => (
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

interface Feature {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  badgeStyle?: "gold" | "muted";
}

interface Plan {
  name: string;
  emoji?: string;
  subtitle: string;
  price: string;
  priceNote: string;
  cta: string;
  ctaDisabled?: boolean;
  popular?: boolean;
  features: Feature[];
  andMore?: { icon: React.ReactNode; label: string }[];
}

const plans: Plan[] = [
  {
    name: "Free",
    subtitle: "Start sharing your music for free",
    price: "EGP 0",
    priceNote: "forever free",
    cta: "Current plan",
    ctaDisabled: true,
    features: [
      { icon: <UploadIcon />, label: "2 hours of uploads" },
      {
        icon: <BoostIcon />,
        label: "Boost tracks and get 100+ listeners",
        badge: "2X MONTH",
        badgeStyle: "muted",
      },
      {
        icon: <MoneyIcon />,
        label: "Distribute & monetize tracks",
        badge: "2X MONTH",
        badgeStyle: "muted",
      },
      {
        icon: <ReplaceIcon />,
        label: "Replace tracks without losing stats",
        badge: "3X MONTH",
        badgeStyle: "muted",
      },
      {
        icon: <AIIcon />,
        label: "AI Mastering",
        badge: "1X MONTH",
        badgeStyle: "muted",
      },
    ],
  },
  {
    name: "Artist Pro",
    emoji: "🔥",
    subtitle: "Unlimited access to all artist tools",
    price: "EGP 74.99",
    priceNote: "/ month, billed yearly for EGP 899.88",
    cta: "Get started",
    popular: true,
    features: [
      { icon: <UploadIcon />, label: "Unlimited uploads" },
      {
        icon: <BoostIcon />,
        label: "Boost tracks and get 100+ listeners",
        badge: "UNLIMITED",
        badgeStyle: "gold",
      },
      {
        icon: <MoneyIcon />,
        label: "Distribute & monetize tracks",
        badge: "UNLIMITED",
        badgeStyle: "gold",
      },
      {
        icon: <ReplaceIcon />,
        label: "Replace tracks without losing stats",
        badge: "UNLIMITED",
        badgeStyle: "gold",
      },
      {
        icon: <AIIcon />,
        label: "AI Mastering",
        badge: "3X MONTH",
        badgeStyle: "gold",
      },
    ],
    andMore: [
      { icon: <StatsIcon />, label: "Audience stats and insights" },
      { icon: <CommunityIcon />, label: "Community management tools" },
    ],
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      style={{ position: "relative", display: "flex", flexDirection: "column" }}
    >
      {/* MOST POPULAR badge */}
      {plan.popular && (
        <div
          style={{
            position: "absolute",
            top: -14,
            right: 20,
            zIndex: 10,
            backgroundColor: "#c9a84c",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "5px 14px",
            borderRadius: 999,
          }}
        >
          MOST POPULAR
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          borderRadius: 14,
          padding: 24,
          backgroundColor: "#fff",
          height: "100%",
          border: plan.popular ? "2px solid #111" : "1px solid #e5e7eb",
        }}
      >
        {/* Header */}
        <div>
          <h2
            style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: 0 }}
          >
            {plan.name} {plan.emoji}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "#9ca3af",
              marginTop: 4,
              marginBottom: 0,
            }}
          >
            {plan.subtitle}
          </p>
        </div>

        {/* Price */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 800, color: "#ff5500" }}>
            {plan.price}
          </span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            {plan.priceNote}
          </span>
        </div>

        {/* CTA button */}
        <button
          disabled={plan.ctaDisabled}
          style={{
            width: "100%",
            padding: "13px 0",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            cursor: plan.ctaDisabled ? "default" : "pointer",
            backgroundColor: plan.ctaDisabled ? "#e5e7eb" : "#111",
            color: plan.ctaDisabled ? "#6b7280" : "#fff",
          }}
        >
          {plan.cta}
        </button>

        {/* Feature list */}
        <ul
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {plan.features.map((f, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 14,
                color: "#111",
              }}
            >
              <span style={{ color: "#9ca3af", flexShrink: 0 }}>{f.icon}</span>
              <span style={{ flex: 1 }}>{f.label}</span>
              {f.badge && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    padding: "3px 8px",
                    borderRadius: 999,
                    flexShrink: 0,
                    backgroundColor:
                      f.badgeStyle === "gold"
                        ? "rgba(201,168,76,0.15)"
                        : "#f3f4f6",
                    color: f.badgeStyle === "gold" ? "#c9a84c" : "#6b7280",
                  }}
                >
                  {f.badge}
                </span>
              )}
            </li>
          ))}
        </ul>

        {/* And more section */}
        {plan.andMore && plan.andMore.length > 0 && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "#9ca3af",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
              <span>AND MORE</span>
              <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
            </div>
            <ul
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {plan.andMore.map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                    color: "#111",
                  }}
                >
                  <span style={{ color: "#9ca3af", flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PricingCards() {
  return (
    <section style={{ padding: "64px 80px", backgroundColor: "#fff" }}>
      <h2
        style={{
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          textAlign: "center",
          color: "#111",
          marginBottom: 40,
        }}
      >
        Available plans.
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          maxWidth: 820,
          margin: "0 auto",
        }}
      >
        {plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>
    </section>
  );
}
