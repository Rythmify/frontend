import { Outlet } from "react-router-dom";
import MainNavbar from "./MainNavbar";
import StickyPlayer from "../player/StickyPlayer";

const AuthMainLayout = () => (
<<<<<<< HEAD
  
    <div className="flex flex-col items-start min-h-screen ">
    <MainNavbar />

    <main className="container flex-1">
=======
  <div className="min-h-screen flex flex-col">
    <MainNavbar />

    {/* pb-14 reserves space so content doesn't hide behind the 56px player bar */}
    <main className="flex-1 pb-14">
>>>>>>> 6c9d16e92b7f619bb9071f653c94fc76a8bd77fb
      <Outlet />
    </main>

    {/* Global player - mounts once and persists across all routes */}
    <StickyPlayer />
  </div>
);

export default AuthMainLayout;