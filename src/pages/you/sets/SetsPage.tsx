import React, { useState } from "react";
import GuestPageFooter from "@/components/Upload/GuestPageFooter";

export default function SetsPage() {
  const [filterText, setFilterText] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filterOptions = ["All", "Created", "Liked"];
  return (
    <div className="container px-4 md:px-4 lg:px-20">
      <div className="flex items-center gap-10 py-2 px-4">
        <div className=" text-white text-[17px] font-bold">
          Hear your own playlists and the playlists you've liked:
        </div>
        {/* Search / Filter Input */}
        <div className="relative group ">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter"
            className="text-[14px] text-white border py-2 pr-10 pl-4 rounded-sm  bg-[#303030]  focus:outline-none focus:border-text-secondary w-40 transition-all placeholder:text-text-secondary"
          />
          {filterText && (
            <button
              onClick={() => setFilterText("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-[#5a5a5a] transition-all cursor-pointer"
            >
              <svg className="w-6 h-6" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.94 8l-4.47 4.47 1.06 1.06L8 9.06l4.47 4.47 1.06-1.06L9.06 8l4.47-4.47-1.06-1.06L8 6.94 3.53 2.47 2.47 3.53 6.94 8z" />
              </svg>
            </button>
          )}
        </div>
        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between min-w-[100px] gap-2 border rounded-md py-2 px-3 mr-2 bg-[#303030] focus:outline-none focus:border-text-secondary transition-all placeholder:text-text-secondary"
          >
            <span>{activeFilter}</span>
            <svg
              viewBox="0 0 24 24"
              className={`w-4 h-4 fill-current  transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            >
              <path d="M20.5303 9.53033L12 18.0607L3.46967 9.53033L4.53033 8.46967L12 15.9393L19.4697 8.46967L20.5303 9.53033Z" />
            </svg>
          </button>

          {isDropdownOpen && (
            <ul className="absolute right-0 mt-1 w-full bg-neutral-900 border border-neutral-700 rounded shadow-xl z-20 overflow-hidden">
              {filterOptions.map((option) => (
                <li key={option}>
                  <button
                    onClick={() => {
                      setActiveFilter(option);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[14px] hover:bg-neutral-800 transition-colors ${
                      activeFilter === option
                        ? "text-white"
                        : "text-text-secondary"
                    }`}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="py-2 px-4">
        <GuestPageFooter></GuestPageFooter>
      </div>
    </div>
  );
}
