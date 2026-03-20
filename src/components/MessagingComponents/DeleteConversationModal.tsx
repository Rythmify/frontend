import { useState } from 'react';
import { deleteConversation, submitReport } from '@/services/api/messaging/conversationApi';
import CheckBox from './CheckBox';

interface DeleteConversationModalProps {
  conversationId: string;
  participantId: string;
  onClose: () => void;
  onDeleted?: (conversationId: string) => void;
}

export default function DeleteConversationModal({
  conversationId,
  participantId,
  onClose,
  onDeleted,
}: DeleteConversationModalProps) {
  const [reportAsSpam, setReportAsSpam] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleArchive = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      if (reportAsSpam) {
        await submitReport({
          resource_type: 'user',
          resource_id: participantId,
          reason: 'spam',
        });
      }
      await deleteConversation(conversationId);
      onDeleted?.(conversationId);
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dcm-title"
    >
      <div className="w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl">
        <h2 id="dcm-title" className="mb-2 text-base font-bold text-white">
          Are you sure?
        </h2>

        <p className="mb-4 text-sm leading-snug text-gray-400">
          Archiving a conversation removes it from your messages and will be
          restored if you contact this user again.
        </p>

        <div className="mb-5">
          <CheckBox
            label="Also report conversation as spam"
            checked={reportAsSpam}
            onChange={setReportAsSpam}
          />
        </div>

        {error && (
          <p className="mb-3 text-xs text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2 text-sm font-semibold text-gray-400 transition-colors rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleArchive}
            disabled={isDeleting}
            className="px-5 py-2 text-sm font-semibold text-black transition-colors bg-white rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            {isDeleting ? 'Archiving…' : 'Archive'}
          </button>
        </div>
      </div>
    </div>
  );
}