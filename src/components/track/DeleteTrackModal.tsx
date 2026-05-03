import { useState } from "react";
import { Modal } from "../MessagingComponents/Modal";
import { deleteTrack } from "@/services/api/upload/track.service";

interface DeleteTrackModalProps {
  trackId: string;
  trackTitle: string;
  onClose: () => void;
  /** Called after the track has been successfully deleted */
  onDeleted: () => void;
}

export default function DeleteTrackModal({
  trackId,
  trackTitle,
  onClose,
  onDeleted,
}: DeleteTrackModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteTrack(trackId);
      onDeleted();
      onClose();
    } catch {
      setError("Failed to delete track. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose}>
      <div className="w-[420px] bg-bg flex flex-col gap-3">
        <h2 className="text-text-upload text-[17px] font-bold">
          Delete track
        </h2>
        <p className="text-white text-sm leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-white/90">{trackTitle}</span>?
          This action cannot be undone.
        </p>

        {error && <p className="text-[#FB2C36] text-sm">{error}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <button
            data-test="button-cancel-delete-track"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-sm font-bold text-white hover:text-[#717171] transition-colors cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            data-test="button-confirm-delete-track"
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 text-bg bg-[#FB2C36] text-sm font-bold rounded-sm hover:opacity-80 transition-opacity disabled:opacity-40 cursor-pointer"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
