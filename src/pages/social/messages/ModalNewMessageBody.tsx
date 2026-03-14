import React from 'react'

const ModalNewMessageBody = () => {
  return (
<div className=""><h2 className="mb-6 text-xl font-semibold text-white">New message</h2>

        <label className="block mb-1 text-sm text-white">
          To <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded px-3 py-2 mb-4 text-white outline-none"
        />

        <label className="block mb-1 text-sm text-white">
          Write your message and add tracks or playlists{" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded px-3 py-2 text-white outline-none resize-y"
        />

        <div className="flex justify-end mt-4">
          <button className="px-3 py-1 text-sm font-extrabold text-black bg-white rounded">
            Send
          </button>
        </div>
        </div>
  )
}

export default ModalNewMessageBody