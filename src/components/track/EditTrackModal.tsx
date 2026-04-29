import { useState, useRef, useEffect } from "react";
import { Modal } from "../MessagingComponents/Modal";
import {
  updateTrack,
  updateTrackCover,
  getGenres,
  setTrackVisibility,
  type GenreOption,
} from "@/services/api/upload/track.service";
import PrivacyToggle from "../Upload/PrivacyToggle";
import type { Track } from "@/types/track";

interface EditTrackModalProps {
  track: Track;
  onClose: () => void;
  /** Called after a successful save with the partial updated fields */
  onSaved: (updated: Partial<Track>) => void;
}

// ── Helper ────────────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="text-white text-sm font-semibold">
        {label}
        {required && <span className="text-[#FB2C36] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function EditTrackModal({
  track,
  onClose,
  onSaved,
}: EditTrackModalProps) {
  const [title, setTitle] = useState(track.title ?? "");
  const [description, setDescription] = useState<string>("");
  // genre stored as name (backend resolves by name, not ID)
  const [genreName, setGenreName] = useState<string>(track.genre ?? "");
  const [isPublic, setIsPublic] = useState(!track.isPrivate);
  const initialIsPublic = !track.isPrivate;
  const [genres, setGenres] = useState<GenreOption[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    track.coverUrl ?? null,
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch genres on mount
  useEffect(() => {
    getGenres()
      .then((fetched) =>
        setGenres(
          Array.isArray(fetched)
            ? fetched.map((g) =>
                typeof g === "string" ? { id: g, name: g } : g,
              )
            : [],
        ),
      )
      .catch(() => setGenres([]));
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, "");
      if (!tags.includes(newTag)) setTags((prev) => [...prev, newTag]);
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      // 1️⃣ Metadata PATCH (title, description, genre by name, tags — NO is_public, NO cover)
      await updateTrack(track.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        genre: genreName || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      // 2️⃣ Visibility PATCH — only if the user actually toggled it
      if (isPublic !== initialIsPublic) {
        await setTrackVisibility(track.id, isPublic);
      }

      // 3️⃣ Cover PATCH — only if the user picked a new image
      if (coverFile) {
        await updateTrackCover(track.id, coverFile);
      }

      onSaved({
        title: title.trim(),
        genre: genreName,
        isPrivate: !isPublic,
        coverUrl: coverPreview ?? track.coverUrl,
      });

      onClose();
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose}>
      <div className="bg-bg flex flex-col">
        {/* ── Header ── */}
        <div className="px-3 pt-4 pb-2 border-b border-white/10">
          <h2 className="text-white text-[22px] font-bold">Edit track</h2>
        </div>

        {/* ── Body ── */}
        <div className="p-3 min-w-[720px] overflow-y-auto">
          <div className="flex gap-6">
            {/* Cover image */}
            <div className="shrink-0">
              <div
                className="w-[180px] h-[180px] bg-[#2a2a2a] rounded-sm overflow-hidden relative cursor-pointer group"
                onClick={() => fileRef.current?.click()}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#3a3a5c] to-[#2a2a3a]" />
                )}
                <div className="absolute inset-0 bg-black/10 flex items-end justify-center pb-4">
                  <span
                    data-test="button-upload-cover-track"
                    className="text-white text-[13px] font-bold bg-bg px-3 py-1 rounded-sm cursor-pointer"
                  >
                    Upload image
                  </span>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>

            {/* Fields */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Title */}
              <Field label="Title" required>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  data-test="input-track-title"
                  className="w-full bg-[#2a2a2a] text-white text-sm px-3 py-2.5 rounded-sm outline-none border border-transparent focus:border-[#555] transition-colors"
                />
              </Field>

              {/* Genre — value & onChange use genre NAME (backend resolves by name) */}
              <Field label="Genre">
                <select
                  value={genreName}
                  onChange={(e) => setGenreName(e.target.value)}
                  data-test="select-track-genre"
                  className="w-full bg-[#2a2a2a] text-white text-sm px-3 py-2.5 rounded-sm outline-none border border-transparent focus:border-[#555] transition-colors appearance-none cursor-pointer"
                >
                  <option value="">No genre</option>
                  {genres.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Additional tags */}
              <Field label="Additional tags">
                <div className="flex flex-wrap gap-1.5 bg-[#2a2a2a] px-3 py-2 rounded-sm border border-transparent focus-within:border-[#555] transition-colors min-h-[42px]">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 bg-[#3a3a3a] text-white text-[12px] px-2 py-0.5 rounded-sm"
                    >
                      #{tag}
                      <button
                        data-test={`button-remove-tag-${tag}`}
                        onClick={() =>
                          setTags((prev) => prev.filter((t) => t !== tag))
                        }
                        className="text-[#888] hover:text-white cursor-pointer leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={
                      tags.length === 0
                        ? "Add tags to describe the genre and mood of your track"
                        : ""
                    }
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-[#555] min-w-[160px]"
                  />
                </div>
              </Field>

              {/* Description */}
              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Describe your track"
                  data-test="textarea-track-description"
                  className="w-full bg-[#2a2a2a] text-white text-sm px-3 py-2.5 rounded-sm outline-none border border-transparent focus:border-[#555] transition-colors resize-none placeholder:text-[#555]"
                />
              </Field>

              {/* Privacy */}
              <Field label="Privacy:">
                <PrivacyToggle
                  value={isPublic ? "public" : "private"}
                  onChange={(val) => setIsPublic(val === "public")}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10">
          {error && <p className="text-[#FB2C36] text-sm">{error}</p>}
          <p className="text-white text-sm font-bold">
            <span className="text-[#FB2C36]">*</span> Required fields
          </p>
          <div className="ml-auto flex gap-3">
            <button
              data-test="button-cancel-edit-track"
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-bold text-white bg-[#303030] rounded-sm hover:text-[#717171] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              data-test="button-save-changes-edit-track-modal"
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-3 py-1.5 bg-bg-inverted text-bg text-sm font-bold rounded-sm hover:text-[#a0a0a0] transition-opacity disabled:opacity-40 cursor-pointer"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
