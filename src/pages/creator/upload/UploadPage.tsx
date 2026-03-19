import { useAuthStore } from "@/stores/auth.store";
<<<<<<< HEAD
import UploadGuestPage from "./UploadGuestPage";

const UploadPage = () => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <UploadGuestPage />;

  return <div>Upload form here</div>;
=======
import { useRef, useState, useEffect } from "react";
import UploadGuestPage from "./UploadGuestPage";
import UploadQuotaBar from "./UploadQuotaBar";
import RecordSection from "./RecordSection";
import DropZone from "./DropZone";
import UploadDetailsForm from "./UploadDetailsForm";
import { useOutletContext } from "react-router-dom";
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
  }>() || {
    isDetailsMode: false,
    setIsDetailsMode: () => {},
    setTrackName: () => {},
  };

  const { isDetailsMode, setIsDetailsMode, setTrackName } = context;
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
  };

  const handleSaveClick = () => {
    if (formRef.current) {
      formRef.current.triggerSubmit();
    }
  };

  if (view === "success") {
    return (
      <div className="fixed inset-0 bg-bg z-100 overflow-y-auto">
        <nav className="flex items-center justify-between px-8 py-4 bg-bg sticky top-0 z-10">
          <div className="flex items-center gap-4 text-white">
            <i className="fa-brands fa-soundcloud text-3xl"></i>
          </div>
          <button
            data-test="close-success-view-button"
            onClick={() => (window.location.href = "/")}
            className="text-[#999] hover:text-white transition-colors p-2 cursor-pointer"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </nav>
        <UploadSuccessView trackId={uploadedTrackId} />
      </div>
    );
  }

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
        ) : (
          <UploadDetailsForm
            ref={formRef}
            audioData={audioData}
            onCancel={() => setIsDetailsMode(false)}
            onSuccess={handleSuccess}
            setIsLoadingParent={setIsSubmitting}
          />
        )}
      </div>

      <UploadFooter
        isDetailsMode={view === "details"}
        onSave={handleSaveClick}
        isLoading={formRef.current?.isUploading}
      />
    </div>
  );
>>>>>>> 6c9d16e92b7f619bb9071f653c94fc76a8bd77fb
};

export default UploadPage;