import { useAuthStore } from "@/stores/auth.store";
import { useRef, useState } from "react";
import UploadGuestPage from "./UploadGuestPage";
import UploadQuotaBar from "./UploadQuotaBar";
import RecordSection from "./RecordSection";
import DropZone from "./DropZone";
import UploadDetailsForm from "./UploadDetailsForm";
import { useOutletContext } from "react-router-dom";
import UploadFooter from "./UploadFooter";

export interface UploadFormHandle {
  triggerSubmit: () => void;
  isUploading: boolean;
}

const UploadPage = () => {
  const { isAuthenticated } = useAuthStore();
  const { isDetailsMode, setIsDetailsMode, setTrackName } =
    useOutletContext<any>();
  const [audioData, setAudioData] = useState<File | Blob | null>(null);
  const formRef = useRef<UploadFormHandle>(null);
  if (!isAuthenticated) return <UploadGuestPage />;

  const handleFinishUpload = (data: File | Blob) => {
    setTrackName(data instanceof File ? data.name : "Recorded_Audio.wav");
    setIsDetailsMode(true); // view the metadata form
    setAudioData(data); //store recorded audio
  };

  const handleSaveClick = () => {
    formRef.current?.triggerSubmit();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container text-left max-w-6xl antialiased">
        {!isDetailsMode ? (
          <>
            <div className="mb-8">
              <UploadQuotaBar />
            </div>
            <DropZone onUpload={handleFinishUpload} />
            <RecordSection onFinish={handleFinishUpload} />
          </>
        ) : (
          <UploadDetailsForm
            ref={formRef}
            audioData={audioData}
            onCancel={() => setIsDetailsMode(false)}
          />
        )}
        <UploadFooter
          isDetailsMode={isDetailsMode}
          onSave={handleSaveClick}
          isLoading={formRef.current?.isUploading}
        />
      </div>
    </div>
  );
};

export default UploadPage;
