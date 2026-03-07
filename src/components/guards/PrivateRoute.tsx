import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

const PrivateRoute = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirectUrl = location.pathname;
    return <Navigate to={`/signin?redirect_url=${encodeURIComponent(redirectUrl)}`} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;