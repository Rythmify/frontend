import "./App.css";
import { HeroUIProvider } from "@heroui/react";
import { RouterProvider } from "react-router-dom";
import { router } from "./Router";
import DevAuthToggle from "./DevAuthToggle";

function App() {
  return (
    <HeroUIProvider>
      <RouterProvider router={router} />
      <DevAuthToggle />
    </HeroUIProvider>
  );
}

export default App;




