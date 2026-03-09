import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import LandingPage from "./LandingPage";

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/discover" replace /> : <LandingPage />;
};

export default HomePage;



