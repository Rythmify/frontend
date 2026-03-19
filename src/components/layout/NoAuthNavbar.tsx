import { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { MoreHorizontal, Menu, X, Search } from "lucide-react";

const NoAuthNavbar = () => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-md font-bold px-1 py-1 border-b-2 transition-colors hover:text-text-hover ${
      isActive
        ? "text-text-hover border-text-hover"
        : "text-text-secondary border-transparent"
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 text-md font-bold transition-colors ${
      isActive ? "text-text-hover" : "text-text-secondary hover:text-text-hover"
    }`;

  return (
    <nav className="sticky top-1 z-50 w-full bg-bg ">

      {/* Main navbar row */}
      <div className="container px-4 md:px-8 lg:px-20 grid grid-cols-[auto_1fr_auto] items-center h-11.5">

        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-6 shrink-0">
          <Link data-test="link-logo" to="/" className="flex items-center gap-2 text-4xl">
            <i className="fa-brands fa-soundcloud text-text-hover" />
            <span className="text-xl ms-1 font-bold tracking-widest uppercase text-text-hover">Rythmify</span>
          </Link>

          {/* Nav links — tablet+ */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/discover" className={navLinkClass}>Home</NavLink>
            <NavLink to="/feed" className={navLinkClass}>Feed</NavLink>
            <NavLink to="/you/library" className={navLinkClass}>Library</NavLink>
          </div>
        </div>

        {/* Center: Search Bar — tablet+ */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="w-full max-w-125 relative">
            <input
              type="text"
              data-test="input-search"
            placeholder="Search artists, bands, tracks, podcasts"
              className="w-full bg-input-bg text-text text-md rounded-sm px-3 py-1.5 pr-9 border border-transparent focus:border-text-secondary outline-none placeholder:text-text-muted"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
              <i className="fa-solid fa-magnifying-glass text-lg font-bold" />
            </button>
          </div>
        </div>

        {/* Spacer — mobile only */}
        <div className="flex-1 md:hidden" />

        {/* Right: Auth actions + more — tablet+ */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            data-test="link-signin"
            to="/signin"
            className="text-md font-bold text-text-hover hover:text-text-secondary transition-colors"
          >
            Sign in
          </Link>

          <Link
            data-test="link-create-account"
            to="/signin"
            className="text-md font-extrabold bg-text-hover mx-3 ms-4 text-bg  px-3 py-1.25 rounded-sm hover:text-text-secondary "
          >
            Create account
          </Link>

          <Link
            data-test="link-upload"
            to="/upload"
            className="hidden lg:block text-md font-bold text-text-secondary hover:text-text-hover transition-colors"
          >
            Upload
          </Link>

          {/* More Menu */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setShowMoreMenu((prev) => !prev)}
              className="text-text-secondary hover:text-text-hover transition-colors"
            >
              <MoreHorizontal size={22} className="mt-2 mx-3" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-2 w-50 bg-bg border border-border rounded-sm shadow-md py-1 z-50 max-h-100 overflow-y-auto">
                <div className="lg:hidden">
                  <DropdownLink label="Upload" to="/upload" onClick={() => setShowMoreMenu(false)} />
                  <div className="border-t border-border my-1" />
                </div>
                <DropdownLink label="About us" to="/pages/contact" onClick={() => setShowMoreMenu(false)} />
                <DropdownLink label="Legal" to="/terms-of-use" onClick={() => setShowMoreMenu(false)} />
                <DropdownLink label="Copyright" to="/pages/copyright" onClick={() => setShowMoreMenu(false)} />
                <DropdownLink label="Mobile apps" to="/download" onClick={() => setShowMoreMenu(false)} />
                <DropdownLink label="Artist Membership" to="/creator/checkout" onClick={() => setShowMoreMenu(false)} />
                <div className="border-t border-border my-1" />
                <DropdownLink label="Keyboard shortcuts" to="#" onClick={() => setShowMoreMenu(false)} />
                    <div className="border-t border-border my-1" />
                <DropdownLink label="Pro Plan" to="/creator/checkout" onClick={() => setShowMoreMenu(false)} />
              </div>
              
            )}
          </div>
        </div>

        {/* Mobile: search icon */}
        <div className="flex md:hidden items-center gap-3">
          <button
            data-test="btn-search-toggle"
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            className="text-text-secondary hover:text-text-hover transition-colors"
          >
            <Search size={22} />
          </button>
          <button
            data-test="btn-menu-toggle"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="text-text-secondary hover:text-text-hover transition-colors"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile search row */}
      {isMobileSearchOpen && (
        <div className="flex md:hidden items-center gap-2 px-4 py-2 border-t border-border">
          <div className="flex-1 relative">
            <input
              autoFocus
              type="text"
              placeholder="Search"
              className="w-full bg-input-bg text-text text-md rounded-sm px-3 py-1.5 pr-9 border border-transparent focus:border-text-secondary outline-none placeholder:text-text-muted"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
              <Search size={16} />
            </button>
          </div>
          <button
            onClick={() => setIsMobileSearchOpen(false)}
            className="text-text-secondary hover:text-text-hover transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Mobile menu drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-bg border-t border-border">
          <NavLink to="/discover" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
          <NavLink to="/feed" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Feed</NavLink>
          <NavLink to="/you/library" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Library</NavLink>
          <div className="border-t border-border my-1" />
          <Link
            to="/signin"
            className="block px-4 py-3 text-md font-bold text-text-secondary hover:text-text-hover transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="block px-4 py-3 text-md font-bold text-text-hover hover:text-text-secondary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Create account
          </Link>
          <Link
            to="/upload"
            className="block px-4 py-3 text-md font-bold text-text-secondary hover:text-text-hover transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Upload
          </Link>
        </div>
      )}

    </nav>
  );
};

const DropdownLink = ({
  label,
  to,
  onClick,
}: {
  label: string;
  to: string;
  onClick: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-2 text-md text-text-hover hover:text-text-secondary transition-colors"
  >
    <span>{label}</span>
  </Link>
);

export default NoAuthNavbar;
