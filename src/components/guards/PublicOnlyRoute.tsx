import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

const PublicOnlyRoute = () => {
  const { isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    const redirectUrl = searchParams.get("redirect_url") || "/discover";
    return <Navigate to={redirectUrl} replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;