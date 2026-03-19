import React from "react";
import { useState, useRef } from "react";

interface UploadCoverImageProps {
  onImageSelect: (file: File) => void;
}

function UploadCoverImage({ onImageSelect }: UploadCoverImageProps) {
  const [artwork, setArtwork] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArtwork(URL.createObjectURL(file));
      onImageSelect(file);
    }
  };
  return (
    <div className="flex flex-col items-center shrink-0">
      {/* Left: Artwork Upload Container */}
      <input
        data-test="cover-image-input"
        type="file"
        ref={imageInputRef}
        className="hidden"
        accept="image/jpeg, image/png, image/gif"
        onChange={handleImageChange}
      />

      <button
        data-test="cover-image-upload-button"
        type="button"
        onClick={() => imageInputRef.current?.click()}
        className="relative w-100 h-100 bg-transparent border border-dashed border-[#353535] flex flex-col items-center justify-center cursor-pointer rounded-sm transition-all group overflow-hidden"
      >
        {artwork ? (
          <>
            <img
              src={artwork}
              alt="Artwork preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-bold border border-white px-3 py-1.5 uppercase tracking-widest">
                Replace image
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/*artwork icon */}
            <div className="w-30 h-30 text-text-upload transition-colors">
              <svg
                height="100%"
                width="100%"
                fill="none"
                viewBox="0 0 60 60"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M48.75 9.38h-37.5c-1.04 0-1.88.83-1.88 1.87v37.5c0 1.04.84 1.88 1.88 1.88h37.5c1.04 0 1.88-.84 1.88-1.88v-37.5c0-1.04-.84-1.88-1.88-1.88Z"
                ></path>
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="m50.63 37.5-9.92-9.91a1.87 1.87 0 0 0-2.67 0L27.59 38.04a1.88 1.88 0 0 1-2.68 0L20.1 33.2a1.87 1.87 0 0 0-2.68 0l-8.04 8.04"
                ></path>
                <path
                  fill="currentColor"
                  d="M23.44 23.9a2.34 2.34 0 1 0 0-4.68 2.34 2.34 0 0 0 0 4.69Z"
                ></path>
              </svg>
            </div>
            <h4 className="text-lg font-bold text-text-upload text-[14px] tracking-tight">
              Add new artwork
            </h4>
          </div>
        )}
      </button>
    </div>
  );
}

export default UploadCoverImage;
