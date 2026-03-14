import { Outlet } from "react-router-dom";
import MainNavbar from "./MainNavbar";

const AuthMainLayout = () => (
  
    <div className="flex flex-col items-start min-h-screen ">
    <MainNavbar />

    <main className="container flex-1">
      <Outlet />
    </main>
  </div>

  
);

export default AuthMainLayout;