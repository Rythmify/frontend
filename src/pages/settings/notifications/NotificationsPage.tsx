import { useState } from "react";

// ── Shared Checkbox ───────────────────────────────────────────

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div
      onClick={onChange}
      className={`w-5 h-5 border rounded-[var(--radius-xs)] flex items-center justify-center cursor-pointer transition-colors duration-150 ${
        checked
          ? "bg-[var(--color-text-hover)] border-[var(--color-text-hover)]"
          : "bg-transparent border-[var(--color-border)]"
      }`}
    >
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 6l3 3 5-5"
            stroke="var(--color-bg)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

// ── Info Icon ─────────────────────────────────────────────────

function InfoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="var(--color-text)"
        strokeWidth="1.5"
      />
      <path
        d="M12 11v5M12 8h.01"
        stroke="var(--color-text)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Section ───────────────────────────────────────────────────

type NotifRow = {
  label: string;
  info?: boolean;
  emailDefault: boolean;
  deviceDefault: boolean | "dropdown" | null;
};

function NotifSection({ title, rows }: { title: string; rows: NotifRow[] }) {
  const [emailStates, setEmailStates] = useState(
    rows.map((r) => r.emailDefault),
  );
  const [deviceStates, setDeviceStates] = useState(
    rows.map((r) =>
      r.deviceDefault !== "dropdown" && r.deviceDefault !== null
        ? r.deviceDefault
        : true,
    ),
  );

  const allEmail = emailStates.every(Boolean);
  const allDevice = deviceStates.every(Boolean);

  const toggleAllEmail = () => setEmailStates(emailStates.map(() => !allEmail));
  const toggleAllDevice = () =>
    setDeviceStates(deviceStates.map(() => !allDevice));

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center mb-4">
        <span className="flex-1 text-base font-bold text-[var(--color-text-hover)]">
          {title}
        </span>
        <div className="w-24 flex items-center">
          <Checkbox checked={allEmail} onChange={toggleAllEmail} />
          <span className="ml-2 text-sm font-semibold text-[var(--color-text-hover)]">
            Email
          </span>
        </div>
        <div className="w-28 flex items-center">
          <Checkbox checked={allDevice} onChange={toggleAllDevice} />
          <span className="ml-2 text-sm font-semibold text-[var(--color-text-hover)]">
            Devices
          </span>
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-5">
        {rows.map((row, i) => (
          <div key={row.label} className="flex items-center">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--color-text-hover)]">
                {row.label}
              </span>
              {row.info && <InfoIcon />}
            </div>
            <div className="w-24 flex items-center">
              <Checkbox
                checked={emailStates[i]}
                onChange={() => {
                  const next = [...emailStates];
                  next[i] = !next[i];
                  setEmailStates(next);
                }}
              />
            </div>
            <div className="w-28 flex items-center">
              {row.deviceDefault === "dropdown" ? (
                <div className="relative">
                  <select className="text-xs text-[var(--color-text-hover)] bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] pl-2 pr-5 py-1 appearance-none cursor-pointer">
                    <option>Everyone</option>
                    <option>Followed</option>
                    <option>Off</option>
                  </select>
                  <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--color-text)]">
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 4l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              ) : row.deviceDefault === null ? null : (
                <Checkbox
                  checked={deviceStates[i]}
                  onChange={() => {
                    const next = [...deviceStates];
                    next[i] = !next[i];
                    setDeviceStates(next);
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

const ACTIVITIES: NotifRow[] = [
  { label: "New follower", emailDefault: true, deviceDefault: true },
  { label: "Repost of your post", emailDefault: true, deviceDefault: true },
  {
    label: "New post by followed user",
    emailDefault: true,
    deviceDefault: true,
  },
  {
    label: "Likes and plays on your post",
    emailDefault: true,
    deviceDefault: true,
  },
  { label: "Comment on your post", emailDefault: false, deviceDefault: true },
  { label: "Recommended Content", emailDefault: true, deviceDefault: true },
  {
    label: "New message",
    emailDefault: true,
    deviceDefault: "dropdown",
    info: true,
  },
];

const UPDATES: NotifRow[] = [
  {
    label: "Rythmify Feature Updates & Education",
    emailDefault: true,
    deviceDefault: true,
  },
  { label: "Surveys and feedback", emailDefault: false, deviceDefault: true },
  {
    label: "Promotional & Partnership Content",
    emailDefault: true,
    deviceDefault: true,
  },
  { label: "Rythmify newsletter", emailDefault: false, deviceDefault: null },
];

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl flex flex-col gap-10 pb-10">
      <NotifSection title="Activities" rows={ACTIVITIES} />
      <NotifSection title="Updates from Rythmify" rows={UPDATES} />

      {/* Cancel + Save */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button className="text-sm text-[var(--color-text-hover)] hover:opacity-70 transition-opacity duration-150">
          Cancel
        </button>
        <button className="px-5 py-2 text-sm bg-[var(--color-input-bg)] text-[var(--color-text-hover)] rounded-[var(--radius-sm)] hover:brightness-110 transition-all duration-150">
          Save changes
        </button>
      </div>
    </div>
  );
}
