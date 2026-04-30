import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  getContentSettings,
  updateContentSettings,
  type ContentSettings,
} from "@/services/settings.service";

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
    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    createPortal(
      <div
        data-test="settings-content-toast"
        className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-sm text-white shadow-md ${
          type === "success"
            ? "bg-[var(--color-success)]"
            : "bg-[var(--color-error)]"
        }`}
      >
        <span>{message}</span>
        <button
          onClick={onClose}
          data-test="settings-content-toast-close-button"
          aria-label="Close toast"
          className="opacity-80 transition hover:opacity-100"
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
      </div>,
      document.body,
    )
  );
}

function SectionTitle({
  children,
  info,
}: {
  children: React.ReactNode;
  info?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <h5 className="text-[var(--color-text-hover)] font-semibold">
        {children}
      </h5>
      {info && (
        <svg
          width="16"
          height="16"
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
      )}
    </div>
  );
}

function FieldLabel({
  children,
  required,
  info,
}: {
  children: React.ReactNode;
  required?: boolean;
  info?: boolean;
}) {
  return (
    <label className="flex items-center gap-1 text-sm font-semibold text-[var(--color-text-hover)] mb-2">
      {children}
      {required && <span className="text-[var(--color-error)]">*</span>}
      {info && (
        <svg
          width="13"
          height="13"
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
      )}
    </label>
  );
}

const inputClass =
  "w-full px-3 py-2 text-sm text-[var(--color-text-hover)] bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-light)]";

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
  return (
    <div className="relative">
      <select
        className={`${inputClass} appearance-none pr-9 cursor-pointer`}
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

// Static checkbox — not mapped to an API field (original behaviour preserved)
function Checkbox({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => setChecked(!checked)}
        className={`w-5 h-5 border rounded-[var(--radius-xs)] flex items-center justify-center transition-colors duration-150 ${
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
      <span className="text-sm text-[var(--color-text-hover)]">{label}</span>
    </label>
  );
}

const CC_OPTIONS = [
  {
    key: "attribution",
    title: "Attribution",
    description:
      "Allow others to copy, distribute, display and perform your copyrighted work but only if they give credit the way you request.",
  },
  {
    key: "noncommercial",
    title: "Noncommercial",
    description:
      "Allow others to distribute, display and perform your work—and derivative works based upon it—but for noncommercial purposes only.",
  },
  {
    key: "noderivative",
    title: "No Derivative Works",
    description:
      "Allow others to copy, distribute, display and perform only verbatim copies of your work, not derivative works based upon it.",
  },
  {
    key: "sharealike",
    title: "Share Alike",
    description:
      "Allow others to distribute derivative works only under a license identical to the license that governs your work.",
  },
];

