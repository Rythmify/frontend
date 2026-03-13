import { useAuthStore } from "@/stores/auth.store";
import UploadGuestPage from "./UploadGuestPage";

const UploadPage = () => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <UploadGuestPage />;

  return (
    <div className="max-w-3xl mx-auto px-4 mt-12 text-left">
      
      {/* main upload title */}
      <h1 className="text-2xl font-bold text-text-upload mb-6 mt-6">
        Upload your audio files.
      </h1>

      {/* helper text */}
      <p className="text-xs text-text-upload leading-relaxed mb-8">
        For best quality, use WAV, FLAC, AIFF, or ALAC. 
        The maximum file size is 4GB uncompressed.{" "}
        <a href="#" className="underline hover:opacity-80 transition-opacity">Learn more.</a>
      </p>
        
     <div className="flex flex-col items-center text-center mt-12 mb-8">
        
        {/* Dropzone text */}
        <p className="m-0 text-text-upload font-sans font-bold text-base mb-6">
          Drag and drop audio files to get started
        </p>
        
        {/*The button for uploading audio*/}
        <button 
          type="button"
          className="bg-bg-inverted hover:opacity-80 text-bg px-4 py-2.5 rounded-full text-sm font-bold transition-colors cursor-pointer"
        >
          Choose files
        </button>

      </div>
    </div>
  );
};

export default UploadPage;