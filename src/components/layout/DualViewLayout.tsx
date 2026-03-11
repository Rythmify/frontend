
import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import MainNavbar from "./MainNavbar";
import NoAuthNavbar from "./NoAuthNavbar";

const DualViewLayout = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated ? <MainNavbar /> : <NoAuthNavbar />}

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default DualViewLayout;