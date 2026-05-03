import { handleExternalAbuse, handleExternalImpersonation, handleExternalOther, handleExternalTrademark } from "../MessagingComponents/externalhandler"
interface ReportAccountModalProps {
  username?: string
  userId?: string
  onClose?: () => void
  onSpamSelected?: () => void
}
export function ReportModal({
  username,
  userId,
  onClose,
  onSpamSelected,
}: ReportAccountModalProps) {
    
  const handleSpam = () => {
    onClose?.()
    onSpamSelected?.()
  }
  return (
    <div data-test="report-account-modal" className="font-sans text-white select-none w-full sm:w-135">
      <h2 className="mb-5 text-xl font-bold tracking-tight">
        Report account for
      </h2>
      <ul className="ml-5 space-y-1 mb-15">
        <li>
          <button
            data-test="report-spam-button"
            onClick={handleSpam}
            className="text-sm font-semibold text-[#557EC8] hover:underline"
          >
            Spam
          </button>
        </li>
        <li>
          <button
            data-test="report-impersonation-button"
            onClick={handleExternalImpersonation}
            className="text-sm font-semibold text-[#557EC8] hover:underline"
          >
            Impersonation
          </button>
        </li>
        <li>
          <button
            data-test="report-abuse-button"
            onClick={handleExternalAbuse}
            className="text-sm font-semibold text-[#557EC8] hover:underline"
          >
            Abuse
          </button>
        </li>
        <li>
          <button
            data-test="report-trademark-button"
            onClick={handleExternalTrademark}
            className="text-sm font-semibold text-[#557EC8] hover:underline"
          >
            Trademark infringement
          </button>
        </li>
        <li>
          <button
            data-test="report-other-button"
            onClick={handleExternalOther}
            className="text-sm font-semibold text-[#557EC8] hover:underline"
          >
            Other
          </button>
        </li>
      </ul>

      <div>
        <p className="mb-2 font-bold text-white text-m">Disclaimer</p>
        <p className="text-sm font-semibold leading-relaxed text-white">
          Reported accounts are reviewed by a specialist team who take action if the account's
          content or activity violates our{" "}
          <a
            href="https://soundcloud.com/pages/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#557EC8] hover:underline"
          >
            Guidelines
          </a>{" "}
          or{" "}
          <a
            href="https://soundcloud.com/terms-of-use"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#557EC8] hover:underline"
          >
            Terms
          </a>
          . Repeated violation or serious breaches can result in the permanent deletion of accounts.
        </p>
      </div>
    </div>
  )
}