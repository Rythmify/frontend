import { Outlet } from "react-router-dom";
import MainNavbar from "./MainNavbar";
import StickyPlayer from "../player/StickyPlayer";

const AuthMainLayout = () => (
  <div className="min-h-screen flex flex-col">
    <MainNavbar />

    {/* pb-14 reserves space so content doesn't hide behind the 56px player bar */}
    <main className="flex-1 pb-14">
      <Outlet />
    </main>

    {/* Global player - mounts once and persists across all routes */}
    <StickyPlayer />
  </div>
);

export default AuthMainLayout;