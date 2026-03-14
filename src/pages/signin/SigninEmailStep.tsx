import { ChevronLeft } from "lucide-react";

interface Props {
  onBack: () => void;
}

export default function SigninEmailStep({ onBack }: Props) {
  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-input-bg text-text-hover hover:bg-border transition-colors shrink-0"
        >
          <ChevronLeft size={25} />
        </button>
        <h4 className="text-text-hover text-center ms-9 ">Sign in or create an account</h4>
      </div>

      <div className="grid gap-5">
        <input
          autoFocus
          type="email"
          placeholder="Your email address or profile URL"
          className="w-full bg-input-bg text-text text-md px-4 py-4 rounded-sm border border-transparent focus:border-text-secondary outline-none placeholder:text-text-muted"
        />
        <button className="w-full bg-text-secondary text-bg text-md font-bold py-4 rounded-sm hover:opacity-90 transition-opacity">
          Continue
        </button>
        <a href="/help" className="text-text-link hover:text-text-link-hover text-md">
          Need help?
        </a>
      </div>
    </>
  );
}
