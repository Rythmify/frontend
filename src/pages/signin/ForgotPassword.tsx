import { ChevronLeft } from "lucide-react";

interface Props {
  email: string;
  onBack: () => void;
  onSend: () => void;
}

export default function ForgotPassword({ email, onBack, onSend }: Props) {
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
        <h4 className="text-text-hover text-center ms-20">Reset password</h4>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-1 bg-input-bg rounded-sm px-4 py-3">
          <p className="text-text-secondary text-xs font-semibold">Your email address</p>
          <p className="text-text-hover text-md">{email}</p>
        </div>

        <p className="text-text-secondary text-md">
          If the email address is in our database, we will send you an email to reset your
          password.{" "}
          <span>Need help? </span>
          <a href="/help" className="text-text-link hover:text-text-link-hover">
            visit our Help Center
          </a>
          .
        </p>

        <button
          data-test="btn-send-reset-link"
          onClick={onSend}
          className="w-full bg-text-hover text-black text-md font-bold py-4 rounded-sm hover:opacity-90 transition-opacity"
        >
          Send reset link
        </button>
      </div>
    </>
  );
}