function CCCheckbox({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="flex items-center gap-3 cursor-pointer"
        onClick={onChange}
      >
        <div
          className={`w-5 h-5 flex-shrink-0 border rounded-[var(--radius-xs)] flex items-center justify-center transition-colors duration-150 ${
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
        <span className="text-sm font-semibold text-[var(--color-text-hover)]">
          {title}
        </span>
      </label>
      <p className="text-xs text-[var(--color-text)] leading-relaxed pl-8">
        {description}
      </p>
    </div>
  );
}

function CreativeCommonsExpanded() {
  const [states, setStates] = useState<Record<string, boolean>>({
    attribution: true,
    noncommercial: true,
    noderivative: false,
    sharealike: true,
  });

  const toggle = (key: string) =>
    setStates((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="mt-4 ">
      {/* Icons + label */}

      <a
        className="justify-end flex items-center gap-1 mb-6"
        href="http://creativecommons.org/licenses/"
        target="_blank"
        rel="noreferrer"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M11.9786 0C15.3491 0 18.1924 1.15688 20.5069 3.47137C22.8349 5.80013 24 8.643 24 12C24 15.3716 22.8566 18.1785 20.5706 20.421C18.1421 22.8071 15.2782 24 11.9786 24C8.73525 24 5.92125 22.821 3.53587 20.4637C1.179 18.1065 0 15.2858 0 12C0 8.71463 1.179 5.87175 3.53587 3.47175C5.85038 1.15687 8.664 0 11.9786 0ZM12.0214 2.1645C9.29287 2.1645 6.98588 3.12187 5.1 5.03587C3.1425 7.03613 2.16412 9.35775 2.16412 12.0004C2.16412 14.6576 3.13538 16.9579 5.07788 18.8996C7.02075 20.8429 9.33488 21.8137 12.0206 21.8137C14.6918 21.8137 17.0209 20.8361 19.0065 18.8783C20.8924 17.064 21.8351 14.7712 21.8351 11.9996C21.8351 9.27112 20.8778 6.95025 18.9641 5.0355C17.0501 3.1215 14.7356 2.1645 12.0214 2.1645ZM15.2359 9.02137V13.9282H13.8649V19.7565H10.1359V13.9286H8.76487V9.02137C8.76487 8.80687 8.83988 8.625 8.9895 8.475C9.13988 8.32538 9.32213 8.25 9.53588 8.25H14.4649C14.6648 8.25 14.8436 8.325 15.0004 8.475C15.1567 8.625 15.2359 8.80725 15.2359 9.02137ZM10.3282 5.93587C10.3282 4.80788 10.8851 4.24312 12 4.24312C13.1149 4.24312 13.6714 4.80713 13.6714 5.93587C13.6714 7.05 13.1141 7.60725 12 7.60725C10.8859 7.60725 10.3282 7.05 10.3282 5.93587Z"
            fill="currentColor"
          />
        </svg>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M11.9783 0C15.3495 0 18.1924 1.15688 20.5069 3.471C22.8349 5.7855 24 8.62838 24 12C24 15.372 22.857 18.1785 20.5706 20.4217C18.1425 22.8075 15.2779 24 11.9783 24C8.721 24 5.907 22.8142 3.53587 20.4431C1.179 18.0855 0 15.2719 0 12C0 8.71425 1.179 5.87138 3.53587 3.47137C5.85 1.15725 8.664 0 11.9783 0ZM2.7 8.7645C2.343 9.75 2.16412 10.8289 2.16412 12.0004C2.16412 14.6576 3.13538 16.9579 5.07788 18.9004C7.035 20.8294 9.3495 21.7935 12.0206 21.7935C14.721 21.7935 17.049 20.8155 19.0069 18.8576C19.707 18.1864 20.2564 17.4863 20.6561 16.7569L16.1351 14.7428C15.9772 15.5002 15.5955 16.1179 14.9888 16.596C14.3805 17.0745 13.6631 17.3501 12.8348 17.421V19.2641H11.442V17.421C10.1134 17.4075 8.89875 16.929 7.79925 15.9859L9.44925 14.3145C10.2345 15.0428 11.1277 15.4069 12.1279 15.4069C12.5419 15.4069 12.8959 15.3146 13.1891 15.1283C13.4816 14.943 13.6286 14.6362 13.6286 14.2069C13.6286 13.9065 13.521 13.6639 13.3069 13.4783L12.15 12.9851L10.7359 12.342L8.82862 11.5061L2.7 8.7645ZM12.0214 2.14275C9.29288 2.14275 6.98588 3.10687 5.1 5.0355C4.62825 5.50725 4.18538 6.04275 3.77138 6.64313L8.35725 8.7C8.55713 8.0715 8.9355 7.56788 9.49312 7.1895C10.0496 6.81113 10.6999 6.60038 11.4431 6.55725V4.71413H12.8363V6.55725C13.9365 6.61463 14.9363 6.98588 15.8363 7.67138L14.2717 9.27863C13.5994 8.80725 12.9146 8.57175 12.2145 8.57175C11.8429 8.57175 11.511 8.64338 11.2185 8.78588C10.9256 8.92875 10.779 9.17175 10.779 9.5145C10.779 9.61462 10.8146 9.71438 10.8859 9.8145L12.4072 10.5008L13.4573 10.9721L15.3862 11.829L21.5351 14.5718C21.7357 13.7288 21.8355 12.8719 21.8355 12.0004C21.8355 9.243 20.8785 6.92175 18.9645 5.0355C17.0644 3.10687 14.7491 2.14275 12.0214 2.14275Z"
            fill="currentColor"
          />
        </svg>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M11.9786 0C15.3353 0 18.1777 1.16438 20.5069 3.49313C22.8349 5.80763 24 8.643 24 12C24 15.3577 22.8566 18.1714 20.5706 20.4427C18.1567 22.8142 15.2921 24 11.9786 24C8.73525 24 5.92125 22.8214 3.53587 20.4641C1.179 18.1073 0 15.2865 0 12.0004C0 8.72925 1.179 5.8935 3.53587 3.4935C5.86425 1.16438 8.67863 0 11.9786 0ZM12.0214 2.1645C9.29287 2.1645 6.98588 3.129 5.1 5.05763C3.1425 7.04363 2.16412 9.35775 2.16412 12C2.16412 14.6719 3.13538 16.9714 5.07788 18.9C7.02075 20.8433 9.33488 21.8141 12.0206 21.8141C14.6918 21.8141 17.0209 20.8357 19.0065 18.8786C20.8924 17.0501 21.8351 14.7574 21.8351 12C21.8351 9.25762 20.8778 6.94313 18.9641 5.05763C17.064 3.12825 14.7495 2.1645 12.0214 2.1645ZM6.66412 10.3069C6.8925 8.83537 7.485 7.69613 8.44238 6.88912C9.39937 6.08213 10.5634 5.67863 11.9351 5.67863C13.8202 5.67863 15.321 6.28613 16.4351 7.49963C17.5492 8.71387 18.1065 10.2713 18.1065 12.171C18.1065 14.0141 17.5279 15.546 16.3714 16.767C15.2134 17.988 13.7141 18.5993 11.8706 18.5993C10.5135 18.5993 9.342 18.1924 8.3565 17.3779C7.37063 16.5634 6.77813 15.4065 6.57788 13.9065H9.6C9.67125 15.3637 10.5499 16.0924 12.2359 16.0924C13.0781 16.0924 13.7572 15.7279 14.2714 14.9996C14.7863 14.2714 15.0435 13.2994 15.0435 12.0855C15.0435 10.8139 14.8076 9.84638 14.3366 9.18188C13.8649 8.51775 13.1869 8.1855 12.3004 8.1855C10.6999 8.1855 9.80025 8.89237 9.60038 10.3065H10.479L8.10075 12.6851L5.72213 10.3065L6.66412 10.3069Z"
            fill="currentColor"
          />
        </svg>
        <span className="text-sm text-[var(--color-text)] ml-1">
          Some rights reserved
        </span>
      </a>

      {/* 4-column grid */}
      <div className="grid grid-cols-4 gap-6">
        {CC_OPTIONS.map((opt) => (
          <CCCheckbox
            key={opt.key}
            checked={states[opt.key]}
            onChange={() => toggle(opt.key)}
            title={opt.title}
            description={opt.description}
          />
        ))}
      </div>
    </div>
  );
}

// ── UploadDefaults — wired to default_include_in_rss + default_license_type ──

function UploadDefaults({
  settings,
  onPatch,
}: {
  settings: ContentSettings;
  onPatch: (delta: Partial<ContentSettings>) => void;
}) {
  const includeRSS = settings.default_include_in_rss ?? false;
  const creativeCommons = settings.default_license_type === "creative_commons";

  return (
    <div>
      <SectionTitle info>Upload Defaults</SectionTitle>
      <div className="flex flex-col gap-4">
        {/* Include in RSS feed — wired to default_include_in_rss */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => onPatch({ default_include_in_rss: !includeRSS })}
            className={`w-5 h-5 border rounded-[var(--radius-xs)] flex items-center justify-center transition-colors duration-150 ${
              includeRSS
                ? "bg-[var(--color-text-hover)] border-[var(--color-text-hover)]"
                : "bg-transparent border-[var(--color-border)]"
            }`}
          >
            {includeRSS && (
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
          <span className="text-sm text-[var(--color-text-hover)]">
            Include in RSS feed
          </span>
        </label>

        {/* Creative Commons — wired to default_license_type */}
        <div>
          <label
            className="flex items-center gap-3 cursor-pointer"
            onClick={() =>
              onPatch({
                default_license_type: creativeCommons
                  ? "all_rights_reserved"
                  : "creative_commons",
              })
            }
          >
            <div
              className={`w-5 h-5 border rounded-[var(--radius-xs)] flex items-center justify-center transition-colors duration-150 ${
                creativeCommons
                  ? "bg-[var(--color-text-hover)] border-[var(--color-text-hover)]"
                  : "bg-transparent border-[var(--color-border)]"
              }`}
            >
              {creativeCommons && (
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
            <span className="text-sm text-[var(--color-text-hover)]">
              Creative Commons license
            </span>
          </label>
          {creativeCommons && <CreativeCommonsExpanded />}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function ContentPage() {
  const [settings, setSettings] = useState<ContentSettings>({
    rss_title: "",
    rss_language: "English",
    rss_category: "",
    rss_explicit: false,
    rss_show_email: false,
    default_include_in_rss: true,
    default_license_type: "all_rights_reserved",
  });
  // Snapshot of last-saved state so Cancel can revert
  const [saved, setSaved] = useState<ContentSettings>({ ...settings });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    getContentSettings()
      .then((data) => {
        if (data) {
          setSettings(data);
          setSaved(data);
        }
      })
      .catch(() => {});
  }, []);

  const patch = (delta: Partial<ContentSettings>) => {
    setSettings((prev) => ({ ...prev, ...delta }));
  };

  const handleSave = async () => {
    try {
      const updated = await updateContentSettings(settings);
      setSettings(updated);
      setSaved(updated);
      setToast({
        message: "Content settings saved successfully.",
        type: "success",
      });
    } catch {
      setToast({
        message: "Failed to save content settings.",
        type: "error",
      });
      // keep pending changes — user can retry
    }
  };

  const handleCancel = () => {
    setSettings(saved);
  };

  return (
    <>
      <div className="max-w-3xl flex flex-col gap-10 pb-24">
        {/* ── RSS Feed ── */}
        <div>
          <SectionTitle info>RSS feed</SectionTitle>

          {/* RSS feed URL + Email address displayed */}
          <div className="flex gap-6 mb-6">
            <div className="flex-[2]">
              <FieldLabel>RSS feed</FieldLabel>
              <input
                className={inputClass}
                readOnly
                defaultValue="https://feeds.rythmify.com/users/rythmify:users:483320034/sounds.rss"
                data-test="settings-content-rss-feed-input"
              />
            </div>
            <div className="flex-1">
              <FieldLabel>Email address displayed</FieldLabel>
              <SelectField
                value={settings.rss_show_email ? "display" : "dont"}
                onChange={(v) => patch({ rss_show_email: v === "display" })}
                dataTest="settings-content-rss-show-email-select"
              >
                <option value="dont">Don't display email address</option>
                <option value="display">Display email address</option>
              </SelectField>
            </div>
          </div>

          {/* Row 2: Custom feed title, Category, Stats-service URL prefix */}
          <div className="flex gap-6 mb-6">
            <div className="flex-1">
              <FieldLabel>Custom feed title</FieldLabel>
              <input
                className={inputClass}
                value={settings.rss_title ?? ""}
                onChange={(e) => patch({ rss_title: e.target.value })}
                data-test="settings-content-rss-title-input"
              />
            </div>
            <div className="flex-1">
              <FieldLabel required>Category</FieldLabel>
              <SelectField
                value={settings.rss_category ?? ""}
                onChange={(v) => patch({ rss_category: v })}
                dataTest="settings-content-rss-category-select"
              >
                <option value=""></option>
                <option>Arts</option>
                <option>Business</option>
                <option>Comedy</option>
                <option>Education</option>
                <option>Fiction</option>
                <option>Government</option>
                <option>Health & Fitness</option>
                <option>History</option>
                <option>Kids & Family</option>
                <option>Leisure</option>
                <option>Music</option>
                <option>News</option>
                <option>Religion & Spirituality</option>
                <option>Science</option>
                <option>Society & Culture</option>
                <option>Sports</option>
                <option>Technology</option>
                <option>True Crime</option>
                <option>TV & Film</option>
              </SelectField>
            </div>
            <div className="flex-1">
              <FieldLabel info>Stats-service URL prefix</FieldLabel>
              <input
                className={inputClass}
                placeholder="http://"
                data-test="settings-content-stats-service-url-input"
              />
            </div>
          </div>

          {/* Row 3: Custom author name, Language, Subscriber redirect */}
          <div className="flex gap-6 mb-6">
            <div className="flex-1">
              <FieldLabel>Custom author name</FieldLabel>
              <input
                className={inputClass}
                data-test="settings-content-author-name-input"
              />
            </div>
            <div className="flex-1">
              <FieldLabel required>Language</FieldLabel>
              <SelectField
                value={settings.rss_language ?? "English"}
                onChange={(v) => patch({ rss_language: v })}
                dataTest="settings-content-rss-language-select"
              >
                <option>English</option>
                <option>Arabic</option>
                <option>French</option>
                <option>German</option>
                <option>Spanish</option>
              </SelectField>
            </div>
            <div className="flex-1">
              <FieldLabel info>Subscriber redirect</FieldLabel>
              <input
                className={inputClass}
                placeholder="http://"
                data-test="settings-content-subscriber-redirect-input"
              />
            </div>
          </div>

          {/* Contains explicit content — wired to rss_explicit */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => patch({ rss_explicit: !settings.rss_explicit })}
              className={`w-5 h-5 border rounded-[var(--radius-xs)] flex items-center justify-center transition-colors duration-150 ${
                settings.rss_explicit
                  ? "bg-[var(--color-text-hover)] border-[var(--color-text-hover)]"
                  : "bg-transparent border-[var(--color-border)]"
              }`}
            >
              {settings.rss_explicit && (
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
            <span className="text-sm text-[var(--color-text-hover)]">
              Contains explicit content
            </span>
          </label>
        </div>

        {/* ── Upload Defaults ── */}
        <UploadDefaults settings={settings} onPatch={patch} />

        {/* Cancel + Save ── */}
        <div className="left-0 right-0 flex items-center justify-end gap-4 px-8 py-4 bg-[var(--color-bg)] ">
          <button
            onClick={handleCancel}
            data-test="settings-content-cancel-button"
            className="text-sm text-[var(--color-text-hover)] hover:opacity-70 transition-opacity duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            data-test="settings-content-save-button"
            className="px-5 py-2 text-sm bg-[var(--color-input-bg)] text-[var(--color-text-hover)] rounded-[var(--radius-sm)] hover:brightness-110 transition-all duration-150"
          >
            Save changes
          </button>
        </div>
      </div>
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
