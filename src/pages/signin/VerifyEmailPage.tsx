import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail, getMe } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { login: storeLogin, logout } = useAuthStore();

  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMsg("Invalid verification link.");
      setStatus("error");
      return;
    }

    verifyEmail(token)
      .then(async (res) => {
        const me = await getMe();
        storeLogin(
          {
            id: me.data.id,
            username: me.data.username,
            displayName: me.data.display_name,
            email: me.data.email,
            role: me.data.role,
            isPro: false,
            avatar: me.data.profile_picture,
            coverUrl: me.data.cover_photo,
            location: me.data.city ?? me.data.country,
          },
          res.data.access_token
        );
        navigate("/discover");
      })
      .catch((err) => {
        logout();
        setErrorMsg(
          err?.response?.data?.error?.message ?? "Verification failed. The link may have expired."
        );
        setStatus("error");
      });
  }, [token]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary text-sm">Verifying your email...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center grid gap-4">
        <h2 className="text-text-hover text-2xl">Verification failed</h2>
        <p className="text-text-secondary text-sm">{errorMsg}</p>
        <button
          data-test="btn-back-to-signin"
          onClick={() => navigate("/signin")}
          className="text-text-link hover:text-text-link-hover text-sm"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}
