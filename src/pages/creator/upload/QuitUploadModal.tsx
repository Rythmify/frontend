import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const QuitUploadModal = ({ isOpen, onClose, onConfirm }: Props) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#121212] p-8 rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* close button */}
        <button
          data-test="close-quit-modal-button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#303030] hover:bg-[#404040] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg viewBox="0 0 16 16" className="w-4 h-4 text-white" fill="currentColor">
            <path d="M6.94 8l-4.47 4.47 1.06 1.06L8 9.06l4.47 4.47 1.06-1.06L9.06 8l4.47-4.47-1.06-1.06L8 6.94 3.53 2.47 2.47 3.53 6.94 8z" />
          </svg>
        </button>

        <h2 className="text-white text-xl font-bold mb-4 pr-10">
          Are you sure you want to quit?
        </h2>

        {/* Body */}
        <p className="text-[#efefef] text-[16px] mb-10">
          Your changes will not be saved.
        </p>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4">
          <button
            data-test="back-to-upload-button"
            onClick={onClose}
            className="text-white text-sm font-bold hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none"
          >
            Back to upload
          </button>
          <button
            data-test="quit-upload-button"
            onClick={onConfirm}
            className="bg-[#EC5261] hover:bg-[#f78ca1] text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors cursor-pointer"
          >
            Quit upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuitUploadModal;