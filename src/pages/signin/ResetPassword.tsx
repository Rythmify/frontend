import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword } from "@/services/auth.service";

const rules = (pw: string) => [
  { label: "At least 8 characters", valid: pw.length >= 8 },
  { label: "At least one uppercase letter", valid: /[A-Z]/.test(pw) },
  { label: "At least one lowercase letter", valid: /[a-z]/.test(pw) },
  { label: "At least one number", valid: /[0-9]/.test(pw) },
];

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [signOutEverywhere, setSignOutEverywhere] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordRules = rules(password);
  const passwordValid = passwordRules.every((r) => r.valid);
  const passwordsMatch = password === confirm;
  const canSubmit = passwordValid && confirm.length > 0 && passwordsMatch && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetPassword(token!, password, confirm, signOutEverywhere);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded px-20 py-14">
        {!token ? (
          <div className="grid gap-4 text-center">
            <h2 className="text-gray-900 text-2xl font-normal">Invalid reset link</h2>
            <p className="text-gray-500 text-sm">
              This password reset link is invalid or has expired.
            </p>
            <button
              data-test="btn-back-to-signin"
              onClick={() => navigate("/signin")}
              className="text-blue-500 hover:underline text-sm"
            >
              Back to sign in
            </button>
          </div>
        ) : success ? (
          <div className="grid gap-6 text-center">
            <h2 className="text-gray-900 text-2xl font-normal">Password changed!</h2>
            <p className="text-gray-500 text-sm">
              Your password has been updated successfully.
            </p>
            <button
              data-test="btn-signin"
              onClick={() => navigate("/signin")}
              className="w-full py-3 rounded-sm bg-[#f50] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-7">
            {/* Heading */}
            <div className="grid gap-3 text-center">
              <h2 className="text-gray-900 text-3xl font-normal">Change your password</h2>
              <div className="grid gap-0.5">
                <p className="text-gray-500 text-sm">Choose a strong, unique password.</p>
                <p className="text-gray-500 text-sm">
                  For tips on choosing a secure password,{" "}
                  <span className="text-blue-500 cursor-default">visit our Help Center.</span>
                </p>
              </div>
            </div>

            {/* New password */}
            <div className="grid gap-1.5">
              <label className="text-gray-800 text-sm">Type your new password</label>
              <div className="relative flex items-center">
                <input
                  data-test="input-password"
                  autoFocus
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full bg-gray-100 border-0 rounded-sm px-3 py-3 pr-10 text-gray-900 text-sm outline-none focus:ring-1 focus:ring-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password.length > 0 && (
                <ul className="grid gap-1 mt-1">
                  {passwordRules.map((r) => (
                    <li
                      key={r.label}
                      className={`text-xs flex items-center gap-1.5 ${r.valid ? "text-green-600" : "text-gray-400"}`}
                    >
                      <span>{r.valid ? "✓" : "✗"}</span> {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div className="grid gap-1.5">
              <label className="text-gray-800 text-sm">Type your new password again, to confirm</label>
              <div className="relative flex items-center">
                <input
                  data-test="input-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit(e as any)}
                  className="w-full bg-gray-100 border-0 rounded-sm px-3 py-3 pr-10 text-gray-900 text-sm outline-none focus:ring-1 focus:ring-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 text-gray-500 hover:text-gray-700"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirm && !passwordsMatch && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match.</p>
              )}
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            {/* Sign out everywhere checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                data-test="checkbox-sign-out-everywhere"
                type="checkbox"
                checked={signOutEverywhere}
                onChange={(e) => setSignOutEverywhere(e.target.checked)}
                className="w-4 h-4 accent-[#f50]"
              />
              <span className="text-gray-800 text-sm">Also sign me out everywhere</span>
            </label>

            {/* Save button */}
            <button
              data-test="btn-save"
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3 rounded-sm text-sm font-semibold transition-all ${
                canSubmit
                  ? "bg-gray-700 text-white hover:bg-gray-800 cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
