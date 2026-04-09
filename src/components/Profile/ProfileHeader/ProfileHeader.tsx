import React, { useState, useRef } from "react";
import type { User } from "@/stores/auth.store";
import { useAuthStore } from "@/stores/auth.store";
import {
  uploadAvatar,
  deleteAvatar,
  uploadCover,
  deleteCover,
} from "@/services/mocks/User.service";

interface ProfileHeaderProps {
  user: User;
  isOwner?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwner = false,
}) => {
  const { username, displayName, avatar, coverUrl, location } = user;
  const { setUser } = useAuthStore();

  const [hoveringAvatar, setHoveringAvatar] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [hoveringCover, setHoveringCover] = useState(false);
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | undefined>(avatar);
  const [localCover, setLocalCover] = useState<string | undefined>(coverUrl);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleReplaceClick = () => {
    avatarInputRef.current?.click();
    setShowImageMenu(false);
    setHoveringAvatar(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Only JPEG, PNG, or WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }
    // Optimistic preview
    const previewUrl = URL.createObjectURL(file);
    setLocalAvatar(previewUrl);
    setUser({ ...user, avatar: previewUrl });

    try {
      // POST /users/me/avatar
      const { profile_picture } = await uploadAvatar(file);
      setLocalAvatar(profile_picture);
      setUser({ ...user, avatar: profile_picture });
    } catch {
      // Revert on failure
      setLocalAvatar(avatar);
      setUser({ ...user, avatar });
    }
  };

  const handleDeleteImage = async () => {
    setLocalAvatar(undefined);
    setUser({ ...user, avatar: undefined });
    setShowImageMenu(false);
    setHoveringAvatar(false);

    try {
      // DELETE /users/me/avatar
      await deleteAvatar();
    } catch {
      // Revert on failure
      setLocalAvatar(avatar);
      setUser({ ...user, avatar });
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Only JPEG, PNG, or WebP images are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Cover image must be under 10MB.");
      return;
    }
    // Optimistic preview
    const previewUrl = URL.createObjectURL(file);
    setLocalCover(previewUrl);
    setUser({ ...user, coverUrl: previewUrl });

    try {
      // POST /users/me/cover
      const { cover_photo } = await uploadCover(file);
      setLocalCover(cover_photo);
      setUser({ ...user, coverUrl: cover_photo });
    } catch {
      // Revert on failure
      setLocalCover(coverUrl);
      setUser({ ...user, coverUrl });
    }
  };

  return (
    <div>
      <input
        data-test="avatar-file-input"
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleAvatarChange}
      />
      <input
        data-test="cover-file-input"
        ref={coverInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleCoverChange}
      />

      <div
        className="h-[255px] bg-center bg-cover relative mb-4"
        style={
          localCover
            ? { backgroundImage: `url('${localCover}')` }
            : { background: "linear-gradient(to right, #8EAD70, #EAF0E5)" }
        }
        onMouseEnter={() => setHoveringCover(true)}
        onMouseLeave={() => setHoveringCover(false)}
      >
        {isOwner && (!localCover || hoveringCover) && (
          <div className="absolute top-8 right-6 z-10">
            <button
              data-test="cover-update-button"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!localCover) {
                  coverInputRef.current?.click();
                } else {
                  setShowCoverMenu((prev) => !prev);
                }
              }}
              className="cursor-pointer px-3 py-1.5 bg-black text-white text-sm font-bold rounded hover:text-[#aaaaaa] transition-colors"
            >
              {localCover ? "Update image" : "Upload header image"}
            </button>

            {showCoverMenu && (
              <div className="absolute top-full right-0 mt-1 bg-black shadow-lg z-50 rounded">
                <button
                  data-test="cover-replace-button"
                  type="button"
                  onClick={() => {
                    coverInputRef.current?.click();
                    setShowCoverMenu(false);
                  }}
                  className="cursor-pointer block w-full whitespace-nowrap text-left px-4 py-3 text-sm font-bold text-white hover:text-[#737272] rounded"
                >
                  Replace image
                </button>
                <button
                  data-test="cover-delete-button"
                  type="button"
                  onClick={async () => {
                    setLocalCover(undefined);
                    setUser({ ...user, coverUrl: undefined });
                    setShowCoverMenu(false);
                    try {
                      // DELETE /users/me/cover
                      await deleteCover();
                    } catch {
                      // Revert on failure
                      setLocalCover(coverUrl);
                      setUser({ ...user, coverUrl });
                    }
                  }}
                  className="cursor-pointer block w-full whitespace-nowrap text-left px-4 py-3 text-sm font-bold text-white hover:text-[#737272] rounded"
                >
                  Delete image
                </button>
              </div>
            )}
          </div>
        )}

        <div className="absolute inset-0 flex items-center px-6 gap-6">
          <div className="relative flex-shrink-0">
            <div
              data-testid="avatar-container"
              className="w-[200px] h-[200px] rounded-full overflow-hidden flex items-center justify-center bg-[#68A039] cursor-pointer"
              onMouseEnter={() => setHoveringAvatar(true)}
              onMouseLeave={() => {
                if (!showImageMenu) setHoveringAvatar(false);
              }}
            >
              {localAvatar ? (
                <img
                  data-test="avatar-image"
                  src={localAvatar}
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

              {isOwner && hoveringAvatar && (
                <div className="absolute inset-0 bg-black/50 flex items-end justify-center pb-8 rounded-full">
                  <div className="relative">
                    <button
                      data-test="avatar-update-button"
                      className={`cursor-pointer bg-black rounded text-sm hover:text-[#737272] font-semibold px-4 py-1.5 ${showImageMenu ? "text-accent" : "text-white"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowImageMenu((prev) => !prev);
                      }}
                    >
                      Update image
                    </button>

                    {showImageMenu && (
                      <div
                        className="absolute top-full left-0 bg-black shadow-lg z-50 rounded"
                        onMouseEnter={() => setHoveringAvatar(true)}
                        onMouseLeave={() => {
                          setShowImageMenu(false);
                          setHoveringAvatar(false);
                        }}
                      >
                        <button
                          data-test="avatar-replace-button"
                          onClick={handleReplaceClick}
                          className="cursor-pointer block w-full whitespace-nowrap text-left px-4 py-3 text-sm font-bold text-white hover:text-[#737272] rounded"
                        >
                          Replace image
                        </button>
                        <button
                          data-test="avatar-delete-button"
                          onClick={handleDeleteImage}
                          className="cursor-pointer block w-full whitespace-nowrap text-left px-4 py-3 text-sm font-bold text-white hover:text-[#737272] rounded"
                        >
                          Delete image
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-0">
            <h1 className="text-white font-bold text-2xl px-2 py-1 bg-black self-start">
              {displayName}
            </h1>
            <div className="flex flex-col gap-1">
              <p className="text-gray-400 font-bold text-sm px-2 py-1 bg-black self-start">
                {username}
              </p>
              {location && (
                <p className="text-gray-400 font-bold text-sm px-2 py-1 bg-black self-start">
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
