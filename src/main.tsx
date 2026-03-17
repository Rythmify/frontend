import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import "./index.css";
import App from "./App.tsx";
import "@fortawesome/fontawesome-free/css/all.min.css";

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./services/mocks/browser");
    return worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <HeroUIProvider>
        <App />
      </HeroUIProvider>
    </StrictMode>,
  );
});