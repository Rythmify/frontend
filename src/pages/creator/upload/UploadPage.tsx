import { useAuthStore } from "@/stores/auth.store";
import { useRef, useState, useEffect } from "react";
import UploadGuestPage from "./UploadGuestPage";
import UploadQuotaBar from "../../../components/Upload/UploadQuotaBar";
import RecordSection from "./RecordSection";
import DropZone from "../../../components/Upload/DropZone";
import UploadDetailsForm from "./UploadDetailsForm";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import UploadFooter from "./UploadFooter";
import UploadSuccessView from "./UploadSuccessView";
import { getUploadQuota, type QuotaData } from "@/services/api/upload/quota.service";

export interface UploadFormHandle {
  triggerSubmit: () => void;
  isUploading: boolean;
}

const UploadPage = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
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
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [showPremiumBanner, setShowPremiumBanner] = useState(
    !!(location.state as { premiumActivated?: boolean } | null)?.premiumActivated,
  );

  const formRef = useRef<UploadFormHandle>(null);

  useEffect(() => {
    if (view !== "success") {
      setView(isDetailsMode ? "details" : "home");
    }
  }, [isDetailsMode, view]);

  useEffect(() => {
    getUploadQuota()
      .then(setQuota)
      .catch(() => {});
  }, []);

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
        {showPremiumBanner && (
          <div className="mb-6 flex items-center justify-between rounded-sm bg-[#388E3C]/15 border border-[#388E3C]/40 px-4 py-3">
            <span className="text-sm font-bold text-[#388E3C]">
              You're now Premium! Enjoy unlimited uploads.
            </span>
            <button
              type="button"
              onClick={() => setShowPremiumBanner(false)}
              className="text-[#388E3C] opacity-60 hover:opacity-100 text-lg leading-none cursor-pointer"
            >
              ×
            </button>
          </div>
        )}
        {view === "home" ? (
          <>
            <div className="mb-8">
              <UploadQuotaBar quota={quota ?? undefined} />
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
            limitReached={quota !== null && !quota.canUpload}
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
