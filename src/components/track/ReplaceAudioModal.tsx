import { useState, useRef, useCallback } from "react";
import { Modal } from "../MessagingComponents/Modal";
import { replaceTrackAudio } from "@/services/api/upload/track.service";
import { TbUpload, TbMusic, TbCheck, TbAlertCircle } from "react-icons/tb";

interface ReplaceAudioModalProps {
  trackId: string;
  trackTitle: string;
  onClose: () => void;
  /** Called after a successful upload so the card can show the "processing" state */
  onReplaced?: () => void;
}

type Stage = "idle" | "uploading" | "done" | "error";

const ACCEPTED = [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", "audio/*"];

export default function ReplaceAudioModal({
  trackId,
  trackTitle,
  onClose,
  onReplaced,
}: ReplaceAudioModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── File selection ─────────────────────────────────────────── */
  const pickFile = (f: File) => {
    if (!f.type.startsWith("audio/")) {
      setError("Please select a valid audio file (MP3, WAV, FLAC, AAC…)");
      return;
    }
    setError(null);
    setFile(f);
    setStage("idle");
    setProgress(0);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) pickFile(f);
  };

  /* ── Drag & drop ────────────────────────────────────────────── */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  }, []);

  /* ── Upload ─────────────────────────────────────────────────── */
  const handleUpload = async () => {
    if (!file) return;
    setStage("uploading");
    setProgress(0);
    setError(null);
    try {
      await replaceTrackAudio(trackId, file, setProgress);
      setStage("done");
      setProgress(100);
      onReplaced?.();
    } catch {
      setStage("error");
      setError("Upload failed. Please try again.");
    }
  };

  /* ── Helpers ─────────────────────────────────────────────────── */
  const fmtSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal isOpen onClose={stage === "uploading" ? () => {} : onClose}>
      <div className="w-[520px] bg-bg flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h2 className="text-white text-[20px] font-bold">Replace audio file</h2>
          <p className="text-white/50 text-sm truncate">
            {trackTitle}
          </p>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => stage !== "uploading" && inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            relative flex flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed
            min-h-[180px] cursor-pointer transition-all duration-200
            ${dragging
              ? "border-[#f50] bg-[#f50]/5"
              : stage === "done"
                ? "border-green-500/40 bg-green-500/5 cursor-default"
                : "border-white/15 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]"
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={onInputChange}
            disabled={stage === "uploading" || stage === "done"}
          />

          {stage === "done" ? (
            <>
              <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center">
                <TbCheck size={28} className="text-green-400" />
              </div>
              <p className="text-green-400 font-semibold text-sm">
                Upload complete — track is processing
              </p>
              <p className="text-white/40 text-xs text-center max-w-[300px]">
                Your new audio is being processed. Waveform and playback will update shortly.
              </p>
            </>
          ) : stage === "uploading" ? (
            <>
              <div className="w-14 h-14 rounded-full bg-[#f50]/10 flex items-center justify-center">
                <TbUpload size={28} className="text-[#f50] animate-bounce" />
              </div>
              <p className="text-white/70 font-semibold text-sm">Uploading…</p>
              {/* Progress bar */}
              <div className="w-4/5 bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-[#f50] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white/40 text-xs">{progress}%</p>
            </>
          ) : file ? (
            <>
              <div className="w-14 h-14 rounded-full bg-[#f50]/10 flex items-center justify-center">
                <TbMusic size={28} className="text-[#f50]" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-sm truncate max-w-[300px]">
                  {file.name}
                </p>
                <p className="text-white/40 text-xs mt-0.5">{fmtSize(file.size)}</p>
              </div>
              <p className="text-white/30 text-xs">Click to choose a different file</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                <TbUpload size={28} className="text-white/40" />
              </div>
              <div className="text-center">
                <p className="text-white/70 font-semibold text-sm">
                  Drop your audio file here
                </p>
                <p className="text-white/35 text-xs mt-1">
                  or click to browse — MP3, WAV, FLAC, AAC, OGG
                </p>
              </div>
            </>
          )}
        </div>

        {/* Warning */}
        {stage !== "done" && (
          <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-sm px-3 py-2.5">
            <TbAlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-amber-300/80 text-xs leading-relaxed">
              Replacing the file will reset your track to <strong className="text-amber-300">processing</strong>.
              Listeners won't be able to play it until processing completes (usually under a minute).
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-[#FB2C36] text-sm">{error}</p>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3">
          {stage === "done" ? (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-bg-inverted text-bg text-sm font-bold rounded-sm hover:opacity-80 transition-opacity cursor-pointer"
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={stage === "uploading"}
                className="px-4 py-2 text-sm font-bold text-white bg-[#303030] rounded-sm hover:text-[#717171] transition-colors cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || stage === "uploading"}
                data-test="button-confirm-replace-audio"
                className="px-4 py-2 bg-[#f50] text-white text-sm font-bold rounded-sm hover:brightness-110 transition disabled:opacity-40 cursor-pointer flex items-center gap-2"
              >
                <TbUpload size={15} />
                {stage === "uploading" ? "Uploading…" : "Replace File"}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
