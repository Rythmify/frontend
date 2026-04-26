// ── Sub-components ────────────────────────────────────────────

import { Link } from "react-router-dom";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="text-[var(--color-text-hover)] font-semibold mb-4">
      {children}
    </h5>
  );
}

// ── Sections ──────────────────────────────────────────────────

function CurrentPlans() {
  return (
    <div>
      <SectionTitle>Current plans</SectionTitle>

      {/* Basic plan card */}
      <div className="rounded-[var(--radius-md)] bg-[var(--color-input-bg)] p-5 mb-3">
        <h4 className="text-[var(--color-text-hover)] font-bold mb-4">Basic</h4>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-text)]">
            Premium plans include unlimited upload space and advanced features.
          </p>
          <Link
            to="/premium"
            className="flex-shrink-0 cursor-pointer px-4 py-2 text-sm font-semibold text-[var(--color-text-hover)] border border-[var(--color-text-hover)] rounded-[var(--radius-sm)] hover:bg-white/5 transition-colors whitespace-nowrap"
          >
            Try Premium
          </Link>
        </div>
      </div>

      {/* Student banner */}
      <div className="rounded-[var(--radius-md)] bg-[var(--color-input-bg)] px-5 py-4 flex items-center justify-center gap-2">
        <p className="text-sm text-[var(--color-text)]">
          Are you a student?{" "}
          <a className="cursor-pointer text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)] transition-colors font-semibold">
            Get Rythmify Go+ for 50% off
          </a>
        </p>
      </div>
    </div>
  );
}

function PurchaseHistory() {
  return (
    <div>
      <SectionTitle>Purchase history</SectionTitle>
      {/* Empty — no purchase history to show */}
    </div>
  );
}

function HelpfulLinks() {
  const links = [
    "Change your credit card or payment details",
    "Troubleshoot payment failures",
    "General payments and billing help",
    "Understand sales tax and VAT",
  ];

  const footerLinks = [
    "Legal",
    "Privacy",
    "Cookie Policy",
    "Cookie Manager",
    "Imprint",
    "Artist Resources",
    "Newsroom",
    "Charts",
    "Transparency Reports",
  ];

  return (
    <aside className="w-[220px] flex-shrink-0 pt-1 lg:w-[240px]">
      <h5 className="text-[var(--color-text-hover)] font-semibold mb-4">
        Helpful links
      </h5>

      <div className="flex flex-col gap-3 mb-6">
        {links.map((link) => (
          <a
            key={link}
            className="cursor-pointer text-sm leading-snug break-words text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)] transition-colors"
          >
            {link}
          </a>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-x-1 gap-y-1 text-xs leading-relaxed text-[var(--color-text)]">
        {footerLinks.map((item, i) => (
          <span key={item} className="inline-flex items-center">
            <a className="cursor-pointer text-[var(--color-text)] hover:text-[var(--color-text-hover)] transition-colors">
              {item}
            </a>
            {i < footerLinks.length - 1 && (
              <span className="mx-1 text-[var(--color-text-muted)]">·</span>
            )}
          </span>
        ))}
      </div>

      <p className="text-xs text-[var(--color-text)]">
        Language:{" "}
        <a className="cursor-pointer text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)] transition-colors">
          English (US)
        </a>
      </p>
    </aside>
  );
}

// ── Subscriptions Page ────────────────────────────────────────

export default function SubscriptionsPage() {
  return (
    <div className="bg-[var(--color-bg)]">
      <div className="container flex w-full gap-16 px-4 py-10 md:px-8 lg:px-20">
        {/* Main column */}
        <main className="flex min-w-0 flex-1 flex-col gap-10">
          <h1 className="text-[var(--color-text-hover)]">Subscriptions</h1>
          <CurrentPlans />
          <PurchaseHistory />
        </main>

        {/* Sidebar */}
        <HelpfulLinks />
      </div>
    </div>
  );
}
