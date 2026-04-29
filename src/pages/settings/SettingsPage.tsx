import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SettingsLayout from "@/pages/settings/SettingsLayout";
import { useAuthStore, type User } from "@/stores/auth.store";
import { normalizeDateOfBirth } from "@/services/auth.service";
import {
  changeEmail,
  deleteMyAccount,
  forgotPassword,
  updateMeAccount,
  disconnectProvider,
  type UserProfile,
} from "@/services/auth.service";

// ── Sub-components ────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="text-[var(--color-text-hover)] font-semibold mb-4">
      {children}
    </h5>
  );
}

function mapProfileToStoreUser(
  profile: UserProfile,
  currentUser: User | null,
): User {
  const displayName =
    profile.display_name ??
    profile.displayName ??
    currentUser?.displayName ??
    "";
  const firstName =
    profile.first_name ?? profile.firstName ?? currentUser?.firstName ?? "";
  const lastName =
    profile.last_name ?? profile.lastName ?? currentUser?.lastName ?? "";
  const avatar =
    profile.profile_picture ?? profile.avatar ?? currentUser?.avatar;
  const coverUrl =
    profile.cover_photo ?? profile.coverUrl ?? currentUser?.coverUrl;
  const city = profile.city ?? currentUser?.city;
  const country = profile.country ?? currentUser?.country;
  const dateOfBirth = normalizeDateOfBirth(
    profile.date_of_birth ?? currentUser?.date_of_birth,
  );

  return {
    id: profile.id,
    username: profile.username ?? currentUser?.username ?? "",
    displayName,
    firstName,
    lastName,
    bio: profile.bio ?? currentUser?.bio ?? "",
    email: profile.email ?? currentUser?.email ?? "",
    avatar,
    coverUrl,
    role: profile.role ?? currentUser?.role ?? "listener",
    isPro: currentUser?.isPro ?? false,
    city,
    country,
    location:
      [city, country].filter(Boolean).join(", ") || currentUser?.location,
    following_ids: profile.following_ids ?? currentUser?.following_ids ?? [],
    followers_ids: profile.followers_ids ?? currentUser?.followers_ids,
    date_of_birth: dateOfBirth,
    gender: profile.gender ?? currentUser?.gender ?? null,
  };
}

