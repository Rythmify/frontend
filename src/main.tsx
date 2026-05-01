import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./services/audioService";

const savedTheme = localStorage.getItem("theme");
const root = document.documentElement;
if (savedTheme === "Light") {
  root.classList.remove("dark");
} else if (savedTheme === "Automatic") {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
} else {
  // "Dark" or no preference — default to dark
  root.classList.add("dark");
}

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK === "true") {
    const { worker } = await import("./services/mocks/browser");
    return worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}
enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
