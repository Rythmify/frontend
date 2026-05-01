const FALLBACK_COVER_URL =
  "https://cdn.prod.website-files.com/62a0a0168756b795debc65bc/65df5bfb519e57f33c35d493_419679-1x1_SoundCloudLogo_cloudmark-f5912b-large-1645807040%20(2).jpg";

interface CoverImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  "data-test"?: string;
}

export default function CoverImage({ src, alt, className, "data-test": dataTest }: CoverImageProps) {
  return (
    <img
      src={src || FALLBACK_COVER_URL}
      alt={alt}
      className={className}
      data-test={dataTest}
      onError={(e) => {
        e.currentTarget.src = FALLBACK_COVER_URL;
      }}
    />
  );
}
