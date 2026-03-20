import { useState, useImperativeHandle, forwardRef } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { uploadTrack } from "@/services/api/upload/track.service";
import HelpIcon from "./HelpIcon";
import UploadCoverImage from "./UploadCoverImage";
import GenreDropdown from "./GenreDropdown";

interface Props {
  audioData: File | Blob | null;
  onCancel: () => void;
  onSuccess?: (trackId: string) => void;
  setIsLoadingParent: (loading: boolean) => void;
}

export interface UploadFormHandle {
  triggerSubmit: () => void;
  isUploading: boolean;
}

const UploadDetailsForm = forwardRef<UploadFormHandle, Props>(
  ({ audioData, onSuccess, setIsLoadingParent }: Props, ref) => {
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
    const [tags, setTags] = useState("");
    const [description, setDescription] = useState("");
    const [privacy, setPrivacy] = useState<"public" | "private">("public");
    const [coverFile, setCoverFile] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setGlobalLoading = (val: boolean) => {
      setIsLoading(val);
      setIsLoadingParent(val);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      setTrackLink(e.target.value.toLowerCase().replace(/\s+/g, "-"));
    };

    const handleSubmit = async () => {
      if (!audioData) {
        setError("Missing audio data.");
        return;
      }
      if (!title.trim()) {
        setError("Track title is required.");
        return;
      }

      setGlobalLoading(true);
      setError(null);

      try {
        const tagsArray = tags
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined;

        const result = await uploadTrack({
          audio_file: audioData,
          title: title.trim(),
          description: description.trim() || undefined,
          genre: genre || undefined,
          artists: artists.trim() || undefined,
          is_public: privacy === "public",
          cover_image: coverFile,
          tags: tagsArray,
        });

        onSuccess?.(result.data.id);
      } catch (err: any) {
        console.error("Upload failed:", err);
        setError(
          err.response?.data?.message || err.message || "Upload failed."
        );
        setGlobalLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      triggerSubmit: () => handleSubmit(),
      isUploading: isLoading,
    }));

    return (
      <div
        data-testid="upload-details-form"
        className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <UploadCoverImage onImageSelect={(file) => setCoverFile(file)} />

          <div className="flex-1 w-full space-y-8 text-xs text-text-upload">
            {/* Track Title */}
            <div>
              <label className="flex items-center gap-1 text-xs font-bold mb-1 tracking-wide">
                Track title <span className="text-[#ec5261]">*</span>
                <HelpIcon
                  title="Track title"
                  content="Clear track titles help your fans know exactly what they're listening to."
                />
              </label>
              <input
                data-testid="upload-title-input"
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="w-full bg-transparent text-sm border-b border-border py-2 outline-none focus:border-bg-inverted  hover:border-bg-inverted transition-colors"
              />
            </div>

            {/* Track Link */}
            <div>
              <label className="block text-xs font-bold mb-1 tracking-wide">
                Track link
              </label>
              <div className="flex items-center text-sm text-text-upload border-b border-border focus:border-bg-inverted  hover:border-bg-inverted transition-colors py-2">
                <span className="shrink-0 text-text-upload/60">
                  https://soundcloud.com/{username}/
                </span>
                <input
                  data-testid="upload-track-link-input"
                  type="text"
                  value={trackLink}
                  onChange={(e) => setTrackLink(e.target.value)}
                  className="flex-1 bg-transparent text-text-upload outline-none px-1"
                />
              </div>
            </div>

            {/* Main Artist */}
            <div>
              <label className="flex items-center gap-1 text-xs font-bold mb-1 tracking-wide">
                Main Artist(s)
                <HelpIcon
                  title="Main Artist(s)"
                  content="Put your name and any featured artists you want to give primary credit to here. These names will be displayed underneath your track title."
                />
              </label>
              <input
                data-testid="upload-artists-input"
                type="text"
                value={artists}
                onChange={(e) => setArtists(e.target.value)}
                className="w-full bg-transparent text-sm border-b border-border  focus:border-bg-inverted  hover:border-bg-inverted py-2 outline-none transition-colors"
              />
              <p className="text-[12px] text-[#616161] mt-1">
                Tip: Use commas to add multiple artist names.
              </p>
            </div>

            {/* Genre */}
            <div>
              <GenreDropdown value={genre} onChange={setGenre} />
            </div>

            {/* Tags */}
            <div>
              <label className="flex items-center gap-1 text-xs font-bold mb-1 tracking-wide">
                Tags <HelpIcon 
                  title="Tags"
                  content="Tags help identify what kind of sound your track is, whether it is spoken voice, hip-hop, etc. Tags make it easier for listeners to find your track on SoundCloud."
                />
              </label>
              <input
                data-testid="upload-tags-input"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add styles, moods, tempo."
                className="w-full bg-transparent text-sm border-b border-border py-2 outline-none focus:border-bg-inverted  hover:border-bg-inverted placeholder:text-text-upload/40"
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-1 text-xs font-bold mb-1 tracking-wide">
                Description
              </label>
              <input
                data-testid="upload-description-input"
                placeholder="Tracks with description tend to get more plays and engagements."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-transparent text-sm border-b border-border py-2 outline-none focus:border-bg-inverted  hover:border-bg-inverted placeholder:text-text-upload/40"
              />
            </div>

            {/* Privacy Section */}
            <div>
              <label className="flex items-center gap-1 text-xs font-bold mb-1 tracking-wide">
                Track Privacy
              </label>
              <div className="flex gap-10 text-sm py-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    data-testid="upload-privacy-public-radio"
                    type="radio"
                    name="privacy"
                    className="hidden"
                    checked={privacy === "public"}
                    onChange={() => setPrivacy("public")}
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${privacy === "public" ? "border-bg-inverted" : "border-[#666] group-hover:border-bg-inverted"}`}
                  >
                    {privacy === "public" && (
                      <div className="w-2.5 h-2.5 bg-bg-inverted rounded-full" />
                    )}
                  </div>
                  <span
                    className={`${privacy === "public" ? "text-text-upload font-bold" : "text-[#999]"}`}
                  >
                    Public
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    data-testid="upload-privacy-private-radio"
                    type="radio"
                    name="privacy"
                    className="hidden"
                    checked={privacy === "private"}
                    onChange={() => setPrivacy("private")}
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${privacy === "private" ? "border-bg-inverted" : "border-[#666] group-hover:border-bg-inverted"}`}
                  >
                    {privacy === "private" && (
                      <div className="w-2.5 h-2.5 bg-bg-inverted rounded-full" />
                    )}
                  </div>
                  <span
                    className={`${privacy === "private" ? "text-text-upload font-bold" : "text-[#999]"}`}
                  >
                    Private
                  </span>
                </label>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <p
                data-testid="upload-error-message"
                className="text-[#FB2C36] text-sm font-bold bg-[#FB2C36]/10 p-3 rounded-sm"
              >
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default UploadDetailsForm;
