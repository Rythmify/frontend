import React from 'react'
import { useState } from 'react'

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}

const CheckBox = ({ label, checked, onChange }: CheckboxProps) => {
  const [hovering, setHovering] = useState(false)

  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 w-4 h-4 min-w-[1rem] border flex items-center justify-center transition-colors rounded-sm ${
          checked
            ? "bg-white border-white"
            : hovering
            ? "bg-transparent border-gray-400"
            : "bg-transparent border-gray-400"
        }`}
      >
        {(checked || hovering) && (
          <svg
            viewBox="0 0 12 12"
            className={`w-3 h-3 ${checked ? "text-black" : "text-gray-300"}`}
            fill="currentColor"
          >
            <path
              d="M1.5 6l3 3 6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="text-sm font-bold leading-snug text-white">
        {label}
      </span>
    </label>
  )
}

export default CheckBox