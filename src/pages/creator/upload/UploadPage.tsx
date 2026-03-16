import { useAuthStore } from "@/stores/auth.store";
import UploadGuestPage from "./UploadGuestPage";
import UploadQuotaBar from "./UploadQuotaBar";
import RecordSection from "./RecordSection";
import DropZone from "./DropZone";

const UploadPage = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <UploadGuestPage />;

  return (
    <div className="container text-left max-w-6xl pb-40 antialiased">
      <div className="mb-8">
      <UploadQuotaBar />
      </div>
      <DropZone />
      <RecordSection />
    </div>
  );
};

export default UploadPage;