import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { uploadTrack } from "@/services/api/upload/track.service";
import HelpIcon from "./HelpIcon";
import UploadCoverImage from "./UploadCoverImage";
import GenreDropdown from "./GenreDropdown";

interface Props {
  audioData: File | Blob | null;
  onCancel: () => void;
  onSuccess?: (trackId: string) => void;
}

const UploadDetailsForm = ({ audioData, onCancel, onSuccess }: Props) => {
  const { user } = useAuthStore();
  const username = user?.username || "username";

  const initialTitle =
    audioData instanceof File
      ? audioData.name.split(".").slice(0, -1).join(".")
      : "Recorded Audio";

  const [title, setTitle] = useState(initialTitle);
  const [trackLink, setTrackLink] = useState(
    initialTitle.toLowerCase().replace(/\s+/g, "-")
  );
  const [artists, setArtists] = useState(username);
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setTrackLink(e.target.value.toLowerCase().replace(/\s+/g, "-"));
  };

  const handleSubmit = async () => {
    if (!audioData || !title.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await uploadTrack({
        audio_file: audioData,
        title: title.trim(),
        description: description.trim() || undefined,
        genre: genre || undefined,
        artists: artists.trim() || undefined,
        is_public: privacy === "public",
        cover_image: coverFile,
      });
      onSuccess?.(result.data.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <UploadCoverImage onImageSelect={(file) => setCoverFile(file)} />{" "}
        {/* Form Section for metadata */}
        <div className="flex-1 w-full space-y-8 text-xs text-text-upload">
          <div>
            <label className="flex items-center gap-1 text-xs font-bold mb-1 tracking-wide">
              Track title <span className="text-[#ec5261]">*</span>
              <HelpIcon />
            </label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full bg-transparent text-sm border-b border-border py-2 outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 tracking-wide ">
              Track link
            </label>
            <div className="flex items-center text-sm text-text-upload border-b border-border py-2">
              <span className="shrink-0">
                https://soundcloud.com/{username}/
              </span>
              <input
                type="text"
                value={trackLink}
                onChange={(e) => setTrackLink(e.target.value)}
                className="flex-1 bg-transparent text-text-upload outline-none px-1"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-bold mb-1 tracking-wide ">
              Main Artist(s) <HelpIcon />
            </label>
            <input
              type="text"
              value={artists}
              onChange={(e) => setArtists(e.target.value)}
              className="w-full bg-transparent text-sm border-b border-border py-2 outline-none transition-colors"
            />
            <p className="text-[12px] text-[#616161] mt-1">
              Tip: Use commas to add multiple artist names.
            </p>
          </div>
          <div>
            <GenreDropdown value={genre} onChange={setGenre} />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-bold mb-1 tracking-wide ">
              Tags <HelpIcon />
            </label>
            <input
              type="text"
              placeholder="Add styles, moods, tempo."
              className="w-full bg-transparent text-sm border-b border-border py-2 outline-none focus:border-white placeholder:text-text-upload/40"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-bold mb-1 tracking-wide ">
              Description
            </label>
            <input
              type="text"
              placeholder="Tracks with description tend to get more plays and engagements."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent text-sm border-b border-border py-2 outline-none focus:border-white placeholder:text-text-upload/40"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-bold mb-1 tracking-wide ">
              Track Privacy
            </label>
            <div className="flex gap-10 text-sm py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="privacy"
                  className="hidden"
                  checked={privacy === "public"}
                  onChange={() => setPrivacy("public")}
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${privacy === "public" ? "border-white" : "border-[#666] group-hover:border-white"}`}
                >
                  {privacy === "public" && (
                    <div className="w-2.5 h-2.5 bg-bg-inverted rounded-full" />
                  )}
                </div>
                <span
                  className={`text-sm ${privacy === "public" ? "text-upload" : "text-[#999]"}`}
                >
                  Public
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="privacy"
                  className="hidden"
                  checked={privacy === "private"}
                  onChange={() => setPrivacy("private")}
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${privacy === "private" ? "border-white" : "border-[#666] group-hover:border-white"}`}
                >
                  {privacy === "private" && (
                    <div className="w-2.5 h-2.5 bg-bg-inverted rounded-full" />
                  )}
                </div>
                <span
                  className={`text-sm ${privacy === "private" ? "text-upload" : "text-[#999]"}`}
                >
                  Private
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDetailsForm;
