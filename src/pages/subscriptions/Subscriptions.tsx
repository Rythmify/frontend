// ── Sub-components ────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getMySubscription,
  getMyTransactions,
  cancelSubscription,
} from "@/services/api/upload/subscription.service";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="text-[var(--color-text-hover)] font-semibold mb-4">
      {children}
    </h5>
  );
}

// ── Types ─────────────────────────────────────────────────────

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "completed" | "refunded" | "failed" | "pending";
};

type Subscription = {
  planName: string;
  renewsOn: string;
  price: string;
  paymentMethod: string;
  autoRenew: boolean;
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
  if (status === "pending")
    return (
      <span className="text-xs font-semibold text-[var(--color-text-muted)]">
        Pending
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
  canceling,
}: {
  subscription: Subscription | null;
  onCancel: () => void;
  canceling: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

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
                {subscription.autoRenew
                  ? `Renews on ${subscription.renewsOn}`
                  : `Active until ${subscription.renewsOn} · auto-renew off`}{" "}
                · {subscription.price} / month
              </p>
            </div>
            {subscription.autoRenew && !confirmOpen && (
              <button
                onClick={() => setConfirmOpen(true)}
                className="flex-shrink-0 cursor-pointer px-4 py-2 text-sm font-semibold text-[var(--color-error)] border border-[var(--color-border)] rounded-[var(--radius-sm)] hover:brightness-110 transition-all duration-150 whitespace-nowrap"
              >
                Cancel plan
              </button>
            )}
          </div>

          {confirmOpen && (
            <div className="mt-4 flex items-center justify-between gap-4 rounded-[var(--radius-sm)] bg-[#F97316]/10 border border-[#F97316]/30 px-4 py-3">
              <span className="text-sm font-semibold text-[#F97316]">
                You'll keep Premium until {subscription.renewsOn}. Cancel
                auto-renew?
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setConfirmOpen(false)}
                  disabled={canceling}
                  className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-[#F97316] border border-[#F97316]/40 rounded-[var(--radius-sm)] hover:bg-[#F97316]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keep Premium
                </button>
                <button
                  onClick={async () => {
                    await onCancel();
                    setConfirmOpen(false);
                  }}
                  disabled={canceling}
                  className="cursor-pointer px-3 py-1.5 text-xs font-semibold bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/40 rounded-[var(--radius-sm)] hover:bg-[#F97316]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {canceling ? "Canceling…" : "Yes, cancel"}
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-[var(--color-border)] mt-4 pt-3 flex flex-col gap-1">
            <p className="text-xs text-white">
              Payment method · {subscription.paymentMethod}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Basic state ──
  return (
    <div>
      <SectionTitle>Current plans</SectionTitle>

      {/* Basic plan card */}
      <div className="rounded-[var(--radius-md)] bg-[var(--color-input-bg)] p-5 mb-3">
        <h4 className="text-[var(--color-text-hover)] font-bold mb-4">Basic</h4>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-white">
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
    </div>
  );
}

function PurchaseHistory({ transactions }: { transactions: Transaction[] }) {
  return (
    <div>
      <SectionTitle>Purchase history</SectionTitle>

      {transactions.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)]">
          No purchase history yet.
        </p>
      )}

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
    </div>
  );
}

function HelpfulLinks() {
  const links = [
    {
      label: "Change your credit card or payment details",
      href: "https://help.soundcloud.com/hc/en-us/articles/360051642434-Subscription-Management",
    },
    {
      label: "Troubleshoot payment failures",
      href: "https://help.soundcloud.com/hc/en-us/articles/39687296248091-Troubleshoot-payment-failures",
    },
    {
      label: "General payments and billing help",
      href: "https://help.soundcloud.com/hc/en-us/articles/360051072534-What-type-of-subscription-is-for-me",
    },
    {
      label: "Understand sales tax and VAT",
      href: "https://help.soundcloud.com/hc/en-us/articles/360051835373-Sales-Tax-VAT",
    },
  ];

  const footerLinks = [
    { label: "Legal", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Cookie Manager", href: "#" },
    { label: "Imprint", href: "#" },
    { label: "Artist Resources", href: "#" },
    { label: "Newsroom", href: "#" },
    { label: "Charts", href: "#" },
    { label: "Transparency Reports", href: "#" },
  ];

  return (
    <aside className="w-[220px] flex-shrink-0 pt-1 lg:w-[240px]">
      <h5 className="text-[var(--color-text-hover)] font-semibold mb-4">
        Helpful links
      </h5>

      <div className="flex flex-col gap-3 mb-6">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer text-sm leading-snug break-words text-[var(--color-text)] hover:text-[var(--color-text-hover)] transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-x-1 gap-y-1 text-xs leading-relaxed text-[var(--color-text)]">
        {footerLinks.map((item, i) => (
          <span key={item.label} className="inline-flex items-center">
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer text-[var(--color-text)] hover:text-[var(--color-text-hover)] transition-colors"
            >
              {item.label}
            </a>
            {i < footerLinks.length - 1 && (
              <span className="mx-1 text-[var(--color-text-muted)]">·</span>
            )}
          </span>
        ))}
      </div>

      <p className="text-xs text-white">
        Language:{" "}
        <a className="cursor-pointer text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)] transition-colors">
          English (US)
        </a>
      </p>
    </aside>
  );
}

// ── Subscriptions Page ────────────────────────────────────────

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

export default function SubscriptionsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    getMySubscription()
      .then(({ data }) => {
        if (
          data.user_subscription_id !== null &&
          data.plan.name === "premium"
        ) {
          setSubscription({
            planName: "Premium",
            renewsOn: formatDate(data.end_date),
            price: `EGP ${data.plan.price}`,
            paymentMethod: "Card",
            autoRenew: data.auto_renew,
          });
        }
      })
      .catch(() => {});

    getMyTransactions()
      .then((items) => {
        setTransactions(
          items.map((t) => ({
            id: t.transaction_id,
            date: formatDate(t.paid_at ?? t.created_at),
            description: "Premium subscription",
            amount: `EGP ${t.amount}`,
            status:
              t.payment_status === "paid"
                ? "completed"
                : t.payment_status === "failed"
                  ? "failed"
                  : "pending",
          })),
        );
      })
      .catch(() => {});
  }, []);

  const handleCancel = async () => {
    setCanceling(true);
    try {
      await cancelSubscription();
      setSubscription((prev) => (prev ? { ...prev, autoRenew: false } : prev));
    } catch {
      // silently ignore — user can retry
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg)]">
      <div className="container flex w-full gap-16 px-4 py-10 md:px-8 lg:px-20">
        {/* Main column */}
        <main className="flex min-w-0 flex-1 flex-col gap-10">
          <h1 className="text-[var(--color-text-hover)]">Subscriptions</h1>
          <CurrentPlans
            subscription={subscription}
            onCancel={handleCancel}
            canceling={canceling}
          />
          <PurchaseHistory transactions={transactions} />
        </main>

        {/* Sidebar */}
        <HelpfulLinks />
      </div>
    </div>
  );
}
