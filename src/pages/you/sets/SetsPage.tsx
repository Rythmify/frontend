import React, { useState } from "react";

import HorizontalCarousel from "@/components/discover/HorizontalCarousel";
import PlaylistCard from "@/components/UI/PlaylistCard/PlaylistCard";
import { useLikesStore } from "@/stores/likes.store";

const CARD_WIDTH = "w-[140px] sm:w-[165px] md:w-[185px] lg:w-[200px]";

export default function SetsPage() {
  const [filterText, setFilterText] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const { likedPlaylists } = useLikesStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filterOptions = ["All", "Created", "Liked"];
  return (
    <div className="">
      <div className="flex justify-between items-center py-2 px-4">
        <div className=" text-white text-[17px] font-bold ">
          Hear your own playlists and the playlists you've liked:
        </div>

        <div className="flex-1" />

        {/* Search / Filter Input */}
        <div className="relative group ">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter"
            className="text-[14px] text-white border border-transparent mr-2 py-2 pr-10 pl-4 rounded-sm bg-[#303030] focus:outline-none focus:border-text-secondary w-50 transition-all placeholder:text-text-secondary"
          />
          {filterText && (
            <button
              onClick={() => setFilterText("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary focus:border-text-secondary hover:text-[#5a5a5a] transition-all cursor-pointer"
            >
              <svg className="w-6 h-6" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.94 8l-4.47 4.47 1.06 1.06L8 9.06l4.47 4.47 1.06-1.06L9.06 8l4.47-4.47-1.06-1.06L8 6.94 3.53 2.47 2.47 3.53 6.94 8z" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center  gap-2">
          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between min-w-25 border border-transparent rounded-sm py-2 px-3 
              bg-[#303030] focus:outline-none focus:border-text-secondary transition-all text-[14px] text-white font-bold hover:text-[#838383] cursor-pointer"
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
              <ul className=" py-2 absolute right-0 mt-1 w-full border font-bold border-text-secondary rounded-sm shadow-xl z-20 overflow-hidden">
                {filterOptions.map((option) => (
                  <li key={option}>
                    <button
                      onClick={() => {
                        setActiveFilter(option);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 text-[14px] hover:bg-bg transition-colors ${
                        activeFilter === option
                          ? "text-white "
                          : "text-text-secondary hover:text-white cursor-pointer"
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
      </div>
      <div className="px-4 pt-2 pb-10">
        <HorizontalCarousel title=" ">
          {likedPlaylists.length === 0 ? (
            <p className="text-text-secondary text-sm py-6">No liked playlists yet.</p>
          ) : (
            likedPlaylists.map((item) => (
              <PlaylistCard key={item.id} item={item} widthClassName={CARD_WIDTH} />
            ))
          )}
        </HorizontalCarousel>
      </div>
      
    </div>
  );
}
