import { useAuthStore } from "@/stores/auth.store";
import { useRef, useState, useEffect } from "react";
import UploadGuestPage from "./UploadGuestPage";
import UploadQuotaBar from "./UploadQuotaBar";
import RecordSection from "./RecordSection";
import DropZone from "./DropZone";
import UploadDetailsForm from "./UploadDetailsForm";
import { Link, useOutletContext } from "react-router-dom";
import UploadFooter from "./UploadFooter";
import UploadSuccessView from "./UploadSuccessView";

export interface UploadFormHandle {
  triggerSubmit: () => void;
  isUploading: boolean;
}

const UploadPage = () => {
  const { isAuthenticated } = useAuthStore();
  const context = useOutletContext<{
    isDetailsMode: boolean;
    setIsDetailsMode: (val: boolean) => void;
    setTrackName: (name: string) => void;
    setUploadProgress: (val: number) => void;
    setUploadSuccess: (val: boolean) => void;
  }>() || {
    isDetailsMode: false,
    setIsDetailsMode: () => {},
    setTrackName: () => {},
  };

  const {
    isDetailsMode,
    setIsDetailsMode,
    setTrackName,
    setUploadProgress,
    setUploadSuccess,
  } = context;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioData, setAudioData] = useState<File | Blob | null>(null);
  const [uploadedTrackId, setUploadedTrackId] = useState<string | null>(null);
  const [view, setView] = useState<"home" | "details" | "success">("home");

  const formRef = useRef<UploadFormHandle>(null);

  useEffect(() => {
    if (view !== "success") {
      setView(isDetailsMode ? "details" : "home");
    }
  }, [isDetailsMode, view]);

  if (!isAuthenticated) return <UploadGuestPage />;

  const handleFinishUpload = (data: File | Blob) => {
    setTrackName(data instanceof File ? data.name : "Recorded_Audio.wav");
    setAudioData(data);
    setIsDetailsMode(true);
    setView("details");
  };

  const handleSuccess = (trackId: string) => {
    setUploadedTrackId(trackId);
    setIsSubmitting(false);
    setView("success");
    setUploadSuccess(true);
  };

  const handleSaveClick = () => {
    if (formRef.current) {
      formRef.current.triggerSubmit();
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="container text-left max-w-6xl antialiased pb-40">
        {view === "home" ? (
          <>
            <div className="mb-8">
              <UploadQuotaBar />
            </div>
            <DropZone onUpload={handleFinishUpload} />
            <RecordSection onFinish={handleFinishUpload} />
          </>
        ) : view === "details" ? (
          <UploadDetailsForm
            ref={formRef}
            audioData={audioData}
            onCancel={() => setIsDetailsMode(false)}
            onSuccess={handleSuccess}
            setIsLoadingParent={setIsSubmitting}
            onProgress={(pct) => setUploadProgress(pct)} 
          />
        ) : (
          <UploadSuccessView trackId={uploadedTrackId} />
        )}
      </div>

      {view !== "success" && (
        <UploadFooter
          isDetailsMode={view === "details"}
          onSave={handleSaveClick}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default UploadPage;
