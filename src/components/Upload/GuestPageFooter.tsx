import "../../pages/creator/upload/UploadGuestPage.css";
import React from "react";

const footerLinks = [
  "Legal",
  "Privacy",
  "Cookie Policy",
  "Cookie Manager",
  "Imprint",
  "Artist Resources",
  "Newsroom",
  "Charts",
  "Transparency Reports",
];

function GuestPageFooter() {
  return (
    <div>
      <footer className="bg-bg py-8">
        <div className="flex flex-wrap items-center gap-y-1 mb-4">
          {footerLinks.map((link, i) => (
            <span key={link} className="flex items-center">
              <button className="text-sm cursor-pointer footer-link">
                {link}
              </button>
              {i < footerLinks.length - 1 && (
                <span className="text-text-secondary text-[12px] mx-2">·</span>
              )}
            </span>
          ))}
        </div>
        <p className="text-sm text-text-secondary">
          Language:{" "}
          <button className="text-text-ulink hover:underline cursor-pointer bg-transparent border-none font-medium">
            English (US)
          </button>
        </p>
      </footer>
    </div>
  );
}

export default GuestPageFooter;
