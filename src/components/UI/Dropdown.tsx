import { useState, useRef, useEffect } from "react";

interface DropdownProps {
  label: string;
  value: string;
  placeholder?: string;
  options: string[];
  onChange: (val: string) => void;
  headerText?: string;
}

const Dropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  headerText
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value); 
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

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
  
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-bold mb-1 tracking-wide text-upload">
        {label}
      </label>

    {/* Search Input Area */}
      <div className="relative flex items-center border-b border-border focus-within:border-bg-inverted hover:border-bg-inverted group">
        <input
          data-test="dropdown-input"
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
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#1e1e1e] border border-[#333] shadow-xl max-h-[300px] overflow-y-auto custom-scrollbar">
          {headerText && (
            <div className="px-4 py-3 text-[13px] text-text-upload/60 border-b border-[#333] bg-[#111]">
              {headerText}
            </div>
          )}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className="px-4 py-3 text-[14px] text-text-upload hover:bg-[#2b2b2b] cursor-pointer transition-colors"
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-[#b8b8b8] italic">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;