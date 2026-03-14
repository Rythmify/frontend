import { useState } from "react";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

interface Props {
  email: string;
  onBack: () => void;
  onContinue: (password: string) => void;
}

export default function SigninPasswordRegisterStep({ email, onBack, onContinue }: Props) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");

  const floated = focused || password.length > 0;

  function handleContinue() {
    if (!password) {
      setError("Please choose a password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    onContinue(password);
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
        <h4 className="text-text-hover text-center ms-20">Create an account</h4>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-1">
          <p className="text-text-secondary text-sm font-semibold">Your email address</p>
          <p className="text-text-hover text-md">{email}</p>
        </div>

        <div className="grid gap-1.5">
          <div className={`relative flex items-center bg-input-bg rounded-sm border-1 transition-colors ${error ? "border-red-500" : focused ? "border-text-secondary" : "border-transparent"}`}>
            <div className="relative flex-1">
              <label
                className={`absolute left-4 pointer-events-none transition-all duration-150 ${
                  floated
                    ? "top-1.5 text-xs text-text-secondary"
                    : "top-1/2 -translate-y-1/2 text-md text-text-muted"
                }`}
              >
                Choose a password (min. 8 characters)
              </label>
              <input
                autoFocus
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                className="w-full bg-transparent text-text text-md px-4 pt-6 pb-2 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="px-4 text-text-secondary hover:text-text-hover transition-colors shrink-0"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
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
