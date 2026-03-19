import React, { useState, useEffect } from "react";

interface EditProfileModalProps {
  user: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    city?: string;
    country?: string;
    avatar?: string;
    username?: string;
  };
  onClose: () => void;
  onSave: (data: {
    displayName: string;
    firstName: string;
    lastName: string;
    bio: string;
    city: string;
    country: string;
    location: string;
    avatarFile: File | null;
  }) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [city, setCity] = useState(user.city || "");
  const [country, setCountry] = useState(user.country || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ displayName?: string }>({});

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const validate = () => {
    const newErrors: { displayName?: string } = {};
    if (!displayName.trim())
      newErrors.displayName = "Display name is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      displayName: displayName.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      bio: bio.trim(),
      city: city.trim(),
      country: country.trim(),
      location: city && country ? `${city}, ${country}` : city || country || "",
      avatarFile,
    });
    onClose();
  };

  const currentAvatar = avatarPreview || user.avatar || null;

  return (
    <>
      <button
        data-test="edit-modal-close-button"
        onClick={onClose}
        className="fixed top-3 right-3 cursor-pointer text-white text-lg hover:opacity-70 z-60 bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center mt-6 mr-6"
      >
        <i className="fa-solid fa-xmark" />
      </button>

      <div
        className="fixed inset-0 bg-white/50 flex items-start justify-center z-50 pt-10"
        onClick={onClose}
      >
        <div
          className="bg-black rounded-sm p-9 w-[780px]"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-white text-left font-bold text-xl mb-6">
            Edit your Profile
          </h2>

          <div className="flex gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-600 relative cursor-pointer">
                {currentAvatar ? (
                  <img
                    data-test="edit-avatar-preview"
                    src={currentAvatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600" />
                )}
                <label className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer">
                  <input
                    data-test="edit-avatar-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <span className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded whitespace-nowrap">
                    Upload image
                  </span>
                </label>
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-left text-white">
                  Display name <span className="text-red-500">*</span>
                </label>
                <input
                  data-test="edit-display-name-input"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (errors.displayName) setErrors({});
                  }}
                  className={`bg-[#333] rounded px-3 py-2 text-sm text-white outline-none border focus:border-white ${errors.displayName ? "border-red-500" : "border-transparent"}`}
                />
                {errors.displayName && (
                  <span className="text-red-500 text-xs">
                    {errors.displayName}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-left text-white">
                  Profile URL <span className="text-red-500">*</span>
                </label>
                <div className="bg-[#333] rounded px-3 py-2 text-sm flex items-center gap-1">
                  <span className="text-text-secondary">Rythmify.com/</span>
                  <span className="text-white">{user.username}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm text-left text-white">
                    First name
                  </label>
                  <input
                    data-test="edit-first-name-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-[#333] rounded px-3 py-2 text-sm text-white outline-none border border-transparent focus:border-white"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm text-left text-white">
                    Last name
                  </label>
                  <input
                    data-test="edit-last-name-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-[#333] rounded px-3 py-2 text-sm text-white outline-none border border-transparent focus:border-white"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm text-left text-white">City</label>
                  <input
                    data-test="edit-city-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-[#333] rounded px-3 py-2 text-sm text-white outline-none border border-transparent focus:border-white"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm text-left text-white">
                    Country
                  </label>
                  <input
                    data-test="edit-country-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="bg-[#333] rounded px-3 py-2 text-sm text-white outline-none border border-transparent focus:border-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-left text-white">Bio</label>
                <textarea
                  data-test="edit-bio-input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world a little bit about yourself. The shorter the better."
                  className="bg-[#333] rounded px-3 py-2 text-sm text-white outline-none border border-transparent focus:border-white h-24 resize-none placeholder:text-text-secondary"
                />
              </div>
            </div>
          </div>

          {/* Your links */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-bold">Your links</span>
              <i className="fa-solid fa-circle-info text-text-secondary text-xs" />
            </div>
            <div className="flex gap-3">
              <button
                data-test="add-link-button"
                className="px-4 py-2 bg-[#333] text-white text-sm font-bold rounded hover:opacity-70"
              >
                Add link
              </button>
              <button
                data-test="add-support-link-button"
                className="px-4 py-2 bg-white text-[#333] text-sm font-bold rounded hover:opacity-70"
              >
                Add support link
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              data-test="edit-cancel-button"
              onClick={onClose}
              className="px-6 py-2 bg-[#333] text-white text-sm font-bold rounded hover:opacity-70"
            >
              Cancel
            </button>
            <button
              data-test="edit-save-button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-white text-black text-sm font-bold rounded hover:bg-gray-200"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfileModal;
