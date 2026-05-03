import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import MainNavbar from "./MainNavbar";
import NoAuthNavbar from "./NoAuthNavbar";
import StickyPlayer from "../player/StickyPlayer";
import { usePromoModal } from "@/hooks/usePromoModal";
import PremiumPromoModal from "@/components/Premium/PremiumPromoModal";

const DualViewLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const { showPromo, closePromo } = usePromoModal();

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && showPromo && <PremiumPromoModal onClose={closePromo} />}
      {isAuthenticated ? <MainNavbar /> : <NoAuthNavbar />}

      <main className="flex-1 pb-14">
        <Outlet />
      </main>

      <StickyPlayer />
    </div>
  );
};

export default DualViewLayout;