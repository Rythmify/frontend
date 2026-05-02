import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import QuitUploadModal from "@/components/Upload/QuitUploadModal";

const UploadLayout = () => {
  const navigate = useNavigate();
  const [isDetailsMode, setIsDetailsMode] = useState(false);
  const [trackName, setTrackName] = useState("");
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleExit = () => {
    if (uploadSuccess) {
      navigate("/artists");
    } else if (isDetailsMode) {
      setShowQuitModal(true);
    } else {
      navigate("/artists");
    }
  };

  return (
    <div className="min-h-screen flex py-2.5 flex-col bg-bg transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-bg ">
        <div className="w-full px-8 flex items-center justify-between h-11.5">
          {/* Left side: Logo and page title */}
          <div className="flex items-center gap-6">
            <Link
              to="/artists"
              className="flex items-center text-4xl gap-2 hover:opacity-80 transition-opacity"
            >
              <i className="fa-brands fa-soundcloud text-text-hover" />
            </Link>
            {/*toggle between upload and details mode in the header*/}
            <h6 className=" font-bold text-text-upload text-md tracking-wide">
              {uploadSuccess ? "" : isDetailsMode ? "Track Info" : "Upload"}
            </h6>
          </div>

          {/* Upload Status => Only visible in Details Mode */}
          <div className="flex items-center gap-4">
            {isDetailsMode && !uploadSuccess && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-text-upload text-xs">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-[24px] h-[24px] shrink-0 text-text-upload"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="m10 16.5 6-4.5-6-4.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8"></path>
                  </svg>
                  <span className="truncate">{trackName}</span>
                </div>
                <button
                  data-test="replace-track-button"
                  onClick={() => setIsDetailsMode(false)}
                  className="text-text-upload text-sm font-bold hover:underline cursor-pointer"
                >
                  Replace track
                </button>
              </div>
            )}
            {isDetailsMode && !uploadSuccess && uploadProgress > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-32 h-1.5 flex items-center gap-[2px]">
                  <div
                    className="h-full bg-[#2e7d32] rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                  <div className="h-full flex-1 border-t-2 border-dashed border-[#555]" />
                </div>
                <span className="text-xs text-text-upload whitespace-nowrap">
                  {uploadProgress < 90
                    ? `Uploading ${uploadProgress}%`
                    : "Processing..."}
                </span>
              </div>
            )}
            {/* Close page */}
            <button
              data-test="exit-upload-button"
              onClick={handleExit}
              className="flex items-center justify-center h-6 w-6 p-5 rounded-full 
              bg-input-bg hover:bg-[dcdcdc] text-text-upload dark:hover:bg-[#353535]
              transition-all duration-300 cursor-pointer"
              aria-label="Exit upload"
            >
              <i className="fa-solid fa-xmark text-md" />
            </button>
          </div>
        </div>
        <QuitUploadModal
          isOpen={showQuitModal}
          onClose={() => setShowQuitModal(false)}
          onConfirm={() => {
            setShowQuitModal(false);
            navigate("/artists");
          }}
        />
      </header>

      <main className="flex-1 bg-bg pt-8">
        {/* Pass states to UploadPage */}
        <Outlet
          context={{
            isDetailsMode,
            setIsDetailsMode,
            setTrackName,
            setUploadProgress,
            setUploadSuccess,
          }}
        />
      </main>
    </div>
  );
};

export default UploadLayout;
