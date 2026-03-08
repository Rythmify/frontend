import { Outlet } from "react-router-dom";
import NoAuthNavbar from "./NoAuthNavbar";

const GuestNavbarLayout = () => (
  <div className="min-h-screen flex flex-col">
    <NoAuthNavbar />

    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);

export default GuestNavbarLayout;