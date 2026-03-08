import { Outlet } from "react-router-dom";
import MainNavbar from "./MainNavbar";

const AuthMainLayout = () => (
  <div className="min-h-screen flex flex-col">
    <MainNavbar />

    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);

export default AuthMainLayout;