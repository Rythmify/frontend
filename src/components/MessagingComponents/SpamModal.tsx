import { useState } from "react"
import { submitReport } from "../../services/api/messaging/conversationApi"
interface ReportSpamModalProps {
  username?: string
  userId?: string
  onClose?: () => void
  onReported?: () => void
}
export function SpamModal({
  username,
  userId,
  onClose,
  onReported,
}: ReportSpamModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const handleReport = async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      await submitReport({
        resource_type: "user",
        resource_id: userId,
        reason: "spam",
      })
      onReported?.()
      onClose?.()
    } catch (err: unknown) {
      const axiosError = err as { response?: { status: number } }
      const status = axiosError.response?.status
      if (status === 401) {
        setError("Missing or invalid access token.")
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <div data-test="spam-report-modal" className="font-sans text-white select-none w-130">
      <h2 className="mb-5 tracking-tight font-etrabold text-[22px]" data-test="spam-report-title">
        Report Spam
      </h2>

      <p className="mb-3 text-sm font-bold text-white">
        Reporting {username} for spam:
      </p>

      <ul className="pl-5 mb-8 text-sm font-semibold text-white list-disc list-inside">
        <li >Removes their comments, reposts and likes from your tracks and playlists</li>
        <li>Blocks them from interacting with you</li>
        <li>Sends SoundCloud a spam report</li>
      </ul>

      {error && (
        <p className="mb-4 text-sm text-red-400">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <button
          data-test="spam-cancel-button"
          onClick={onClose}
          disabled={loading}
          className="px-5 py-2 text-sm font-semibold bg-[#333] hover:text-[#838383] text-white transition-colors rounded-sm disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          data-test="spam-report-button"
          onClick={handleReport}
          disabled={loading}
          className="px-5 py-2 text-sm font-bold text-black transition-colors bg-white rounded-sm hover:text-gray-400 disabled:opacity-50"
        >
          {"Report spam"}
        </button>
      </div>
    </div>
  )
}