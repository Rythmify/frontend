import { useState, useRef } from "react";
import { Modal } from "../MessagingComponents/Modal";
import {
  updatePlaylist,
  type Playlist,
  type PlaylistSubtype,
} from "@/services/api/playlist/playlist.service";
import { getGenres } from "@/services/api/upload/track.service";
import { useEffect } from "react";
import PrivacyToggle from "../Upload/PrivacyToggle";

interface EditPlaylistModalProps {
  playlist: Playlist;
  onClose: () => void;
  onSaved: (updated: Playlist) => void;
}

type Tab = "basic" | "tracks" | "metadata";

const PLAYLIST_TYPES: { label: string; value: PlaylistSubtype }[] = [
  { label: "Playlist", value: "playlist" },
  { label: "Album", value: "album" },
  { label: "EP", value: "ep" },
  { label: "Single", value: "single" },
  { label: "Compilation", value: "compilation" },
];

export default function EditPlaylistModal({
  playlist,
  onClose,
  onSaved,
}: EditPlaylistModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("basic");

  // ── Basic info state ───────────────────────────────────────────────────────
  const [name, setName] = useState(playlist.name);
  const [slug, setSlug] = useState(playlist.slug ?? "");
  const [subtype, setSubtype] = useState<PlaylistSubtype>(
    playlist.subtype ?? "playlist",
  );
  const [releaseDate, setReleaseDate] = useState(playlist.release_date ?? "");
  const [genreId, setGenreId] = useState(playlist.genre_id ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(
    playlist.tags?.map((t) => t.name) ?? [],
  );
  const [description, setDescription] = useState(playlist.description ?? "");
  const [isPublic, setIsPublic] = useState(playlist.is_public);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    playlist.cover_image ?? null,
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  // ── UI state ───────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 60),
    );
  };

  // Fetch genres on mount
  useEffect(() => {
    getGenres()
      .then((res) => setGenres(res))
      .catch(() => {});
  }, []);

  // Cover image
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // Tags
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
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await updatePlaylist(playlist.playlist_id, {
        name: name.trim(),
        description: description.trim() || null,
        is_public: isPublic,
        subtype,
        slug: slug || undefined,
        release_date: releaseDate || null,
        genre_id: genreId || null,
        cover_image: coverFile ?? undefined,
      });
      onSaved(res.data);
      onClose();
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "basic", label: "Basic info" },
    { id: "tracks", label: "Tracks" },
    { id: "metadata", label: "Metadata" },
  ];

  return (
    <Modal isOpen onClose={onClose}>
      <div className=" bg-bg flex flex-col">
        {/* ── Tab bar ── */}
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-4 text-[22px] font-bold relative transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="p-3 min-w-fit overflow-y-auto ">
          {activeTab === "basic" && (
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
                    <span className="text-white text-[13px] font-bold bg-bg px-3 py-1 rounded-sm cursor-pointer">
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
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    maxLength={100}
                    className="w-full bg-[#2a2a2a] text-white text-sm px-3 py-2.5 rounded-sm outline-none border border-transparent focus:border-[#555] transition-colors"
                  />
                </Field>

                {/* Permalink */}
                <Field label="Permalink" required>
                  <div className="flex items-center bg-[#2a2a2a] rounded-sm border border-transparent focus-within:border-[#555] transition-colors overflow-hidden">
                    <span className="text-[#6e6e6e] text-[12px] px-3 py-2.5 whitespace-nowrap border-r border-[#3a3a3a]">
                      rythmify.com/{playlist.owner_user_id}/sets/
                    </span>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm px-3 py-2.5 outline-none min-w-0"
                    />
                  </div>
                </Field>

                {/* Type + Release date */}
                <div className="flex gap-4">
                  <Field label="Playlist type" className="flex-1">
                    <select
                      value={subtype}
                      onChange={(e) =>
                        setSubtype(e.target.value as PlaylistSubtype)
                      }
                      className="w-full bg-[#2a2a2a] text-white text-sm px-3 py-2.5 rounded-sm outline-none border border-transparent focus:border-[#555] transition-colors appearance-none cursor-pointer"
                    >
                      {PLAYLIST_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Release date" className="flex-1">
                    <input
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      className="w-full bg-[#2a2a2a] text-white text-sm px-3 py-2.5 rounded-sm outline-none border border-transparent focus:border-[#555] transition-colors"
                    />
                  </Field>
                </div>

                {/* Genre */}
                <Field label="Genre">
                  <select
                    value={genreId}
                    onChange={(e) => setGenreId(e.target.value)}
                    className="w-full bg-[#2a2a2a] text-white text-sm px-3 py-2.5 rounded-sm outline-none border border-transparent focus:border-[#555] transition-colors appearance-none cursor-pointer"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g}>
                        {g}
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
                          ? "Add tags to describe the genre and mood of your playlist"
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
                    rows={4}
                    maxLength={500}
                    placeholder="Describe your playlist"
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
          )}

          {activeTab === "tracks" && (
            <div className="text-[#6e6e6e] text-sm py-8 text-center">
              Track management coming soon.
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-1 ">
          {error && <p className="text-[#FB2C36] text-sm">{error}</p>}
          <p className="text-white text-sm font-bold">
            <span className="text-[#FB2C36]">*</span> Required fields
          </p>
          <div className="ml-auto flex gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-bold text-white bg-[#303030] rounded-sm hover:text-[#717171] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
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
