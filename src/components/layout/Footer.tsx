import { Link } from "react-router-dom";

const FOOTER_LINKS = [
  { label: "Directory", to: "/people" },
  { label: "About us", to: "/pages/contact" },
  { label: "Artist Resources", to: "/creator/checkout" },
  { label: "Newsroom", to: "#" },
  { label: "Topics", to: "#" },
  { label: "Jobs", to: "#" },
  { label: "Developers", to: "#" },
  { label: "Help", to: "#" },
  { label: "Legal", to: "/terms-of-use" },
  { label: "Privacy", to: "#" },
  { label: "Cookie Manager", to: "#" },
  { label: "Imprint", to: "#" },
  { label: "Charts", to: "/feed/charts" },
  { label: "Transparency Reports", to: "#" },
];

const Footer = () => (
  <footer className="border-t border-border py-6 px-6 md:px-12 lg:px-20">
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {FOOTER_LINKS.map((link) => (
        <Link
          key={link.label}
          to={link.to}
          className="text-xs text-text-secondary hover:text-text transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </div>
    <p className="mt-4 text-xs text-text-secondary">
      Language:{" "}
      <span className="underline underline-offset-2 cursor-pointer hover:text-text transition-colors">
        English (US)
      </span>
    </p>
  </footer>
);

export default Footer;
