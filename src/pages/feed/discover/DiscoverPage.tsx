import { useAuthStore } from "@/stores/auth.store";
import DiscoverPageAuth from "./DiscoverPageAuth";
import DiscoverPageGuest from "./DiscoverPageGuest";

const DiscoverPage = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <DiscoverPageAuth /> : <DiscoverPageGuest />;
};

export default DiscoverPage;
