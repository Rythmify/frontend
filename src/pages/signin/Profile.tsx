import { useState } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

interface ProfileData {
  displayName: string;
  dateOfBirth: { month: string; day: string; year: string };
  gender: string;
  captchaToken: string;
}

interface Props {
  email: string;
  onBack: () => void;
  onContinue: (data: ProfileData) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => String(currentYear - 13 - i));

function FloatingSelect({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  error?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value !== "";

  return (
    <div className={`relative bg-input-bg rounded-sm border transition-colors ${error ? "border-red-500" : focused ? "border-text-secondary" : "border-transparent"}`}>
      <label
        className={`absolute left-4 pointer-events-none transition-all duration-150 ${
          floated ? "top-1.5 text-xs text-text-secondary" : "top-1/2 -translate-y-1/2 text-md text-text-muted"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent text-text text-md px-4 pt-6 pb-2 outline-none appearance-none cursor-pointer pr-8"
        >
          <option value="" disabled hidden />
          {options.map((o) => (
            <option key={o} value={o} className="bg-bg">
              {o}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className="absolute right-3 top-1/4 translate-y-1 text-bg pointer-events-none" />
      </div>
    </div>
  );
}

export default function Profile({ email, onBack, onContinue }: Props) {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const defaultDisplayName = email.split("@")[0];
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [displayNameFocused, setDisplayNameFocused] = useState(false);

  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [gender, setGender] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const displayNameFloated = displayNameFocused || displayName.length > 0;

  function validate() {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = "Please enter a display name.";
    if (!month) e.month = "Required";
    if (!day) e.day = "Required";
    if (!year) e.year = "Required";
    if (!gender) e.gender = "Please select a gender.";
    return e;
  }

  async function handleContinue() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (!executeRecaptcha) { setErrors({ form: "reCAPTCHA not ready. Please try again." }); return; }

    setLoading(true);
    try {
      const captchaToken = await executeRecaptcha("register");
      onContinue({
        displayName: displayName.trim(),
        dateOfBirth: { month, day, year },
        gender,
        captchaToken,
      });
    } catch {
      setErrors({ form: "reCAPTCHA failed. Please try again." });
    } finally {
      setLoading(false);
    }
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
        <h4 className="text-text-hover text-center ms-10">Tell us more about you</h4>
      </div>

      <div className="grid gap-5">

        {/* Display name */}
        <div className="grid gap-1.5">
          <div className={`relative bg-input-bg rounded-sm border transition-colors ${errors.displayName ? "border-red-500" : displayNameFocused ? "border-text-secondary" : "border-transparent"}`}>
            <label
              className={`absolute left-4 pointer-events-none transition-all duration-150 ${
                displayNameFloated ? "top-1.5 text-sm text-text-secondary" : "top-1/2 -translate-y-1/2 text-md text-text-muted"
              }`}
            >
              Display name
            </label>
            <input
              data-test="input-display-name"
              type="text"
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setErrors((prev) => ({ ...prev, displayName: "" })); }}
              onFocus={() => setDisplayNameFocused(true)}
              onBlur={() => setDisplayNameFocused(false)}
              className="w-full bg-transparent text-text-hover text-md px-4 pt-6 pb-2 outline-none"
            />
          </div>
          {errors.displayName && <p className="text-red-500 text-sm">{errors.displayName}</p>}
          <p className="text-text-secondary text-sm">Your display name can be anything you like. Your name or artist name are good choices.</p>
        </div>

        {/* Date of birth */}
        <div className="grid gap-2">
          <p className="text-text-hover text-md font-bold">Date of birth (required)</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <FloatingSelect label="Month"  value={month} onChange={(v) => { setMonth(v); setErrors((p) => ({ ...p, month: "" })); }} options={MONTHS} error={!!errors.month} />
            </div>
            <div>
              <FloatingSelect label="Day" value={day} onChange={(v) => { setDay(v); setErrors((p) => ({ ...p, day: "" })); }} options={DAYS} error={!!errors.day} />
            </div>
            <div>
              <FloatingSelect label="Year" value={year} onChange={(v) => { setYear(v); setErrors((p) => ({ ...p, year: "" })); }} options={YEARS} error={!!errors.year} />
            </div>
          </div>
          {(errors.month || errors.day || errors.year) && <p className="text-red-500 text-sm">Please complete your date of birth.</p>}
          <p className="text-text-secondary text-sm">Your date of birth is used to verify your age and is not shared publicly.</p>
        </div>

        {/* Gender */}
        <div className="grid gap-1.5">
          <FloatingSelect
            label="Gender (required)"
            value={gender}
            onChange={(v) => { setGender(v); setErrors((p) => ({ ...p, gender: "" })); }}
            options={["Male", "Female", "Custom", "Prefer not to say"]}
            error={!!errors.gender}
          />
          {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
        </div>

        {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}

        <button
          data-test="btn-continue"
          onClick={handleContinue}
          disabled={loading}
          className="w-full bg-white text-black text-md font-bold py-4 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Continue"}
        </button>
      </div>
    </>
  );
}
