import React from "react";

// ── Section Title ─────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="text-[var(--color-text-hover)] font-semibold mb-4">
      {children}
    </h5>
  );
}

// ── Security Icon (LOCK + WARNING) ────────────────────────────

function SecurityIcon() {
  return (
    <div className="relative w-16 h-16">
      {/* Background */}
      <div className="w-full h-full rounded-xl bg-[var(--color-input-bg)] flex items-center justify-center">
        {/* Lock */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className="text-white"
        >
          <path
            d="M7 10V7a5 5 0 0110 0v3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect
            x="5"
            y="10"
            width="14"
            height="10"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="15" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* Warning triangle */}
      <div className="absolute -bottom-1 -right-1">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M12 3L2 21h20L12 3z" fill="#ef4444" />
          <rect x="11" y="9" width="2" height="5" fill="white" />
          <rect x="11" y="16" width="2" height="2" fill="white" />
        </svg>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function TwoFactorPage() {
  return (
    <div className="max-w-3xl flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <SectionTitle>Status</SectionTitle>

        <div className="flex items-center gap-6">
          <SecurityIcon />

          <div className="flex flex-col gap-2">
            <p className="text-[var(--color-text-hover)] font-semibold">
              Protect your account
            </p>

            <p className="text-sm text-[var(--color-text)] max-w-2xl leading-relaxed">
              Protect your privacy and secure your SoundCloud account with
              Two-Factor Authentication (2FA). When enabled, you'll need a
              6-digit code from an authenticator app each time you log in,
              adding an extra layer of security.
              <span className="text-blue-400 cursor-pointer ml-1">
                Learn more
              </span>
            </p>
          </div>
        </div>

        <button className="w-fit mt-4 px-6 py-3 text-sm font-semibold rounded-full bg-[var(--color-text-hover)] text-black hover:brightness-90 transition">
          Enable Two-Factor Auth (2FA)
        </button>
      </div>
    </div>
  );
}
