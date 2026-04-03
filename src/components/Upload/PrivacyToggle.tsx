import React, { useState } from "react";

interface PrivacyToggleProps {
  value: "public" | "private";
  onChange: (val: "public" | "private") => void;
}

function PrivacyToggle({ value, onChange }: PrivacyToggleProps) {
  return (
    <div>
      <div className="flex gap-10 text-sm py-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            data-test="upload-privacy-public-radio"
            type="radio"
            name="privacy"
            className="hidden"
            checked={value === "public"}
            onChange={() => onChange("public")}
          />
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${value === "public" ? "border-bg-inverted" : "border-[#666] group-hover:border-bg-inverted"}`}
          >
            {value === "public" && (
              <div className="w-2.5 h-2.5 bg-bg-inverted rounded-full" />
            )}
          </div>
          <span
            className={`${value === "public" ? "text-text-upload font-bold" : "text-[#999]"}`}
          >
            Public
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            data-test="upload-privacy-private-radio"
            type="radio"
            name="privacy"
            className="hidden"
            checked={value === "private"}
            onChange={() => onChange("private")}
          />
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${value === "private" ? "border-bg-inverted" : "border-[#666] group-hover:border-bg-inverted"}`}
          >
            {value === "private" && (
              <div className="w-2.5 h-2.5 bg-bg-inverted rounded-full" />
            )}
          </div>
          <span
            className={`${value === "private" ? "text-text-upload font-bold" : "text-[#999]"}`}
          >
            Private
          </span>
        </label>
      </div>
    </div>
  );
}

export default PrivacyToggle;
