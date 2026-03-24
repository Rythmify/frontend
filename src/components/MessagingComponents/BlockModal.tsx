import { useState } from "react"
import { blockUser, submitReport } from "../../services/api/messaging/conversationApi"
import CheckBox from "./CheckBox"

interface BlockUserModalProps {
  username?: string
  userId?: string
  onClose?: () => void
  onBlocked?: (data: { blocker_id: string; blocked_id: string; created_at: string }) => void
}

export function BlockUserModal({
  username, userId, onClose, onBlocked,
}: BlockUserModalProps) {
  const [removeContent, setRemoveContent] = useState(false)
  const [reportSpam, setReportSpam]       = useState(false)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  const handleBlock = async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const blockRes = await blockUser(userId)
      if (reportSpam) {
        await submitReport({
          resource_type: "user",
          resource_id: userId,
          reason: "spam",
        })
      }
      if ("data" in blockRes) {
        onBlocked?.(blockRes.data)
      } else {
        onBlocked?.({ blocker_id: "", blocked_id: userId, created_at: "" })
      }
      onClose?.()
    } catch (err: unknown) {
      const axiosError = err as { response?: { status: number } }
      if (axiosError.response?.status === 401) {
        setError("Missing or invalid access token.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-test="block-user-modal" className="font-sans text-white select-none w-130">
      <h2 className="mb-5 text-xl font-bold tracking-tight">
        Block {username}
      </h2>
      <p className="mb-1 font-bold text-white text-m">
        Blocking means that {username} will no longer be able to
      </p>

      <ul className="pl-5 mb-8 text-sm font-bold text-white list-disc list-inside">
        <li className="font-medium">follow you,</li>
        <li className="font-medium">like your tracks,</li>
        <li className="font-medium">repost your tracks,</li>
        <li className="font-medium">send you messages,</li>
        <li className="font-medium">share tracks with you,</li>
        <li className="font-medium">post new comments on your tracks, or</li>
        <li className="font-medium">send you new stream or email notifications.</li>
      </ul>

      <div className="mb-6 space-y-3">
        <CheckBox
          label={`Also permanently remove this user's comments, reposts and likes of your tracks and playlists`}
          checked={removeContent}
          onChange={setRemoveContent}
        />
        <CheckBox
          label={`Also report ${username} for spam`}
          checked={reportSpam}
          onChange={setReportSpam}
        />
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-400">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <button
          data-test="block-cancel-button"
          onClick={onClose}
          disabled={loading}
          className="px-5 py-2 text-sm font-semibold bg-[#333] hover:bg-[#444] text-white transition-colors rounded-sm disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          data-test="block-user-button"
          onClick={handleBlock}
          disabled={loading}
          className="px-5 py-2 text-sm font-semibold text-black transition-colors bg-white rounded-sm hover:bg-gray-200 disabled:opacity-50"
        >
          {`Block ${username}`}
        </button>
      </div>
    </div>
  )
}