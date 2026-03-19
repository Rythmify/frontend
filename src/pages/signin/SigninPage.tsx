import React from "react";

export default function SigninPage() {
  return <div>SigninPage</div>;
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";
import { Button } from "@heroui/react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import Email from "./Email";
import PasswordLogin from "./PasswordLogin";
import PasswordRegister from "./PasswordRegister";
import ForgotPassword from "./ForgotPassword";
import ForgotPasswordSent from "./ForgotPasswordSent";
import Profile from "./Profile";
import VerifyEmail from "./VerifyEmail";
import { useNavigate } from "react-router-dom";
import { login, register, resendVerification, getMe, forgotPassword } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "";

type Step = "main" | "email" | "login" | "register" | "forgot-password" | "forgot-password-sent" | "profile" | "verify-email";

function SigninFlow() {
  const [step, setStep] = useState<Step>("main");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [loginError, setLoginError] = useState("");



  function handleEmailContinue(resolvedEmail: string, exists: boolean) {
    setEmail(resolvedEmail);
    setStep(exists ? "login" : "register");
  }

  const card = "mt-20 container grid gap-7 bg-bg border-2 rounded-md border-input-bg w-lg p-8";

  if (step === "email") {
    return (
      <div className={card}>
        <Email onBack={() => setStep("main")} onContinue={handleEmailContinue} />
      </div>
    );
  }

  if (step === "login") {
<<<<<<< HEAD
    return (
      <div className={card}>
        <PasswordLogin
          email={email}
          onBack={() => setStep("email")}
          onContinue={(pw) => {
            // TODO: call login API with email + pw
            console.log("login", { email, pw });
          }}
          onForgotPassword={() => setStep("forgot-password")}
        />
      </div>
    );
  }
=======
  return (
    <div className={card}>
      {loginError && <p className="text-red-500 text-sm -mb-4">{loginError}</p>}
      <PasswordLogin
        email={email}
        onBack={() => setStep("email")}
        onContinue={async (pw) => {
          setLoginError("");
          try {
            const res = await login(email, pw);
            const me = await getMe();
            storeLogin({
              id: me.data.id,
              username: me.data.username,
              displayName: me.data.display_name,
              firstName: me.data.first_name,
              lastName: me.data.last_name,
              bio: me.data.bio,
              email: me.data.email,
              role: me.data.role,
              isPro: false,
              avatar: me.data.profile_picture,
              coverUrl: me.data.cover_photo,
              city: me.data.city,
              country: me.data.country,
              following_ids: [],
            }, res.data.access_token);
            navigate("/discover");
          } catch (err: any) {
            setLoginError(err?.response?.data?.error?.message ?? "Invalid credentials.");
          }
        }}
        onForgotPassword={() => setStep("forgot-password")}
      />
      <p className="text-sm text-center text-text-secondary">
        Don't have an account?{" "}
        <button
          onClick={() => setStep("register")}
          className="text-text-link hover:text-text-link-hover"
        >
          Create one
        </button>
      </p>
    </div>
  );
}

>>>>>>> 6c9d16e92b7f619bb9071f653c94fc76a8bd77fb

  if (step === "forgot-password") {
    return (
      <div className={card}>
        <ForgotPassword
          email={email}
          onBack={() => setStep("login")}
          onSend={async () => {
            try {
              await forgotPassword(email);
            } catch {
              // backend always returns 200 to avoid email enumeration
            }
            setStep("forgot-password-sent");
          }}
        />
      </div>
    );
  }

  if (step === "forgot-password-sent") {
    return (
      <div className={card}>
        <ForgotPasswordSent
          onBack={() => setStep("forgot-password")}
          onBackToLogin={() => setStep("login")}
        />
      </div>
    );
  }

  if (step === "register") {
    return (
      <div className={card}>
        <PasswordRegister
          email={email}
          onBack={() => setStep("email")}
          onContinue={(pw) => {
            setPassword(pw);
            setStep("profile");
          }}
        />
      </div>
    );
  }

  if (step === "profile") {
    return (
      <div className={card}>
        <Profile
          email={email}
          onBack={() => setStep("register")}
<<<<<<< HEAD
          onContinue={(data) => {
            // TODO: call register API
            console.log("register", {
              email,
              password,
              display_name: data.displayName,
              gender: data.gender.toLowerCase(),
              date_of_birth: `${data.dateOfBirth.year}-${String(MONTHS.indexOf(data.dateOfBirth.month) + 1).padStart(2, "0")}-${String(data.dateOfBirth.day).padStart(2, "0")}`,
              captcha_token: data.captchaToken,
            });
            setStep("verify-email");
=======
          onContinue={async (data) => {
            try {
              await register({
                email,
                password,
                display_name: data.displayName,
                gender: data.gender.toLowerCase() as "male" | "female",
                date_of_birth: `${data.dateOfBirth.year}-${String(MONTHS.indexOf(data.dateOfBirth.month) + 1).padStart(2, "0")}-${String(data.dateOfBirth.day).padStart(2, "0")}`,
                captcha_token: data.captchaToken,
              });
              setStep("verify-email");
            } catch (err: any) {
              alert(err?.response?.data?.error?.message ?? "Registration failed.");
            }
>>>>>>> 6c9d16e92b7f619bb9071f653c94fc76a8bd77fb
          }}
        />
      </div>
    );
  }

  if (step === "verify-email") {
    return (
      <div className={card}>
        <VerifyEmail
          email={email}
<<<<<<< HEAD
          onSendAgain={() => {
            // TODO: call resend verification email API
            console.log("resend verification email", { email });
=======
          onSendAgain={async () => {
            if (!executeRecaptcha) return;
            try {
              const captchaToken = await executeRecaptcha("resend_verification");
              await resendVerification(email, captchaToken);
            } catch {
              // silently fail — user can try again
            }
>>>>>>> 6c9d16e92b7f619bb9071f653c94fc76a8bd77fb
          }}
          onBackToLogin={() => setStep("main")}
        />
      </div>
    );
  }

  return (
    <div className={card}>
      <h1 className="text-text-hover max-w-sm">Sign in or create an account</h1>

      <p className="text-md font-bold text-text-secondary w-full">
        By clicking on any of the "Continue" buttons below, you agree to
        Rythmify's{" "}
        <a href="/terms" className="text-text-link hover:text-text-link-hover">
          Terms of Use
        </a>{" "}
        and acknowledge our{" "}
        <a href="/privacy" className="text-text-link hover:text-text-link-hover">
          Privacy Policy
        </a>
        .
      </p>

      <div className="grid gap-6">
        <Button data-test="btn-continue-facebook" className="flex items-center justify-center gap-2 text-center text-md font-bold text-white rounded-sm bg-[#003BB3] py-3 w-full">
          <FaFacebook className="text-xl" />
          Continue with Facebook
        </Button>

        <Button data-test="btn-continue-google" className="flex items-center justify-center gap-2 text-center text-md font-bold text-text-hover rounded-sm bg-input-bg py-3 w-full">
          <FcGoogle className="text-xl" />
          Continue with Google
        </Button>

        <Button data-test="btn-continue-apple" className="flex items-center justify-center gap-2 text-center text-md font-bold text-white rounded-sm bg-black py-3 w-full">
          <FaApple className="text-xl" />
          Continue with Apple
        </Button>
      </div>

      <div className="grid gap-5">
        <p className="text-text-hover text-md font-bold">Or with email</p>
        <input
          data-test="input-email"
          type="email"
          placeholder="Your email address or profile URL"
          className="w-full bg-input-bg text-text text-md px-4 py-4 rounded-sm border border-transparent outline-none placeholder:text-text-muted cursor-pointer"
          onFocus={() => setStep("email")}
          readOnly
        />
        <button
          data-test="btn-continue-email"
          onClick={() => setStep("email")}
          className="w-full bg-text-secondary text-bg text-md font-bold py-4 rounded-sm hover:opacity-90 transition-opacity"
        >
          Continue
        </button>
        <a href="/help" className="text-text-link hover:text-text-link-hover text-md">
          Need help?
        </a>
      </div>
    </div>
  );
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function SigninPage() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <SigninFlow />
    </GoogleReCaptchaProvider>
  );
}
