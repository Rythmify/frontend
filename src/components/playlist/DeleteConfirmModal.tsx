import { useState } from "react";
import { Modal } from "../MessagingComponents/Modal";
import { deletePlaylist } from "@/services/api/playlist/playlist.service";

interface DeleteConfirmModalProps {
  playlistId: string;
  playlistName: string;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteConfirmModal({
  playlistId,
  playlistName,
  onClose,
  onDeleted,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deletePlaylist(playlistId);
      onDeleted();
      onClose();
    } catch {
      setError("Failed to delete playlist. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose}>
      <div className="w-[420px] bg-bg flex flex-col gap-3">
        <h2 className="text-text-upload text-[17px] font-bold">
          Delete playlist
        </h2>
        <p className="text-white text-sm leading-relaxed">
          Are you sure you want to delete {playlistName}? This action cannot be undone.
        </p>

        {error && <p className="text-[#FB2C36] text-sm">{error}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <button
            data-test="button-cancel-delete"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-sm font-bold text-white hover:text-[#717171] transition-colors cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            data-test="button-confirm-delete"
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 text-bg bg-bg-inverted text-sm font-bold rounded-sm hover:opacity-80 transition-opacity disabled:opacity-40 cursor-pointer"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}