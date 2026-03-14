// Modal.tsx
import { useEffect } from "react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex  justify-center bg-[#717171]/50 flex-col"
      onClick={onClose}   // clicking backdrop closes it
    >
<div className="relative">
  <button className="bg-[#303030] p-1 rounded-full absolute top-0 right-0" onClick={onClose}>
  <svg
  color="white"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="absolute top-0 right-0 w-8 h-8"
  >
    <path
      d="M6.94 8l-4.47 4.47 1.06 1.06L8 9.06l4.47 4.47 1.06-1.06L9.06 8l4.47-4.47-1.06-1.06L8 6.94 3.53 2.47 2.47 3.53 6.94 8z"
      fill="currentColor"
    />
  </svg>
</button>
</div>
      <div
        className="self-center w-full max-w-2xl p-6 bg-black "
        onClick={e => e.stopPropagation()}  // prevent backdrop click
      >
        {children}
      </div>
    </div>
  )
}