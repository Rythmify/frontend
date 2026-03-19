interface UploadFooterProps {
  isDetailsMode: boolean;
  onSave?: () => void;
  isLoading?: boolean;
}

const UploadFooter = ({
  isDetailsMode,
  onSave,
  isLoading,
}: UploadFooterProps) => {
  if (!isDetailsMode) {
    return (
      <footer className="py-8 mt-20 fixed bottom-0 left-0 right-0 z-50  bg-bg/90 transition-all duration-300">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[12px] text-[#9e9e9e] ">
          {[
            "Legal",
            "Privacy",
            "Cookie Policy",
            "Cookie Manager",
            "Imprint",
            "About us",
            "Copyright",
            "Feedback",
          ].map((link) => (
            <a
              key={link}
              href="#"
              className="hover:underline last:after:content-none after:content-['-'] after:ml-2"
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    );
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-bg/90 transition-all duration-300 border-t border-border z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-center relative h-19">
        <p className="text-[12px] text-[#ffffffb3]">
          By uploading, you confirm that your sounds comply with our{" "}
          <a href="#" className="underline text-text-upload">
            Terms of Use
          </a>{" "}
          and you don't infringe anyone else's rights.
        </p>

        <div className="absolute right-0">
          <button
            data-test="upload-button"
            onClick={onSave}
            disabled={isLoading}
            className="bg-[#388e3c] hover:bg-[#81c784] text-text-upload text-sm px-4 py-2.5 w-50 rounded-full font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default UploadFooter;
