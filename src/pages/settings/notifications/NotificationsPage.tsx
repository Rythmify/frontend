import { useState, useEffect } from "react";
import axiosInstance from "@/services/api/axiosInstance";

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

// ── Types ─────────────────────────────────────────────────────

type NotifRow = {
  label: string;
  info?: boolean;
  emailKey: string;
  deviceKey: string | null;
  deviceType: boolean | "dropdown" | "checkbox+dropdown";
  dropdownKey?: string;
};

type MessageSource = "everyone" | "followers_only" | "nobody";

type Prefs = Record<string, boolean | MessageSource>;

// ── Section ───────────────────────────────────────────────────

function NotifSection({
  title,
  rows,
  prefs,
  onToggle,
}: {
  title: string;
  rows: NotifRow[];
  prefs: Prefs;
  onToggle: (key: string, value: boolean | MessageSource) => void;
}) {
  const emailKeys = rows.map((r) => r.emailKey);
  const deviceKeys = rows
    .filter((r) => r.deviceKey && r.deviceType !== "dropdown")
    .map((r) => r.deviceKey as string);

  const allEmail = emailKeys.every((k) => prefs[k]);
  const allDevice = deviceKeys.length > 0 && deviceKeys.every((k) => prefs[k]);

  const toggleAllEmail = () => emailKeys.forEach((k) => onToggle(k, !allEmail));
  const toggleAllDevice = () =>
    deviceKeys.forEach((k) => onToggle(k, !allDevice));

  return (
    <div>
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

      <div className="flex flex-col gap-5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--color-text-hover)]">
                {row.label}
              </span>
              {row.info && <InfoIcon />}
            </div>
            <div className="w-24 flex items-center">
              <Checkbox
                checked={!!prefs[row.emailKey]}
                onChange={() => onToggle(row.emailKey, !prefs[row.emailKey])}
              />
            </div>
            <div className="w-28 flex items-center">
              {row.deviceType === "dropdown" ? (
                <div className="relative">
                  <select
                    value={(prefs[row.dropdownKey ?? "messages_from"] ??
                      "everyone") as MessageSource}
                    onChange={(e) =>
                      onToggle(
                        row.dropdownKey ?? "messages_from",
                        e.target.value as MessageSource,
                      )
                    }
                    data-test={`settings-notifications-${row.emailKey}-dropdown`}
                    className="text-xs text-[var(--color-text-hover)] bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] pl-2 pr-5 py-1 appearance-none cursor-pointer"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="followers_only">Followers only</option>
                    <option value="nobody">Nobody</option>
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
              ) : row.deviceType === "checkbox+dropdown" ? (
                <div className="flex flex-col gap-2">
                  {row.deviceKey ? (
                    (() => {
                      const deviceKey = row.deviceKey;
                      return (
                    <Checkbox
                      checked={!!prefs[deviceKey]}
                      onChange={() => onToggle(deviceKey, !prefs[deviceKey])}
                    />
                      );
                    })()
                  ) : null}
                  <div className="relative">
                    <select
                      value={(prefs[row.dropdownKey ?? "messages_from"] ??
                        "everyone") as MessageSource}
                      onChange={(e) =>
                        onToggle(
                          row.dropdownKey ?? "messages_from",
                          e.target.value as MessageSource,
                        )
                      }
                      data-test={`settings-notifications-${row.emailKey}-dropdown`}
                      className="text-xs text-[var(--color-text-hover)] bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] pl-2 pr-5 py-1 appearance-none cursor-pointer"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="followers_only">Followers only</option>
                      <option value="nobody">Nobody</option>
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
                </div>
              ) : row.deviceKey ? (
                <Checkbox
                  checked={!!prefs[row.deviceKey]}
                  onChange={() =>
                    onToggle(row.deviceKey!, !prefs[row.deviceKey!])
                  }
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Row definitions ───────────────────────────────────────────
// Keys map exactly to the API field names in NotificationPreferences schema

const ACTIVITIES: NotifRow[] = [
  {
    label: "New follower",
    emailKey: "new_follower_email",
    deviceKey: "new_follower_push",
    deviceType: true,
  },
  {
    label: "Repost of your post",
    emailKey: "repost_of_your_post_email",
    deviceKey: "repost_of_your_post_push",
    deviceType: true,
  },
  {
    label: "New post by followed user",
    emailKey: "new_post_by_followed_email",
    deviceKey: "new_post_by_followed_push",
    deviceType: true,
  },
  {
    label: "Likes and plays on your post",
    emailKey: "likes_and_plays_email",
    deviceKey: "likes_and_plays_push",
    deviceType: true,
  },
  {
    label: "Comment on your post",
    emailKey: "comment_on_post_email",
    deviceKey: "comment_on_post_push",
    deviceType: true,
  },
  {
    label: "Recommended Content",
    emailKey: "recommended_content_email",
    deviceKey: "recommended_content_push",
    deviceType: true,
  },
  {
    label: "New message",
    emailKey: "new_message_email",
    deviceKey: "new_message_push",
    deviceType: "checkbox+dropdown",
    dropdownKey: "messages_from",
    info: true,
  },
];

const UPDATES: NotifRow[] = [
  {
    label: "Rythmify Feature Updates & Education",
    emailKey: "feature_updates_email",
    deviceKey: "feature_updates_push",
    deviceType: true,
  },
  {
    label: "Surveys and feedback",
    emailKey: "surveys_and_feedback_email",
    deviceKey: "surveys_and_feedback_push",
    deviceType: true,
  },
  {
    label: "Promotional & Partnership Content",
    emailKey: "promotional_content_email",
    deviceKey: "promotional_content_push",
    deviceType: true,
  },
  {
    label: "Rythmify newsletter",
    emailKey: "newsletter_email",
    deviceKey: null,
    deviceType: false,
  },
];

// Mirrors the API defaults from the OpenAPI spec
const DEFAULT_PREFS: Prefs = {
  new_follower_email: false,
  new_follower_push: true,
  repost_of_your_post_email: false,
  repost_of_your_post_push: true,
  new_post_by_followed_email: false,
  new_post_by_followed_push: false,
  likes_and_plays_email: false,
  likes_and_plays_push: false,
  comment_on_post_email: false,
  comment_on_post_push: true,
  recommended_content_email: false,
  recommended_content_push: false,
  new_message_email: false,
  new_message_push: true,
  messages_from: "everyone",
  feature_updates_email: true,
  feature_updates_push: true,
  surveys_and_feedback_email: false,
  surveys_and_feedback_push: false,
  promotional_content_email: false,
  promotional_content_push: false,
  newsletter_email: false,
};

// ── Page ──────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const loadPrefs = () => {
    axiosInstance
      .get<{ data: Prefs }>("/notifications/preferences")
      .then((res) => setPrefs({ ...DEFAULT_PREFS, ...res.data.data }))
      .catch(() => {
        /* fallback to defaults silently */
      });
  };

  // Load from GET /notifications/preferences on mount
  useEffect(() => {
    loadPrefs();
  }, []);

  const handleToggle = (key: string, value: boolean | MessageSource) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setSaveStatus("idle");
  };

  // PATCH /notifications/preferences with full prefs object
  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      await axiosInstance.patch("/notifications/preferences", prefs);
      setDirty(false);
      setSaveStatus("success");
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  // Reload from server, discarding local changes
  const handleCancel = () => {
    setSaveStatus("idle");
    setDirty(false);
    loadPrefs();
  };

  return (
    <div className="max-w-3xl flex flex-col gap-10 pb-10">
      <NotifSection
        title="Activities"
        rows={ACTIVITIES}
        prefs={prefs}
        onToggle={handleToggle}
      />
      <NotifSection
        title="Updates from Rythmify"
        rows={UPDATES}
        prefs={prefs}
        onToggle={handleToggle}
      />

      {/* Cancel + Save */}
      <div className="flex items-center justify-end gap-4 pt-4">
        {saveStatus === "success" && (
          <span className="text-xs text-[var(--color-success)]">Saved!</span>
        )}
        {saveStatus === "error" && (
          <span className="text-xs text-[var(--color-error)]">
            Failed to save
          </span>
        )}
        <button
          onClick={handleCancel}
          data-test="settings-notifications-cancel-button"
          className="text-sm text-[var(--color-text-hover)] hover:opacity-70 transition-opacity duration-150"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          data-test="settings-notifications-save-button"
          className="px-5 py-2 text-sm bg-[var(--color-input-bg)] text-[var(--color-text-hover)] rounded-[var(--radius-sm)] hover:brightness-110 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && (
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
          Save changes
        </button>
      </div>
    </div>
  );
}
