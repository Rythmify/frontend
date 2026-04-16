import { Link } from "react-router-dom";

interface AlbumOwnerInfoProps {
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  followers: number;
  trackNum: number;
}

export default function AlbumOwnerInfo({
  username,
  displayName,
  avatarUrl,
  followers,
  trackNum,
}: AlbumOwnerInfoProps) {
  const name = displayName || username;
  const fallbackLetter = name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <div
      data-test="album-owner-info"
      className="flex flex-col items-center lg:items-start gap-3 px-2 py-2"
    >
      <Link to={`/${username}`} className="shrink-0">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
              data-test="album-owner-avatar"
            />
          ) : (
            <div
              data-test="album-owner-avatar-fallback"
              className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-[#3a3a3a] to-[#1f1f1f]"
            >
              {fallbackLetter}
            </div>
          )}
        </div>
      </Link>

      <div className="min-w-0 text-center lg:text-left flex flex-col gap-0.5">
        <Link
          to={`/${username}`}
          data-test="album-owner-name"
          className="text-white text-xl md:text-sm font-bold leading-tight truncate hover:text-[#d0d0d0] transition-colors"
        >
          {name}
        </Link>
        <div className="flex justify-center items-center ">
          <p className="text-[12px] text-text-secondary flex flex-1 justify-center items-center gap-1">
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <g fill="currentColor">
                <path d="M8 7.5a3 3 0 100-6 3 3 0 000 6zM2.001 14.248C2.036 10.005 2.984 8.5 8 8.5s5.965 1.487 5.999 5.748a.25.25 0 01-.249.252H2.25a.25.25 0 01-.249-.252z"></path>
              </g>
            </svg>
            {followers}
          </p>

          <p className="text-[12px] text-text-secondary flex flex-1 justify-center items-center gap-1">
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M5.75 2v12h1.5V2h-1.5zM13.25 10V6h-1.5v4h1.5zM4.25 5v6-1.5V5h1.5zM8.75 4v8h1.5V4h-1.5z"
                fill="currentColor"
              ></path>
            </svg>
            {trackNum}
          </p>

        </div>
        
      </div>
    </div>
  );
}
