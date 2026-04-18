import { useState } from "react";
import { Modal } from "@/components/UI/Modal";
import { BlockUserModal } from "@/components/UI/BlockModal";

interface BlockButtonProps {
  userId: string;
  username: string;
  displayName?: string;
  isBlocked?: boolean;
  onBlockChange?: (blocked: boolean) => void;
}

export default function BlockButton({
  userId,
  username,
  displayName,
  isBlocked = false,
  onBlockChange,
}: BlockButtonProps) {
  const [open, setOpen] = useState(false);

  const label = displayName || username;

  return (
    <>
      <button
        data-test="block-button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
      >
        <i className="fa-solid fa-ban text-xs w-4" />
        {isBlocked ? `Blocked ${label}` : `Block ${label}`}
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <BlockUserModal
          username={label}
          userId={userId}
          onClose={() => setOpen(false)}
          onBlocked={() => {
            onBlockChange?.(true);
            setOpen(false);
          }}
        />
      </Modal>
    </>
  );
}
