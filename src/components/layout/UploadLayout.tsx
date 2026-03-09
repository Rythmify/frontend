import { Outlet } from "react-router-dom";
import Footer from "./Footer";

const UploadLayout = () => (
  <div className="min-h-screen flex flex-col">
    <header>
      {/* Mariam---upload navbar design here */}
    </header>

    <main className="flex-1">
      <Outlet />
    </main>

    <Footer />
  </div>
);

export default UploadLayout;