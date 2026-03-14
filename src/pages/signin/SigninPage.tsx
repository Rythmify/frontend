import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";
import { Button } from "@heroui/react";
import SigninEmailStep from "./SigninEmailStep";
import SigninPasswordLoginStep from "./SigninPasswordLoginStep";
import SigninPasswordRegisterStep from "./SigninPasswordRegisterStep";

type Step = "main" | "email" | "login" | "register";

export default function SigninPage() {
  const [step, setStep] = useState<Step>("main");
  const [email, setEmail] = useState("");

  function handleEmailContinue(resolvedEmail: string, exists: boolean) {
    setEmail(resolvedEmail);
    setStep(exists ? "login" : "register");
  }

  if (step === "email") {
    return (
      <div className="mt-20 container grid gap-7 bg-bg border-2 rounded-md border-input-bg w-lg p-8">
        <SigninEmailStep
          onBack={() => setStep("main")}
          onContinue={handleEmailContinue}
        />
      </div>
    );
  }

  if (step === "login") {
    return (
      <div className="mt-20 container grid gap-7 bg-bg border-2 rounded-md border-input-bg w-lg p-8">
        <SigninPasswordLoginStep
          email={email}
          onBack={() => setStep("email")}
          onContinue={(password) => {
            //  call login API with email + password
            console.log("login", { email, password });
          }}
        />
      </div>
    );
  }

  if (step === "register") {
    return (
      <div className="mt-20 container grid gap-7 bg-bg border-2 rounded-md border-input-bg w-lg p-8">
        <SigninPasswordRegisterStep
          email={email}
          onBack={() => setStep("email")}
          onContinue={(password) => {
            //  call register API with email + password
            console.log("register", { email, password });
          }}
        />
      </div>
    );
  }

  return (
    <div className="mt-20 container grid gap-7 bg-bg border-2 rounded-md border-input-bg w-lg p-8">
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
        <Button className="flex items-center justify-center gap-2 text-center text-md font-bold text-white rounded-sm bg-[#003BB3] py-3 w-full">
          <FaFacebook className="text-xl" />
          Continue with Facebook
        </Button>

        <Button className="flex items-center justify-center gap-2 text-center text-md font-bold text-text-hover rounded-sm bg-input-bg py-3 w-full">
          <FcGoogle className="text-xl" />
          Continue with Google
        </Button>

        <Button className="flex items-center justify-center gap-2 text-center text-md font-bold text-white rounded-sm bg-black py-3 w-full">
          <FaApple className="text-xl" />
          Continue with Apple
        </Button>
      </div>

      <div className="grid gap-5">
        <p className="text-text-hover text-md font-bold">Or with email</p>
        <input
          type="email"
          placeholder="Your email address or profile URL"
          className="w-full bg-input-bg text-text text-md px-4 py-4 rounded-sm border border-transparent outline-none placeholder:text-text-muted cursor-pointer"
          onFocus={() => setStep("email")}
          readOnly
        />
        <button
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
