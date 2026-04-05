import { Outlet, useLocation } from "react-router-dom";
import SettingsLayout from "@/pages/settings/SettingsLayout";
import { useAuthStore } from "@/stores/auth.store";

// ── Sub-components ────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="text-[var(--color-text-hover)] font-semibold mb-4">
      {children}
    </h5>
  );
}

function OutlineButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm bg-[var(--color-input-bg)] text-[var(--color-text-hover)] hover:brightness-110 transition-all duration-150 rounded-[var(--radius-sm)]"
    >
      {children}
    </button>
  );
}

// ── Sections ──────────────────────────────────────────────────

function ChangeTheme() {
  const options = ["Light", "Dark", "Automatic"] as const;
  return (
    <div>
      <SectionTitle>Change theme</SectionTitle>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="theme"
              defaultChecked={opt === "Dark"}
              className="w-4 h-4 accent-[var(--color-text-hover)]"
            />
            <span className="text-sm text-[var(--color-text-hover)]">
              {opt}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function EmailAddresses() {
  const { user } = useAuthStore();
  return (
    <div>
      <SectionTitle>Email addresses</SectionTitle>
      <p className="text-sm text-[var(--color-text-hover)] mb-4">
        {user?.email}{" "}
        <span className="text-[var(--color-text)]">(Primary)</span>
      </p>
      <OutlineButton>Add an email address</OutlineButton>
    </div>
  );
}

function SocialNetworks() {
  return (
    <div>
      <SectionTitle>Sign in with other social networks</SectionTitle>
      {/* Connected account */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Google icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-sm text-[var(--color-text-hover)]">
            Connected account name
          </span>
        </div>
        <button className="text-sm text-[var(--color-text)] hover:text-[var(--color-text-hover)] transition-colors duration-150">
          Disconnect account
        </button>
      </div>
      {/* Add accounts */}
      <div className="flex flex-wrap gap-3">
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1877F2] text-white rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity duration-150">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
          </svg>
          Add Facebook account
        </button>
        <button className="flex items-center gap-2 px-4 py-2 text-sm border border-transparent bg-[var(--color-input-bg)] text-[var(--color-text-hover)] hover:brightness-110 transition-all duration-150  rounded-[var(--radius-sm)]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Add Google account
        </button>
        <button className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--color-border)] bg-white text-black rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity duration-150">
          <svg
            width="16"
            height="16"
            viewBox="0 0 814 1000"
            fill="black"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-146.8-99.5C79 758.4 32 643.1 32 531.3c0-186.8 121.8-285.5 241.4-285.5 63.5 0 116.4 41.8 155.9 41.8 37.5 0 96.9-43.4 168.6-43.4 25.4 0 125.2 2.6 197.3 99.7zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
          </svg>
          Add Apple account
        </button>
      </div>
    </div>
  );
}

function Password() {
  return (
    <div>
      <SectionTitle>Password</SectionTitle>
      <OutlineButton>Send password-reset link</OutlineButton>
    </div>
  );
}

function VerificationBadge() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h5 className="text-[var(--color-text-hover)] font-semibold">
          Verification badge
        </h5>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="#1DA1F2"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="#1DA1F2"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <OutlineButton>Request verification</OutlineButton>
    </div>
  );
}

function ChevronDown() {
  return (
    <svg
      width="12"
      height="12"
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
  );
}

function SelectField({
  children,
  defaultValue,
}: {
  children: React.ReactNode;
  defaultValue?: string;
}) {
  const selectClass =
    "pr-9 pl-3 py-2 text-sm text-[var(--color-text-hover)] bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] appearance-none cursor-pointer w-full";
  return (
    <div className="relative">
      <select className={selectClass} defaultValue={defaultValue}>
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]">
        <ChevronDown />
      </span>
    </div>
  );
}

function BasicInformation() {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const genders = ["Indicate gender", "Male", "Female", "Prefer not to say"];

  return (
    <div>
      <SectionTitle>Basic information</SectionTitle>
      <div className="flex flex-wrap gap-6">
        <div>
          <label className="block text-xs text-[var(--color-text)] mb-2">
            Birth date
          </label>
          <div className="flex gap-2">
            <SelectField defaultValue="July">
              {months.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </SelectField>
            <SelectField defaultValue="1">
              {days.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </SelectField>
            <SelectField defaultValue="2005">
              {years.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </SelectField>
          </div>
        </div>
        <div>
          <label className="block text-xs text-[var(--color-text)] mb-2">
            Gender <span className="text-[var(--color-error)]">*</span>
          </label>
          <SelectField defaultValue="Indicate gender">
            {genders.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </SelectField>
          <p className="text-xs text-[var(--color-error)] mt-1">
            Please indicate your gender.
          </p>
        </div>
      </div>
    </div>
  );
}

function ConnectedApplications() {
  const apps = [
    "Rythmify.com",
    "Rythmify iOS",
    "Rythmify Checkout",
    "m.rythmify.com",
  ];
  return (
    <div>
      <SectionTitle>Connected applications</SectionTitle>
      <div className="flex flex-col">
        {apps.map((app) => (
          <div key={app} className="flex items-center justify-between py-3 ">
            <span className="text-sm text-[var(--color-text-hover)]">
              {app}
            </span>
            <button className="text-sm text-[var(--color-text-hover)] font-bold cursor-pointer">
              Revoke access
            </button>
          </div>
        ))}
        <div className="flex justify-end pt-3">
          <button className="text-sm text-[var(--color-text-hover)] font-bold cursor-pointer">
            Revoke all
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteAccount() {
  return (
    <button className="text-sm self-start fint-bold text-[var(--color-error)] ">
      Delete account
    </button>
  );
}

// ── Account Page ──────────────────────────────────────────────

function AccountPage() {
  return (
    <div className="max-w-2xl flex flex-col gap-10">
      <ChangeTheme />
      <EmailAddresses />
      <SocialNetworks />
      <Password />
      <VerificationBadge />
      <BasicInformation />
      <ConnectedApplications />
      <DeleteAccount />
    </div>
  );
}

// ── SettingsPage ──────────────────────────────────────────────

export default function SettingsPage() {
  const location = useLocation();
  const isAccount = location.pathname === "/settings";

  return (
    <SettingsLayout>{isAccount ? <AccountPage /> : <Outlet />}</SettingsLayout>
  );
}
