import { Outlet } from "react-router-dom";
import Footer from "./Footer";

const CheckoutLayout = () => (
  <div className="min-h-screen flex flex-col">
    <header>
      {/* Farah--- Checkout Navbar implementation here */}
    </header>

    <main className="flex-1">
      <Outlet />
    </main>

    <Footer />
  </div>
);

export default CheckoutLayout;