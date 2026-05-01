import "./App.css";
import { useEffect } from "react";
import { HeroUIProvider } from "@heroui/react";
import { RouterProvider } from "react-router-dom";
import { router } from "./Router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthStore } from "@/stores/auth.store";
import { performRefresh } from "@/services/api/axiosInstance";
import { connectSocket, getCurrentToken } from '@/services/api/messaging/socketService';
import { useNotificationStore } from '@/stores/notification.store';
import { Toaster } from "sonner";

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

    // Initial hydration if already authenticated
    if (useAuthStore.getState().isAuthenticated) {
      import("@/stores/player.store").then((m) => m.usePlayerStore.getState().loadFromBackend());
      import("@/stores/likes.store").then((m) => m.useLikesStore.getState().hydrateFromApi());
      import("@/stores/history.store").then((m) => m.useHistoryStore.getState().hydrateFromBackend());
    }

    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, []);

  // ── Socket + real-time listeners initialization ──────────────────────────
  // Runs once on mount. Handles the page-refresh case where module state
  // resets but the user is still authenticated (token persisted in storage).
  // connectSocket checks .connected internally so it's safe to call even if
  // login already called it. Both notification and messaging stores register
  // their own socket listeners here so they survive across route changes.
  useEffect(() => {
    const { isAuthenticated } = useAuthStore.getState();
    const token =
      (useAuthStore.getState() as { token?: string }).token ??
      localStorage.getItem("auth_token");

    if (isAuthenticated && token && !getCurrentToken()) {
      connectSocket(token);
    }

    // Set up real-time badge listeners for notifications after ensuring
    // the socket exists. The messaging store's setupSocketListeners is still
    // called from MainNavbar — no change needed there.
    if (isAuthenticated) {
      useNotificationStore.getState().setupNotificationListeners();
    }

    // Re-run whenever the user logs in mid-session (e.g. after logout → login
    // without a page refresh)
    const unsubscribe = useAuthStore.subscribe((state, prevState) => {
      const wasAuthenticated = (prevState as typeof state).isAuthenticated;

      if (state.isAuthenticated && !wasAuthenticated) {
        const freshToken =
          (state as { token?: string }).token ??
          localStorage.getItem("auth_token");
        if (freshToken) connectSocket(freshToken);
        useNotificationStore.getState().setupNotificationListeners();
      }
    });

    return () => unsubscribe();
  }, []);

  // ── Proactive token refresh ──────────────────────────────────────────────
  // Refreshes the access token 60s before expiry so the session stays alive
  // as long as the browser tab is open.
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (timerId) clearTimeout(timerId);

      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const expiryMs = getJwtExpiryMs(token);
      const delayMs = expiryMs
        ? Math.max(expiryMs - Date.now() - 60_000, 0)
        : 2 * 60 * 1000;

      timerId = setTimeout(async () => {
        try {
          const newToken = await performRefresh();
          if (newToken) {
            schedule();
          } else {
            timerId = setTimeout(schedule, 30_000);
          }
        } catch {
          timerId = setTimeout(schedule, 30_000);
        }
      }, delayMs);
    };

    schedule();

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
        <Toaster
          position="bottom-right"
          expand={false}
          richColors
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(18, 18, 18, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              maxWidth: '350px',
            },
          }}
        />
      </HeroUIProvider>
    </GoogleOAuthProvider>
  );
}

export default App;