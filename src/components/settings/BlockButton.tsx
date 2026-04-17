import { useState } from "react";
import { blockUser, unblockUser } from "@/services/user.service";
import BlockModal from "./BlockModal";

interface BlockButtonProps {
  userId: string;
  username: string;
  displayName: string;
  isBlocked?: boolean;
  onBlockChange?: (blocked: boolean) => void;
  /** Show as icon-only (for compact layouts) */
  iconOnly?: boolean;
}

export default function BlockButton({
  userId,
  username,
  displayName,
  isBlocked: initialBlocked = false,
  onBlockChange,
  iconOnly = false,
}: BlockButtonProps) {
  const [isBlocked, setIsBlocked] = useState(initialBlocked);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBlockConfirm = async () => {
    setLoading(true);
    try {
      await blockUser(userId);
      setIsBlocked(true);
      onBlockChange?.(true);
    } catch {
      // silently revert
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    try {
      await unblockUser(userId);
      setIsBlocked(false);
      onBlockChange?.(false);
    } catch {
      // silently revert
    } finally {
      setLoading(false);
    }
  };

  if (isBlocked) {
    return (
      <button
        onClick={handleUnblock}
        disabled={loading}
        className={`flex items-center gap-1.5 text-sm font-semibold text-[var(--color-error)] border border-[var(--color-error)] rounded-[var(--radius-sm)] transition-all duration-150 hover:bg-[var(--color-error)] hover:text-white disabled:opacity-50 ${
          iconOnly ? "p-2" : "px-3 py-1.5"
        }`}
        title="Unblock user"
      >
        <BlockIcon />
        {!iconOnly && <span>Blocked</span>}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className={`flex items-center gap-1.5 text-sm text-[var(--color-text)] border border-[var(--color-border)] rounded-[var(--radius-sm)] transition-all duration-150 hover:border-[var(--color-border-light)] hover:text-[var(--color-text-hover)] disabled:opacity-50 ${
          iconOnly ? "p-2" : "px-3 py-1.5"
        }`}
        title="Block user"
      >
        <BlockIcon />
        {!iconOnly && <span>Block</span>}
      </button>

      {showModal && (
        <BlockModal
          username={username}
          displayName={displayName}
          onConfirm={handleBlockConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  );
}

function BlockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.93 4.93l14.14 14.14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
