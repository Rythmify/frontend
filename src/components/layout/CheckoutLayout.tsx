import { Outlet } from "react-router-dom";

const CheckoutLayout = () => (
  <div className="min-h-screen flex flex-col">
    <header>
      {/* Farah--- Checkout Navbar implementation here */}
    </header>

    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);

export default CheckoutLayout;
