// ── Sub-components ────────────────────────────────────────────

import { Link } from "react-router-dom";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="text-[var(--color-text-hover)] font-semibold mb-4">
      {children}
    </h5>
  );
}

<<<<<<< HEAD
// ── Sections ──────────────────────────────────────────────────

function CurrentPlans() {
=======
// ── Types ─────────────────────────────────────────────────────

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "completed" | "refunded" | "failed";
};

type Subscription = {
  planName: string;
  renewsOn: string;
  price: string;
  paymentMethod: string;
};

// ── Sections ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: Transaction["status"] }) {
  if (status === "completed")
    return (
      <span className="text-xs font-semibold text-[var(--color-success)]">
        Completed
      </span>
    );
  if (status === "refunded")
    return (
      <span className="text-xs font-semibold text-[var(--color-text-muted)]">
        Refunded
      </span>
    );
  return (
    <span className="text-xs font-semibold text-[var(--color-error)]">
      Failed
    </span>
  );
}

function CurrentPlans({
  subscription,
  onCancel,
}: {
  subscription: Subscription | null;
  onCancel: () => void;
}) {
  // ── Premium state ──
  if (subscription) {
    return (
      <div>
        <SectionTitle>Current plans</SectionTitle>

        <div className="rounded-[var(--radius-md)] bg-[var(--color-input-bg)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-[var(--color-text-hover)] font-bold">
                Premium
              </h4>
              <p className="text-sm text-white mt-1">
                Renews on {subscription.renewsOn} · EGP 29.99 / month
              </p>
            </div>
            <button
              onClick={onCancel}
              className="flex-shrink-0 cursor-pointer px-4 py-2 text-sm font-semibold text-[var(--color-error)] border border-[var(--color-border)] rounded-[var(--radius-sm)] hover:brightness-110 transition-all duration-150 whitespace-nowrap"
            >
              Cancel plan
            </button>
          </div>

          <div className="border-t border-[var(--color-border)] mt-4 pt-3 flex flex-col gap-1">
            <p className="text-xs text-white">
              Payment method · {subscription.paymentMethod}
            </p>
            <a className="cursor-pointer text-xs text-[var(--color-text)] hover:text-[var(--color-text-hover)] transition-colors self-start">
              Change your credit card or payment details
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Basic state ──
>>>>>>> 258a33b0cca2d1736077df35c0c1d4a2ccf52bd3
  return (
    <div>
      <SectionTitle>Current plans</SectionTitle>

      {/* Basic plan card */}
      <div className="rounded-[var(--radius-md)] bg-[var(--color-input-bg)] p-5 mb-3">
        <h4 className="text-[var(--color-text-hover)] font-bold mb-4">Basic</h4>
        <div className="flex items-center justify-between gap-4">
<<<<<<< HEAD
          <p className="text-sm text-[var(--color-text)]">
=======
          <p className="text-sm text-white">
>>>>>>> 258a33b0cca2d1736077df35c0c1d4a2ccf52bd3
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
<<<<<<< HEAD
        <p className="text-sm text-[var(--color-text)]">
          Are you a student?{" "}
          <a className="cursor-pointer text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)] transition-colors font-semibold">
            Get Rythmify Go+ for 50% off
=======
        <p className="text-sm text-white">
          Are you a student?{" "}
          <a className="cursor-pointer text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)] transition-colors font-semibold">
            Get Premium for 50% off
>>>>>>> 258a33b0cca2d1736077df35c0c1d4a2ccf52bd3
          </a>
        </p>
      </div>
    </div>
  );
}

<<<<<<< HEAD
function PurchaseHistory() {
  return (
    <div>
      <SectionTitle>Purchase history</SectionTitle>
      {/* Empty — no purchase history to show */}
=======
function PurchaseHistory({ transactions }: { transactions: Transaction[] }) {
  return (
    <div>
      <SectionTitle>Purchase history</SectionTitle>

      {transactions.length > 0 && (
        <div className="flex flex-col">
          {/* Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_96px_120px_92px] gap-x-6 px-3 pb-2 border-b border-[var(--color-border)]">
            <span className="justify-self-start text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Description
            </span>
            <span className="justify-self-end text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] text-right">
              Date
            </span>
            <span className="justify-self-end text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] text-right">
              Amount
            </span>
            <span className="justify-self-end text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] text-right">
              Status
            </span>
          </div>

          {/* Rows */}
          {transactions.map((txn) => (
            <div
              key={txn.id}
              className="grid grid-cols-[minmax(0,1fr)_96px_120px_92px] gap-x-6 px-3 py-3 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-input-bg)] transition-colors rounded-[var(--radius-sm)]"
            >
              <span className="justify-self-start text-sm text-white">
                {txn.description}
              </span>
              <span className="justify-self-end text-sm text-white text-right whitespace-nowrap">
                {txn.date}
              </span>
              <span className="justify-self-end text-sm font-semibold text-[var(--color-text-hover)] text-right">
                {txn.amount}
              </span>
              <div className="flex justify-end">
                <StatusBadge status={txn.status} />
              </div>
            </div>
          ))}
        </div>
      )}
>>>>>>> 258a33b0cca2d1736077df35c0c1d4a2ccf52bd3
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
<<<<<<< HEAD
            className="cursor-pointer text-sm leading-snug break-words text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)] transition-colors"
=======
            className="cursor-pointer text-sm leading-snug break-words text-[var(--color-text)] hover:text-[var(--color-text-hover)] transition-colors"
>>>>>>> 258a33b0cca2d1736077df35c0c1d4a2ccf52bd3
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

<<<<<<< HEAD
      <p className="text-xs text-[var(--color-text)]">
=======
      <p className="text-xs text-white">
>>>>>>> 258a33b0cca2d1736077df35c0c1d4a2ccf52bd3
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
<<<<<<< HEAD
=======
  const subscription: Subscription | null = null;

  const transactions: Transaction[] = [];

  //for testing how the ui looks

  //   const subscription: Subscription | null = {
  //     planName: "Premium",
  //     renewsOn: "May 25, 2026",
  //     price: "$29.99",
  //     paymentMethod: "Visa ending in 4242",
  //   };

  //   const transactions: Transaction[] = [
  //     {
  //       id: "1",
  //       date: "Apr 25, 2026",
  //       description: "Premium · Monthly",
  //       amount: "EGP 29.99",
  //       status: "completed",
  //     },
  //     {
  //       id: "2",
  //       date: "Mar 25, 2026",
  //       description: "Premium · Monthly",
  //       amount: "EGP 29.99",
  //       status: "completed",
  //     },
  //     {
  //       id: "3",
  //       date: "Feb 25, 2026",
  //       description: "Premium · Monthly",
  //       amount: "EGP 29.99",
  //       status: "refunded",
  //     },
  //   ];

  const handleCancel = () => {
    // call your cancellation API here
  };

>>>>>>> 258a33b0cca2d1736077df35c0c1d4a2ccf52bd3
  return (
    <div className="bg-[var(--color-bg)]">
      <div className="container flex w-full gap-16 px-4 py-10 md:px-8 lg:px-20">
        {/* Main column */}
        <main className="flex min-w-0 flex-1 flex-col gap-10">
          <h1 className="text-[var(--color-text-hover)]">Subscriptions</h1>
<<<<<<< HEAD
          <CurrentPlans />
          <PurchaseHistory />
=======
          <CurrentPlans subscription={subscription} onCancel={handleCancel} />
          <PurchaseHistory transactions={transactions} />
>>>>>>> 258a33b0cca2d1736077df35c0c1d4a2ccf52bd3
        </main>

        {/* Sidebar */}
        <HelpfulLinks />
      </div>
    </div>
  );
}
