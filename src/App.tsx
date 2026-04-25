import "./App.css";
import { useEffect } from "react";
import { HeroUIProvider } from "@heroui/react";
import { RouterProvider } from "react-router-dom";
import { router } from "./Router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthStore } from "@/stores/auth.store";
import { performRefresh } from "@/services/api/axiosInstance";

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
  // We also subscribe to auth-store changes so the timer starts immediately
  // after a fresh login (not just on the initial page load).
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (timerId) clearTimeout(timerId);

      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const expiryMs = getJwtExpiryMs(token);
      // Refresh 60 s before expiry; if we can't decode, try again in 2 min
      const delayMs = expiryMs
        ? Math.max(expiryMs - Date.now() - 60_000, 0)
        : 2 * 60 * 1000;

      timerId = setTimeout(async () => {
        try {
          const newToken = await performRefresh();
          if (newToken) {
            schedule(); // reschedule for the new token's expiry
          } else {
            // Response was 200 but had no token — retry in 30 s
            timerId = setTimeout(schedule, 30_000);
          }
        } catch {
          // Refresh failed transiently — retry in 30 s;
          // the 401 interceptor will also handle it on the next request
          timerId = setTimeout(schedule, 30_000);
        }
      }, delayMs);
    };

    schedule();

    // Restart timer whenever the user logs in (isAuthenticated flips to true)
    let prevAuthenticated = useAuthStore.getState().isAuthenticated;
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.isAuthenticated && !prevAuthenticated) schedule();
      else if (!state.isAuthenticated && prevAuthenticated) {
        if (timerId) clearTimeout(timerId);
        timerId = null;
      }
      prevAuthenticated = state.isAuthenticated;
    });

    return () => {
      if (timerId) clearTimeout(timerId);
      unsubscribe();
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <HeroUIProvider>
      <RouterProvider router={router} />
    </HeroUIProvider>
    </GoogleOAuthProvider>
  );
}

export default App;




