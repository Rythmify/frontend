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
    <div className="relative w-22 h-22">
      <svg
        viewBox="0 0 88 96"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M44 50.4167C42.4812 50.4167 41.25 51.6479 41.25 53.1667C41.25 54.6854 42.4812 55.9167 44 55.9167C45.5188 55.9167 46.75 54.6854 46.75 53.1667C46.75 51.6479 45.5188 50.4167 44 50.4167Z"
          fill="var(--color-text-hover)"
        ></path>
        <path
          d="M44 8.25C34.381 8.25 26.5833 16.0477 26.5833 25.6667V33.9167H18.3333C16.8145 33.9167 15.5833 35.1479 15.5833 36.6667V73.3333C15.5833 74.8521 16.8145 76.0833 18.3333 76.0833H69.6667C71.1854 76.0833 72.4167 74.8521 72.4167 73.3333V36.6667C72.4167 35.1479 71.1854 33.9167 69.6667 33.9167H61.4167V25.6667C61.4167 16.0477 53.619 8.25 44 8.25ZM55.9167 25.6667V33.9167H32.0833V25.6667C32.0833 19.0853 37.4186 13.75 44 13.75C50.5814 13.75 55.9167 19.0853 55.9167 25.6667ZM52.25 53.1667C52.25 56.7595 49.9533 59.816 46.748 60.9479V65.0833H41.248V60.9465C38.0448 59.8134 35.75 56.758 35.75 53.1667C35.75 48.6103 39.4437 44.9167 44 44.9167C48.5563 44.9167 52.25 48.6103 52.25 53.1667Z"
          fill="var(--color-text-hover)"
        ></path>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M72.0207 70.5C71.1226 68.9444 68.8774 68.9444 67.9793 70.5L57.587 88.5C56.6889 90.0556 57.8115 92 59.6077 92H80.3923C82.1885 92 83.3111 90.0556 82.413 88.5L72.0207 70.5ZM71 76.3333V83.3333H69V76.3333H71ZM71.5 86.8333C71.5 87.6618 70.8284 88.3333 70 88.3333C69.1716 88.3333 68.5 87.6618 68.5 86.8333C68.5 86.0049 69.1716 85.3333 70 85.3333C70.8284 85.3333 71.5 86.0049 71.5 86.8333Z"
          fill="#CF0000"
        ></path>
      </svg>
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

        <button className="w-fit mt-4 px-3 py-3 text-sm font-semibold rounded-full bg-[var(--color-text-hover)] text-black hover:brightness-90 transition">
          Enable Two-Factor Auth (2FA)
        </button>
      </div>
    </div>
  );
}
