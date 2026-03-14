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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#717171]/50"
      onClick={onClose}   // clicking backdrop closes it
    >
      <div
        className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl"
        onClick={e => e.stopPropagation()}  // prevent backdrop click
      >
        {children}
      </div>
    </div>
  )
}