import { ChevronLeft } from "lucide-react";

interface Props {
  onBack: () => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordSent({ onBack, onBackToLogin }: Props) {
  return (
    <>
      <div className="flex items-center gap-3">
        <button
          data-test="btn-back"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-input-bg text-text-hover hover:bg-border transition-colors shrink-0"
        >
          <ChevronLeft size={25} />
        </button>
        <h4 className="text-text-hover text-center ms-25">Reset password</h4>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <p className="text-text-hover text-lg font-bold">Check your email</p>
          <p className="text-text-secondary text-md">
            We've sent instructions on how to change your password to your email address.
          </p>
        </div>

        <button
          data-test="btn-back-to-login"
          onClick={onBackToLogin}
          className="w-full bg-white text-black text-md font-bold py-4 rounded-sm hover:opacity-90 transition-opacity"
        >
          Back to login
        </button>

        <p className="text-text-secondary text-sm">
          Did not receive the email? Check your spam folder or{" "}
          <a href="/help" className="text-text-link hover:text-text-link-hover">
            visit our Help Center
          </a>
          .
        </p>
      </div>
    </>
  );
}
