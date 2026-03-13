import React, { useState } from "react";
import type { User } from "@/stores/auth.store";

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
  const [showImageMenu, setShowImageMenu] = useState(false);

  return (
    <div className=" container">
      <div
        className="w-full h-[255px] bg-center bg-cover relative mb-4"
        style={
          coverUrl
            ? { backgroundImage: `url('${coverUrl}')` }
            : { background: "linear-gradient(to right, #8EAD70, #EAF0E5)" }
        }
      >
        {/* Upload header button */}
        {isOwner && (
          <button className="absolute top-8 right-6 px-3 py-1.5 bg-black text-white  text-sm font-bold rounded hover:text-[#aaaaaa] transition-colors">
            Upload header image
          </button>
        )}

        {/* Avatar , name row */}
        <div className="absolute inset-0 flex items-center px-6 gap-6 ">
          {/* Avatar wrapper */}
          <div className="relative flex-shrink-0">
            <div
              className="w-[200px] h-[200px] rounded-full overflow-hidden flex items-center justify-center bg-[#68A039] cursor-pointer"
              onMouseEnter={() => setHoveringAvatar(true)}
              onMouseLeave={() => {
                if (!showImageMenu) setHoveringAvatar(false);
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className={`text-8xl font-bold text-white transition-opacity ${hoveringAvatar ? "opacity-30" : "opacity-100"}`}
                >
                  {username.charAt(0).toUpperCase()}
                </span>
              )}

              {/* Hover overlay with button */}
              {isOwner && hoveringAvatar && (
                <div className="absolute inset-0 bg-black/50 flex items-end justify-center pb-8 rounded-full">
                  <div className="relative">
                    <button
                      className={`bg-black rounded text-sm hover:text-[#737272] font-semibold px-4 py-1.5 ${showImageMenu ? "text-accent" : "text-white"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowImageMenu((prev) => !prev);
                      }}
                    >
                      Update image
                    </button>

                    {/* Dropdown  */}
                    {showImageMenu && (
                      <div
                        className="absolute top-full left-0  bg-black shadow-lg z-50 rounded "
                        onMouseEnter={() => setHoveringAvatar(true)}
                        onMouseLeave={() => {
                          setShowImageMenu(false);
                          setHoveringAvatar(false);
                        }}
                      >
                        <button className="block w-full whitespace-nowrap text-left px-4 py-3 text-sm font-bold text-white hover:text-[#737272] rounded">
                          Replace image
                        </button>
                        <button className="block w-full whitespace-nowrap text-left px-4 py-3 text-sm font-bold text-white hover:text-[#737272] rounded">
                          Delete image
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Name , username , location */}
          <div className="flex flex-col gap-0">
            <h1 className="text-white font-bold text-2xl px-2 py-1 bg-black/70 self-start">
              {displayName || username}
            </h1>
            <div className="flex flex-col gap-1">
              <p className="text-gray-400 font-bold text-sm px-2 py-1 bg-black/70 self-start">
                {username}
              </p>
              {location && (
                <p className="text-gray-400 font-bold text-sm px-2 py-1 bg-black/70 self-start">
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
