import "./App.css";
import { useEffect } from "react";
import { HeroUIProvider } from "@heroui/react";
import { RouterProvider } from "react-router-dom";
import { router } from "./Router";
import DevAuthToggle from "./DevAuthToggle";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthStore } from "@/stores/auth.store";
import { refreshToken } from "@/services/auth.service";

// Decode a JWT and return its exp field in ms (or null if invalid)
function getJwtExpiryMs(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function App() {
  // Log out cleanly when the token refresh fails (401 after retry)
  useEffect(() => {
    const handleSessionExpired = () => {
      useAuthStore.getState().logout();
    };
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, []);

  // Proactively refresh the access token 60 s before it expires so the
  // session stays alive as long as the browser tab is open.
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (timerId) clearTimeout(timerId);

      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const expiryMs = getJwtExpiryMs(token);
      // Refresh 60 s before expiry; if we can't decode, try again in 13 min
      const delayMs = expiryMs
        ? Math.max(expiryMs - Date.now() - 60_000, 0)
        : 13 * 60 * 1000;

      timerId = setTimeout(async () => {
        try {
          await refreshToken(); // saves new token to localStorage internally
          schedule();           // reschedule for the new token
        } catch {
          // Refresh failed — 401 interceptor will handle any following request
        }
      }, delayMs);
    };

    schedule();
    return () => { if (timerId) clearTimeout(timerId); };
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <HeroUIProvider>
      <RouterProvider router={router} />
      <DevAuthToggle />
    </HeroUIProvider>
    </GoogleOAuthProvider>
  );
}

export default App;




