// SearchBar.tsx

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { getSuggestions, type SuggestionUser, type SuggestionsResponse } from "@/services/api/search/Searchapi";
import UserAvatar from "./UserAvatar";

interface Props {
  className?: string;
  autoFocus?: boolean;
  onClose?: () => void;
  showClose?: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar({
  className = "",
  autoFocus = false,
  onClose,
  showClose = false,
}: Props) {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SuggestionUser[]>([]);
  const [textSuggestions, setTextSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 250);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Fetch suggestions ───────────────────────────────────────────────────────

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (!trimmed) {
      setUsers([]);
      setTextSuggestions([]);
      setOpen(false);
      return;
    }

    // Create a fresh controller for THIS effect run
    const controller = new AbortController();

    getSuggestions(trimmed, controller.signal)
      .then(({ users, suggestions }: SuggestionsResponse) => {
        setUsers(users ?? []);
        setTextSuggestions(suggestions ?? []);
        setActiveIndex(-1);
        // Only open if we actually got something back
        if ((users ?? []).length > 0 || (suggestions ?? []).length > 0) {
          setOpen(true);
        }
      })
      .catch((err: unknown) => {
        // Swallow abort errors silently — a new effect will fire immediately
        if (err instanceof Error && (err.name === "AbortError" || err.message.includes("canceled"))) {
          return;
        }
        // Real error — clear and close rather than showing stale data
        setUsers([]);
        setTextSuggestions([]);
        setOpen(false);
        console.error("[SearchBar] getSuggestions error:", err);
      });

    // Cleanup: abort the in-flight request when query changes or component unmounts
    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  // ── Close on outside click ──────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const goToSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }, [navigate]);

  const goToUser = useCallback((user: SuggestionUser) => {
    setOpen(false);
    navigate(`/${user.username}`);
  }, [navigate]);

  const goToTextSuggestion = useCallback((label: string) => {
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(label)}`);
  }, [navigate]);

  // ── Keyboard navigation ─────────────────────────────────────────────────────
  // Index layout:
  //   0             → "Search for X"
  //   1 … U         → user rows
  //   U+1 … U+S    → text suggestion rows

  const totalItems = 1 + users.length + textSuggestions.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "Enter") goToSearch(query);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex <= 0) {
        goToSearch(query);
      } else if (activeIndex <= users.length) {
        goToUser(users[activeIndex - 1]);
      } else {
        goToTextSuggestion(textSuggestions[activeIndex - 1 - users.length]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      onClose?.();
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className={`relative flex items-center gap-2 ${className}`}>

      {/* Input */}
      <div className="flex-1 relative">
        <input
          autoFocus={autoFocus}
          data-test="input-search"
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (users.length > 0 || textSuggestions.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-input-bg text-text text-md rounded-sm px-3 py-[6px] pr-9 border border-transparent focus:border-text-secondary outline-none placeholder:text-text-muted"
        />
        <button
          onClick={() => goToSearch(query)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
          tabIndex={-1}
        >
          <Search size={16} />
        </button>
      </div>

      {/* Close button — mobile */}
      {showClose && (
        <button
          onClick={() => { setOpen(false); onClose?.(); }}
          className="text-text-secondary hover:text-text transition-colors shrink-0"
        >
          <X size={20} />
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div
          data-test="search-suggestions-dropdown"
          className="absolute left-0 top-full mt-1 w-full min-w-[260px] bg-bg border border-border rounded-sm shadow-lg z-[200] overflow-hidden"
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* "Search for …" */}
          <button
            onClick={() => goToSearch(query)}
            className={`w-full text-left px-4 py-3 text-sm text-text-secondary hover:bg-white/5 transition-colors ${
              activeIndex === 0 ? "bg-white/5" : ""
            }`}
          >
            Search for <span className="font-semibold text-text">"{query}"</span>
          </button>

          {/* Users */}
          {users.length > 0 && <div className="border-t border-border" />}
          {users.map((user, i) => (
            <button
              key={user.id}
              onClick={() => goToUser(user)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors ${
                activeIndex === i + 1 ? "bg-white/5" : ""
              }`}
            >
              <UserAvatar
                src={user.profile_picture ?? undefined}
                name={user.display_name}
                alt={user.display_name}
                wrapperClassName="w-9 h-9 rounded-full overflow-hidden shrink-0"
                initialsClassName="flex h-full w-full items-center justify-center rounded-full bg-zinc-700 text-white text-sm font-bold"
              />
              <span className="text-text text-sm font-semibold truncate">
                {user.display_name}
              </span>
              <span className="ml-auto text-text-muted shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v1h20v-1c0-3.3-6.7-5-10-5z" />
                </svg>
              </span>
            </button>
          ))}

          {/* Text suggestions */}
          {textSuggestions.length > 0 && users.length > 0 && (
            <div className="border-t border-border" />
          )}
          {textSuggestions.map((label, i) => (
            <button
              key={label}
              onClick={() => goToTextSuggestion(label)}
              className={`w-full text-left px-4 py-2.5 text-sm font-semibold text-text hover:bg-white/5 transition-colors ${
                activeIndex === 1 + users.length + i ? "bg-white/5" : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}