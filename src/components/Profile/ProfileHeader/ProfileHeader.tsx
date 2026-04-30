import React, { useState, useRef, useEffect } from "react";
import type { User } from "@/stores/auth.store";
import { useAuthStore } from "@/stores/auth.store";
import {
  uploadAvatar,
  deleteAvatar,
  uploadCover,
  deleteCover,
} from "@/services/user.service";

interface ProfileHeaderProps {
  user: User;
  isOwner?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwner = false,
}) => {
  const { username, displayName, avatar, coverUrl, location, isPro } = user;
  const { setUser } = useAuthStore();

  const [hoveringAvatar, setHoveringAvatar] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [hoveringCover, setHoveringCover] = useState(false);
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | undefined>(avatar);
  const [localCover, setLocalCover] = useState<string | undefined>(coverUrl);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalAvatar(avatar);
  }, [avatar]);

  useEffect(() => {
    setLocalCover(coverUrl);
  }, [coverUrl]);

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

        <div className="absolute inset-0 flex flex-col sm:flex-row items-center sm:items-end pb-6 px-4 sm:px-6 gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div
              data-testid="avatar-container"
              className="w-[120px] h-[120px] sm:w-[200px] sm:h-[200px] rounded-full overflow-hidden flex items-center justify-center bg-[#68A039] cursor-pointer shadow-xl border-4 border-black/10"
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
                  className={`text-6xl sm:text-8xl font-bold text-white transition-opacity ${hoveringAvatar ? "opacity-30" : "opacity-100"}`}
                >
                  {username.charAt(0).toUpperCase()}
                </span>
              )}

              {isOwner && hoveringAvatar && (
                <div className="absolute inset-0 bg-black/50 flex items-end justify-center pb-4 sm:pb-8 rounded-full">
                  <div className="relative">
                    <button
                      data-test="avatar-update-button"
                      className={`cursor-pointer bg-black rounded text-[10px] sm:text-sm hover:text-[#737272] font-semibold px-2 py-1 sm:px-4 sm:py-1.5 ${showImageMenu ? "text-accent" : "text-white"}`}
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

          <div className="relative flex flex-col gap-0 items-center sm:items-start text-center sm:text-left mb-2 -top-2 sm:-top-12">
            <h1 className="text-white font-bold text-xl sm:text-2xl px-2 py-1 bg-black self-center sm:self-start leading-tight">
              {displayName}
            </h1>
            <div className="flex flex-col gap-1">
              <p className="text-gray-400 font-bold text-xs sm:text-sm px-2 py-1 bg-black self-center sm:self-start">
                {username}
              </p>
              {location && (
                <p className="text-gray-400 font-bold text-xs sm:text-sm px-2 py-1 bg-black self-center sm:self-start">
                  {location}
                </p>
              )}
              {isPro && (
                <div
                  data-test="premium-badge"
                  className="inline-flex items-center gap-1 self-center sm:self-start px-2 py-1 bg-black"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path
                      d="M9.50386 0.55107C8.64601 -0.183691 7.35399 -0.18369 6.49615 0.551072L6.4558 0.585631C5.98395 0.989776 5.35867 1.18572 4.73063 1.12625L4.67693 1.12116C3.53512 1.01303 2.48985 1.74548 2.24364 2.82622L2.23206 2.87705C2.09663 3.4715 1.71019 3.98449 1.16585 4.29241L1.1193 4.31874C0.129663 4.87854 -0.269594 6.06366 0.189869 7.07757L0.211479 7.12526C0.464201 7.68295 0.464201 8.31705 0.211479 8.87474L0.189869 8.92243C-0.269594 9.93634 0.129663 11.1215 1.1193 11.6813L1.16585 11.7076C1.71019 12.0155 2.09663 12.5285 2.23206 13.123L2.24364 13.1738C2.48985 14.2545 3.53512 14.987 4.67693 14.8788L4.73063 14.8738C5.35867 14.8143 5.98395 15.0102 6.4558 15.4144L6.49615 15.4489C7.35399 16.1837 8.64601 16.1837 9.50386 15.4489L9.54421 15.4144C10.0161 15.0102 10.6413 14.8143 11.2694 14.8738L11.3231 14.8788C12.4649 14.987 13.5101 14.2545 13.7564 13.1738L13.7679 13.1229C13.9034 12.5285 14.2898 12.0155 14.8342 11.7076L14.8807 11.6813C15.8703 11.1215 16.2696 9.93634 15.8101 8.92243L15.7885 8.87474C15.5358 8.31705 15.5358 7.68295 15.7885 7.12526L15.8101 7.07757C16.2696 6.06366 15.8703 4.87854 14.8807 4.31874L14.8342 4.29241C14.2898 3.98449 13.9034 3.4715 13.7679 2.87705L13.7564 2.82622C13.5101 1.74548 12.4649 1.01303 11.3231 1.12116L11.2694 1.12625C10.6413 1.18572 10.016 0.989776 9.5442 0.585631L9.50386 0.55107ZM12.4016 6.50673C12.5101 6.59463 12.5905 6.7145 12.6322 6.85062C12.6755 6.98851 12.6781 7.13671 12.6395 7.27611C12.6009 7.41551 12.5229 7.53972 12.4156 7.63272L10.5327 9.25741L11.1284 11.7679C11.1558 11.8731 11.1595 11.9835 11.1394 12.0905C11.1192 12.1974 11.0757 12.2982 11.0121 12.385C10.9486 12.4718 10.8667 12.5423 10.7727 12.5911C10.6788 12.64 10.5753 12.6658 10.4702 12.6667C10.3415 12.6661 10.2157 12.6271 10.1078 12.5543L8.00417 11.1759H7.99584L6.04215 12.4593C5.91594 12.5419 5.76885 12.5835 5.61969 12.5789C5.47053 12.5743 5.32609 12.5236 5.20486 12.4333C5.07996 12.3388 4.98536 12.2075 4.93336 12.0564C4.88136 11.9054 4.87436 11.7416 4.91326 11.5864L5.47562 9.29198L3.58443 7.63272C3.47713 7.53972 3.39915 7.41551 3.36054 7.27611C3.32193 7.13671 3.32447 6.98851 3.36781 6.85062C3.41002 6.71481 3.49055 6.59526 3.59898 6.50744C3.7074 6.41962 3.83874 6.36757 3.976 6.35802L6.43372 6.19383L7.36682 3.78272C7.41687 3.65067 7.50397 3.53724 7.61686 3.45712C7.72974 3.377 7.86322 3.33388 8 3.33333C8.13678 3.33388 8.27026 3.377 8.38315 3.45712C8.49603 3.53724 8.58314 3.65067 8.63318 3.78272L9.54962 6.18086L12.024 6.35802C12.1614 6.36699 12.293 6.41882 12.4016 6.50673Z"
                      fill="#CFB25D"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-white font-bold text-xs sm:text-sm leading-none">
                    Premium
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
