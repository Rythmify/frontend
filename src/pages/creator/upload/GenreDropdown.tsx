import { useState, useRef, useEffect } from "react";

const GenreDropdown = ({ value, onChange }: { value: string; onChange: (g: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const genres = [
    "Alternative Rock",
    "Ambient",
    "Classical",
    "Country",
    "Dance & EDM",
    "Dancehall",
    "Deep House",
    "Disco",
    "Drum & Bass",
    "Electronic",
    "Hip-hop & Rap",
    "House",
    "Jazz & Blues",
    "Latin",
    "Metal",
    "Piano",
    "Pop",
    "R&B & Soul",
    "Reggae",
    "Reggaeton",
    "Rock",
    "Soundtrack",
    "Techno",
    "Trance",
    "World",
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-bold mb-1 tracking-wide text-upload">
        Genre
      </label>

      {/* Search Input Area */}
      <div className="relative flex items-center border-b border-border group">
        <input
          type="text"
          placeholder="Add or search for genre"
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm py-2 outline-none text-upload placeholder:text-text-upload/40"
        />
        <i
          className={`fa-solid fa-chevron-up text-xs transition-transform duration-200 ${!isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#1A1A1A] border border-[#333] shadow-xl max-h-[300px] overflow-y-auto custom-scrollbar">
          <div className="px-4 py-3 text-[13px] text-text-upload/60 border-b border-[#333] bg-[#111]">
            All music genres
          </div>
          {genres
            .filter((g) => g.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((genre) => (
              <div
                key={genre}
                onClick={() => {
                  onChange(genre);
                  setSearchTerm(genre);
                  setIsOpen(false);
                }}
                className="px-4 py-3 text-[14px] text-white hover:bg-[#333] cursor-pointer transition-colors"
              >
                {genre}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
export default GenreDropdown;
