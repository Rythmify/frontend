import { useState, useEffect, useRef } from 'react'
import { searchFollowing, type FollowingUser } from '@/services/api/messaging/conversationApi'

const ModalNewMessageBody = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FollowingUser[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selected, setSelected] = useState<FollowingUser|null>(null)
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }

    const t = setTimeout(async () => {
      const res = await searchFollowing(query.trim(), 10, 0)
      setResults(res.data.items)
      setShowDropdown(res.data.items.length > 0)
    }, 150)

    return () => clearTimeout(t)
  }, [query])

  const handleSelect = (user: FollowingUser) => {
    setSelected(user)
    setQuery(user.display_name)
    setShowDropdown(false)
    inputRef.current?.blur()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (selected) setSelected(null)
  }

  const handleSend = () => {
    if (!selected || !message.trim()) return
    console.log('send to', selected.id, message)
  }

  return (
    <>
      <style>{`
        .msg-input {
          caret-color: #ff5500;
        }
        .msg-input:focus {
          border-color: #ffffff !important;
          outline: none;
        }
      `}</style>

      <div>
        <h2 className="mb-6 text-xl font-semibold text-white">New message</h2>

        <label className="block mb-1 text-sm text-white">
          To <span className="text-red-500">*</span>
        </label>

         <div className="relative mb-4">  
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={handleInputChange}
            onFocus={() => { if (results.length > 0) setShowDropdown(true) }}
            className="msg-input w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded px-3 py-2 text-white transition-colors duration-150"
          />

          {showDropdown && (
            <div className="absolute z-10 w-auto mt-1 bg-[#1a1a1a] border border-[#3a3a3a] rounded shadow-lg max-h-52 overflow-y-auto ml-5">
              {results.map((user) => (
                <button
                  key={user.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(user)}
                  className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-[#2a2a2a] transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 overflow-hidden rounded-full bg-neutral-600">
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.display_name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-xs font-bold text-white">
                        {user.display_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                    <div className="text-sm font-bold text-grey-300 hover:text-white">
                     {user.display_name}
                    </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="block mb-1 text-sm text-white">
          Write your message and add tracks or playlists{" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="msg-input w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded px-3 py-2 text-white resize-y transition-colors duration-150"
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSend}
            disabled={!selected || !message.trim()}
            className="px-3 py-1 text-sm font-extrabold text-black bg-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </>
  )
}

export default ModalNewMessageBody