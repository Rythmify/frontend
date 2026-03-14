import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { checkEmail } from "../../services/auth.service";

interface Props {
  onBack: () => void;
  onContinue: (email: string, exists: boolean) => void;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function SigninEmailStep({ onBack, onContinue }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleContinue() {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    const { exists } = await checkEmail(email);
    onContinue(email, exists);
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-input-bg text-text-hover hover:bg-border transition-colors shrink-0"
        >
          <ChevronLeft size={25} />
        </button>
        <h4 className="text-text-hover text-center ms-9">Sign in or create an account</h4>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-1.5">
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            placeholder="Your email address or profile URL"
            className={`w-full bg-input-bg text-text text-md px-4 py-4 rounded-sm border outline-none placeholder:text-text-muted transition-colors ${
              error ? "border-red-500" : "border-transparent focus:border-text-secondary"
            }`}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-text-secondary text-bg text-md font-bold py-4 rounded-sm hover:opacity-90 transition-opacity"
        >
          Continue
        </button>

        <a href="/help" className="text-text-link hover:text-text-link-hover text-md">
          Need help?
        </a>
      </div>
    </>
  );
}
