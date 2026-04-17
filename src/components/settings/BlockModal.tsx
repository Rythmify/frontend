import { useState } from "react";

interface BlockModalProps {
  username: string;
  displayName: string;
  onConfirm: (opts: { removeContent: boolean; reportSpam: boolean }) => void;
  onCancel: () => void;
}

export default function BlockModal({
  username,
  displayName,
  onConfirm,
  onCancel,
}: BlockModalProps) {
  const [removeContent, setRemoveContent] = useState(false);
  const [reportSpam, setReportSpam] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-[#1a1a1a] rounded-xl shadow-2xl p-8">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-[var(--color-text)] hover:text-[var(--color-text-hover)] transition-colors"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 2l12 12M14 2L2 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-[var(--color-text-hover)] text-xl font-bold mb-5">
          Block {displayName}
        </h2>

        {/* Description */}
        <div className="mb-6">
          <p className="text-[var(--color-text-hover)] text-sm font-semibold mb-3">
            Blocking means that {displayName} will no longer be able to
          </p>
          <ul className="space-y-1 pl-1">
            {[
              "follow you,",
              "like your tracks,",
              "repost your tracks,",
              "send you messages,",
              "share tracks with you,",
              "post new comments on your tracks, or",
              "send you new stream or email notifications.",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-[var(--color-text-hover)]"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-text-hover)] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 mb-8">
          <CheckboxRow
            checked={removeContent}
            onChange={() => setRemoveContent((v) => !v)}
            label={`Also permanently remove this user's comments, reposts and likes of your tracks and playlists`}
          />
          <CheckboxRow
            checked={reportSpam}
            onChange={() => setReportSpam((v) => !v)}
            label={`Also report ${displayName} for spam`}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-sm text-[var(--color-text-hover)] hover:opacity-70 transition-opacity"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ removeContent, reportSpam })}
            className="px-5 py-2 text-sm font-semibold bg-[var(--color-text-hover)] text-[var(--color-bg)] rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity"
          >
            Block {displayName}
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        onClick={onChange}
        className={`mt-0.5 w-5 h-5 flex-shrink-0 border rounded-[var(--radius-xs)] flex items-center justify-center transition-colors duration-150 ${
          checked
            ? "bg-[var(--color-text-hover)] border-[var(--color-text-hover)]"
            : "bg-transparent border-[var(--color-border)] group-hover:border-[var(--color-border-light)]"
        }`}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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
      <span className="text-sm text-[var(--color-text-hover)] leading-relaxed">
        {label}
      </span>
    </label>
  );
}
