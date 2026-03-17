import { useState } from "react";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

interface Props {
  email: string;
  onBack: () => void;
  onContinue: (password: string) => void;
  onForgotPassword: () => void;
}

export default function PasswordLogin({ email, onBack, onContinue, onForgotPassword }: Props) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");

  const floated = focused || password.length > 0;

  function handleContinue() {
    if (!password) {
      setError("Please enter your password.");
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
          data-test="btn-back"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-input-bg text-text-hover hover:bg-border transition-colors shrink-0"
        >
          <ChevronLeft size={25} />
        </button>
        <h4 className="text-text-hover text-center ms-25">Welcome back!</h4>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-1">
          <p className="text-text-secondary text-sm font-semibold">Your email address or profile URL</p>
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
                Your Password (min. 8 characters)
              </label>
              <input
                data-test="input-password"
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
                className="w-full bg-transparent text-text text-md px-4 pt-6 pb-2 outline-none [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_var(--color-input-bg)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--color-text)]"
              />
            </div>
            <button
              data-test="btn-toggle-password"
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
          data-test="btn-continue"
          onClick={handleContinue}
          className={`w-full text-md font-bold py-4 rounded-sm transition-all ${
            password.length >= 8
              ? "!bg-text-hover !text-bg"
              : "!bg-text-secondary !text-bg"
          }`}
        >
          Continue
        </button>

        <button
          data-test="btn-forgot-password"
          onClick={onForgotPassword}
          className="text-text-link hover:text-text-link-hover text-md text-left"
        >
          Forgot your password?
        </button>
      </div>
    </>
  );
}
