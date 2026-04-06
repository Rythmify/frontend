import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleLogin } from "@/services/auth.service";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SettingsLayout from "@/pages/settings/SettingsLayout";
import { useAuthStore } from "@/stores/auth.store";
import {
  forgotPassword,
  updateMeAccount,
  disconnectProvider,
} from "@/services/auth.service";

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
  disabled,
  loading,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="px-4 py-2 text-sm bg-[var(--color-input-bg)] text-[var(--color-text-hover)] hover:brightness-110 transition-all duration-150 rounded-[var(--radius-sm)]"
    >
      {loading && (
        <svg
          className="animate-spin w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

// ── Sections ──────────────────────────────────────────────────

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] shadow-md text-sm text-white transition-all duration-300 ${
        type === "success"
          ? "bg-[var(--color-success)]"
          : "bg-[var(--color-error)]"
      }`}
    >
      {type === "success" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 18L18 6M6 6l12 12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 2l8 8M10 2l-8 8"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

// ── Theme ─────────────────────────────────────────────────────

type Theme = "Light" | "Dark" | "Automatic";

function ChangeTheme({}) {
  const options: Theme[] = ["Light", "Dark", "Automatic"];

  const getInitial = (): Theme => {
    const saved = localStorage.getItem("theme") as Theme | null;
    return saved ?? "Dark";
  };

  const [selected, setSelected] = useState<Theme>(getInitial);
  // Apply saved theme before React mounts (prevents flash)
  const savedTheme = localStorage.getItem("theme");
  const root = document.documentElement;

  if (savedTheme === "Light") {
    root.classList.remove("dark");
  } else if (savedTheme === "Dark") {
    root.classList.add("dark");
  } else if (savedTheme === "Automatic") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    prefersDark ? root.classList.add("dark") : root.classList.remove("dark");
  } else {
    // No saved preference — default to dark
    root.classList.add("dark");
  }

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    if (theme === "Dark") {
      root.classList.add("dark");
    } else if (theme === "Light") {
      root.classList.remove("dark");
    } else {
      // Automatic — follow system
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      prefersDark ? root.classList.add("dark") : root.classList.remove("dark");
    }
  };

  const handleChange = (theme: Theme) => {
    setSelected(theme);
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  };

  return (
    <div>
      <SectionTitle>Change theme</SectionTitle>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="theme"
              checked={selected === opt}
              onChange={() => handleChange(opt)}
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

function EmailAddresses({
  onToast,
}: {
  onToast: (msg: string, type: "success" | "error") => void;
}) {
  const { user } = useAuthStore();
  const [showInput, setShowInput] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newEmail.trim()) return;
    setLoading(true);
    try {
      // POST /auth/change-email — sends verification to new email
      const { changeEmail } = await import("@/services/auth.service");
      await changeEmail(newEmail.trim());
      onToast("Verification email sent to " + newEmail, "success");
      setShowInput(false);
      setNewEmail("");
    } catch {
      onToast("Failed to send verification email.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionTitle>Email addresses</SectionTitle>
      <p className="text-sm text-[var(--color-text-hover)] mb-4">
        {user?.email}{" "}
        <span className="text-[var(--color-text)]">(Primary)</span>
      </p>
      {showInput ? (
        <div className="flex gap-2 items-center">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New email address"
            className="px-3 py-2 text-sm text-[var(--color-text-hover)] bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--color-border-light)] w-64"
          />
          <OutlineButton
            onClick={handleAdd}
            loading={loading}
            disabled={!newEmail.trim()}
          >
            Add
          </OutlineButton>
          <button
            onClick={() => {
              setShowInput(false);
              setNewEmail("");
            }}
            className="text-sm text-[var(--color-text)] hover:text-[var(--color-text-hover)] transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <OutlineButton onClick={() => setShowInput(true)}>
          Add an email address
        </OutlineButton>
      )}
    </div>
  );
}

type Provider = "google" | "facebook" | "apple";

const PROVIDER_LABELS: Record<Provider, string> = {
  google: "Google",
  facebook: "Facebook",
  apple: "Apple",
};

function SocialNetworks({
  onToast,
}: {
  onToast: (msg: string, type: "success" | "error") => void;
}) {
  const [connected, setConnected] = useState<Provider[]>([]);
  const [disconnecting, setDisconnecting] = useState<Provider | null>(null);

  const handleDisconnect = async (provider: Provider) => {
    setDisconnecting(provider);
    try {
      await disconnectProvider(provider);
      setConnected((prev) => prev.filter((p) => p !== provider));
      onToast(`${PROVIDER_LABELS[provider]} account disconnected.`, "success");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ??
        "Cannot disconnect — this may be your only login method.";
      onToast(msg, "error");
    } finally {
      setDisconnecting(null);
    }
  };

  const handleConnect = (provider: Provider) => {
    onToast(`Redirecting to ${PROVIDER_LABELS[provider]} login…`, "success");
  };

  return (
    <div>
      <SectionTitle>Sign in with other social networks</SectionTitle>

      {/* Connected accounts */}
      {connected.length === 0 ? (
        <p className="text-sm text-[var(--color-text)] mb-4">
          You have not linked social accounts to your Rythmify account.
        </p>
      ) : (
        <div className="flex flex-col gap-2 mb-4">
          {connected.map((provider) => (
            <div key={provider} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {provider === "google" && (
                  <svg width="16" height="16" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                  </svg>
                )}
                {provider === "facebook" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                  </svg>
                )}
                {provider === "apple" && (
                  <svg width="16" height="16" viewBox="0 0 814 1000" fill="var(--color-text-hover)" xmlns="http://www.w3.org/2000/svg">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-146.8-99.5C79 758.4 32 643.1 32 531.3c0-186.8 121.8-285.5 241.4-285.5 63.5 0 116.4 41.8 155.9 41.8 37.5 0 96.9-43.4 168.6-43.4 25.4 0 125.2 2.6 197.3 99.7zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
                  </svg>
                )}
                <span className="text-sm text-[var(--color-text-hover)]">
                  {PROVIDER_LABELS[provider]} account connected
                </span>
              </div>
              <button
                onClick={() => handleDisconnect(provider)}
                disabled={disconnecting === provider}
                className="text-sm text-[var(--color-text)] hover:text-[var(--color-text-hover)] transition-colors duration-150 disabled:opacity-50"
              >
                {disconnecting === provider ? "Disconnecting…" : "Disconnect account"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add accounts — always shown */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleConnect("facebook")}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1877F2] text-white rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity duration-150"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
          </svg>
          Add Facebook account
        </button>
        <button
          onClick={() => handleConnect("google")}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-transparent bg-[var(--color-input-bg)] text-[var(--color-text-hover)] hover:brightness-110 transition-all duration-150 rounded-[var(--radius-sm)]"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
            <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          Add Google account
        </button>
        <button
          onClick={() => handleConnect("apple")}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-inverted)] text-[var(--color-bg)] rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity duration-150"
        >
          <svg width="16" height="16" viewBox="0 0 814 1000" fill="var(--color-bg)" xmlns="http://www.w3.org/2000/svg">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-146.8-99.5C79 758.4 32 643.1 32 531.3c0-186.8 121.8-285.5 241.4-285.5 63.5 0 116.4 41.8 155.9 41.8 37.5 0 96.9-43.4 168.6-43.4 25.4 0 125.2 2.6 197.3 99.7zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
          </svg>
          Add Apple account
        </button>
      </div>
    </div>
  );

}

function Password({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
 
  const handleSend = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      await forgotPassword(user.email);
      setSent(true);
      onToast("Password reset link sent to " + user.email, "success");
    } catch {
      onToast("Failed to send reset link. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div>
      <SectionTitle>Password</SectionTitle>
      <OutlineButton onClick={handleSend} loading={loading} disabled={sent}>
        {sent ? "Reset link sent ✓" : "Send password-reset link"}
      </OutlineButton>
      {sent && (
        <p className="text-xs text-[var(--color-text)] mt-2">
          Check your inbox at {user?.email}. The link expires in 1 hour.
        </p>
      )}
    </div>
  );
}

function VerificationBadge({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
 
  const handleRequest = async () => {
    setLoading(true);
    // No endpoint for this yet — placeholder
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setRequested(true);
    onToast("Verification request submitted!", "success");
  };
 
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h5 className="text-[var(--color-text-hover)] font-semibold">
          Verification badge
        </h5>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#1DA1F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <OutlineButton onClick={handleRequest} loading={loading} disabled={requested}>
        {requested ? "Request submitted " : "Request verification"}
      </OutlineButton>
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

function SelectField({ children, value, onChange, defaultValue }: {
  children: React.ReactNode;
  value?: string;
  onChange?: (v: string) => void;
  defaultValue?: string;
}) {
  const selectClass =
    "pr-9 pl-3 py-2 text-sm text-[var(--color-text-hover)] bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] appearance-none cursor-pointer w-full focus:outline-none focus:border-[var(--color-border-light)]";
  return (
    <div className="relative">
      <select
        className={selectClass}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      >
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
