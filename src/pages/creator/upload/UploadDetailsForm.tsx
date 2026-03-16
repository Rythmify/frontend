import { useState } from "react";

interface Props {
  audioData: File | Blob | null;
  onCancel: () => void;
}

const UploadDetailsForm = ({  }: Props) => {
  return (
    <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-8"></div>
    </div>
  );
};

export default UploadDetailsForm;
