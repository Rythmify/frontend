import { useState } from "react";

interface CoverImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  "data-test"?: string;
}

export default function CoverImage({ src, alt, className, "data-test": dataTest }: CoverImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <img src="/icon_soundcloud.png" alt="" className="w-1/2 h-1/2 object-contain opacity-75" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      data-test={dataTest}
      onError={() => setFailed(true)}
    />
  );
}