function OutlineButton({
  children,
  onClick,
  disabled,
  loading,
  dataTest,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  dataTest?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      data-test={dataTest}
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
      <button
        onClick={onClose}
        data-test="settings-toast-close-button"
        className="ml-2 opacity-70 hover:opacity-100"
      >
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
const CONNECTED_APPS_STORAGE_KEY = "settings-connected-applications";
const DEFAULT_CONNECTED_APPS = [
  "Rythmify.com",
  "Rythmify iOS",
  "Rythmify Checkout",
  "m.rythmify.com",
];
const MONTHS = [
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
] as const;
const DELETE_ACCOUNT_REASONS = [
  "I have another account",
  "I want to make a new account",
  "There aren't enough privacy options",
  "I am no longer creating content for this account",
  "I had copyright issues with a track or tracks",
  "I don't want to subscribe to Rythmify Pro anymore",
  "I switched to another music or audio service",
  "My account got hacked",
  "I can't remove my tracks",
  "People are harassing me",
  "Too much spam on the platform",
] as const;

function ChangeTheme() {
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
    if (prefersDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
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
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
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
              data-test={`settings-theme-${opt.toLowerCase()}-input`}
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

type PendingEmail = {
  email: string;
  confirmed: boolean;
};

function EmailAddresses({
  onToast,
}: {
  onToast: (msg: string, type: "success" | "error") => void;
}) {
  const { user } = useAuthStore();
  const [showInput, setShowInput] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [pendingEmails, setPendingEmails] = useState<PendingEmail[]>(() => {
    try {
      const stored = localStorage.getItem(`pending-emails-${user?.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist pending emails per user
  useEffect(() => {
    localStorage.setItem(
      `pending-emails-${user?.id}`,
      JSON.stringify(pendingEmails),
    );
  }, [pendingEmails, user?.id]);

  const handleAdd = async () => {
    const trimmedEmail = newEmail.trim();
    if (!trimmedEmail) return;

    const normalizedCurrentEmail = user?.email?.trim().toLowerCase();
    const normalizedNewEmail = trimmedEmail.toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      normalizedCurrentEmail &&
      normalizedNewEmail === normalizedCurrentEmail
    ) {
      onToast("This email is already your primary email address.", "error");
      return;
    }

    if (
      pendingEmails.some((e) => e.email.toLowerCase() === normalizedNewEmail)
    ) {
      onToast("This email is already pending confirmation.", "error");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      onToast("Please enter a valid email address.", "error");
      return;
    }

    setLoading(true);
    try {
      await changeEmail(trimmedEmail);
      setPendingEmails((prev) => [
        ...prev,
        { email: trimmedEmail, confirmed: false },
      ]);
      onToast(`Verification email sent to ${trimmedEmail}`, "success");
      setShowInput(false);
      setNewEmail("");
    } catch (err: any) {
      if (err?.response?.status === 401) {
        onToast("Session expired. Please login again.", "error");
        return;
      }
      onToast("Failed to send verification email.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (email: string) => {
    setResendingEmail(email);
    try {
      await changeEmail(email);
      onToast(`Verification email resent to ${email}`, "success");
    } catch (err: any) {
      onToast("Failed to resend verification email.", "error");
    } finally {
      setResendingEmail(null);
    }
  };

  const handleRemove = (email: string) => {
    setPendingEmails((prev) => prev.filter((e) => e.email !== email));
    onToast("Email address removed.", "success");
  };

  return (
    <div>
      <SectionTitle>Email addresses</SectionTitle>

      {/* Primary email */}
      <p className="text-sm text-[var(--color-text-hover)] mb-2">
        {user?.email}{" "}
        <span className="text-[var(--color-text)]">(Primary)</span>
      </p>

      {/* Pending / unconfirmed emails */}
      {pendingEmails.map((entry) => (
        <p
          key={entry.email}
          className="text-sm text-[var(--color-text)] mb-2 flex flex-wrap items-center gap-x-1"
        >
          <span>{entry.email}</span>
          <span>(Not confirmed</span>
          <span>-</span>
          <button
            onClick={() => handleResend(entry.email)}
            disabled={resendingEmail === entry.email}
            data-test={`settings-resend-email-${entry.email}`}
            className="text-[var(--color-text-hover)] hover:underline disabled:opacity-50 transition-opacity"
          >
            {resendingEmail === entry.email
              ? "Sending…"
              : "Resend confirmation email"}
          </button>
          <span>)</span>
          <button
            onClick={() => handleRemove(entry.email)}
            data-test={`settings-remove-email-${entry.email}`}
            className="ml-2 text-[var(--color-text-hover)] hover:underline transition-opacity"
          >
            Remove address
          </button>
        </p>
      ))}

      {/* Add new email */}
      {showInput ? (
        <div className="flex gap-2 items-center mt-3">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New email address"
            data-test="settings-new-email-input"
            className="px-3 py-2 text-sm text-[var(--color-text-hover)] bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--color-border-light)] w-64"
          />
          <OutlineButton
            onClick={handleAdd}
            loading={loading}
            disabled={!newEmail.trim()}
            dataTest="settings-add-email-button"
          >
            Add
          </OutlineButton>
          <button
            onClick={() => {
              setShowInput(false);
              setNewEmail("");
            }}
            data-test="settings-cancel-add-email-button"
            className="text-sm text-[var(--color-text)] hover:text-[var(--color-text-hover)] transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <OutlineButton
          onClick={() => setShowInput(true)}
          dataTest="settings-show-add-email-button"
        >
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
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/${provider}`;
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
                )}
                {provider === "facebook" && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#1877F2"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                  </svg>
                )}
                {provider === "apple" && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 814 1000"
                    fill="var(--color-text-hover)"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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
                data-test={`settings-disconnect-${provider}-button`}
                className="text-sm text-[var(--color-text)] hover:text-[var(--color-text-hover)] transition-colors duration-150 disabled:opacity-50"
              >
                {disconnecting === provider
                  ? "Disconnecting…"
                  : "Disconnect account"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add accounts — always shown */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleConnect("facebook")}
          data-test="settings-connect-facebook-button"
          className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1877F2] text-white rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity duration-150"
        >
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
        <button
          onClick={() => handleConnect("google")}
          data-test="settings-connect-google-button"
          className="flex items-center gap-2 px-4 py-2 text-sm border border-transparent bg-[var(--color-input-bg)] text-[var(--color-text-hover)] hover:brightness-110 transition-all duration-150 rounded-[var(--radius-sm)]"
        >
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
        <button
          onClick={() => handleConnect("apple")}
          data-test="settings-connect-apple-button"
          className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--color-border)] bg-[var(--color-bg-inverted)] text-[var(--color-bg)] rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity duration-150"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 814 1000"
            fill="var(--color-bg)"
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

function Password({
  onToast,
}: {
  onToast: (msg: string, type: "success" | "error") => void;
}) {
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
      <OutlineButton
        onClick={handleSend}
        loading={loading}
        disabled={sent}
        dataTest="settings-send-password-reset-button"
      >
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

function VerificationBadge({
  onToast,
}: {
  onToast: (msg: string, type: "success" | "error") => void;
}) {
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
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="#1DA1F2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <OutlineButton
        onClick={handleRequest}
        loading={loading}
        disabled={requested}
        dataTest="settings-request-verification-button"
      >
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

function SelectField({
  children,
  value,
  onChange,
  defaultValue,
  dataTest,
}: {
  children: React.ReactNode;
  value?: string;
  onChange?: (v: string) => void;
  defaultValue?: string;
  dataTest?: string;
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
        data-test={dataTest}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]">
        <ChevronDown />
      </span>
    </div>
  );
}

function BasicInformation({
  onToast,
}: {
  onToast: (msg: string, type: "success" | "error") => void;
}) {
  const { user, setUser, logout } = useAuthStore();
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const [month, setMonth] = useState("January");
  const [day, setDay] = useState("1");
  const [year, setYear] = useState(String(currentYear));
  const [gender, setGender] = useState<"" | "male" | "female">("");
  const [lastSyncedDateOfBirth, setLastSyncedDateOfBirth] = useState("");
  const [lastSyncedGender, setLastSyncedGender] = useState<
    "" | "male" | "female"
  >("");
  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving">("idle");

  useEffect(() => {
    const syncedDateOfBirth = normalizeDateOfBirth(user?.date_of_birth) ?? "";
    const syncedGender = (user?.gender ?? "") as "" | "male" | "female";

    if (syncedDateOfBirth) {
      const [savedYear, savedMonth, savedDay] = syncedDateOfBirth.split("-");
      const monthIndex = Number(savedMonth) - 1;
      if (savedYear) setYear(savedYear);
      if (savedDay) setDay(String(Number(savedDay)));
      if (monthIndex >= 0 && monthIndex < MONTHS.length) {
        setMonth(MONTHS[monthIndex]);
      }
    } else {
      setMonth("January");
      setDay("1");
      setYear(String(currentYear));
    }

    setGender(syncedGender);
    setLastSyncedDateOfBirth(syncedDateOfBirth);
    setLastSyncedGender(syncedGender);
    setIsDirty(false);
    setSaveState("idle");
  }, [currentYear, user?.date_of_birth, user?.gender]);

  const candidateDateOfBirth = `${year}-${String(
    MONTHS.indexOf(month as (typeof MONTHS)[number]) + 1,
  ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const normalizedDateOfBirth = `${String(
    new Date(`${candidateDateOfBirth}T00:00:00`).getFullYear(),
  )}-${String(
    new Date(`${candidateDateOfBirth}T00:00:00`).getMonth() + 1,
  ).padStart(2, "0")}-${String(
    new Date(`${candidateDateOfBirth}T00:00:00`).getDate(),
  ).padStart(2, "0")}`;
  const isBirthDateDirty = lastSyncedDateOfBirth !== candidateDateOfBirth;
  const isGenderDirty = lastSyncedGender !== gender;
  const canSave = isDirty && saveState !== "saving";

  const resetForm = () => {
    const syncedDateOfBirth = normalizeDateOfBirth(user?.date_of_birth) ?? "";
    const syncedGender = (user?.gender ?? "") as "" | "male" | "female";

    if (syncedDateOfBirth) {
      const [savedYear, savedMonth, savedDay] = syncedDateOfBirth.split("-");
      const monthIndex = Number(savedMonth) - 1;
      if (savedYear) setYear(savedYear);
      if (savedDay) setDay(String(Number(savedDay)));
      if (monthIndex >= 0 && monthIndex < MONTHS.length) {
        setMonth(MONTHS[monthIndex]);
      }
    } else {
      setMonth("January");
      setDay("1");
      setYear(String(currentYear));
    }

    setGender(syncedGender);
    setIsDirty(false);
  };

  const handleSave = async () => {
    if (!localStorage.getItem("auth_token")) {
      logout();
      onToast("Session expired. Please sign in again.", "error");
      return;
    }

    if (gender === "") {
      onToast("Please indicate your gender before saving.", "error");
      return;
    }

    const payload: {
      gender?: "male" | "female";
      date_of_birth?: string;
    } = {};

    if (isGenderDirty) {
      payload.gender = gender;
    }

    if (isBirthDateDirty) {
      if (normalizedDateOfBirth !== candidateDateOfBirth) {
        onToast("Please choose a valid birth date.", "error");
        return;
      }
      payload.date_of_birth = candidateDateOfBirth;
    }

    if (!payload.gender && !payload.date_of_birth) {
      onToast("No changes to save.", "error");
      return;
    }

    setSaveState("saving");
    try {
      const response = await updateMeAccount(payload);
      const profile = response?.data ?? response;
      const mergedProfile = { ...profile, ...payload };
      const nextUser = mapProfileToStoreUser(mergedProfile, user);

      setUser({ ...nextUser });
      setLastSyncedDateOfBirth(
        payload.date_of_birth ?? nextUser.date_of_birth ?? "",
      );
      setLastSyncedGender((nextUser.gender ?? "") as "" | "male" | "female");
      setIsDirty(false);
      onToast("Basic information saved successfully.", "success");
    } catch (err: any) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        "Failed to update basic information.";

      if (status === 401) {
        logout();
        onToast("Session expired. Please sign in again.", "error");
        return;
      }

      if (status === 429) {
        onToast(
          "Too many requests. Please wait a moment and try again.",
          "error",
        );
        return;
      }

      onToast(message, "error");
    } finally {
      setSaveState("idle");
    }
  };

  return (
    <div>
      <SectionTitle>Basic information</SectionTitle>
      <div className="flex flex-wrap gap-6">
        <div>
          <label className="block text-xs text-[var(--color-text)] mb-2">
            Birth date
          </label>
          <div className="flex gap-2">
            <SelectField
              value={month}
              dataTest="settings-birth-month-select"
              onChange={(value) => {
                setMonth(value);
                setIsDirty(true);
              }}
            >
              {MONTHS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </SelectField>
            <SelectField
              value={day}
              dataTest="settings-birth-day-select"
              onChange={(value) => {
                setDay(value);
                setIsDirty(true);
              }}
            >
              {days.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </SelectField>
            <SelectField
              value={year}
              dataTest="settings-birth-year-select"
              onChange={(value) => {
                setYear(value);
                setIsDirty(true);
              }}
            >
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
          <SelectField
            value={gender}
            dataTest="settings-gender-select"
            onChange={(value) => {
              setGender(value as "" | "male" | "female");
              setIsDirty(true);
            }}
          >
            <option value="">Indicate gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </SelectField>
          {!gender && (
            <p className="text-xs text-[var(--color-error)] mt-1">
              Please indicate your gender.
            </p>
          )}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!canSave}
          data-test="settings-basic-info-save-button"
          className="rounded-[var(--radius-sm)] bg-[var(--color-input-bg)] px-4 py-2 text-sm font-semibold text-[var(--color-text-hover)] transition-all duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveState === "saving" ? "Saving..." : "Save changes"}
        </button>
        <button
          onClick={resetForm}
          disabled={!isDirty || saveState === "saving"}
          data-test="settings-basic-info-cancel-button"
          className="text-sm font-semibold text-[var(--color-text)] transition hover:text-[var(--color-text-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        {saveState === "saving" && (
          <p className="text-xs text-[var(--color-text)]">
            Saving basic information...
          </p>
        )}
      </div>
    </div>
  );
}

function ConnectedApplications() {
  const { user } = useAuthStore();

  const storageKey = `settings-connected-applications-${user?.id}`;
  const [apps, setApps] = useState<string[]>(() => {
    const savedApps = localStorage.getItem(storageKey);
    if (!savedApps) return DEFAULT_CONNECTED_APPS;

    try {
      const parsed = JSON.parse(savedApps);
      return Array.isArray(parsed) ? parsed : DEFAULT_CONNECTED_APPS;
    } catch {
      return DEFAULT_CONNECTED_APPS;
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(apps));
  }, [apps]);

  const revokeApp = (appName: string) => {
    setApps((current) => current.filter((app) => app !== appName));
  };

  const revokeAll = () => {
    setApps([]);
  };

  return (
    <div>
      <SectionTitle>Connected applications</SectionTitle>
      <div className="flex flex-col">
        {apps.length === 0 && (
          <p className="text-sm text-[var(--color-text)]">
            No connected applications.
          </p>
        )}
        {apps.map((app) => (
          <div key={app} className="flex items-center justify-between py-3 ">
            <span className="text-sm text-[var(--color-text-hover)]">
              {app}
            </span>
            <button
              onClick={() => revokeApp(app)}
              data-test={`settings-revoke-${app.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-button`}
              className="text-sm text-[var(--color-text-hover)] font-bold cursor-pointer"
            >
              Revoke access
            </button>
          </div>
        ))}
        <div className="flex justify-end pt-3">
          <button
            onClick={revokeAll}
            data-test="settings-revoke-all-apps-button"
            className="text-sm text-[var(--color-text-hover)] font-bold cursor-pointer"
          >
            Revoke all
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteAccountModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
}) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleReason = (reason: string) => {
    setSelectedReasons((current) =>
      current.includes(reason)
        ? current.filter((item) => item !== reason)
        : [...current, reason],
    );
  };

  const handleDelete = async () => {
    if (!confirmed || isDeleting) return;
    setIsDeleting(true);
    try {
      const deleted = await onConfirm();
      if (deleted) {
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 pt-16 sm:pt-20 pb-6 overflow-y-auto">
      <div className="relative w-full max-w-[28rem] sm:max-w-[32rem] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-4 sm:px-5 sm:py-5 text-[var(--color-text-hover)] shadow-[var(--shadow-md)] my-6">
        <button
          onClick={onClose}
          data-test="settings-delete-account-modal-close-button"
          className="absolute right-3 top-3 sm:right-4 sm:top-4 text-[var(--color-text)] transition hover:text-[var(--color-text-hover)]"
          aria-label="Close delete account modal"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h2 className="mb-4 text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-hover)]">
          Delete account
        </h2>

        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-3 text-sm sm:text-base font-semibold text-[var(--color-text-hover)]">
              Why are you choosing to delete your account?
            </p>
            <div className="flex flex-col gap-2">
              {DELETE_ACCOUNT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex cursor-pointer items-start gap-2.5 text-sm font-semibold text-[var(--color-text-hover)]"
                >
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(reason)}
                    onChange={() => toggleReason(reason)}
                    data-test={`settings-delete-reason-${reason.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-input`}
                    className="mt-0.5 h-4 w-4 rounded border border-[var(--color-border-light)] bg-transparent accent-[var(--color-accent)]"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              <div className="flex flex-col gap-2.5">
                <label className="flex cursor-pointer items-start gap-2.5 text-sm font-semibold text-[var(--color-text-hover)]">
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes("other")}
                    onChange={() => toggleReason("other")}
                    data-test="settings-delete-reason-other-input"
                    className="mt-0.5 h-4 w-4 rounded border border-[var(--color-border-light)] bg-transparent accent-[var(--color-accent)]"
                  />
                  <span>Other, please specify</span>
                </label>
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  rows={2}
                  placeholder="Tell us more"
                  data-test="settings-delete-other-reason-input"
                  className="min-h-[56px] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm text-[var(--color-text-hover)] placeholder:text-[var(--color-text)] focus:outline-none focus:border-[var(--color-border-light)]"
                />
              </div>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 text-sm font-semibold text-[var(--color-text-hover)]">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={() => setConfirmed((value) => !value)}
              data-test="settings-delete-account-confirm-input"
              className="mt-0.5 h-4 w-4 rounded border border-[var(--color-border-light)] bg-transparent accent-[var(--color-accent)]"
            />
            <span>
              Yes, I want to delete my account and all my tracks, comments and
              stats.
            </span>
          </label>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={isDeleting}
              data-test="settings-delete-account-cancel-button"
              className="px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:text-[var(--color-text-hover)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={!confirmed || isDeleting}
              data-test="settings-delete-account-confirm-button"
              className="rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--color-border-light)] disabled:text-[var(--color-text)]"
            >
              {isDeleting ? "Deleting..." : "Delete my account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteAccount({
  onDeleteRequested,
}: {
  onDeleteRequested: () => void;
}) {
  return (
    <button
      onClick={onDeleteRequested}
      data-test="settings-delete-account-button"
      className="text-sm self-start font-bold text-[var(--color-error)]"
    >
      Delete account
    </button>
  );
}

// ── Account Page ──────────────────────────────────────────────

function AccountPage() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteMyAccount();
      logout();
      navigate("/", { replace: true });
      return true;
    } catch (err: any) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        (status
          ? `Failed to delete account (${status}).`
          : "Failed to delete account.");
      showToast(message, "error");
      return false;
    }
  };

  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
      setToast({
        message: "Session expired. Please sign in again.",
        type: "error",
      });
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [logout]);

  return (
    <>
      <div className="max-w-2xl flex flex-col gap-10">
        <ChangeTheme />
        <EmailAddresses onToast={showToast} />
        <SocialNetworks onToast={showToast} />
        <Password onToast={showToast} />
        <VerificationBadge onToast={showToast} />
        <BasicInformation onToast={showToast} />
        <ConnectedApplications />
        <DeleteAccount onDeleteRequested={() => setShowDeleteModal(true)} />
      </div>
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
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
