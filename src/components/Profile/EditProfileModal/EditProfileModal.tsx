import React, { useState, useEffect } from "react";
import { useAuthStore, type ProfileLink } from "@/stores/auth.store";
import { uploadAvatar } from "@/services/user.service";

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
    links?: ProfileLink[];
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
    links?: ProfileLink[];
  }) => void | Promise<void>;
}

const formControlClass =
  "w-full h-10 box-border bg-input-bg rounded px-3 text-sm text-bg-inverted outline-none border border-border focus:border-text-hover";

const createLink = (isSupport = false): ProfileLink => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  url: "",
  title: "",
  isSupport,
});

const supportPlatformsText =
  "Supported platforms: PayPal, Cash app, Venmo, Bandcamp, Shopify, Kickstarter, Patreon, and Gofundme.";

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const { user: currentUser, setUser } = useAuthStore();
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
  const existingLinks = user.links ?? [];
  const [links, setLinks] = useState<ProfileLink[]>(
    existingLinks.length > 0 ? existingLinks.map((link) => ({ ...link })) : [],
  );
  const [errors, setErrors] = useState<{
    displayName?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    country?: string;
  }>({});

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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

    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(previewUrl);

    const latestUser = currentUser ?? undefined;
    if (latestUser) {
      setUser({ ...latestUser, avatar: previewUrl });
    }

    try {
      const { profile_picture } = await uploadAvatar(file);
      setAvatarPreview(profile_picture);
      if (latestUser) {
        setUser({ ...latestUser, avatar: profile_picture });
      }
      setAvatarFile(null);
    } catch (error) {
      console.error(error);
      setAvatarPreview(user.avatar || null);
      if (latestUser) {
        setUser({ ...latestUser, avatar: user.avatar });
      }
      setAvatarFile(null);
    } finally {
      URL.revokeObjectURL(previewUrl);
      e.target.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const isNumericOnly = (value: string) => /^\d+$/.test(value.trim());

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!displayName.trim()) {
      newErrors.displayName = "Display name is required.";
    } else if (isNumericOnly(displayName)) {
      newErrors.displayName = "Display name cannot be numbers only.";
    }

    if (firstName.trim() && isNumericOnly(firstName)) {
      newErrors.firstName = "First name cannot be numbers only.";
    }

    if (lastName.trim() && isNumericOnly(lastName)) {
      newErrors.lastName = "Last name cannot be numbers only.";
    }

    if (city.trim() && /\d/.test(city)) {
      newErrors.city = "City cannot contain numbers.";
    }

    if (country.trim() && /\d/.test(country)) {
      newErrors.country = "Country cannot contain numbers.";
    } else if (country.trim() && country.trim().length > 2) {
      newErrors.country = "Country must be 2 letters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await Promise.resolve(
      onSave({
        displayName: displayName.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
        city: city.trim(),
        country: country.trim(),
        location: city && country ? `${city}, ${country}` : city || country || "",
        avatarFile: null,
        links: links
          .map((link) => ({
            ...link,
            url: link.url.trim(),
            title: link.title.trim(),
          }))
          .filter((link) => link.url),
      }),
    );
    onClose();
  };

  const currentAvatar = avatarPreview || user.avatar || null;
  const hasSupportLink = links.some((link) => link.isSupport);

  const updateLink = (
    id: string,
    field: keyof Pick<ProfileLink, "url" | "title">,
    value: string,
  ) => {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link)),
    );
  };

  const addLinkRow = (isSupport = false) => {
    if (isSupport && hasSupportLink) return;
    setLinks((prev) => [...prev, createLink(isSupport)]);
  };

  const removeLinkRow = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  return (
    <>
      <button
        data-test="edit-modal-close-button"
        onClick={onClose}
        className="fixed top-14 right-4 sm:top-16 sm:right-6 cursor-pointer text-bg text-lg hover:opacity-70 z-60 bg-bg-inverted rounded-full w-8 h-8 flex items-center justify-center"
      >
        <i className="fa-solid fa-xmark" />
      </button>

      <div
        className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-16 sm:pt-20 px-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-bg rounded-sm p-5 sm:p-7 lg:p-8 w-full max-w-[720px] my-6 text-bg-inverted"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-bg-inverted text-left font-bold text-xl mb-6">
            Edit your Profile
          </h2>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0 self-center lg:self-start">
              <div className="w-36 h-36 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden bg-input-bg relative cursor-pointer">
                {currentAvatar ? (
                  <img
                    data-test="edit-avatar-preview"
                    src={currentAvatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-input-bg" />
                )}
                <label className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 cursor-pointer">
                  <input
                    data-test="edit-avatar-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <span className="bg-bg-inverted text-bg text-xs font-bold px-3 py-1.5 rounded whitespace-nowrap">
                    Upload image
                  </span>
                </label>
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-left text-bg-inverted">
                  Display name <span className="text-red-500">*</span>
                </label>
                <input
                  data-test="edit-display-name-input"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (errors.displayName) {
                      const { displayName: _displayName, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                  className={`bg-input-bg rounded px-3 py-2 text-sm text-bg-inverted outline-none border focus:border-text-hover ${errors.displayName ? "border-red-500" : "border-border"}`}
                />
                {errors.displayName && (
                  <span className="text-error text-xs">
                    {errors.displayName}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-left text-bg-inverted">
                  Profile URL <span className="text-red-500">*</span>
                </label>
                <div className="bg-input-bg rounded px-3 py-2 text-sm flex items-center gap-1">
                  <span className="text-text-secondary">Rythmify.com/</span>
                  <span className="text-bg-inverted">{user.username}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm text-left text-bg-inverted">
                    First name
                  </label>
                  <input
                    data-test="edit-first-name-input"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (errors.firstName) {
                        const { firstName: _firstName, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    className={formControlClass}
                  />
                  {errors.firstName && (
                    <span className="text-red-500 text-xs">
                      {errors.firstName}
                    </span>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm text-left text-bg-inverted">
                    Last name
                  </label>
                  <input
                    data-test="edit-last-name-input"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (errors.lastName) {
                        const { lastName: _lastName, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    className={formControlClass}
                  />
                  {errors.lastName && (
                    <span className="text-red-500 text-xs">
                      {errors.lastName}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm text-left text-bg-inverted">City</label>
                  <input
                    data-test="edit-city-input"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city) {
                        const { city: _city, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    className={formControlClass}
                  />
                  {errors.city && (
                    <span className="text-red-500 text-xs">
                      {errors.city}
                    </span>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-sm text-left text-bg-inverted">
                    Country
                  </label>
                  <input
                    data-test="edit-country-input"
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      if (errors.country) {
                        const { country: _country, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    className={formControlClass}
                  />
                  {errors.country && (
                    <span className="text-red-500 text-xs">
                      {errors.country}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-left text-bg-inverted">Bio</label>
                <textarea
                  data-test="edit-bio-input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world a little bit about yourself. The shorter the better."
                  className="bg-input-bg rounded px-3 py-2 text-sm text-bg-inverted outline-none border border-border focus:border-text-hover h-24 resize-none placeholder:text-text-secondary"
                />
              </div>
            </div>
          </div>

          {/* Your links */}
          <div className="mt-6 flex flex-col gap-3">
            {links.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-bg-inverted text-sm font-bold">
                    Your links
                  </span>
                  <i className="fa-solid fa-circle-info text-text-secondary text-xs" />
                </div>
                <div className="flex flex-col gap-3">
                  {links.map((link) =>
                    link.isSupport ? (
                      <div key={link.id} className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-text-secondary text-lg shrink-0">
                            <i className="fa-solid fa-dollar-sign" />
                          </span>
                          <input
                            value={link.url}
                            onChange={(e) =>
                              updateLink(link.id, "url", e.target.value)
                            }
                            placeholder="e.g. https://paypal.me/username"
                            className="flex-1 min-w-0 h-10 box-border bg-input-bg rounded px-3 text-sm text-bg-inverted outline-none border border-border focus:border-text-hover"
                          />
                          <span className="text-text-secondary text-sm shrink-0">
                            <i className="fa-solid fa-circle-info" />
                          </span>
                          <button
                            type="button"
                            aria-label="Remove link"
                            onClick={() => removeLinkRow(link.id)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-input-bg text-bg-inverted transition-opacity hover:opacity-70"
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                        <div className="pl-7 text-sm leading-relaxed text-text-secondary">
                          <span>{supportPlatformsText}</span>
                          <button
                            type="button"
                            className="ml-1 cursor-pointer text-[#7da7ff] hover:underline"
                          >
                            Learn more
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div key={link.id} className="flex items-center gap-3">
                        <span className="text-text-secondary text-lg shrink-0">
                          <i className="fa-solid fa-link" />
                        </span>
                          <input
                            value={link.url}
                            onChange={(e) =>
                              updateLink(link.id, "url", e.target.value)
                            }
                            placeholder="Web or email address"
                            className="flex-1 min-w-0 h-10 box-border bg-input-bg rounded px-3 text-sm text-bg-inverted outline-none border border-border focus:border-text-hover"
                          />
                          <input
                            value={link.title}
                            onChange={(e) =>
                              updateLink(link.id, "title", e.target.value)
                            }
                            placeholder="Short title"
                            className="w-full sm:w-64 h-10 box-border bg-input-bg rounded px-3 text-sm text-bg-inverted outline-none border border-border focus:border-text-hover"
                          />
                          <button
                            type="button"
                            aria-label="Remove link"
                            onClick={() => removeLinkRow(link.id)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-input-bg text-bg-inverted transition-opacity hover:opacity-70"
                          >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    ),
                  )}
                </div>
              </>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                data-test="add-link-button"
                onClick={() => addLinkRow(false)}
                className="px-4 py-2 bg-bg-actionbutton text-bg-inverted text-sm font-bold rounded hover:opacity-70"
              >
                Add link
              </button>
              <button
                type="button"
                data-test="add-support-link-button"
                onClick={() => addLinkRow(true)}
                disabled={hasSupportLink}
                className={`px-4 py-2 text-sm font-bold rounded transition-opacity ${
                  hasSupportLink
                    ? "bg-border text-text-secondary cursor-not-allowed"
                    : "bg-bg text-bg-inverted hover:opacity-70"
                }`}
              >
                Add support link
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              data-test="edit-cancel-button"
              onClick={onClose}
              className="px-6 py-2 bg-bg-actionbutton text-bg-inverted text-sm font-bold rounded hover:opacity-70"
            >
              Cancel
            </button>
            <button
              data-test="edit-save-button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-bg-inverted text-bg text-sm font-bold rounded hover:opacity-80"
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
