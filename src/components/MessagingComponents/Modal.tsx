// Modal.tsx
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-test="modal-backdrop"
      className="fixed inset-0 flex z-[9999] overflow-y-auto bg-bg-inverted/40 flex-col "
      onClick={onClose} // clicking backdrop closes it
    >
      <div className="relative mt-10 mr-10">
        <button
          data-test="modal-close-button"
          className="bg-[#303030]  w-10 h-10 rounded-full absolute top-0 right-0 flex items-center justify-center "
          onClick={onClose}
        >
          <svg
            color="white"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="w-6 h-6"
          >
            <path
              d="M6.94 8l-4.47 4.47 1.06 1.06L8 9.06l4.47 4.47 1.06-1.06L9.06 8l4.47-4.47-1.06-1.06L8 6.94 3.53 2.47 2.47 3.53 6.94 8z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      <div
        className="self-center inline-block my-19 p-6 mt-10 bg-bg rounded-sm"
        onClick={(e) => e.stopPropagation()} // prevent backdrop click
      >
        {children}
      </div>
    </div>
  );
}
