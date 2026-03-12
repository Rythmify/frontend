import React, { useState } from "react";
import type { User } from "@/stores/auth.store";

// interface User {
//   username: string;
//   displayName?: string;
//   avatarUrl?: string;
//   coverUrl?: string;
//   location?: string;
// }

interface ProfileHeaderProps {
  user: User;
  isOwner?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwner = false,
}) => {
  const { username, displayName, avatar, coverUrl, location } = user;
  const [hoveringAvatar, setHoveringAvatar] = useState(false);

  return (
    <div className="w-full max-w-[96%] mx-auto">
      <div
        className="w-full h-[255px] bg-center bg-cover relative"
        style={
          coverUrl
            ? { backgroundImage: `url('${coverUrl}')` }
            : { background: "linear-gradient(to right, #7a9e5a, #e8f0d8)" }
        }
      >
        {isOwner && (
          <button className="absolute top-8 right-6 px-4 py-1.5 bg-white text-black text-sm font-bold rounded">
            Upload header image
          </button>
        )}

        {/* Avatar + name — vertically centered, not bottom */}
        <div className="absolute inset-0 flex items-center px-6 gap-6">
          {/* <div className="w-[200px] h-[200px] rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-green-600"> */}
          <div
            className="relative w-[200px] h-[200px] rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-green-600 cursor-pointer"
            onMouseEnter={() => setHoveringAvatar(true)}
            onMouseLeave={() => setHoveringAvatar(false)}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-8xl font-bold text-white">
                {username.charAt(0).toUpperCase()}
              </span>
            )}

            {isOwner && hoveringAvatar && (
              <div className="absolute inset-0 bg-black/50 flex items-end justify-center pb-8">
                <button className="bg-white text-black text-sm font-semibold px-3 py-1.5 rounded">
                  Update image
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-0">
            <h1 className="text-white font-bold text-2xl px-2 py-1 bg-black/70 self-start">
              {displayName || username}
            </h1>

            <div className="flex flex-col gap-1">
              <p className="text-gray-300 font-bold text-sm px-2 py-1 bg-black/70 self-start">
                {username}
              </p>

              {location && (
                <p className="text-gray-300 font-bold text-sm px-2 py-1 bg-black/70 self-start">
                  {location}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
