import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export default function GitHubCallbackPage() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false); // prevents double execution

  useEffect(() => {
    if (hasRun.current) return; // stop second run
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);

    const oauthError = params.get("error");
    if (oauthError) {
      navigate(`/signin?error=${oauthError}`, { replace: true });
      return;
    }

    const accessToken = params.get("access_token");
    const isNewUser = params.get("is_new_user") === "true";
    const email = params.get("email") ?? "";
    const displayName = params.get("display_name") ?? "";

    if (!accessToken) {
      navigate("/signin?error=missing_token", { replace: true });
      return;
    }

    localStorage.setItem("auth_token", accessToken);
    window.history.replaceState({}, "", "/auth/callback");

    if (isNewUser) {
      navigate("/complete-profile", { state: { email, displayName } });
      return;
    }

    getMe()
      .then((me) => {
        storeLogin(
          {
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
          },
          accessToken,
        );
        navigate("/discover");
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
        setError("GitHub sign-in failed. Please try again.");
      });
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-white text-sm">Signing you in with GitHub...</p>
    </div>
  );
}