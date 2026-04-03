import { useState } from "react";

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
  defaultValue,
}: {
  children: React.ReactNode;
  defaultValue?: string;
}) {
  return (
    <div className="relative">
      <select
        className={`${inputClass} appearance-none pr-9 cursor-pointer`}
        defaultValue={defaultValue}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]">
        <ChevronDown />
      </span>
    </div>
  );
}

function Checkbox({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => setChecked(!checked)}
        className={`w-4 h-4 border rounded-[var(--radius-xs)] flex items-center justify-center transition-colors duration-150 ${
          checked
            ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
            : "bg-[var(--color-input-bg)] border-[var(--color-border)]"
        }`}
      >
        {checked && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 5l2.5 2.5L8 3"
              stroke="white"
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

export default function ContentPage() {
  return (
    <div className="max-w-3xl flex flex-col gap-10 pb-24">
      {/* ── RSS Feed ── */}
      <div>
        <SectionTitle info>RSS feed</SectionTitle>

        {/* RSS feed URL + Email address displayed */}
        <div className="flex gap-6 mb-6">
          <div className="flex-1">
            <FieldLabel>RSS feed</FieldLabel>
            <input
              className={inputClass}
              readOnly
              defaultValue="https://feeds.rythmify.com/users/rythmify:users:483320034/sounds.rss"
            />
          </div>
          <div className="w-64">
            <FieldLabel>Email address displayed</FieldLabel>
            <SelectField defaultValue="dont">
              <option value="dont">Don't display email address</option>
              <option value="display">Display email address</option>
            </SelectField>
          </div>
        </div>

        {/* Row 2: Custom feed title, Category, Stats-service URL prefix */}
        <div className="flex gap-6 mb-6">
          <div className="flex-1">
            <FieldLabel>Custom feed title</FieldLabel>
            <input className={inputClass} />
          </div>
          <div className="flex-1">
            <FieldLabel required>Category</FieldLabel>
            <SelectField>
              <option value=""></option>
              <option>Arts</option>
              <option>Business</option>
              <option>Comedy</option>
              <option>Education</option>
              <option>Music</option>
              <option>Technology</option>
            </SelectField>
          </div>
          <div className="flex-1">
            <FieldLabel info>Stats-service URL prefix</FieldLabel>
            <input className={inputClass} placeholder="http://" />
          </div>
        </div>

        {/* Row 3: Custom author name, Language, Subscriber redirect */}
        <div className="flex gap-6 mb-6">
          <div className="flex-1">
            <FieldLabel>Custom author name</FieldLabel>
            <input className={inputClass} />
          </div>
          <div className="flex-1">
            <FieldLabel required>Language</FieldLabel>
            <SelectField defaultValue="English">
              <option>English</option>
              <option>Arabic</option>
              <option>French</option>
              <option>German</option>
              <option>Spanish</option>
            </SelectField>
          </div>
          <div className="flex-1">
            <FieldLabel info>Subscriber redirect</FieldLabel>
            <input className={inputClass} placeholder="http://" />
          </div>
        </div>

        {/* Contains explicit content */}
        <Checkbox label="Contains explicit content" />
      </div>

      {/* ── Upload Defaults ── */}
      <div>
        <SectionTitle info>Upload Defaults</SectionTitle>
        <div className="flex flex-col gap-4">
          <Checkbox label="Include in RSS feed" />
          <Checkbox label="Creative Commons license" />
        </div>
      </div>

      {/* ─ Cancel + Save ── */}
      <div className=" left-0 right-0 flex items-center justify-end gap-4 px-8 py-4 bg-[var(--color-bg)] ">
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
