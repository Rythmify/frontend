import { useAuthStore } from "@/stores/auth.store";
import UploadGuestPage from "./UploadGuestPage";

const UploadPage = () => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <UploadGuestPage />;

  return <div>Upload form here</div>;
};

export default UploadPage;