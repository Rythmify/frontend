import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import NoAuthNavbar from "./NoAuthNavbar";

const LandingLayout = () => (
  <div className=" mx-auto min-h-screen flex flex-col">
    
    <main className=" container px-20">
      <Outlet />
    </main>
   
  </div>
);

export default LandingLayout;