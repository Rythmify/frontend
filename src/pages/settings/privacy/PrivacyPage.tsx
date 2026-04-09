import { useState, useEffect, useCallback } from "react";
import {
  getPrivacySettings,
  updatePrivacySettings,
  type PrivacySettings,
} from "@/services/settings.service";

// ── Toggle ────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 flex-shrink-0 ${
        checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-input-bg)]"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </div>
  );
}

// ── Setting Row ───────────────────────────────────────────────

function SettingRow({
  label,
  description,
  defaultOn = true,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  defaultOn?: boolean;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-8">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-[var(--color-text-hover)]">
          {label}
        </span>
        {description && (
          <p className="text-xs text-[var(--color-text)] leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ── Section Title ─────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="text-[var(--color-text-hover)] font-semibold mb-4">
      {children}
    </h5>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function PrivacyPage() {
  const [settings, setSettings] = useState<PrivacySettings>({
    is_private: false,
    receive_messages_from_anyone: true,
    show_activities_in_discovery: true,
    show_as_top_fan: true,
    show_top_fans_on_tracks: true,
  });

  // Load real settings on mount
  useEffect(() => {
    getPrivacySettings()
      .then(setSettings)
      .catch(() => {
        // keep defaults silently
      });
  }, []);

  // Optimistic toggle — reverts on API failure
  const toggle = useCallback(
    async (key: keyof PrivacySettings) => {
      const next = !settings[key];
      setSettings((prev) => ({ ...prev, [key]: next }));
      try {
        const updated = await updatePrivacySettings({ [key]: next });
        setSettings(updated);
      } catch {
        setSettings((prev) => ({ ...prev, [key]: !next }));
      }
    },
    [settings],
  );

  return (
    <div className="max-w-3xl flex flex-col gap-10">
      {/* ── Privacy settings ── */}
      <div className="flex flex-col gap-6">
        <SectionTitle>Privacy settings</SectionTitle>
        <SettingRow
          label="Receive messages from anyone"
          description="For your safety, we recommend only allowing messages from people you follow. Turning this on will allow anyone to send you messages."
          defaultOn={true}
          checked={settings.receive_messages_from_anyone}
          onChange={() => toggle("receive_messages_from_anyone")}
        />
        <SettingRow
          label="Show my activities in social discovery playlists and modules"
          description="Your Likes, Reactions and other engagement may be shown to other users in discovery features such as 'Liked By' playlists or update feeds. Turning this off won't hide your Likes on your profile or tracks."
          defaultOn={true}
          checked={settings.show_activities_in_discovery}
          onChange={() => toggle("show_activities_in_discovery")}
        />
        <SettingRow
          label="Show when I'm a First or Top Fan"
          description="Appear in public Top Fans and First Fans lists"
          defaultOn={true}
          checked={settings.show_as_top_fan}
          onChange={() => toggle("show_as_top_fan")}
        />
        <SettingRow
          label="Show First and Top Fans for my tracks"
          description="Your First and Top Fans will appear on your tracks"
          defaultOn={true}
          checked={settings.show_top_fans_on_tracks}
          onChange={() => toggle("show_top_fans_on_tracks")}
        />
      </div>

      {/* ── Blocked users ── */}
      <div>
        <SectionTitle>Blocked users</SectionTitle>
        <p className="text-sm text-[var(--color-text-hover)]">
          You have not muted any users.
        </p>
      </div>

      {/* ── Cookies ── */}
      <div>
        <SectionTitle>Cookies</SectionTitle>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-hover)]">
            Manage your cookie preferences
          </span>
          <button
            data-test="settings-privacy-cookie-manager-button"
            className="px-4 py-2 text-sm bg-[var(--color-input-bg)] text-[var(--color-text-hover)] rounded-[var(--radius-sm)] hover:brightness-110 transition-all duration-150"
          >
            Open Cookie Manager
          </button>
        </div>
      </div>
    </div>
  );
}
