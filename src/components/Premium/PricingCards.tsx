import React from "react";

const UploadIcon = () => (
  <svg
    width="18"
    height="18"
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
    width="18"
    height="18"
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
    width="18"
    height="18"
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
    width="18"
    height="18"
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
    width="18"
    height="18"
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

const plan = {
  name: "Artist Pro",
  subtitle: "Tailored access to essential artist tools",
  price: "EGP 74.99",
  priceNote: "/ month, billed yearly for EGP 899.88",
  cta: "Get started",
  features: [
    { icon: <UploadIcon />, label: "Unlimited uploads" },
    {
      icon: <BoostIcon />,
      label: "Boost tracks and get 100+ listeners",
      badge: "UNLIMITED",
      badgeStyle: "gold" as const,
    },
    {
      icon: <MoneyIcon />,
      label: "Distribute & monetize tracks",
      badge: "UNLIMITED",
      badgeStyle: "gold" as const,
    },
    {
      icon: <ReplaceIcon />,
      label: "Replace tracks without losing stats",
      badge: "UNLIMITED",
      badgeStyle: "gold" as const,
    },
    { icon: <AIIcon />, label: "AI Mastering", badge: "3X MONTH", badgeStyle: "gold" as const },
  ],
};

function PlanCard() {
  return (
    <div className="w-full max-w-3xl rounded-[28px] border-2 border-black bg-white p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
      <div className="space-y-6">
        <div>
          <h2 className="m-0 text-[2.15rem] font-black leading-[1.05] tracking-tight text-black md:text-[2.45rem]">
            {plan.name}
          </h2>
          <p className="mt-3 text-base leading-6 text-slate-500 md:text-[1.05rem]">
            {plan.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-[1.6rem] font-black text-[#ff5500] md:text-[1.75rem]">
            {plan.price}
          </span>
          <span className="text-sm text-slate-500 md:text-[0.95rem]">
            {plan.priceNote}
          </span>
        </div>

        <button className="w-full rounded-full bg-black px-6 py-4 text-[0.98rem] font-bold text-white transition-opacity hover:opacity-90">
          {plan.cta}
        </button>

        <ul className="space-y-5">
          {plan.features.map((feature) => (
            <li key={feature.label} className="flex items-center gap-4 text-base font-bold text-black">
              <span className="flex-shrink-0 text-black">{feature.icon}</span>
              <span className="flex-1">{feature.label}</span>
              <span
                className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[0.625rem] font-bold tracking-[0.05em] ${
                  feature.badgeStyle === "gold"
                    ? "bg-[rgba(201,168,76,0.18)] text-[#c9a84c]"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {feature.badge}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function PricingCards() {
  return (
    <section className="bg-white px-6 py-32 md:px-10 lg:px-24">
      <h2 className="mb-16 text-center text-5xl font-black tracking-tight text-black md:text-[3.35rem]">
        Available plan.
      </h2>
      <div className="mx-auto flex max-w-4xl justify-center">
        <PlanCard />
      </div>
    </section>
  );
}
