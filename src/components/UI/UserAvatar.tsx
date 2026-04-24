interface UserAvatarProps {
  src?: string | null;
  name: string;
  alt?: string;
  dataTest?: string;
  imageDataTest?: string;
  fallbackDataTest?: string;
  wrapperClassName?: string;
  imageClassName?: string;
  initialsClassName?: string;
  onClick?: () => void;
}

const getInitial = (value: string) => value.trim().charAt(0).toUpperCase() || "?";

export default function UserAvatar({
  src,
  name,
  alt,
  dataTest,
  imageDataTest,
  fallbackDataTest,
  wrapperClassName = "",
  imageClassName = "h-full w-full object-cover",
  initialsClassName = "flex h-full w-full items-center justify-center bg-zinc-800 text-white font-bold",
  onClick,
}: UserAvatarProps) {
  const label = alt ?? name;

  return (
    <div data-test={dataTest} className={wrapperClassName} onClick={onClick}>
      {src ? (
        <img data-test={imageDataTest} src={src} alt={label} className={imageClassName} />
      ) : (
        <div data-test={fallbackDataTest} className={initialsClassName}>
          {getInitial(name || label)}
        </div>
      )}
    </div>
  );
}
