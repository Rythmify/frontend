import "./App.css";
import { HeroUIProvider } from "@heroui/react";
import { RouterProvider } from "react-router-dom";
import { router } from "./Router";
import DevAuthToggle from "./DevAuthToggle";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
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




