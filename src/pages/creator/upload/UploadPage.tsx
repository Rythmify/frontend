import { useAuthStore } from "@/stores/auth.store";
import UploadGuestPage from "./UploadGuestPage";
import { useState, useRef } from "react";
import CloudUploadIcon from "./CloudUploadIcon";

const UploadPage = () => {
  const { isAuthenticated } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isAuthenticated) return <UploadGuestPage />;

  {/*Drag and Drop Handlers */}
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    console.log("Files selected:", files);
  };

  return (
    <div className="container pt-8 px-8 pb-40 mt-12 text-left antialiased">
      
      {/* main upload title */}
      <h1 className="text-[28px] font-bold text-text-upload mb-6 mt-6">
        Upload your audio files.
      </h1>

      {/* helper text */}
      <p className="text-sm text-text-upload leading-relaxed mb-8">
        For best quality, use WAV, FLAC, AIFF, or ALAC. 
        The maximum file size is 4GB uncompressed.{" "}
        <a href="#" className="underline hover:opacity-80 transition-opacity">Learn more.</a>
      </p>
        
      {/*The Dropzone Container */}
      <div 
        className={`border-2 border-dashed rounded-md p-16 flex flex-col items-center justify-center text-center transition-colors ${
          isDragging 
            ? "border-accent bg-accent/5" 
            : "border-border bg-bg hover:border-text-hover cursor-pointer"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()} 
      >
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          accept=".wav,.flac,.aiff,.alac,.mp3"
          multiple
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
        />

        {/* Cloud Upload Icon */}
        <CloudUploadIcon className="mb-6 text-text-upload" />

        {/* Dropzone Content */}
        <p className="m-0 text-text-upload font-sans font-bold text-base mb-6">
          Drag and drop audio files to get started
        </p>

        {/*The button for uploading audio*/}
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-bg-inverted hover:opacity-80 text-bg px-4 py-2.5 rounded-full text-sm font-bold transition-colors cursor-pointer"
        >
          Choose files
        </button>

      </div>
    </div>
  );
};

export default UploadPage;